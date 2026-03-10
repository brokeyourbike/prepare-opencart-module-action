import { info, error, getInput, setOutput, setFailed } from '@actions/core';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

export const UPLOAD_FOLDER = 'upload';
export const MODIFICATION_NAME = 'install.xml';
export const LICENSE_NAME = 'LICENSE.txt';

export async function run(): Promise<void> {
  try {
    const githubWorkspace = process.env.GITHUB_WORKSPACE;

    if (typeof githubWorkspace !== 'string') {
      error('GITHUB_WORKSPACE is not a string');
      return;
    }

    const moduleName = getInput('module-name');
    const files = getInput('files');
    const modificationFile = getInput('modification-file');
    const licenseFile = getInput('license-file');

    const destName = `${moduleName}.ocmod.zip`;
    const destPath = path.join(githubWorkspace, destName);

    info(`Ready to zip ${files} into ${destName}`);

    const zip = new AdmZip();

    if (files !== '') {
      files.split(' ').forEach((fileName) => {
        const filePath = path.join(githubWorkspace, fileName);

        if (!fs.existsSync(filePath)) {
          error(`  - ${fileName} (Not Found)`);
          return;
        }

        const dir = path.dirname(fileName);
        const stats = fs.lstatSync(filePath);

        if (stats.isDirectory()) {
          const zipPath = dir === '.' ? fileName : dir;
          zip.addLocalFolder(filePath, path.join(UPLOAD_FOLDER, zipPath));
        } else {
          const zipPath = dir === '.' ? '' : dir;
          zip.addLocalFile(filePath, path.join(UPLOAD_FOLDER, zipPath));
        }

        info(`  - ${fileName}`);
      });
    }

    if (modificationFile !== '') {
      const modificationFilePath = path.join(githubWorkspace, modificationFile);

      if (!fs.existsSync(modificationFilePath)) {
        error(`Modification file - ${modificationFilePath} (Not Found)`);
        return;
      }

      zip.addLocalFile(modificationFilePath, '', MODIFICATION_NAME);
    }

    if (licenseFile !== '') {
      const licenseFilePath = path.join(githubWorkspace, licenseFile);

      if (!fs.existsSync(licenseFilePath)) {
        error(`License file - ${licenseFilePath} (Not Found)`);
        return;
      }

      zip.addLocalFile(licenseFilePath, '', LICENSE_NAME);
    }

    zip.writeZip(destPath);

    setOutput('output_name', destName);
    setOutput('output_file', destPath);
    info(`Zipped file ${destName} successfully`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to `run`';
    setFailed(message);
  }
}
