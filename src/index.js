import React from 'react'
import ReactDOM from 'react-dom'
import winston from 'winston'

import Config from './classes/Config';
import Server from './classes/Server';
import Webpack from './classes/Webpack';

module.exports = class UniversalApp {
  constructor(props) {
    this.config = props;
    this.logger = new winston.Logger({
      level: this.config.logLevel,
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'ua.log' })
      ]
    });
    this.server = new Server({}, this);
    this.webpack = new Webpack({}, this);
    this.logger.info('[Universal App] - Creating instance..')
  }

  /**
   * Starts the engine
   */
  start() {
    this.server.start();
  }

  /**
   * Adds routes to the route config
   * @param {array} routes [route, route2, routefolder, routefolder3]
   */
  addRoutes(routes){
    this.server.addRoutes(route)
  }

  /**
   * Adds a route file or folder to the route config
   * @param {string} route path/to/route.js
   */
  addRoute(route){
    this.server.addRoute(route)
  }

}
