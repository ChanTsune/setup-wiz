import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { Input } from "./input";

async function post(input: Input, failure: (message: string | Error) => void) {
  return await core.group("Uninstall wiz", async () => {
    const returnCode = await exec.exec("rm", ["-rf", "~/.wiz"]);
    if (returnCode !== 0) {
      failure(`Uinstall failed. exit code ${returnCode})`);
      return returnCode;
    }
    core.info("wiz is uninstalled!");
    return returnCode;
  });
}

async function run() {
  const input = new Input(
    core.getInput("version", { required: false, trimWhitespace: true }),
    core.getBooleanInput("uninstall", { required: false })
  );
  return await post(input, (message) => {
    core.setFailed(message);
  });
}

run();
