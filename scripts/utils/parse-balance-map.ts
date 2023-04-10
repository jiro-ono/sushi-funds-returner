import { BigNumber, utils } from "ethers";
import BalanceTree from "./balance-tree";

type Format = { user: string; token: string; amount: string };
export type FormatBigNumber = {
  user: string;
  token: string;
  amount: BigNumber;
};

export function parseBalanceMap(balances: Format[]) {
  const balancesWithBigNumbers = balances.map((entry) => ({
    ...entry,
    amount: BigNumber.from(entry.amount),
  }));

  const sortedAddresses = balancesWithBigNumbers.sort(
    (a, b) => parseInt(a.user, 16) - parseInt(b.user, 16)
  );

  // construct a tree
  const tree = new BalanceTree(balancesWithBigNumbers);

  // generate claims
  const claims = sortedAddresses.map<{ proof: string[] } & FormatBigNumber>(
    (entry, index) => ({
      user: entry.user,
      index,
      amount: entry.amount,
      token: entry.token,
      proof: tree.getProof(index, entry.user, entry.token, entry.amount),
    })
  );

  const amountMap = new Map<string, BigNumber>();
  claims.forEach((claim) => {
    const existing = amountMap.get(claim.token);
    if (existing) {
      amountMap.set(claim.token, existing.add(claim.amount));
    } else {
      amountMap.set(claim.token, claim.amount);
    }
  });
  amountMap.forEach((value, token) =>
    console.log(
      "token:",
      token,
      "amount/18:",
      value.div(BigInt(10e18)).toString(),
      "amount/6:",
      value.div(BigInt(10e6)).toString()
    )
  );

  return {
    merkleRoot: tree.getHexRoot(),
    claims,
  };
}
