import React from 'react'
import ReactDOM from 'react-dom'
import winston from 'winston'

import Config from './classes/Config';
import Server from './classes/Server';

class UniversalApp {
  constructor(props) {
    this.config = new Config({}, this);
    this.server = new Server({}, this);
    this.logger = new winston.Logger({
      level: this.config.logLevel,
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'ua.log' })
      ]
    });
  }

  start(props) {
    Object.assign(this.config, {
      environment: 'development',
      logLevel: 3,
      pathCwd : '../../'
    })

    if (props)
      Object.assign(this.config, props)

    this.server.start()
  }
}
export default new UniversalApp()
