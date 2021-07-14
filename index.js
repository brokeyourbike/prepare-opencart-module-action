const fs = require('fs')
const path = require('path')
const core = require('@actions/core')
const AdmZip = require('adm-zip')

const moduleName = core.getInput('module-name')
const files = core.getInput('files')
const recursive = core.getInput('recursive') === 'true'

const destName = `${moduleName}.ocmod.zip`
const destPath = path.join(process.env.GITHUB_WORKSPACE, destName)

console.log(`Ready to zip ${files} into ${destName}`)

const zip = new AdmZip()

files.split(' ').forEach(fileName => {
  const filePath = path.join(process.env.GITHUB_WORKSPACE, fileName)

  if (!fs.existsSync(filePath)) {
    console.log(`  - ${fileName} (Not Found)`)
    return
  }

  const dir = path.dirname(fileName)
  const stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    const zipDir = dir === '.' ? fileName : dir
    zip.addLocalFolder(filePath, !recursive && zipDir)
  } else {
    const zipDir = dir === '.' ? '' : dir
    zip.addLocalFile(filePath, !recursive && zipDir)
  }

  console.log(`  - ${fileName}`)
})

zip.writeZip(destPath)

core.setOutput('output_name', destName)
core.setOutput('output_file', destPath)

console.log(`\nZipped file ${destName} successfully`)
