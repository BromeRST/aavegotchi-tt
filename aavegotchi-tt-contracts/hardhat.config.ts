import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const { POLYGON_URL, POLYGONSCAN_API_KEY, PRIVATE_KEY, MUMBAI_URL } =
  process.env;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.13", // Your contract version
      },
      {
        version: "0.8.20", // OpenZeppelin required version
      },
    ],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    polygon: {
      url: POLYGON_URL || "https://polygon-rpc.com",
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 31337,
      forking: {
        url: POLYGON_URL || "https://polygon-rpc.com",
      },
    },
  },
  mocha: {
    timeout: 100000000000,
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY,
  },
};

export default config;
