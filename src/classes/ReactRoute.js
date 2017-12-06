import path from "path";
import Webpack from "./Webpack";

export default class ReactRoute {
  constructor(prefix, app, wpClientCfg, wpServerCfg, options, middleware) {
    this.prefix = prefix;
    this.app = app;
    this.options = options;
    this.middleware = middleware;

    this.webpack = new Webpack({ isDevMode: this.isDevMode }, this.parent);
    this.webpack.updateClientConfig(wpClientCfg);
    this.webpack.updateServerConfig(wpServerCfg);

    if (this.prefix.length > 0) {
      let publicPath = path.posix.join(
        "/",
        this.prefix,
        this.webpack.clientConfig.output.publicPath
      );
      this.webpack.updateClientConfig({ output: { publicPath: publicPath } });
    }

    this.webpack.addVariable({
      "process.env": {
        REACT_APP_PATH: JSON.stringify(this.app),
        ROUTE_PREFIX: JSON.stringify(path.posix.join("/", this.prefix))
      }
    });
  }

  async setHTML(fn) {
    if (!typeof fn === "function") {
      this.parent.logger.warn(
        "[ReactRoute] setHTML(function) - You must pass a function"
      );
    }
    this.webpack.addVariable({ RENDER_HTML_FUNCTION: fn });
  }
}
