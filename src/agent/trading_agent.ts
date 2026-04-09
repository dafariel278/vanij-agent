import { KrakenClient } from "../exchange/kraken_client.js";
import { RiskManager } from "../risk/risk_manager.js";
import { StrategyEngine } from "../strategies/index.js";
import { ERC8004Identity } from "../identity/erc8004_identity.js";
import { Logger } from "../utils/logger.js";

export interface AgentConfig {
  mode: "paper" | "live";
  krakenApiKey?: string;
  krakenApiSecret?: string;
  maxPositionSize: number;
  maxDailyLoss: number;
  maxLeverage: number;
}

export interface TradeSignal {
  pair: string;
  side: "buy" | "sell";
  size: number;
  strategy: string;
  confidence: number;
  timestamp: number;
}

export interface Position {
  pair: string;
  side: "long" | "short";
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  timestamp: number;
}

export class TradingAgent {
  private logger: Logger;
  private config: AgentConfig;
  private kraken: KrakenClient;
  private riskManager: RiskManager;
  private strategyEngine: StrategyEngine;
  private identity?: ERC8004Identity;
  
  private positions: Map<string, Position> = new Map();
  private dailyPnl: number = 0;
  private tradeCount: number = 0;
  private isRunning: boolean = false;

  constructor(config: AgentConfig) {
    this.config = config;
    this.logger = new Logger("VANIJ");
    
    this.kraken = new KrakenClient({
      apiKey: config.krakenApiKey,
      apiSecret: config.krakenApiSecret,
      paperMode: config.mode === "paper",
    });
    
    this.riskManager = new RiskManager({
      maxPositionSize: config.maxPositionSize,
      maxDailyLoss: config.maxDailyLoss,
      maxLeverage: config.maxLeverage,
    });
    
    this.strategyEngine = new StrategyEngine();
  }

  async initialize(): Promise<void> {
    this.logger.info("Initializing VANIJ components...");
    
    // Initialize Kraken connection
    await this.kraken.connect();
    this.logger.info("✓ Kraken client connected");
    
    // Initialize ERC-8004 identity (optional for paper mode)
    if (this.config.mode === "live" && process.env.AGENT_WALLET_PRIVATE_KEY) {
      this.identity = new ERC8004Identity();
      await this.identity.initialize();
      this.logger.info("✓ ERC-8004 identity initialized");
    }
    
    // Load strategies
    await this.strategyEngine.loadStrategies();
    this.logger.info("✓ Strategy engine loaded");
    
    this.logger.info("🎉 VANIJ initialization complete!");
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.logger.info("Starting trading loop...");
    
    // Main trading loop
    while (this.isRunning) {
      try {
        await this.tradingCycle();
        await this.sleep(60000); // 1 minute interval
      } catch (error) {
        this.logger.error("Trading cycle error:", error);
        await this.sleep(30000); // Wait 30s on error
      }
    }
  }

  stop(): void {
    this.isRunning = false;
    this.logger.info("Trading stopped");
  }

  private async tradingCycle(): Promise<void> {
    this.logger.info("--- Trading Cycle ---");
    
    // 1. Update market data
    const marketData = await this.kraken.getMarketData();
    
    // 2. Generate trade signals
    const signals = await this.strategyEngine.analyze(marketData);
    
    // 3. Process each signal
    for (const signal of signals) {
      await this.processSignal(signal);
    }
    
    // 4. Update positions and check exits
    await this.updatePositions();
    
    // 5. Log status
    this.logStatus();
    
    // 6. Attest on-chain if identity exists
    if (this.identity) {
      await this.attestCycle();
    }
  }

  private async processSignal(signal: TradeSignal): Promise<void> {
    this.logger.info(`Signal: ${signal.strategy} ${signal.side} ${signal.pair} (confidence: ${signal.confidence})`);
    
    // Risk check
    const riskCheck = this.riskManager.evaluateTrade(signal, this.positions, this.dailyPnl);
    
    if (!riskCheck.approved) {
      this.logger.warn(`Trade rejected: ${riskCheck.reason}`);
      return;
    }
    
    // Execute trade
    const execution = await this.kraken.executeOrder({
      pair: signal.pair,
      side: signal.side,
      size: riskCheck.adjustedSize,
    });
    
    if (execution.success) {
      this.tradeCount++;
      
      // Record position
      this.positions.set(signal.pair, {
        pair: signal.pair,
        side: signal.side === "buy" ? "long" : "short",
        size: riskCheck.adjustedSize,
        entryPrice: execution.price,
        currentPrice: execution.price,
        pnl: 0,
        timestamp: Date.now(),
      });
      
      // Attest trade
      if (this.identity) {
        await this.identity.attestTrade({
          signal,
          execution,
          riskCheck,
        });
      }
      
      this.logger.info(`✓ Trade executed: ${signal.side} ${riskCheck.adjustedSize} ${signal.pair} @ ${execution.price}`);
    } else {
      this.logger.error(`Trade failed: ${execution.error}`);
    }
  }

  private async updatePositions(): Promise<void> {
    for (const [pair, position] of this.positions) {
      const ticker = await this.kraken.getTicker(pair);
      position.currentPrice = ticker.price;
      
      // Calculate PnL
      if (position.side === "long") {
        position.pnl = (position.currentPrice - position.entryPrice) * position.size;
      } else {
        position.pnl = (position.entryPrice - position.currentPrice) * position.size;
      }
      
      // Check exit conditions
      const exitSignal = this.strategyEngine.checkExit(position, ticker);
      
      if (exitSignal.shouldExit) {
        await this.closePosition(pair, exitSignal.reason);
      }
    }
  }

  private async closePosition(pair: string, reason: string): Promise<void> {
    const position = this.positions.get(pair);
    if (!position) return;
    
    this.logger.info(`Closing position ${pair}: ${reason}`);
    
    const side = position.side === "long" ? "sell" : "buy";
    
    const execution = await this.kraken.executeOrder({
      pair,
      side,
      size: position.size,
    });
    
    if (execution.success) {
      this.dailyPnl += position.pnl;
      this.positions.delete(pair);
      
      this.logger.info(`✓ Position closed: ${pair} PnL: ${position.pnl.toFixed(2)}`);
      
      // Check circuit breaker
      if (this.riskManager.shouldTriggerCircuitBreaker(this.dailyPnl)) {
        this.logger.warn("🚨 CIRCUIT BREAKER TRIGGERED - Stopping trading");
        this.stop();
      }
    }
  }

  private async attestCycle(): Promise<void> {
    await this.identity!.recordCheckpoint({
      timestamp: Date.now(),
      positions: Array.from(this.positions.values()),
      dailyPnl: this.dailyPnl,
      tradeCount: this.tradeCount,
    });
  }

  private logStatus(): void {
    const totalPnl = Array.from(this.positions.values()).reduce((sum, p) => sum + p.pnl, 0) + this.dailyPnl;
    this.logger.info(`Status: ${this.positions.size} positions, Daily PnL: ${this.dailyPnl.toFixed(2)}, Total: ${totalPnl.toFixed(2)}, Trades: ${this.tradeCount}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
