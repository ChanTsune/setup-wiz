import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import { getOctokit } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";

async function main(github: ReturnType<typeof getOctokit>) {
  // Check platform

  const response = await github.rest.actions.listArtifactsForRepo({
    owner: "ChanTsune",
    repo: "wiz",
  });

  const platformArtifacts = response.data.artifacts.filter(
    (it) => it.name === "wiz-Linux"
  );

  if (platformArtifacts.length === 0) {
    core.setFailed("No artifact found");
    return;
  }

  const artifact = platformArtifacts[0];
  const downloadURL = artifact.archive_download_url;
  core.info(`Downloading archive from ${downloadURL}`);
  const zipArchivePath = await tc.downloadTool(downloadURL);
  core.info(`Download complete!`);
  core.info(`Extracting archive...`);
  const tarArchivePath = await tc.extractZip(zipArchivePath);
  const archivePath = await tc.extractTar(`${tarArchivePath}/archive.tar.gz`);
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
