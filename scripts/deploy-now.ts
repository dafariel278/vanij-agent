import { ethers } from "ethers";
import * as fs from "fs";

const RPC = "https://ethereum-sepolia.publicnode.com";
const PRIVATE_KEY = "0xac7c415e0c3a73e9e2bcee0f0ee6f8d38e5e1c9c9a3e5c9b1b5e5f1a7c3d5e7f";

const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

console.log("\n🚀 Deploying ERC-8004 Agent Identity to Sepolia...\n");
console.log("📍 Deployer:", wallet.address);

const bytecode = "0x" + fs.readFileSync("./artifacts/contracts_AgentIdentity_sol_AgentIdentity.bin", "utf8");

async function deploy() {
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");
  
  console.log("📦 Deploying contract...");
  
  const tx = await wallet.sendTransaction({
    data: bytecode,
    gasLimit: 3000000n
  });
  
  console.log("⏳ Tx hash:", tx.hash);
  console.log("   Waiting for confirmation...");
  
  const receipt = await tx.wait();
  
  if (receipt.contractAddress) {
    console.log("\n✅ SUCCESS! ERC-8004 Identity Registry Deployed!\n");
    console.log("📍 Contract Address:", receipt.contractAddress);
    console.log("🔗 Explorer: https://sepolia.etherscan.io/address/" + receipt.contractAddress);
    
    // Save to file
    const deployInfo = {
      network: "sepolia",
      contractAddress: receipt.contractAddress,
      deployer: wallet.address,
      txHash: tx.hash,
      deployedAt: new Date().toISOString()
    };
    fs.writeFileSync("./deployment.json", JSON.stringify(deployInfo, null, 2));
    console.log("\n📝 Deployment info saved to deployment.json");
  }
}

deploy().catch(console.error);
