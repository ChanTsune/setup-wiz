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

  const zipArchivePath = await tc.downloadTool(downloadURL);
  const tarArchivePath = await tc.extractZip(zipArchivePath);
  const archivePath = await tc.extractTar(`${tarArchivePath}/archive.tar.gz`);

  const exitCode = await exec.exec('sh', [`${archivePath}/install.sh`]);
  if (exitCode != 0) {
    core.setFailed("Install failed.");
    return;
  }
}

main(new GitHub());
