import fs from 'fs';
import path from 'path';

//
//Handle config files
//
export default class Config {
  constructor(props, parent) {
    this.parent = parent;
    this.configPath = path.join(process.cwd(), 'config');

    let config = this.parseConfigFolder();
    Object.assign(this, config);

    if (let env = getEnvironmentVariable() !== ''){
      this.environment = env
    }else{
      this.environment = this.core.NODE_ENV
    }
  }

  parseConfigFolder() {
    let config = {};
    fs.readdirSync(this.configPath).forEach(file => {
      if (file == 'index.js') return;
      var name = file.substr(0, file.indexOf('.'));
      config[name] = require(path.join(this.configPath, name));
    });
    return config;
  }

  getEnvironmentVariable(){
    const nodeEnv = (process.env.NODE_ENV || '').toLowerCase();

    if (nodeEnv === 'prod' || nodeEnv === 'production') return 'production';
    else if (nodeEnv === 'dev' || nodeEnv === 'development') return 'development';
    else return '';
  }
}
