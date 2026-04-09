import { MarketData, Ticker, TradeSignal, Position } from "../agent/trading_agent.js";
import { Logger } from "../utils/logger.js";
import { ArbitrageStrategy } from "./arbitrage.js";
import { SentimentStrategy } from "./sentiment.js";
import { CorrelationStrategy } from "./correlation.js";

export interface Strategy {
  name: string;
  analyze(marketData: MarketData): Promise<TradeSignal[]>;
  checkExit(position: Position, ticker: Ticker): { shouldExit: boolean; reason: string };
}

export interface ExitSignal {
  shouldExit: boolean;
  reason: string;
}

export class StrategyEngine {
  private logger: Logger;
  private strategies: Strategy[] = [];

  constructor() {
    this.logger = new Logger("Strategy");
  }

  async loadStrategies(): Promise<void> {
    this.strategies = [
      new ArbitrageStrategy(),
      new SentimentStrategy(),
      new CorrelationStrategy(),
    ];
    
    this.logger.info(`Loaded ${this.strategies.length} strategies: ${this.strategies.map(s => s.name).join(", ")}`);
  }

  async analyze(marketData: MarketData): Promise<TradeSignal[]> {
    const allSignals: TradeSignal[] = [];
    
    for (const strategy of this.strategies) {
      try {
        const signals = await strategy.analyze(marketData);
        allSignals.push(...signals);
      } catch (error) {
        this.logger.error(`Strategy ${strategy.name} error:`, error);
      }
    }
    
    // Sort by confidence
    allSignals.sort((a, b) => b.confidence - a.confidence);
    
    // Return top signals
    return allSignals.slice(0, 3);
  }

  checkExit(position: Position, ticker: Ticker): ExitSignal {
    // Default exit conditions
    const pnl = position.side === "long"
      ? (ticker.price - position.entryPrice) * position.size
      : (position.entryPrice - ticker.price) * position.size;
    
    const pnlPercent = pnl / (position.entryPrice * position.size);
    
    // Stop loss at -5%
    if (pnlPercent <= -0.05) {
      return { shouldExit: true, reason: "Stop loss triggered (-5%)" };
    }
    
    // Take profit at +10%
    if (pnlPercent >= 0.10) {
      return { shouldExit: true, reason: "Take profit triggered (+10%)" };
    }
    
    // Time-based exit (24 hours)
    const hoursHeld = (Date.now() - position.timestamp) / (1000 * 60 * 60);
    if (hoursHeld >= 24) {
      return { shouldExit: true, reason: "Position timeout (24h)" };
    }
    
    return { shouldExit: false, reason: "" };
  }
}
