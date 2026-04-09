import { MarketData, TradeSignal, Ticker, Position } from "../agent/trading_agent.js";
import { Strategy, ExitSignal } from "./index.js";
import { Logger } from "../utils/logger.js";

export class ArbitrageStrategy implements Strategy {
  name = "Arbitrage";
  private logger = new Logger("Arbitrage");

  async analyze(marketData: MarketData): Promise<TradeSignal[]> {
    const signals: TradeSignal[] = [];
    
    // Look for arbitrage opportunities across pairs
    // In reality, this would compare prices across exchanges
    // For hackathon, we'll detect bid-ask spreads
    
    for (const [pair, ticker] of marketData.tickers) {
      const spread = (ticker.ask - ticker.bid) / ticker.price;
      
      // If spread is unusually wide, might be arbitrage opportunity
      if (spread > 0.002) { // 0.2% spread
        this.logger.info(`Wide spread detected on ${pair}: ${(spread * 100).toFixed(3)}%`);
        
        signals.push({
          pair,
          side: "buy",
          size: 100,
          strategy: "arbitrage-spread",
          confidence: Math.min(spread * 100, 0.8), // Higher spread = higher confidence
          timestamp: Date.now(),
        });
      }
    }
    
    return signals;
  }

  checkExit(position: Position, ticker: Ticker): ExitSignal {
    const spread = (ticker.ask - ticker.bid) / ticker.price;
    
    // Exit when spread normalizes
    if (spread < 0.001) {
      return { shouldExit: true, reason: "Spread normalized" };
    }
    
    return { shouldExit: false, reason: "" };
  }
}
