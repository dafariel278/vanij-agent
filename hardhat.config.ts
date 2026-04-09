import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.RPC_URL || "https://eth-sepolia.public.blastapi.io",
      accounts: process.env.AGENT_WALLET_PRIVATE_KEY 
        ? [process.env.AGENT_WALLET_PRIVATE_KEY] 
        : [],
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: process.env.AGENT_WALLET_PRIVATE_KEY 
        ? [process.env.AGENT_WALLET_PRIVATE_KEY] 
        : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
