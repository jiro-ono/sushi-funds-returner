import { ethers } from "hardhat";

const merkleRoot =
  "0xfda68d12c8cb0bb086b852e24765306f590f90ac9a21651765069408894c443b";

async function main() {
  const signer = await ethers.getSigners();
  console.log(signer);

  const Distributor = await ethers.getContractFactory("SushiFundsReturner");
  const distributor = await Distributor.deploy(merkleRoot);

  console.log(distributor.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
