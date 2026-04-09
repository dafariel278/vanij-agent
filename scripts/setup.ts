import { execSync } from "child_process";
import { existsSync, copyFileSync } from "fs";
import { Logger } from "../src/utils/logger.js";

const logger = new Logger("Setup");

async function setup() {
  logger.info("🚀 Setting up VANIJ Agent...\n");

  // 1. Check environment
  logger.info("Checking environment...");
  
  if (!existsSync(".env")) {
    if (existsSync(".env.example")) {
      copyFileSync(".env.example", ".env");
      logger.info("✓ Created .env from .env.example");
      logger.warn("⚠️  Please edit .env with your API keys");
    }
  } else {
    logger.info("✓ .env file exists");
  }

  // 2. Install dependencies
  logger.info("\nInstalling dependencies...");
  try {
    execSync("bun install", { stdio: "inherit" });
    logger.info("✓ Dependencies installed");
  } catch (error) {
    logger.error("Failed to install dependencies");
    process.exit(1);
  }

  // 3. Create necessary directories
  logger.info("\nCreating directories...");
  const dirs = ["logs", "data", "cache"];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      execSync(`mkdir -p ${dir}`);
      logger.info(`✓ Created ${dir}/`);
    }
  }

  // 4. Verify Kraken CLI (optional)
  logger.info("\nChecking for Kraken CLI...");
  try {
    const result = execSync("which kraken-cli 2>/dev/null || echo 'not found'").toString();
    if (result.includes("not found")) {
      logger.warn("⚠️  Kraken CLI not installed (optional for paper trading)");
      logger.info("   Install from: https://github.com/krakenfx/kraken-cli");
    } else {
      logger.info("✓ Kraken CLI found");
    }
  } catch {
    logger.warn("⚠️  Could not check for Kraken CLI");
  }

  logger.info("\n🎉 Setup complete!");
  logger.info("\nNext steps:");
  logger.info("1. Edit .env with your API keys");
  logger.info("2. Run: bun run start:paper  (for paper trading)");
  logger.info("3. Run: bun run start:live   (for live trading)");
  logger.info("\nRegister at: https://early.surge.xyz");
  logger.info("Username: admin");
  logger.info("Password: JBRv2xWG7AzwVrLz88");
}

setup().catch(console.error);
