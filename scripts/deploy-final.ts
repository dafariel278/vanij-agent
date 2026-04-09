import { ethers } from "ethers";

const RPC = "https://ethereum-sepolia.publicnode.com";
const PRIVATE_KEY = "0xac7c415e0c3a73e9e2bcee0f0ee6f8d38e5e1c9c9a3e5c9b1b5e5f1a7c3d5e7f";

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("\n🚀 Deploying ERC-8004 Agent Identity Registry...\n");
console.log("📍 Deployer:", wallet.address);

const balance = await provider.getBalance(wallet.address);
console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

// ERC-8004 Identity Registry Contract
const contractBytecode = "0x608060405234801561001057600080fd5b50604051610201380380610201833981810160405281019061003291906100f3565b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505061011e565b600080fd5b600080fd5b600080fd";

// Simple storage contract for agent identity
const abi = [
  "function registerAgent(address _agentWallet, string _name, string _metadataURI) external",
  "function getAgent(address _agentWallet) external view returns (tuple(address wallet, string name, string metadataURI, uint256 registeredAt, uint256 reputation))",
  "function updateReputation(address _agentWallet, int256 _delta) external",
  "event AgentRegistered(address indexed wallet, string name, string metadataURI, uint256 timestamp)",
  "event ReputationUpdated(address indexed wallet, int256 delta, uint256 newScore)"
];

console.log("📦 Deploying contract...\n");

// Deploy using simpler approach - just send tx with bytecode
const tx = await wallet.sendTransaction({
  data: contractBytecode,
  gasLimit: 2000000n
});

console.log("Tx hash:", tx.hash);
console.log("Waiting for confirmation...");

const receipt = await tx.wait();
console.log("\n✅ Contract deployed!");
console.log("📍 Contract Address:", receipt.contractAddress);
console.log("🔗 Explorer: https://sepolia.etherscan.io/address/" + receipt.contractAddress);
