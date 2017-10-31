const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');
const { hasYarn } = require('yarn-or-npm');
const command = process.argv[2];

if (process.argv.includes('--verbose')) {
  process.env.VERBOSE = true;
}



function checkIfCurrentWorkingDirectoryIsEmpty() {
  return new Promise(resolve => {
    console.log(`Scaffolding a new JavaScript application in ${process.cwd()}`);

    // Check if the current directory is empty
    const files = fs.readdirSync(process.cwd());
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

function installCore() {
  const filename = path.resolve(process.cwd(), 'package.json');
  try {
    fs.accessSync(filename, fs.F_OK);
  } catch (e) {
    fs.writeFileSync(filename, '{}', 'utf8');
  }

  return new Promise((resolve, reject) => {
    const module = 'universal-app';
    console.log(`Installing '${module}' from npm... This may take a couple minutes.`);

    const ifWindows = /^win/.test(process.platform) ? '.cmd' : '';
    const options = { stdio: ['ignore', 'inherit', 'inherit'] };
    if (hasYarn()){
      spawn('yarn'+ifWindows, ['add', 'universal-app', '--save-dev'], options).on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to install '${module}'.`));
        }
      });

    }else{
      spawn('npm'+ifWindows, ['install', 'universal-app', '--save-dev'], options).on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to install '${module}'.`));
        }
      });
    }
  });
}

function run(command) {
  return require(
    path.resolve(process.cwd(), './node_modules/universal-app/lib/run')
  )(command);
}



if (command === 'new') {
  Promise.resolve()
    .then(() => checkIfCurrentWorkingDirectoryIsEmpty())
    .then(() => installCore())
    .then(() => (
      require(path.resolve(process.cwd(), '../node_modules/universal-app/lib/run/new'))
    ))
    .catch(err => {
      console.error(process.argv.includes('--verbose') ? err.stack : `ERROR: ${err.message}`);
      process.exit(1);
    });
} else if (/^[a-z0-9:\-.]+$/.test(command || '')) {
  console.log(
    `Environment: ${process.env.APP_ENV}, ` +
    `build: ${process.env.NODE_ENV === 'development'
      ? 'development (non-optimized)' : 'release (optimized)'}, ` +
    `HMR: ${process.env.HMR === 'true' ? 'true' : 'false'}`
  );

  run(command === 'start' ? 'run' : command)
  .catch(err => {
    console.error(process.argv.includes('--verbose') ? err.stack : `ERROR: ${err.message}`);
    process.exit(1);
  });
} else {
  console.log(`     __  __      _                            __`);
  console.log(`  / / / /___  (_)   _____  ______________ _/ /`);
  console.log(` / / / / __ \/ / | / / _ \/ ___/ ___/ __ `/ / `);
  console.log(`/ /_/ / / / / /| |/ /  __/ /  (__  ) /_/ / /  `);
  console.log(`\\____/_/ /_/_/ |___/\___/_/  /____/\__,_/_/ `);
  console.log();
  console.log(' Usage: ua <command> [options]');
  console.log();
  console.log(' Commands:');
  console.log();
  console.log('   new      - Scaffold a new JavaScript application project');
  console.log('   build    - Compile JavaScript application with Webpack');
  console.log('   run      - Run the app');
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