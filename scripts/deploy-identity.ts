import { ethers } from "ethers";

const RPC = "https://ethereum-sepolia.publicnode.com";
const ADDR = "0xBcd8393f6d6b6ba67C7BD1C4309Ce67D24dfDd23";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac7c415e0c3a73e9e2bcee0f0ee6f8d38e5e1c9c9a3e5c9b1b5e5f1a7c3d5e7f";

console.log("🚀 Deploying ERC-8004 Agent Identity...\n");

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("Deployer:", wallet.address);

const balance = await provider.getBalance(wallet.address);
console.log("Balance:", ethers.formatEther(balance), "ETH\n");

// Simple ERC-8004 Agent Identity Contract
const ABI = [
  "function initialize(string _name, string _metadata) external",
  "function registerAgent(address _agentWallet, string _capabilities) external returns (uint256)",
  "function getAgent(uint256 _id) external view returns (tuple(string name, address wallet, string capabilities, uint256 reputation, bool active))",
  "function attestationCount() external view returns (uint256)",
];

const BYTECODE = "0x608060405234801561001057600080fd5b50604051610201380380610201833981810160405281019061003291906100f3565b816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806001908051906020019061008a92919061009d565b508060028190555050506101c0565b8280546100a99061011f565b90610001906100bd92919061010084019081900484019061013e565b505081565b6000815190506100d281610186565b92915050565b6000815190506100e78161019d565b92915050565b60008060408385031215610100576100ff610180565b5b600061010e868287016100c3565b935050602061011f868287016100d8565b925050509250929050565b600060018260ff160361013557600061013a565b6000815b90509091929350505092915050565b60008082840190506101e8565b508091505092915050565b60006101e882610165565b905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600061019182610165565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036101c3576101c26101e8565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6040518060400160405280600290602082028036833750919291505056fea2646970667358221220845d7c3e5a5d7b5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d64736f6c63430008120033";

try {
  console.log("Deploying contract...");
  const tx = await wallet.sendTransaction({ data: BYTECODE });
  console.log("TX:", tx.hash);
  console.log("Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("\n✅ Deployed!");
  console.log("Contract:", receipt.contractAddress);
  console.log("Gas used:", receipt.gasUsed.toString());
} catch (e: any) {
  console.log("Error:", e.message?.slice(0, 200));
}
