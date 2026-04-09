import { MarketData, TradeSignal, Ticker, Position } from "../agent/trading_agent.js";
import { Strategy, ExitSignal } from "./index.js";
import { Logger } from "../utils/logger.js";

export class CorrelationStrategy implements Strategy {
  name = "Correlation";
  private logger = new Logger("Correlation");
  
  // Historical correlations between pairs
  private correlations: Map<string, Map<string, number>> = new Map([
    ["XXBTZUSD", new Map([
      ["XETHZUSD", 0.85],
      ["XSOLZUSD", 0.75],
      ["XXRPZUSD", 0.60],
      ["XDOTZUSD", 0.70],
    ])],
    ["XETHZUSD", new Map([
      ["XXBTZUSD", 0.85],
      ["XSOLZUSD", 0.72],
    ])],
  ]);

  async analyze(marketData: MarketData): Promise<TradeSignal[]> {
    const signals: TradeSignal[] = [];
    
    // Look for correlation divergence
    const btcTicker = marketData.tickers.get("XXBTZUSD");
    if (!btcTicker) return signals;
    
    const btcChange = btcTicker.change24h / btcTicker.price;
    
    for (const [pair, ticker] of marketData.tickers) {
      if (pair === "XXBTZUSD") continue;
      
      const correlation = this.getCorrelation("XXBTZUSD", pair);
      if (!correlation || correlation < 0.6) continue;
      
      const pairChange = ticker.change24h / ticker.price;
      const expectedChange = btcChange * correlation;
      const divergence = pairChange - expectedChange;
      
      // If divergence is significant, trade the reversion
      if (Math.abs(divergence) > 0.02) {
        // If pair moved more than expected, it might revert
        const side = divergence > 0 ? "sell" : "buy";
        const confidence = Math.min(Math.abs(divergence) * 10, 0.85);
        
        this.logger.info(`Correlation divergence on ${pair}: ${(divergence * 100).toFixed(2)}% (${side})`);
        
        signals.push({
          pair,
          side,
          size: 100,
          strategy: "correlation-mean-reversion",
          confidence,
          timestamp: Date.now(),
        });
      }
    }
    
    return signals;
  }

  private getCorrelation(pair1: string, pair2: string): number | null {
    const corr = this.correlations.get(pair1);
    if (!corr) return null;
    return corr.get(pair2) || null;
  }

  checkExit(position: Position, ticker: Ticker): ExitSignal {
    // Exit when correlation normalizes
    // Simplified - in production, would recalculate correlation
    const change = ticker.change24h / ticker.price;
    
    if (Math.abs(change) < 0.005) {
      return { shouldExit: true, reason: "Correlation normalized" };
    }
    
    return { shouldExit: false, reason: "" };
  }
}
