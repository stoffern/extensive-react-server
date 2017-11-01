#!/usr/bin/env node

const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');
const { hasYarn } = require('yarn-or-npm');
const command = process.argv[2];

const libFolder = path.resolve(process.cwd(), './node_modules/universal-app/lib/run')
const appName = process.argv[3] || ''
const appFolder = path.resolve(process.cwd(), appName)

function checkIfCurrentWorkingDirectoryIsEmpty(appName) {
  return new Promise(resolve => {
    console.log(`Scaffolding a new JavaScript application in ${process.cwd()}`);

    // Check if the current directory is empty
    fsExtra.ensureDirSync(path.resolve(process.cwd(), appName))
    const files = fs.readdirSync(path.resolve(process.cwd(), appName));
    if (files.filter(x => x !== '.git').length) {
      console.log('The current directory is not empty.');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      process.stdout.write('Are you sure you want to proceed? (y/N)? ');
      process.stdin.once('keypress', key => {
        rl.close();
        if (key === 'y' || key === 'Y') {
          console.log();
          resolve();
        } else {
          process.exit(0);
        }
      });
    } else {
      resolve();
    }
  });
}

async function installCore(appName) {
  var packageJson = path.resolve(process.cwd(), appName, 'package.json')
  try {
    await fsExtra.ensureFile(packageJson);
    await fsExtra.writeJson(packageJson, {name: appName})
    await installModule('universal-app')
  } catch (e) {
    console.log('Error creating package.json file')
    console.log(e)
  }
}

function installModule(module){
  return new Promise((resolve, reject) => {
    const ifWindows = /^win/.test(process.platform) ? '.cmd' : '';
    const options = { stdio: ['ignore', 'inherit', 'inherit'], cwd: path.resolve(process.cwd(), appName) };

    console.log(`Installing '${module}' from npm... This may take a couple minutes.`);
    if (hasYarn()){
      spawn('yarn'+ifWindows, ['add', module, '--save-dev'], options).on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to install '${module}'.`));
        }
      });

    }else{
      spawn('npm'+ifWindows, ['install', module, '--save-dev'], options).on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to install '${module}'.`));
        }
      });
    }
  });

}

function executeCommand(command) {
  return Promise.resolve()
    .then(() => require(path.resolve(libFolder,command+'.js'))())
}

async function run (){ 
  if (command === 'new') {
    try{
      await checkIfCurrentWorkingDirectoryIsEmpty(appName)
      await installCore(appName)
      await require(path.resolve(process.cwd(),'./node_modules/universal-app/lib/run/new.js'))(appFolder)
    }catch (e){
      console.error(process.argv.includes('--verbose') ? e.stack : `ERROR: ${e.message}`);
      process.exit(1);
    }
  } else if (/^[a-z0-9:\-.]+$/.test(command || '')) {
    // console.log(
    //   `Environment: ${process.env.APP_ENV}, ` +
    //   `build: ${process.env.NODE_ENV === 'development'
    //     ? 'development (non-optimized)' : 'release (optimized)'}, ` +
    //   `HMR: ${process.env.HMR === 'true' ? 'true' : 'false'}`
    // );

    executeCommand(command)
    .catch(err => {
      console.error(process.argv.includes('--verbose') ? err.stack : `ERROR: ${err.message}`);
      process.exit(1);
    });
  } else {
    console.log(`   __  __      _                            __`);
    console.log(`  / / / /___  (_)   _____  ______________ _/ /`);
    console.log(` / / / / __ \\/ / | / / _ \/ ___/ ___/ __ \`/ / `);
    console.log(`/ /_/ / / / / /| |/ /  __/ /  (__  ) /_/ / /  `);
    console.log(`\\____/_/ /_/_/ |___/\\___/_/  /____/\\__,_/_/ `);
    console.log()
    console.log(`                                  App CLI `);
    console.log();
    console.log(' Usage: ua-cli <command> [options]  or..');
    console.log(' Usage: ua <command> [options]');
    console.log();
    console.log(' Commands:');
    console.log();
    console.log('   new      - Scaffold a new JavaScript application project');
    console.log('   build    - Compile JavaScript application with Webpack');
    console.log('   run      - Run the app');
    console.log('   add      - Add module(s) to the app');
    console.log();
    console.log(' Options:');
    console.log();
    console.log('   --dev or --development');
    console.log('   --prod or --production');
    console.log();
    console.log('   --debug');
    console.log();
    console.log('   --no-hmr          - Disable Hot Module Replacement (HMR)');
    console.log('   --verbose         - Print more information to the console');
    console.log('   -v, --version     - Print React App SDK version');
    console.log();
    console.log(' For more information visit:');
    console.log();
    console.log('   https://github.com/stoffern/universal-app');
  }
}

run()