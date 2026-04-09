import { ethers } from "ethers";

// Try multiple RPCs
const RPCS = [
  "https://ethereum-sepolia.publicnode.com",
  "https://1rpc.io/sepolia",
  "https://sepolia.gateway.tenderly.co",
];

const ADDR = "0xBcd8393f6d6b6ba67C7BD1C4309Ce67D24dfDd23";

for (const rpc of RPCS) {
  try {
    console.log("Trying:", rpc);
    const provider = new ethers.JsonRpcProvider(rpc);
    const balance = await provider.getBalance(ADDR);
    console.log("✅ Connected!");
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");
    
    // Deploy simple contract
    const block = await provider.getBlockNumber();
    console.log("📦 Block:", block);
    break;
  } catch (e) {
    console.log("❌ Failed\n");
  }
}
