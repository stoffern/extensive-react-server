import fs from "fs";
import path from "path";
import KoaRouter from "koa-router";
import send from "koa-send";
import KoaStatic from "koa-static-server";

import RouteReact from "./RouteReact";
import RouteStatic from "./RouteStatic";

export default class Router {
  constructor(props, parent) {
    this.parent = parent;
    this.api = new KoaRouter();
    this.ReactRoutes = [];
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
    this.parent.logger.info("[Route] added: " + file);
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
  async addStaticFile(filePath, servePath = "") {
    if (!filePath || filePath.length == 0) {
      this.parent.logger.warn(
        "[VelopServer][Router] addStaticFile() - called without a valid file/string."
      );
      return;
    }

    try {
      let isFile = fs.lstatSync(filePath).isFile();
      if (!isFile) {
        this.parent.logger.warn(
          "[VelopServer][Router] addStaticFile() - path:" +
            filePath +
            " - is not a file"
        );
        return;
      } else {
        //send file
        this.parent.app.use(async (ctx, next) => {
          let publicPath =
            servePath == ""
              ? path.posix.join("/", path.basename(filePath))
              : path.posix.join("/", servePath);
          if (ctx.path == publicPath) {
            await send(ctx, path.basename(filePath), {
              root: path.dirname(filePath)
            });
            return next();
          } else return next();
        });
      }
    } catch (e) {
      this.parent.logger.warn("[VelopServer][Router] addStaticFile()");
      this.parent.logger.warn(e);
    }
  }

  /**
   * [addStaticFolder description]
   * @param {[type]} filePath  [description]
   * @param {[type]} servePath [description]
   */
  async addStaticFolder(filePath, servePath) {
    if (!filePath || filePath.length == 0) {
      this.parent.logger.warn(
        "[VelopServer][Router] addStaticFolder() - called without a valid file/string."
      );
      return;
    }

    try {
      let isFile = fs.lstatSync(filePath).isFile();
      let isDirectory = fs.lstatSync(filePath).isDirectory();
      if (!isFile && !isDirectory) {
        this.parent.logger.warn(
          "[VelopServer][Route] addStaticFolder() - path:" +
            filePath +
            " - does not exist"
        );
        return;
      } else {
        if (isFile) {
          this.addStaticFile(filePath);
        } else {
          this.parent.app.use(
            KoaStatic({ rootDir: filePath, rootPath: servePath })
          );
        }
      }
    } catch (e) {
      this.parent.logger.warn("[VelopServer][Router] addStaticFile()");
      this.parent.logger.warn(e);
    }
  }
}
