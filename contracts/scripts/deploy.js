// contracts/scripts/deploy.js

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { ethers } = require("hardhat");

async function main() {
  console.log("Using RPC_URL=", process.env.RPC_URL);
  console.log("Using OWNER_PK=", process.env.OWNER_PK);

  // 使用完全限定名：文件路径 + 合约名
  const Reserve = await ethers.getContractFactory("ReserveSBT.sol:ReserveSBT");

  // 部署并等待
  const reserve = await Reserve.deploy();
  await reserve.waitForDeployment();

  console.log("ReserveSBT deployed to:", reserve.target);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
