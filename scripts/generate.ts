import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { parseBalanceMap } from "./utils/parse-balance-map";
import { BigNumber } from "ethers";

const filename = "arbitrum_1.json";

interface Input {
  user: string;
  token: string;
  value: string; // Decimal string
}

// Record<user, Record<token, amount>>
function getInput(filename: string) {
  const input = JSON.parse(
    readFileSync(`./scripts/inputs/${filename}`, "utf8")
  ) as Input[];

  return input.map((e) => ({
    user: e.user,
    token: e.token,
    amount: BigNumber.from(e.value).toHexString(), // !
  }));
}

async function main() {
  const input = getInput(filename);
  const output = parseBalanceMap(input);

  if (!existsSync("./scripts/outputs")) {
    mkdirSync("./scripts/outputs");
  }

  writeFileSync(
    `./scripts/outputs/${filename}`,
    JSON.stringify(output, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
