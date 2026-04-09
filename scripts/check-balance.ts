import { ethers } from "ethers";

const WALLET_ADDRESS = "0xBcd8393f6d6b6ba67C7BD1C4309Ce67D24dfDd23";

console.log("\n📍 Agent Wallet: " + WALLET_ADDRESS + "\n");

// Use public RPC
const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia.publicnode.com");

try {
  const balance = await provider.getBalance(WALLET_ADDRESS);
  const balanceEth = ethers.formatEther(balance);
  console.log(`💰 Balance: ${balanceEth} ETH\n`);
  
  if (parseFloat(balanceEth) < 0.001) {
    console.log("⚠️  Need 0.01+ ETH for deployment\n");
  } else {
    console.log("✅ Ready to deploy!\n");
  }
} catch (e) {
  console.log("Checking balance via block explorer...\n");
}
