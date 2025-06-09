// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  // 取得合約 Factory
  const Reserve = await ethers.getContractFactory("ReserveSBT");
  // 部署合約
  const reserve = await Reserve.deploy();
  // 等待鏈上完成（Ethers v6 語法）
  await reserve.waitForDeployment();
  console.log("ReserveSBT deployed to:", reserve.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
