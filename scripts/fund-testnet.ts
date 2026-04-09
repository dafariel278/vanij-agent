import { ethers } from "ethers";

const WALLET_ADDRESS = "0xBcd8393f6d6b6ba67C7BD1C4309Ce67D24dfDd23";

console.log("\n");
console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║            🌐 ERC-8004 Wallet Funding Guide                 ║");
console.log("╚════════════════════════════════════════════════════════════╝");
console.log("\n");

console.log("📍 Your Agent Wallet Address:\n");
console.log(`   ${WALLET_ADDRESS}\n`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("🔗 Get FREE Sepolia Testnet ETH from these faucets:\n");
console.log("   1. QuickNode Faucet:");
console.log("      https://faucet.quicknode.com/ethereum/sepolia\n");
console.log("   2. Infura Faucet:");
console.log("      https://www.infura.io/faucet/sepolia\n");
console.log("   3. Paradigm Faucet:");
console.log("      https://faucet.paradigm.xyz/\n");
console.log("   4. Coinbase Faucet:");
console.log("      https://coinbase.com/faucets/ethereum-sepolia\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Check current balance
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/demo");
const balance = await provider.getBalance(WALLET_ADDRESS);
const balanceEth = ethers.formatEther(balance);

console.log(`💰 Current Balance: ${balanceEth} ETH\n`);

if (parseFloat(balanceEth) < 0.001) {
  console.log("⚠️  Wallet needs funding. Please visit one of the faucets above.\n");
  console.log("   Copy this address and paste in faucet:\n");
  console.log(`   ${WALLET_ADDRESS}\n`);
} else {
  console.log("✅ Wallet has sufficient funds for deployment!\n");
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
