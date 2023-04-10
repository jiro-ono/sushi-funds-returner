import MerkleTree from "./merkle-tree";
import { BigNumber, utils } from "ethers";
import { FormatBigNumber } from "./parse-balance-map";

export default class BalanceTree {
  private readonly tree: MerkleTree;
  constructor(balances: FormatBigNumber[]) {
    this.tree = new MerkleTree(
      balances.map(({ user, token, amount }, index) => {
        return BalanceTree.toNode(index, user, token, amount);
      })
    );
  }

  public static verifyProof(
    index: number | BigNumber,
    account: string,
    token: string,
    amount: BigNumber,
    proof: Buffer[],
    root: Buffer
  ): boolean {
    let pair = BalanceTree.toNode(index, account, token, amount);
    for (const item of proof) {
      pair = MerkleTree.combinedHash(pair, item);
    }

    return pair.equals(root);
  }

  // keccak256(abi.encode(index, account, amount))
  public static toNode(
    index: number | BigNumber,
    account: string,
    token: string,
    amount: BigNumber
  ): Buffer {
    return Buffer.from(
      utils
        .solidityKeccak256(
          ["uint256", "address", "uint256", "address"],
          [index, account, amount, token]
        )
        .substr(2),
      "hex"
    );
  }

  public getHexRoot(): string {
    return this.tree.getHexRoot();
  }

  // returns the hex bytes32 values of the proof
  public getProof(
    index: number | BigNumber,
    account: string,
    token: string,
    amount: BigNumber
  ): string[] {
    return this.tree.getHexProof(
      BalanceTree.toNode(index, account, token, amount)
    );
  }
}
