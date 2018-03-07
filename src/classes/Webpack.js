import React from "react";
import path from "path";
import fs from "fs";
import _ from "lodash";
import webpack from "webpack";
import uuidv4 from "uuid/v4";
import webpackMerge from "webpack-merge";
import findNodeModules from "find-node-modules";

export default class Webpack {
  constructor(props, parent) {
    this.parent = parent;
    this.compileConfigs = [];

    this.variables = {};
    this.getModulesPath();

    this.externals = [];
    let modulesPath = path.resolve(process.cwd(), "node_modules");
    if (fs.existsSync(modulesPath) && fs.lstatSync(modulesPath).isDirectory())
      this.externals = fs
        .readdirSync(modulesPath)
        .filter(
          x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x)
        )
        .reduce((externals, mod) => {
          externals[mod] = `commonjs ${mod}`;
          return externals;
        }, {});

    this.clientConfig = {
      name: "client",
      target: "web",
      module: {
        rules: [
          {
            test: /\.js$/,
            use: {
              loader: "babel-loader",
              options: {
                babelrc: true,
                comments: true
              }
            },
            exclude: /node_modules/
          },
          {
            test: /\.json$/,
            loader: "json-loader"
          }
        ]
      },
      resolve: {
        extensions: [".js"]
      }
    };

    this.serverConfig = {
      name: "server",
      target: "node",
      entry: path.join(this.modulesPath, "utils/server-render"),
      module: {
        rules: [
          {
            test: /\.js$/,
            use: {
              loader: "babel-loader",
              options: {
                babelrc: true,
                comments: true
              }
            },
            exclude: /node_modules/
          }
        ]
      },
      resolve: {
        extensions: [".js"]
      }
    };

