import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ERC-8004 Agent Identity to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deployer:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ Insufficient balance!");
    console.log("\nGet testnet ETH from:");
    console.log("  https://sepoliafaucet.com");
    console.log("  https://www.alchemy.com/faucets/ethereum-sepolia");
    process.exit(1);
  }

  console.log("⏳ Deploying ERC8004AgentIdentity...\n");

  const ERC8004AgentIdentity = await ethers.getContractFactory("ERC8004AgentIdentity");
  const identity = await ERC8004AgentIdentity.deploy();

  await identity.waitForDeployment();

  const address = await identity.getAddress();
  
  console.log("✅ ERC-8004 Agent Identity deployed!");
  console.log("📄 Contract Address:", address);
  console.log("🔍 View on Etherscan: https://sepolia.etherscan.io/address/" + address);
  
  // Register the VANIJ agent
  console.log("\n⏳ Registering VANIJ Agent...\n");
  
  const tx = await identity.registerAgent(
    "VANIJ",
    "https://vanij.agent/metadata.json",
    deployer.address
  );
  
  const receipt = await tx.wait();
  
  // Get agent ID from event
  const event = receipt?.logs.find((log: any) => {
    try {
      const parsed = identity.interface.parseLog(log);
      return parsed?.name === "AgentRegistered";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = identity.interface.parseLog(event as any);
    console.log("✅ VANIJ Agent Registered!");
    console.log("🆔 Agent ID:", parsed?.args[0].toString());
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractAddress: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorer: "https://sepolia.etherscan.io/address/" + address,
  };
  
  require("fs").writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📄 Deployment info saved to deployment.json");
  console.log("\n📝 Add to .env:");
  console.log(`IDENTITY_REGISTRY_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
