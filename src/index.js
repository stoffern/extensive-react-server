import React from "react";
import ReactDOM from "react-dom";
import winston from "winston";

import Server from "./classes/Server";
import Webpack from "./classes/Webpack";

module.exports = class ExtensiveReactServer {
  constructor(props) {
    this.config = Object.assign(
      {
        environment: "development",
        hostname: "localhost",
        port: 3000,

        options: {
          logToFile: false,
          logFile: "server.log",

          logRequests: true,
          useJsonPretty: true,
          useEtags: false,

          useHelmet: true,
          helmetOptions: {
            noCache: true,
            frameguard: {
              action: "deny"
            }
          },
          useCompress: true,
          compressOptions: {
            threshold: 2048
          },

          useDdos: true,
          ddosOptions: {
            burst: 10,
            limit: 15
          },

          useCors: true,
          corsOptions: {
            origin: "*"
          }
        }
      },
      props
    );

    let transports = [new winston.transports.Console()];
    if (this.config.options.logToFile)
      transports.push(
        new winston.transports.File({ filename: this.config.options.logFile })
      );

    this.logger = new winston.Logger({
      level: this.config.options.logLevel,
      transports: transports
    });

    this.server = new Server({}, this);
    this.webpack = new Webpack({}, this);
    this.logger.info("[ExtServer] - Creating instance..");
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
  addRouteFolder(routes) {
    this.server.router.addRouteFolder(route);
  }

  /**
   * Adds a route file or folder to the route config
   * @param {string} route path/to/route.js
   */
  addRoute(route) {
    this.server.router.addRoute(route);
  }

  /**
   * [description]
   * @param {[type]}
   */
  addStaticFile(filePath, servePath) {
    this.server.router.addStaticFile(filePath, servePath);
  }

  /**
   * [description]
   * @param {[type]}
   */
  addStaticFolder(filePath, servePath) {
    this.server.router.addStaticFolder(filePath, servePath);
  }

  /**
   * Adds a react app to the route
   * @param {string} prefix        [description]
   * @param {FoundRouter} router   [description]
   * @param {Object} webpackClient [description]
   * @param {Object} webpackServer [description]
   * @param {object} options       [description]
   * @param {array} middleware    [description]
   */
  addReactRoute(
    prefix,
    app,
    webpackClient = {},
    webpackServer = {},
    options = {},
    middleware = []
  ) {
    return this.server.addReactRoute(
      prefix,
      app,
      webpackClient,
      webpackServer,
      options,
      middleware
    );
  }
};
