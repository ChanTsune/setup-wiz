import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import { getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { Input } from "./input";
import { Output } from "./output";

async function main(
  input: Input,
  github: ReturnType<typeof getOctokit>,
  callback: (output: Output) => void,
  failure: (message: string | Error) => void
) {
  // Check platform
  const releaseListResponse = await github.rest.repos.listReleases({
    owner: "ChanTsune",
    repo: "wiz",
  });
  const releaseList = releaseListResponse.data.filter(
    (it) => it.tag_name == input.version
  );
  if (releaseList.length === 0) {
    failure("No release available");
    return;
  }
  const release = releaseList[0];
  const assets = release.assets.filter((it) => it.name.startsWith("wiz-Linux"));

  if (assets.length === 0) {
    failure("No artifact found");
    return;
  }

  const artifact = assets[0];
  const tarArchivePath = await core.group("Download archive", async () => {
    const downloadURL = artifact.browser_download_url;
    core.info(`Downloading from ${downloadURL}`);
    const tarArchivePath = await tc.downloadTool(downloadURL);
    core.info(`Download complete!`);
    return tarArchivePath;
  });

  const archivePath = await core.group("Extract archive", async () => {
    core.info(`Extracting archive...`);
    const archivePath = await tc.extractTar(tarArchivePath);
    core.info(`Extract complete!`);
    return archivePath;
  });

  const exitCode = await core.group("Install wiz", async () => {
    core.info(`Installing wiz...`);
    const exitCode = await exec.exec("sh", [`${archivePath}/install.sh`]);
    if (exitCode !== 0) {
      return exitCode;
    }
    core.addPath("~/.wiz/bin");
    core.info(`Install complete!`);
    return exitCode;
  });
  if (exitCode !== 0) {
    failure("Install failed.");
    return;
  }
  callback(new Output("~./wiz/bin", release.tag_name));
}

async function run() {
  const env = process.env;
  const githubToken = env.GITHUB_TOKEN;
  const github = githubToken ? getOctokit(githubToken) : new GitHub();
  if (githubToken) {
    core.info("Found `GITHUB_TOKEN` environment variable! Use this for api request.")
  }

  const input = new Input(
    core.getInput(Input.VERSION, { required: false, trimWhitespace: true }),
    core.getBooleanInput(Input.UNINSTALL, { required: false })
  );
  return await main(
    input,
    github,
    (output) => {
      core.setOutput("path", output.path);
      core.setOutput("version", output.version);
    },
    (message) => {
      core.setFailed(message);
    }
  );
}

run();
