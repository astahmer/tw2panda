import childProcess from "child_process";
import * as semver from "semver";
import "dotenv/config";

const execaSync = childProcess.execSync;

const { version } = require("../package.json");

const releaseType = process.env["VSCE_RELEASE_TYPE"];
const target = process.env["VSCE_TARGET"] ?? "";

const tokens = {
  vscode: process.env["VSCE_TOKEN"],
  openvsx: process.env["OVSX_TOKEN"],
};

const hasTokens = tokens.vscode !== undefined;
if (!hasTokens) {
  throw new Error("Cannot publish extension without tokens.");
}

const now = (process.env["VSCE_RELEASE_VERSION"] ?? new Date().getTime()).toString().slice(0, 8);
const currentVersion = semver.valid(version);
console.log({ releaseType });

if (!currentVersion) {
  throw new Error("Cannot get the current version number from package.json");
}

const rcVersion = semver.inc(currentVersion, "patch")?.replace(/\.\d+$/, `.${now}`);
if (!rcVersion) {
  throw new Error("Could not populate the current version number for rc's build.");
}

const withTarget = target ? `--target ${target}` : "";

const commands = {
  vscode_package: `pnpm vsix-builder package ${rcVersion} ${withTarget} -o panda.vsix`,
  vscode_publish: `pnpm vsce publish --packagePath panda.vsix -p ${process.env["VSCE_TOKEN"]}`,
  // rc release: publish to VS Code Marketplace with today's date as patch number
  vscode_package_rc: `pnpm vsix-builder package ${rcVersion} --pre-release ${withTarget} -o panda.vsix`,
  vscode_publish_rc: `pnpm vsce publish --pre-release --packagePath panda.vsix -p ${process.env["VSCE_TOKEN"]}`,
  // To publish to the open-vsx registry
  openvsx_publish: `npx ovsx publish panda.vsix -p ${process.env["OVSX_TOKEN"]}`,
};

switch (releaseType) {
  case "rc":
    console.log("[vsce:package]", commands.vscode_package_rc, target);
    execaSync(commands.vscode_package_rc, { stdio: "inherit" });
    break;
  case "stable":
    console.log("[vsce:package]", commands.vscode_package, target);
    execaSync(commands.vscode_package, { stdio: "inherit" });
    break;
  default:
    console.log("[vsce:package]", "Skipping 'vsce package' step.");
}

console.log("[vsce:publish] publishing", rcVersion, target);
switch (releaseType) {
  case "rc":
    if (!rcVersion || !semver.valid(rcVersion) || semver.valid(rcVersion) === currentVersion) {
      throw new Error("Cannot publish rc build with an invalid version number: " + rcVersion);
    }
    execaSync(commands.vscode_publish_rc, { stdio: "inherit" });
    break;

  case "stable":
    execaSync(commands.vscode_publish, { stdio: "inherit" });
    execaSync(commands.openvsx_publish, { stdio: "inherit" });
    break;

  case "dry-run":
    console.info("[vsce:publish]", `Current version: ${currentVersion}.`);
    console.info("[vsce:publish]", `Pre-release version for rc's build: ${rcVersion}.`);
    break;

  default:
    throw new Error(`Invalid release type: ${releaseType}`);
}
