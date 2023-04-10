import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { parseBalanceMap } from "./utils/parse-balance-map";

const filename = "1.json";

// Record<user, Record<token, amount>>
function getInput(filename: string) {
  const input = JSON.parse(
    readFileSync(`./scripts/inputs/${filename}`, "utf8")
  ) as Record<string, Record<string, string>>;
  return Object.keys(input).flatMap((user) =>
    Object.keys(input[user]).map((token) => ({
      user,
      token,
      amount: input[user][token],
    }))
  );
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
