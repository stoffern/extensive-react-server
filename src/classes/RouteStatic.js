import fs from "fs";
import path from "path";
import send from "koa-send";
import passport from "koa-passport";
import serve from "koa-static";
import mount from "koa-mount";

export default class RouteStatic {
  constructor(props, parent) {
    this.parent = parent;
    this.authMiddleware = (ctx, next) => next();

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
        this.parent.router.api.all(this.servePath, serve(this.filePath));
      }
    } catch (e) {
      this.parent.logger.warn("[VelopServer][Router] addStaticFolder()");
      this.parent.logger.warn(e);
    }
  }

  addAuthentication(m) {
    this.authMiddleware = m;
  }
}
