require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

module.exports = {
  solidity: "0.8.20",
  networks: {
    shimmer: {
      url: process.env.RPC_URL,
      chainId: Number(process.env.CHAIN_ID),
      accounts: [process.env.OWNER_PK],
    },
  },
};
