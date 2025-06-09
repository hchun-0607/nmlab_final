// hardhat.config.js

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
require("@nomicfoundation/hardhat-toolbox");

const path = require("path");

module.exports = {
  // 支援多個版本編譯器，符合合約中 ^0.8.24 的需求
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {}
      }
    ]
  },
  // 指定 Hardhat 專案其他路徑
  paths: {
    sources: "./",  // 合約原始檔位於 contracts 根
    artifacts: path.resolve(__dirname, "../artifacts"),  // 主專案的 artifacts
    cache: path.resolve(__dirname, "../cache")           // 主專案的 cache
  },
  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      chainId: 11155111,
      accounts: [
        process.env.OWNER_PK.startsWith("0x")
          ? process.env.OWNER_PK
          : "0x" + process.env.OWNER_PK
      ]
    }
  }
};