    if (props.isDevMode) {
      this.setClientConfigDev();
      this.setServerConfigDev();
    } else {
      this.setClientConfigProd();
      this.setServerConfigProd();
    }
  }

  getModulesPath() {
    try {
      let modulesFolder = path.resolve(findNodeModules()[0]);
      let modulesPackage = path.resolve(modulesFolder, "@velop/server/lib");
      let srcFolder = path.join(modulesFolder, "..", "src");
      if (
        fs.existsSync(path.resolve(srcFolder)) &&
        fs.existsSync(path.resolve(srcFolder, "utils")) &&
        fs.existsSync(path.resolve(srcFolder, "utils", "client-render.js")) &&
        fs
          .lstatSync(path.resolve(srcFolder, "utils", "client-render.js"))
          .isFile()
      ) {
        this.modulesPath = srcFolder;
      } else if (fs.lstatSync(modulesPackage).isDirectory()) {
        this.modulesPath = modulesPackage;
      } else {
        this.parent.logger.info(
          "[VelopServer][Error] Could not find node_modules or source path...."
        );
        return "";
      }
    } catch (e) {
      this.parent.logger.info("[VelopServer][Error] " + e);
      this.parent.logger.info(
        "[VelopServer][Error] Could not find node_modules or source path...."
      );
      return "";
    }
  }

  setClientConfigDev() {
    this.clientConfig = webpackMerge(true, this.clientConfig, {
      mode: "development",
      entry: [
        "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false",
        "react-hot-loader/patch",
        path.join(this.modulesPath, "utils/client-render")
      ],
      output: {
        filename: "[name].js",
        chunkFilename: "[name].js",
        path: path.resolve(process.cwd(), "build/client"),
        publicPath: "/static/"
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
      ]
    });
  }

  setClientConfigProd() {
    this.clientConfig = webpackMerge(true, this.clientConfig, {
      mode: "production",
      entry: path.join(this.modulesPath, "utils/client-render"),
      output: {
        filename: "[name].[chunkhash].js",
        chunkFilename: "[name].[chunkhash].js",
        path: path.resolve(process.cwd(), "build/client"),
        publicPath: "/static/"
      },
      plugins: [new webpack.HashedModuleIdsPlugin()]
    });
  }

  setServerConfigDev() {
    let externals = this.externals;
    this.serverConfig = webpackMerge(true, this.serverConfig, {
      mode: "development",
      externals,
      output: {
        path: path.resolve(__dirname, "build/ssr"),
        filename: "[name].js",
        libraryTarget: "commonjs2"
      }
    });
  }

  setServerConfigProd() {
    this.serverConfig = webpackMerge(true, this.serverConfig, {
      mode: "production",
      output: {
        path: path.resolve(process.cwd(), "build/ssr"),
        filename: "[name].[chunkhash].js",
        chunkFilename: "[name].[chunkhash].js",
        libraryTarget: "commonjs2"
      }
    });
  }

  /**
   * [updateClientConfig description]
   * @param  {[type]} cfg [description]
   * @return {[type]}     [description]
   */
  updateClientConfig(cfg = {}) {
    let strategy = {};
    if (cfg.entry && cfg.entry.length > 0) {
      strategy.entry = "replace";
    }
    this.clientConfig = webpackMerge.strategy(strategy)(this.clientConfig, cfg);
  }

  /**
   * [updateServerConfig description]
   * @param  {[type]} cfg [description]
   * @return {[type]}     [description]
   */
  updateServerConfig(cfg = {}) {
    let strategy = {};
    if (cfg.entry && cfg.entry.length > 0) {
      strategy.entry = "replace";
    }
    this.serverConfig = webpackMerge.strategy(strategy)(this.serverConfig, cfg);
  }

  /**
   * [addToCompile description]
   * @param {[type]} cfg [description]
   */
  addToCompile(cfg = {}) {
    this.compileConfigs.push(cfg);
    return this.compileConfigs.length - 1;
  }

  /**
   * [updateConfigWithStrategy description]
   * @param  {[type]} strategy [description]
   * @param  {[type]} config   [description]
   * @return {[type]}          [description]
   */
  async updateConfigWithStrategy(strategy, config) {
    if (!typeof strategy === "object" || !typeof config === "object") {
      this.parent.logger.warn(
        "[Webpack] updateConfigWithStrategy(strategy, object) - You must pass a object"
      );
    }
    this.updateServerConfigWithStrategy(strategy, config);
    this.updateClientConfigWithStrategy(strategy, config);
  }

  /**
   * [updateServerConfigWithStrategy description]
   * @param  {[type]} strategy [description]
   * @param  {[type]} config   [description]
   * @return {[type]}          [description]
   */
  async updateServerConfigWithStrategy(strategy, config) {
    if (!typeof strategy === "object" || !typeof config === "object") {
      this.parent.logger.warn(
        "[Webpack] updateServerConfigWithStrategy(strategy, object) - You must pass a object"
      );
    }
    this.serverConfig = webpackMerge.strategy(strategy)(
      this.serverConfig,
      config
    );
  }

  /**
   * [updateClientConfigWithStrategy description]
   * @param  {[type]} strategy [description]
   * @param  {[type]} config   [description]
   * @return {[type]}          [description]
   */
  async updateClientConfigWithStrategy(strategy = {}, config = {}) {
    if (!typeof strategy === "object" || !typeof config === "object") {
      this.parent.logger.warn(
        "[Webpack] updateClientConfigWithStrategy(strategy, object) - You must pass a object"
      );
    }
    this.clientConfig = webpackMerge.strategy(strategy)(
      this.clientConfig,
      config
    );
  }

  /**
   * Add webpack module bundler
   * @param {object} config [description]
   */
  async addPlugin(config = {}) {
    if (!typeof config === "object") {
      this.parent.logger.warn(
        "[Webpack] addPlugin(object) - You must pass a object"
      );
    }
    this.updateConfigWithStrategy({ plugins: "append" }, { plugins: [config] });
  }

  /**
   * [addPlugins description]
   * @param {[type]} config [description]
   */
  async addPlugins(config = []) {
    if (!config.isArray) {
      this.parent.logger.warn(
        "[Webpack] addPlugins(array) - You must pass an array"
      );
    }
    configs.map(config => this.addPlugin(config));
  }

  /**
   * [addModule description]
   * @param {object} config [description]
   */
  async addModule(config = {}) {
    if (!typeof config === "object") {
      this.parent.logger.warn(
        "[Webpack] addModule(object) - You must pass a object"
      );
    }
    this.updateConfigWithStrategy(
      { "module.rules": "append" },
      { module: { rules: [config] } }
    );
  }

  /**
   * [addModules description]
   * @param {[type]} configs [description]
   */
  async addModules(configs = []) {
    if (!config.isArray) {
      this.parent.logger.warn(
        "[Webpack] addModules(array) - You must pass an array"
      );
    }
    configs.map(config => this.addModule(config));
  }

  /**
   * [addVariables description]
   * @param {[type]} obj [description]
   */
  async addVariables(array = []) {
    if (!array.isArray) {
      this.parent.logger.warn(
        "[Webpack] addVariables(array) - You must pass an array"
      );
    }
    array.map(cfg => this.addVariable(cfg));
  }

  /**
   * [addVariable description]
   * @param {[type]} obj [description]
   */
  async addVariable(obj = {}) {
    if (!typeof obj === "object") {
      this.parent.logger.warn(
        "[Webpack] addVariable(object) - You must pass a object"
      );
    }
    Object.assign(this.variables, obj);
  }

  /**
   * [addExtention description]
   * @param {[type]} obj [description]
   */
  async addExtention(string) {
    if (!typeof string === "string") {
      this.parent.logger.warn(
        "[Webpack] addExtention(string) - You must pass a string"
      );
    }
    this.clientConfig.resolve.extensions = _.union(
      this.clientConfig.resolve.extensions,
      [string]
    );
    this.serverConfig.resolve.extensions = _.union(
      this.serverConfig.resolve.extensions,
      [string]
    );
  }

  /**
   * [compileVariables description]
   * @return {[type]} [description]
   */
  async compileVariables() {
    let variables = {
      "process.env": this.variables
    };
    this.updateConfigWithStrategy(
      { plugins: "append" },
      { plugins: [new webpack.DefinePlugin(variables)] }
    );
  }

  /**
   * [compile description]
   * @return {[type]} [description]
   */
  async compile(callback) {
    this.compileVariables();
    this.updateClientConfig({
      name: this.clientConfig.name + "-" + uuidv4()
    });
    this.updateServerConfig({
      name: this.serverConfig.name + "-" + uuidv4()
    });

    const configs = webpack([this.clientConfig, this.serverConfig]);
    configs.compilers[0].plugin("done", () => {
      callback();
    });

    return configs;
  }

  /**
   * [compileWithCallback description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  async compileWithCallback(callback) {
    await this.compileVariables();
    await this.updateClientConfig({
      name: this.clientConfig.name + "-" + uuidv4()
    });
    await this.updateServerConfig({
      name: this.serverConfig.name + "-" + uuidv4()
    });
    let compile = await webpack([this.clientConfig, this.serverConfig]).run(
      callback
    );
    return compile;
  }
}
