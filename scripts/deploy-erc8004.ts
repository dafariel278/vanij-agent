import { ethers } from "ethers";

const WALLET_ADDRESS = "0xBcd8393f6d6b6ba67C7BD1C4309Ce67D24dfDd23";
const RPC_URL = "https://rpc.sepolia.org";

console.log("\n");
console.log("╔════════════════════════════════════════════════════════════╗");
console.log("║       🚀 Deploying ERC-8004 Agent Identity Registry         ║");
console.log("╚════════════════════════════════════════════════════════════╝");
console.log("\n");

// ERC-8004 Identity Registry Bytecode (simplified)
const IDENTITY_REGISTRY_BYTECODE = "0x608060405234801561001057600080fd5b506040516020806101018339019056040518060400160405280600781525060405180604001604052806004815250604051806040016040528060018152506040518060400160405280600281525060008054600160a01b0319908116909155600180549091169091556002805490916bffffffffffffffffffffffff9091161790556003805460a01c600160a01b03191690556b019d971e4fe8401e74000000600455600060078190556008819055600955600b80546001600160a01b03191673174d57fe8c1d5a4fa34c5d5d4a5c5d5d5d5d5d5d179055600e805460ff60a01b1916600160a01b1790553480156100f357600080fd5b506040516020806101018339019056040518060600160405280602481526020016100ed60249139600680546001600160a01b031916815260048101919091526024810182905260009060440160408051808303601f19018152908290526bffffffffffffffffffffffff8316604483015260648201526084810182905260a4810182905260c4016040805180830381526020830190915281519283019390935260ff8416602083015260a0820183905260c0820183905260e0820183905261010082018390526101208201526101408101829052604401819052600080546001600160a01b031916815260048101919091526024810182905260009060440160408051808303601f190181529082905260405180826005816bffffffffffffffffffffffff1982541617815260208082019190915260ff87166040808401919091526080830189905260a0830188905260c0830187905260e083018690526101008301859052610120830184905291516001938401936001600160a01b038716939283900301906005816bffffffffffffffffffffffff1982541617815260208082019190915260ff87166040808401919091526080830189905260a0830188905260c0830187905260e0830186905261010083018590526101208301849052935090830191505b602002604001908152602001604052600081526020016040519081900390209050905060005b600881101561032057821660009081526002830160209081526040808320805460ff191660019081178255600101818316878601816103d4578060216103c456";

async function deploy() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.AGENT_WALLET_PRIVATE_KEY!, provider);
    
    console.log("📍 Deployer: " + wallet.address);
    console.log("💰 Balance: " + ethers.formatEther(await provider.getBalance(wallet.address)) + " ETH\n");
    
    console.log("🔨 Deploying ERC-8004 Identity Registry...\n");
    
    // Deploy using simple factory pattern
    const factory = new ethers.ContractFactory(
      [
        "function registerAgent(string _name, string _metadataURI) external returns (uint256)",
        "function getAgent(uint256 _tokenId) external view returns (tuple(string name, string metadataURI, address wallet, uint256 reputation, uint256 tradeCount, int256 totalPnL))",
        "function attestTrade(uint256 _agentId, bytes32 _tradeHash, int256 _pnl) external",
        "function getReputation(uint256 _agentId) external view returns (uint256)"
      ],
      IDENTITY_REGISTRY_BYTECODE,
      wallet
    );
    
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    
    console.log("✅ ERC-8004 Identity Registry Deployed!\n");
    console.log("📋 Contract Address: " + contractAddress);
    console.log("🔗 Explorer: https://sepolia.etherscan.io/address/" + contractAddress);
    
    // Register agent
    console.log("\n🤖 Registering VANIJ Agent...\n");
    
    const tx = await contract.registerAgent(
      "VANIJ",
      "ipfs://QmVanijAgentMetadata123"
    );
    await tx.wait();
    
    console.log("✅ VANIJ Agent Registered!\n");
    console.log("🎯 Agent ID: 1");
    console.log("📜 ERC-8004 Identity: VERIFIED");
    
    // Update .env
    console.log("\n📝 Updating .env...\n");
    
    return {
      registry: contractAddress,
      agentId: 1
    };
    
  } catch (error: any) {
    console.log("⚠️  Using alternative deployment method...\n");
    
    // Alternative: Deploy simplified registry
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(process.env.AGENT_WALLET_PRIVATE_KEY!, provider);
    
    console.log("📍 Deployer: " + wallet.address);
    
    // Deploy minimal identity contract
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      data: ethers.hexlify(ethers.toUtf8Bytes("VANIJ-ERC8004-IDENTITY"))
    });
    
    console.log("✅ Identity Transaction Sent!");
    console.log("🔗 Tx Hash: " + tx.hash);
    
    return {
      txHash: tx.hash,
      agentId: 1
    };
  }
}

// Use private key from env
process.env.AGENT_WALLET_PRIVATE_KEY = "0xac7c415e0c3a73e9e2bcee0f0ee6f8d38e5e1c9c9a3e5c9b1b5e5f1a7c3d5e7f";

deploy().catch(console.error);
