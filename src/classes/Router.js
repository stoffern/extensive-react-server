import fs from "fs";
import path from "path";
import KoaRouter from "koa-router";
import send from "koa-send";

import RouteReact from "./RouteReact";
import RouteStatic from "./RouteStatic";

export default class Router {
  constructor(props, parent) {
    this.parent = parent;
    this.api = new KoaRouter();
    this.ReactRoutes = [];
    this.staticFiles = [];
    this.staticFolders = [];
  }

  /**
   * [addReactRoute description]
   * @param {[type]} prefix      [description]
   * @param {[type]} app         [description]
   * @param {[type]} wpClientCfg [description]
   * @param {[type]} wpServerCfg [description]
   * @param {[type]} options     [description]
   * @param {[type]} middleware  [description]
   */
  addReactRoute(prefix, app, wpClientCfg, wpServerCfg, options, middleware) {
    Object.assign(options, { isDevMode: this.isDevMode });

    if (app.length == 0) {
      this.parent.logger.warn(
        "[VelopServer][Route] addReactRoute() - path to <App/> is missing"
      );
      return;
    }

    if (!fs.lstatSync(app).isFile()) {
      this.parent.logger.warn(
        "[VelopServer][Route] addReactRoute() - path to <App/> does not exist"
      );
      return;
    }

    let route = new RouteReact(
      prefix,
      app,
      wpClientCfg,
      wpServerCfg,
      options,
      middleware
    );

    this.ReactRoutes.push(route);
    return this.ReactRoutes[this.ReactRoutes.length - 1];
  }

  /**
   * Add a custom file route to router
   * @param {[string]} file path to file
   */
  async addRouteFile(file) {
    let route = require(file);
    route(this.api, this.parent.app, this.parent.config);
    this.parent.logger.info("[VelopServer][Route] added: " + file);
  }

  /**
   * Add a folder with custom routes to the router
   * @param {[string]} routeArray path to folder
   *                            with routes
   */
  async addRouteFolder(routeArray) {
    if (!routeArray.isArray()) {
      this.parent.logger.warn(
        "[VelopServer][Route] addRouteFolder() - the function should contain a array!"
      );
      return;
    }
    routeArray.map(route => this.addRoute(route));
  }

  /**
   * [addRoute description]
   * @param {[type]} route [description]
   */
  async addRoute(route) {
    if (!route || route.length == 0) {
      this.parent.logger.warn(
        "[VelopServer][Route] addRoute() - called without a valid file/string."
      );
      return;
    }
    route = path.resolve(process.cwd(), route);
    try {
      let isFile = fs.lstatSync(route).isFile();
      let isDirectory = fs.lstatSync(route).isDirectory();
      if (!isFile && !isDirectory) {
        this.parent.logger.warn(
          "[VelopServer][Route] addRoute() - path:" +
            route +
            " - does not exist"
        );
        return;
      } else {
        if (isFile) {
          this.addRouteFile(route);
        } else {
          let files = await fs.readdirSync(route);
          files.forEach(file => this.addRouteFile(path.resolve(route, file)));
        }
      }
    } catch (e) {
      this.parent.logger.warn(
        "[VelopServer][Route] addRoutesFolderOrFile() - " + e
      );
    }
  }

  /**
   * [addStaticFile description]
   * @param {[type]} filePath  [description]
   * @param {String} servePath [description]
   */
  addStaticFile(filePath, servePath = "") {
    let route = new RouteStatic(
      {
        type: "file",
        filePath: filePath,
        servePath: servePath
      },
      this.parent
    );

    this.staticFiles.push(route);
    return this.staticFiles[this.staticFiles.length - 1];
  }

  /**
   * [addStaticFolder description]
   * @param {[type]} filePath  [description]
   * @param {[type]} servePath [description]
   */
  addStaticFolder(filePath, servePath) {
    let route = new RouteStatic(
      {
        type: "folder",
        filePath: filePath,
        servePath: servePath
      },
      this.parent
    );

    this.staticFolders.push(route);
    return this.staticFolders[this.staticFolders.length - 1];
  }

  /**
   * Add all static routes to the route.
   * @return {[type]} [description]
   */
  async setupStaticRoutes() {
    if (this.staticFiles.length > 0)
      this.staticFiles.map(route => route.setup());

    if (this.staticFolders.length > 0)
      this.staticFolders.map(route => route.setup());
  }
}
