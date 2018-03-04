import path from "path";
import Webpack from "./Webpack";

export default class RouteReact {
  constructor(
    prefix,
    app,
    wpClientCfg,
    wpServerCfg,
    options,
    middleware,
    parent
  ) {
    this.prefix = prefix;
    this.parent = parent;
    this.app = app;
    this.options = options;
    this.middleware = middleware;
    this.authMiddleware = null;

    this.webpack = new Webpack({ isDevMode: options.isDevMode }, this.parent);
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
      NODE_ENV: JSON.stringify(
        options.isDevMode ? "development" : "production"
      ),
      REACT_APP_PATH: JSON.stringify(this.app),
      REACT_ROUTE_PREFIX: JSON.stringify(path.posix.join("/", this.prefix))
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

  async setGraphqlEnpoint(endpoint) {
    if (!typeof endpoint === "string") {
      this.parent.logger.warn(
        "[Webpack] setGraphqlEnpoint(function) - You must pass a string"
      );
    }
    this.webpack.addVariable({ GRAPHQL_ENDPOINT: JSON.stringify(endpoint) });
  }

  addAuthentication(auth) {
    this.authMiddleware = auth;
  }
}
