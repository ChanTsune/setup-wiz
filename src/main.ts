import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import { getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";

async function main(github: ReturnType<typeof getOctokit>) {
  // Check platform
  const releaseListResponse = await github.rest.repos.listReleases({
    owner: "ChanTsune",
    repo: "wiz",
  });
  const releaseList = releaseListResponse.data.filter(
    (it) => it.tag_name == "dev-latest"
  );
  if (releaseList.length === 0) {
    core.setFailed("No release available");
    return;
  }
  const release = releaseList[0];
  const assets = release.assets.filter((it) => it.name.startsWith("wiz-Linux"));

  if (assets.length === 0) {
    core.setFailed("No artifact found");
    return;
  }

  const artifact = assets[0];
  const downloadURL = artifact.browser_download_url;
  core.info(`Downloading archive from ${downloadURL}`);
  const tarArchivePath = await tc.downloadTool(downloadURL);
  core.info(`Download complete!`);
  core.info(`Extracting archive...`);
  const archivePath = await tc.extractTar(tarArchivePath);
  core.info(`Extract complete!`);
  core.info(`Installing wiz...`);
  const exitCode = await exec.exec("sh", [`${archivePath}/install.sh`]);
  if (exitCode != 0) {
    core.setFailed("Install failed.");
    return;
  }
  core.addPath("~/.wiz/bin");
  core.info(`Install complete!`);
}

main(new GitHub());
