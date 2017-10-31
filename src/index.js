
import React from 'react'
import ReactDOM from 'react-dom'
import AppContainer from 'react-hot-loader/lib/AppContainer'
import { createClientRouter, createClientResolver } from './utils/Router'
import winston from 'winston'

import Config from './classes/Config';
import Server from './classes/Server';

export default class Rload {
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
    this.config.environment = props.environment || 'development'
    this.config.logLevel = props.logLevel || 3
    this.config.pathCwd = props.pathCwd || '../../'

    this.server.start()
  }
}

