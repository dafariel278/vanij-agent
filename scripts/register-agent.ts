import { ethers } from "ethers";

const RPC = "https://ethereum-sepolia.publicnode.com";
const PRIVATE_KEY = "0xac7c415e0c3a73e9e2bcee0f0ee6f8d38e5e1c9c9a3e5c9b1b5e5f1a7c3d5e7f";
const CONTRACT_ADDRESS = "0xb3E2Bcab09eB871Fe4C02204Cf615a080862d20a";

const ABI = [
  "function registerAgent(address _wallet, string _name, string _metadataURI) external",
  "function getAgent(address _wallet) external view returns (address wallet, string name, string metadataURI, uint256 registeredAt, uint256 reputation, bool exists)"
];

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

async function register() {
  console.log("\n🤖 Registering VANIJ Agent Identity...\n");
  
  // Register the trading agent
  const agentWallet = "0xBcd8393f6d6b6ba67C7BD1C4309Ce67D24dfDd23";
  const agentName = "VANIJ";
  const metadataURI = "ipfs://vanij-agent-metadata-json"; // Can be updated later
  
  console.log("📍 Agent Wallet:", agentWallet);
  console.log("📛 Agent Name:", agentName);
  console.log("📄 Metadata URI:", metadataURI);
  
  console.log("\n⏳ Registering...");
  
  const tx = await contract.registerAgent(agentWallet, agentName, metadataURI);
  console.log("Tx hash:", tx.hash);
  
  await tx.wait();
  console.log("\n✅ Agent Registered Successfully!");
  
  // Verify registration
  const agent = await contract.getAgent(agentWallet);
  console.log("\n📋 Agent Info:");
  console.log("   Wallet:", agent.wallet);
  console.log("   Name:", agent.name);
  console.log("   Registered:", new Date(Number(agent.registeredAt) * 1000).toISOString());
  console.log("   Reputation:", agent.reputation.toString());
  
  console.log("\n🎉 VANIJ Agent is now live on ERC-8004!");
}

register().catch(console.error);
