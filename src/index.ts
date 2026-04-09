import { config } from "dotenv";
import { TradingAgent } from "./agent/trading_agent.js";
import { Logger } from "./utils/logger.js";

config();

const logger = new Logger("Main");

async function main() {
  const mode = process.argv.includes("--mode=paper") ? "paper" : "live";
  
  logger.info(`🚀 Starting VANIJ Agent in ${mode.toUpperCase()} mode`);
  
  const agent = new TradingAgent({
    mode,
    krakenApiKey: process.env.KRAKEN_API_KEY,
    krakenApiSecret: process.env.KRAKEN_API_SECRET,
    maxPositionSize: Number(process.env.MAX_POSITION_SIZE_USD) || 1000,
    maxDailyLoss: Number(process.env.MAX_DAILY_LOSS_USD) || 100,
    maxLeverage: Number(process.env.MAX_LEVERAGE) || 2,
  });

  try {
    await agent.initialize();
    await agent.start();
  } catch (error) {
    logger.error("Agent failed:", error);
    process.exit(1);
  }
}

main();
