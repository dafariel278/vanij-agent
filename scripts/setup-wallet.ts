import { ethers } from "ethers";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

console.log("🔐 VANIJ Agent Wallet Setup\n");

// Generate a new wallet for the agent
const wallet = ethers.Wallet.createRandom();

console.log("✅ New Agent Wallet Generated:\n");
console.log("📍 Address:", wallet.address);
console.log("🔑 Private Key:", wallet.privateKey);
console.log("\n⚠️  IMPORTANT: Keep this private key secure!");
console.log("   Never share it publicly or commit to git.\n");

// Save to .env
const envPath = path.join(process.cwd(), ".env");
let envContent = "";

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, "utf8");
}

// Update or add the private key
const lines = envContent.split("\n");
const updatedLines: string[] = [];
let foundKey = false;

for (const line of lines) {
  if (line.startsWith("AGENT_WALLET_PRIVATE_KEY=")) {
    updatedLines.push(`AGENT_WALLET_PRIVATE_KEY=${wallet.privateKey}`);
    foundKey = true;
  } else {
    updatedLines.push(line);
  }
}

if (!foundKey) {
  updatedLines.push(`AGENT_WALLET_PRIVATE_KEY=${wallet.privateKey}`);
}

fs.writeFileSync(envPath, updatedLines.join("\n"));
console.log("✅ Private key saved to .env\n");

// Instructions for testnet ETH
console.log("📝 Next Steps:\n");
console.log("1. Get testnet ETH from faucet:");
console.log("   Sepolia: https://sepoliafaucet.com");
console.log("   Base Sepolia: https://www.base.org/faucet");
console.log("   Alchemy: https://www.alchemy.com/faucets/ethereum-sepolia\n");
console.log("2. Fund wallet at:", wallet.address, "\n");
console.log("3. Deploy ERC-8004 identity:");
console.log("   bun run scripts/deploy-identity.ts\n");

// Save wallet info
const walletInfo = {
  address: wallet.address,
  createdAt: new Date().toISOString(),
  network: "sepolia",
};
fs.writeFileSync(
  path.join(process.cwd(), "wallet-info.json"),
  JSON.stringify(walletInfo, null, 2)
);
