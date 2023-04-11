import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from "dotenv";
dotenv.config();

const privKey = process.env.PRIV_KEY;

if (!privKey) {
  throw new Error("No private key found");
}

const config: HardhatUserConfig = {
  etherscan: {
    apiKey: {
      arbitrumOne: "",
    },
  },
  networks: {
    arbitrum: {
      accounts: [privKey],
      chainId: 42161,
      url: "https://arb1.arbitrum.io/rpc",
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000000,
          },
        },
      },
    ],
  },
};

export default config;
