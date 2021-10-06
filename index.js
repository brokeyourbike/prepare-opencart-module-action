const fs = require('fs')
const path = require('path')
const core = require('@actions/core')
const AdmZip = require('adm-zip')

const UPLOAD_FOLDER = 'upload'
const MODIFICATION_NAME = 'install.xml'
const LICENSE_NAME = 'LICENSE.txt'

const moduleName = core.getInput('module-name')
const files = core.getInput('files')
const modificationFile = core.getInput('modification-file')
const licenseFile = core.getInput('license-file')

const destName = `${moduleName}.ocmod.zip`
const destPath = path.join(process.env.GITHUB_WORKSPACE, destName)

console.log(`Ready to zip ${files} into ${destName}`)

const zip = new AdmZip()

if (files !== '') {
  files.split(' ').forEach(fileName => {
    const filePath = path.join(process.env.GITHUB_WORKSPACE, fileName)

    if (!fs.existsSync(filePath)) {
      console.log(`  - ${fileName} (Not Found)`)
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

    console.log(`  - ${fileName}`)
  })
}

if (modificationFile !== '') {
  const modificationFilePath = path.join(process.env.GITHUB_WORKSPACE, modificationFile)

  if (!fs.existsSync(modificationFilePath)) {
    core.setFailed(`Modification file - ${modificationFilePath} (Not Found)`)
  }

  zip.addLocalFile(modificationFilePath, '', MODIFICATION_NAME)
}

if (licenseFile !== '') {
  const licenseFilePath = path.join(process.env.GITHUB_WORKSPACE, licenseFile)

  if (!fs.existsSync(licenseFilePath)) {
    core.setFailed(`License file - ${licenseFilePath} (Not Found)`)
  }

  zip.addLocalFile(licenseFilePath, '', LICENSE_NAME)
}

zip.writeZip(destPath)

core.setOutput('output_name', destName)
core.setOutput('output_file', destPath)

console.log(`\nZipped file ${destName} successfully`)
