import * as core from '@actions/core'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'

export const UPLOAD_FOLDER = 'upload'
export const MODIFICATION_NAME = 'install.xml'
export const LICENSE_NAME = 'LICENSE.txt'

export async function run (): Promise<void> {
  try {
    const githubWorkspace = process.env.GITHUB_WORKSPACE

    if (typeof githubWorkspace !== 'string') {
      core.error('GITHUB_WORKSPACE is not a string')
      return
    }

    const moduleName = core.getInput('module-name')
    const files = core.getInput('files')
    const modificationFile = core.getInput('modification-file')
    const licenseFile = core.getInput('license-file')

    const destName = `${moduleName}.ocmod.zip`
    const destPath = path.join(githubWorkspace, destName)

    core.info(`Ready to zip ${files} into ${destName}`)

    const zip = new AdmZip()

    if (files !== '') {
      files.split(' ').forEach(fileName => {
        const filePath = path.join(githubWorkspace, fileName)

        if (!fs.existsSync(filePath)) {
          core.error(`  - ${fileName} (Not Found)`)
          return
        }

        const dir = path.dirname(fileName)
        const stats = fs.lstatSync(filePath)

        if (stats.isDirectory()) {
          const zipPath = dir === '.' ? fileName : dir
          zip.addLocalFolder(filePath, path.join(UPLOAD_FOLDER, zipPath))
        } else {
          const zipPath = dir === '.' ? '' : dir
          zip.addLocalFile(filePath, path.join(UPLOAD_FOLDER, zipPath))
        }

        core.info(`  - ${fileName}`)
      })
    }

    if (modificationFile !== '') {
      const modificationFilePath = path.join(githubWorkspace, modificationFile)

      if (!fs.existsSync(modificationFilePath)) {
        core.error(`Modification file - ${modificationFilePath} (Not Found)`)
        return
      }

      zip.addLocalFile(modificationFilePath, '', MODIFICATION_NAME)
    }

    if (licenseFile !== '') {
      const licenseFilePath = path.join(githubWorkspace, licenseFile)

      if (!fs.existsSync(licenseFilePath)) {
        core.error(`License file - ${licenseFilePath} (Not Found)`)
        return
      }

      zip.addLocalFile(licenseFilePath, '', LICENSE_NAME)
    }

    zip.writeZip(destPath)

    core.setOutput('output_name', destName)
    core.setOutput('output_file', destPath)
    core.info(`Zipped file ${destName} successfully`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to `run`'
    core.setFailed(message)
  }
}
