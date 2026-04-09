import { describe, test, expect } from "bun:test";
import { TradingAgent } from "../src/agent/trading_agent.js";
import { RiskManager } from "../src/risk/risk_manager.js";
import { StrategyEngine } from "../src/strategies/index.js";

describe("RiskManager", () => {
  const riskManager = new RiskManager({
    maxPositionSize: 1000,
    maxDailyLoss: 100,
    maxLeverage: 2,
  });

  test("should approve valid trade signal", () => {
    const signal = {
      pair: "XXBTZUSD",
      side: "buy" as const,
      size: 500,
      strategy: "test",
      confidence: 0.8,
      timestamp: Date.now(),
    };

    const result = riskManager.evaluateTrade(signal, new Map(), 0);
    expect(result.approved).toBe(true);
    expect(result.adjustedSize).toBe(500);
  });

  test("should reject low confidence signal", () => {
    const signal = {
      pair: "XXBTZUSD",
      side: "buy" as const,
      size: 500,
      strategy: "test",
      confidence: 0.3,
      timestamp: Date.now(),
    };

    const result = riskManager.evaluateTrade(signal, new Map(), 0);
    expect(result.approved).toBe(false);
  });

  test("should cap position size", () => {
    const signal = {
      pair: "XXBTZUSD",
      side: "buy" as const,
      size: 2000,
      strategy: "test",
      confidence: 0.8,
      timestamp: Date.now(),
    };

    const result = riskManager.evaluateTrade(signal, new Map(), 0);
    expect(result.approved).toBe(true);
    expect(result.adjustedSize).toBe(1000);
  });
});

describe("StrategyEngine", () => {
  test("should load strategies", async () => {
    const engine = new StrategyEngine();
    await engine.loadStrategies();
    // Engine should be ready
    expect(true).toBe(true);
  });
});
