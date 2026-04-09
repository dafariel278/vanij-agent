import { MarketData, TradeSignal, Ticker, Position } from "../agent/trading_agent.js";
import { Strategy, ExitSignal } from "./index.js";
import { Logger } from "../utils/logger.js";

export class SentimentStrategy implements Strategy {
  name = "Sentiment";
  private logger = new Logger("Sentiment");
  private sentimentCache: Map<string, number> = new Map();

  async analyze(marketData: MarketData): Promise<TradeSignal[]> {
    const signals: TradeSignal[] = [];
    
    for (const [pair, ticker] of marketData.tickers) {
      // Simulate sentiment analysis
      // In production, this would fetch from social media APIs, news, on-chain metrics
      const sentiment = this.getSimulatedSentiment(pair);
      
      // Combine with price momentum
      const momentum = ticker.change24h / ticker.price;
      const combinedSignal = sentiment * 0.6 + momentum * 0.4;
      
      if (Math.abs(combinedSignal) > 0.02) {
        const side = combinedSignal > 0 ? "buy" : "sell";
        const confidence = Math.min(Math.abs(combinedSignal) * 10, 0.9);
        
        this.logger.info(`Sentiment signal for ${pair}: ${side} (sentiment: ${sentiment.toFixed(3)}, momentum: ${momentum.toFixed(3)})`);
        
        signals.push({
          pair,
          side,
          size: 100,
          strategy: "sentiment-fusion",
          confidence,
          timestamp: Date.now(),
        });
      }
    }
    
    return signals;
  }

  private getSimulatedSentiment(pair: string): number {
    // Check cache first
    if (this.sentimentCache.has(pair)) {
      const cached = this.sentimentCache.get(pair)!;
      // Add some noise
      return cached + (Math.random() - 0.5) * 0.01;
    }
    
    // Generate simulated sentiment based on pair
    const baseSentiment: Record<string, number> = {
      "XXBTZUSD": 0.02,  // BTC slightly bullish
      "XETHZUSD": 0.03,  // ETH more bullish
      "XXRPZUSD": -0.01, // XRP slightly bearish
      "XDOTZUSD": 0.01,  // DOT neutral-positive
      "XSOLZUSD": 0.04,  // SOL bullish
    };
    
    const sentiment = baseSentiment[pair] || 0;
    this.sentimentCache.set(pair, sentiment);
    
    return sentiment + (Math.random() - 0.5) * 0.01;
  }

  checkExit(position: Position, ticker: Ticker): ExitSignal {
    const sentiment = this.getSimulatedSentiment(position.pair);
    
    // Exit if sentiment reverses
    const positionDirection = position.side === "long" ? 1 : -1;
    
    if (sentiment * positionDirection < -0.02) {
      return { shouldExit: true, reason: "Sentiment reversal detected" };
    }
    
    return { shouldExit: false, reason: "" };
  }
}
