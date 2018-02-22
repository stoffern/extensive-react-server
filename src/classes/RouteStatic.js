export default class RouteStatic {
  constructor(props, parent) {
    this.parent = parent;
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
