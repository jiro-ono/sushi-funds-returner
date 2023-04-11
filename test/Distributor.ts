import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseBalanceMap } from "../scripts/utils/parse-balance-map";

describe("Distributor", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    const [token1, token2] = [await Token.deploy(), await Token.deploy()];

    const map = parseBalanceMap([
      {
        user: otherAccount1.address,
        token: token1.address,
        amount: "0x8C7C8ED88B4BF3B3", // 10123123123123123123
      },
      {
        user: otherAccount1.address,
        token: token2.address,
        amount: "0x7C8ED88B4BF3B3", // 35059957813212083
      },
      {
        user: otherAccount2.address,
        token: token1.address,
        amount: "0x12345", // 74565
      },
    ]);

    const Distributor = await ethers.getContractFactory("SushiFundsReturner");
    const distributor = await Distributor.deploy(map.merkleRoot);

    await token1.transfer(distributor.address, await token1.totalSupply());
    await token2.transfer(distributor.address, await token2.totalSupply());

    return { distributor, otherAccount1, otherAccount2, map, token1, token2 };
  }

  describe("Withdrawals", function () {
    it("Withdraws when it should", async function () {
      const { distributor, otherAccount1, otherAccount2, map, token1, token2 } =
        await deploy();

      const claim1 = map.claims[0];

      await expect(
        await distributor.claim(
          0,
          claim1.user,
          claim1.amount,
          claim1.token,
          claim1.proof
        )
      )
        .to.emit(distributor, "Claimed")
        .withArgs(0, claim1.amount, claim1.user, claim1.token);

      // it's account2 because of sorting in the merkle tree generation
      expect(await token1.balanceOf(otherAccount2.address)).to.equal(
        claim1.amount
      );

      const claim2 = map.claims[1];

      expect(
        await distributor.claim(
          1,
          claim2.user,
          claim2.amount,
          claim2.token,
          claim2.proof
        )
      )
        .to.emit(distributor, "Claimed")
        .withArgs(1, claim2.amount, claim2.user, claim2.token);

      expect(await token1.balanceOf(otherAccount1.address)).to.equal(
        claim2.amount
      );

      const claim3 = map.claims[2];

      expect(
        await distributor.claim(
          2,
          claim3.user,
          claim3.amount,
          claim3.token,
          claim3.proof
        )
      )
        .to.emit(distributor, "Claimed")
        .withArgs(2, claim3.amount, claim3.user, claim3.token);

      expect(await token2.balanceOf(otherAccount1.address)).to.equal(
        claim3.amount
      );
    });

    it("Doesn't withdraw when it shouldn't", async function () {
      const { distributor, map } = await deploy();

      const claim1 = map.claims[0];

      await expect(
        distributor.claim(
          0,
          claim1.user,
          claim1.amount,
          claim1.token,
          claim1.proof
        )
      )
        .to.emit(distributor, "Claimed")
        .withArgs(0, claim1.amount, claim1.user, claim1.token);

      await expect(
        distributor.claim(
          0,
          claim1.user,
          claim1.amount,
          claim1.token,
          claim1.proof
        )
      ).to.revertedWith("MerkleDistributor: Drop already claimed.");
    });
  });
});
