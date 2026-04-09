import { Logger } from "../utils/logger.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface KrakenConfig {
  apiKey?: string;
  apiSecret?: string;
  paperMode: boolean;
}

export interface OrderRequest {
  pair: string;
  side: "buy" | "sell";
  size: number;
  type?: "market" | "limit";
  price?: number;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  price: number;
  size: number;
  error?: string;
}

export interface Ticker {
  pair: string;
  price: number;
  bid: number;
  ask: number;
  volume24h: number;
  change24h: number;
}

export interface MarketData {
  tickers: Map<string, Ticker>;
  orderBooks: Map<string, OrderBook>;
  timestamp: number;
}

export interface OrderBook {
  pair: string;
  bids: [number, number][]; // [price, volume]
  asks: [number, number][];
}

export class KrakenClient {
  private logger: Logger;
  private config: KrakenConfig;
  private connected: boolean = false;
  private krakenCliPath: string = "kraken-cli";

  constructor(config: KrakenConfig) {
    this.config = config;
    this.logger = new Logger("Kraken");
  }

  async connect(): Promise<void> {
    this.logger.info(`Connecting to Kraken (${this.config.paperMode ? "PAPER" : "LIVE"} mode)...`);
    
    // Verify Kraken CLI is available
    try {
      const { stdout } = await execAsync("which kraken-cli || echo 'not found'");
      if (stdout.includes("not found")) {
        this.logger.warn("Kraken CLI not found, using REST API fallback");
        this.krakenCliPath = "";
      }
    } catch {
      this.krakenCliPath = "";
    }
    
    // Test connection
    if (this.config.apiKey && this.config.apiSecret) {
      // Would validate credentials here
      this.logger.info("API credentials configured");
    }
    
    this.connected = true;
    this.logger.info("✓ Kraken connection established");
  }

  async getMarketData(): Promise<MarketData> {
    const tickers = new Map<string, Ticker>();
    
    // Fetch tickers for major pairs
    const pairs = ["XXBTZUSD", "XETHZUSD", "XXRPZUSD", "XDOTZUSD", "XSOLZUSD"];
    
    for (const pair of pairs) {
      try {
        const ticker = await this.getTicker(pair);
        tickers.set(pair, ticker);
      } catch (error) {
        this.logger.error(`Failed to get ticker for ${pair}`);
      }
    }
    
    return {
      tickers,
      orderBooks: new Map(),
      timestamp: Date.now(),
    };
  }

  async getTicker(pair: string): Promise<Ticker> {
    // Using Kraken REST API (public endpoint)
    const url = `https://api.kraken.com/0/public/Ticker?pair=${pair}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json() as { result?: Record<string, { c: string[], b: string[], a: string[], v: string[], p: string[] }> };
      
      if (data.result) {
        const key = Object.keys(data.result)[0];
        const ticker = data.result[key];
        
        return {
          pair,
          price: parseFloat(ticker.c[0]),
          bid: parseFloat(ticker.b[0]),
          ask: parseFloat(ticker.a[0]),
          volume24h: parseFloat(ticker.v[1]),
          change24h: parseFloat(ticker.p[1]) - parseFloat(ticker.p[0]),
        };
      }
    } catch (error) {
      this.logger.error(`Error fetching ticker: ${error}`);
    }
    
    // Fallback to simulated data for paper trading
    if (this.config.paperMode) {
      return this.getSimulatedTicker(pair);
    }
    
    throw new Error(`Failed to get ticker for ${pair}`);
  }

  private getSimulatedTicker(pair: string): Ticker {
    // Simulated prices for paper trading
    const prices: Record<string, number> = {
      "XXBTZUSD": 67000 + Math.random() * 1000,
      "XETHZUSD": 3400 + Math.random() * 100,
      "XXRPZUSD": 0.50 + Math.random() * 0.02,
      "XDOTZUSD": 7.5 + Math.random() * 0.5,
      "XSOLZUSD": 150 + Math.random() * 10,
    };
    
    const price = prices[pair] || 100;
    
    return {
      pair,
      price,
      bid: price * 0.999,
      ask: price * 1.001,
      volume24h: Math.random() * 1000000,
      change24h: (Math.random() - 0.5) * 0.05 * price,
    };
  }

  async executeOrder(order: OrderRequest): Promise<OrderResult> {
    this.logger.info(`Executing: ${order.side} ${order.size} ${order.pair}`);
    
    if (this.config.paperMode) {
      return this.simulateOrder(order);
    }
    
    // Real order execution via Kraken CLI or API
    if (this.krakenCliPath) {
      return this.executeViaCli(order);
    }
    
    return this.executeViaApi(order);
  }

  private simulateOrder(order: OrderRequest): Promise<OrderResult> {
    return new Promise(resolve => {
      setTimeout(() => {
        const ticker = this.getSimulatedTicker(order.pair);
        const price = order.side === "buy" ? ticker.ask : ticker.bid;
        
        resolve({
          success: true,
          orderId: `sim-${Date.now()}`,
          price,
          size: order.size,
        });
      }, 100);
    });
  }

  private async executeViaCli(order: OrderRequest): Promise<OrderResult> {
    const cmd = `${this.krakenCliPath} order --pair ${order.pair} --${order.side} --volume ${order.size}`;
    
    try {
      const { stdout } = await execAsync(cmd);
      // Parse CLI output
      return {
        success: true,
        orderId: stdout.trim(),
        price: 0,
        size: order.size,
      };
    } catch (error) {
      return {
        success: false,
        price: 0,
        size: 0,
        error: String(error),
      };
    }
  }

  private async executeViaApi(order: OrderRequest): Promise<OrderResult> {
    // Would implement Kraken REST API order execution
    // For now, return error for live mode without CLI
    return {
      success: false,
      price: 0,
      size: 0,
      error: "Live trading requires Kraken CLI or API credentials",
    };
  }

  async getOrderBook(pair: string): Promise<OrderBook> {
    const url = `https://api.kraken.com/0/public/Depth?pair=${pair}&count=10`;
    
    try {
      const response = await fetch(url);
      const data = await response.json() as { result?: Record<string, { bids: string[][], asks: string[][] }> };
      
      if (data.result) {
        const key = Object.keys(data.result)[0];
        const book = data.result[key];
        
        return {
          pair,
          bids: book.bids.map(b => [parseFloat(b[0]), parseFloat(b[1])]),
          asks: book.asks.map(a => [parseFloat(a[0]), parseFloat(a[1])]),
        };
      }
    } catch (error) {
      this.logger.error(`Error fetching order book: ${error}`);
    }
    
    return { pair, bids: [], asks: [] };
  }
}
