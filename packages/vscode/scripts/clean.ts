import { rimraf } from "rimraf";
import { join } from "path";

async function main() {
  try {
    await rimraf(join(__dirname, "..", "dist"));
    await rimraf(join(__dirname, "..", "node_modules"));
  } catch {
    //
  }
}

main();
