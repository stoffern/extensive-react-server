import fs from "fs";
import path from "path";
import send from "koa-send";
import passport from "koa-passport";
import mount from "koa-mount";

export default class RouteStatic {
  constructor(props, parent) {
    this.parent = parent;
    this.authMiddleware = (passport, ctx, next) => next();

    Object.assign(this, {
      type: props.type,
      filePath: props.filePath,
      servePath: props.servePath
    });

    if (!this.filePath || this.filePath.length == 0) {
      this.parent.logger.warn(
        "[VelopServer][Router] - called without a valid file/string."
      );
      return;
    }
  }

  /**
   * Setup with the correct config
   */
  async setup() {
    if (this.type == "file") this.addFile();
    else this.addFolder();
  }

  /**
   * Setup as a file route
   */
  addFile() {
    let isFile = fs.lstatSync(this.filePath).isFile();
    if (!isFile) {
      this.parent.logger.warn(
        "[VelopServer][Router] addStaticFile() - path:" +
          this.filePath +
          " - is not a file"
      );
      return;
    }

    try {
      var servePath = this.servePath;

      let publicPath =
        servePath == ""
          ? path.posix.join("/", path.basename(this.filePath))
          : path.posix.join("/", servePath);

      this.parent.router.api.get(
        publicPath,
        (ctx, next) => this.authMiddleware(passport, ctx, next),
        async (ctx, next) => {
          await send(ctx, path.basename(this.filePath), {
            root: path.dirname(this.filePath)
          });
        }
      );
    } catch (e) {
      this.parent.logger.warn("[VelopServer][Router] addStaticFile()");
      this.parent.logger.warn(e);
    }
  }

  /**
   * Setup as a folder route
   */
  addFolder() {
    try {
      let isDirectory = fs.lstatSync(this.filePath).isDirectory();
      if (!isDirectory) {
        this.parent.logger.warn(
          "[VelopServer][Route] addStaticFolder() - path:" +
            this.filePath +
            " - does not exist or is not a folder"
        );
        return;
      } else {
        this.parent.router.api.all(
          path.join(this.servePath, "/", "*"),
          this.serveFolder(path.resolve(this.filePath))
        );
      }
    } catch (e) {
      this.parent.logger.warn("[VelopServer][Router] addStaticFolder()");
      this.parent.logger.warn(e);
    }
  }

  serveFolder(root, opts) {
    const send = require("koa-send");

    opts = opts || {};
    opts.index = opts.index || "index.html";

    root = path.resolve(root);

    if (opts.debug) console.log('Static mounted on "%s"', root);

    return async function(ctx, next) {
      if (ctx.method != "GET" && ctx.method != "HEAD") await next();
      if (ctx.body != null || ctx.status != 404) await next();

      let file = ctx.params["0"] || "/" + opts.index;
      if (fs.existsSync(path.resolve(root, file))) {
        let requested = path.normalize(file);
        if (requested.length == 0 || requested == "/") requested = opts.index;
        await send(ctx, requested, { root: root });
      } else {
        return next();
      }
    };
  }

  addAuthentication(m) {
    this.authMiddleware = m;
  }
}
