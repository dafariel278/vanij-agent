import { TradeSignal, Position } from "../agent/trading_agent.js";
import { Logger } from "../utils/logger.js";

export interface RiskConfig {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxLeverage: number;
  circuitBreakerThreshold?: number;
}

export interface RiskCheck {
  approved: boolean;
  reason: string;
  adjustedSize: number;
  warnings: string[];
}

export class RiskManager {
  private logger: Logger;
  private config: RiskConfig;
  private dailyHighPnl: number = 0;
  private drawdownTriggered: boolean = false;

  constructor(config: RiskConfig) {
    this.config = config;
    this.logger = new Logger("Risk");
  }

  evaluateTrade(signal: TradeSignal, positions: Map<string, Position>, dailyPnl: number): RiskCheck {
    const warnings: string[] = [];
    let approved = true;
    let reason = "";
    let adjustedSize = signal.size;

    // 1. Check circuit breaker
    if (this.drawdownTriggered) {
      return {
        approved: false,
        reason: "Circuit breaker triggered - trading halted",
        adjustedSize: 0,
        warnings: ["Daily loss limit exceeded"],
      };
    }

    // 2. Check position size
    if (signal.size > this.config.maxPositionSize) {
      adjustedSize = this.config.maxPositionSize;
      warnings.push(`Position size reduced from ${signal.size} to ${adjustedSize}`);
      this.logger.warn(`Position size capped at ${this.config.maxPositionSize}`);
    }

    // 3. Check if pair already has position
    if (positions.has(signal.pair)) {
      const existingPosition = positions.get(signal.pair)!;
      const sameDirection = 
        (existingPosition.side === "long" && signal.side === "buy") ||
        (existingPosition.side === "short" && signal.side === "sell");
      
      if (sameDirection) {
        // Would increase position - check total
        const totalSize = existingPosition.size + adjustedSize;
        if (totalSize > this.config.maxPositionSize) {
          adjustedSize = Math.max(0, this.config.maxPositionSize - existingPosition.size);
          warnings.push("Position increase limited by max size");
        }
      }
    }

    // 4. Check daily loss limit
    if (dailyPnl < -this.config.maxDailyLoss * 0.8) {
      warnings.push("Approaching daily loss limit");
      this.logger.warn("Near daily loss limit, reducing position sizes");
      adjustedSize *= 0.5;
    }

    // 5. Check confidence
    if (signal.confidence < 0.5) {
      approved = false;
      reason = "Signal confidence too low";
      warnings.push(`Confidence ${signal.confidence} below threshold 0.5`);
    }

    // 6. Validate adjusted size
    if (approved && adjustedSize <= 0) {
      approved = false;
      reason = "Adjusted position size is zero or negative";
    }

    return {
      approved,
      reason,
      adjustedSize,
      warnings,
    };
  }

  shouldTriggerCircuitBreaker(dailyPnl: number): boolean {
    if (dailyPnl <= -this.config.maxDailyLoss) {
      this.drawdownTriggered = true;
      this.logger.error("🚨 CIRCUIT BREAKER: Daily loss limit reached");
      return true;
    }
    
    // Also check drawdown from peak
    if (dailyPnl > this.dailyHighPnl) {
      this.dailyHighPnl = dailyPnl;
    }
    
    const drawdown = this.dailyHighPnl - dailyPnl;
    const threshold = this.config.circuitBreakerThreshold || this.config.maxDailyLoss * 0.5;
    
    if (drawdown >= threshold) {
      this.logger.error(`🚨 CIRCUIT BREAKER: Drawdown ${drawdown} exceeded threshold ${threshold}`);
      return true;
    }
    
    return false;
  }

  resetDaily(): void {
    this.dailyHighPnl = 0;
    this.drawdownTriggered = false;
    this.logger.info("Daily risk limits reset");
  }

  getRiskMetrics(): { maxPositionSize: number; maxDailyLoss: number; drawdownTriggered: boolean } {
    return {
      maxPositionSize: this.config.maxPositionSize,
      maxDailyLoss: this.config.maxDailyLoss,
      drawdownTriggered: this.drawdownTriggered,
    };
  }
}
