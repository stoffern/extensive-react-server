import fs from 'fs';
import path from 'path';

export default class Config {
  constructor(props, parent) {
    this.parent = parent;
    this.configPath = path.join(process.cwd(), 'config');

    let config = this.parseConfigFolder();
    Object.assign(this, config);
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
}
