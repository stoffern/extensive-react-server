import React from 'react'
import ReactDOM from 'react-dom'
import winston from 'winston'

import Config from './classes/Config';
import Server from './classes/Server';
import Webpack from './classes/Webpack';

module.exports = class ExtensiveReactServer {
  constructor(props) {
    this.config = Object.assign({
      environment: 'development',
      hostname: 'localhost',
      port: 3000,

      options:{
        logRequests: true, 
        useJsonPretty: true, 
        useEtags: false,

        useHelmet: true,
        helmetOptions:{
          noCache: true,
          frameguard: {
            action: 'deny'
          }
        },
        useCompress: true,
        compressOptions:{
          threshold: 2048
        },

        useCors: true,
        corsOptions:{
          origin: '*'
        },
      }
    }, props);

    this.logger = new winston.Logger({
      level: this.config.logLevel,
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'server.log' })
      ]
    });
    this.server = new Server({}, this);
    this.webpack = new Webpack({}, this);
    this.logger.info('[ExtServer] - Creating instance..')
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
  addRouteSSR(prefix, app, webpackClient = {}, webpackServer = {}, options, middleware){
    this.server.addRouteSSR(prefix, app, webpackClient, webpackServer, options, middleware)
  }

}
