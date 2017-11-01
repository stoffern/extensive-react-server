import fs from 'fs-extra'
import path from 'path'
import _ from 'lodash'
const { spawn } = require('child_process');
const { hasYarn } = require('yarn-or-npm');

var clientDir = path.resolve(process.cwd());
var projectName = path.basename(clientDir);
var uAppdir = path.resolve(__dirname, '..');

var selectedTemplate = 'default';

const ifWindows = /^win/.test(process.platform) ? '.cmd' : '';
const options = { stdio: ['ignore', 'inherit', 'inherit'] };



async function updateJsonFile(projectName){
  try{
    await fs.ensureFile(path.resolve(clientDir, 'package.json'))
    var jsonData = await fs.readJson(path.resolve(clientDir, 'package.json'))

    jsonData.name = projectName;
    jsonData.version = '0.0.1';

    await fs.outputFileSync(
      path.resolve(clientDir, 'package.json'), 
      JSON.stringify(jsonData, null, 2)
    )
    return jsonData
  }catch(e){

  }
}

function copyWepackFiles(){
  console.log('Copy webpack files..');
  return fs.copySync(path.resolve(uAppdir, '..', 'templates', 'webpack'), path.resolve(clientDir, 'webpack'))
}

function copyTemplate(){
  console.log('Copy template files..');
  return fs.copySync(path.resolve(uAppdir, '..', 'templates', 'default'), path.resolve(clientDir))
}
module.exports = async function init () {
  try{
    let json = await updateJsonFile(projectName)
    await copyWepackFiles();
    await copyTemplate();
    var jsonTemplate = await fs.readJson(path.resolve(clientDir, 'package.json'))
    let merge = await _.merge(jsonTemplate, json)

    await fs.outputJSON(
      path.resolve(clientDir, 'package.json'), 
      merge
    )
    console.log('Install remaining node modules..');

    var cmd = 'npm'
    if (hasYarn()){
      cmd = 'yarn'
    }
    spawn(cmd+ifWindows, ['install'], options).on('close', code => {
      if (code === 0) {
        console.log('installed')
      } else {
        new Error(`Failed to install '${module}'.`);
      }
    });
  }catch(e){

  }
}