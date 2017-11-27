import React from 'react'
import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import uuidv4 from 'uuid/v4'
import webpackMerge  from 'webpack-merge'


export default class Webpack {
  constructor(props, parent) {
    this.parent = parent;
    this.compileConfigs = [];


    this.externals = []
    let modulesPath = path.resolve(process.cwd(), 'node_modules')
    if (fs.existsSync(modulesPath) && fs.lstatSync(modulesPath).isDirectory())
      this.externals = fs
        .readdirSync(modulesPath)
        .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x))
        .reduce((externals, mod) => {
          externals[mod] = `commonjs ${mod}`
          return externals
        }, {})

    this.clientConfig = {
      name: 'client',
      target: 'web',
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader',
          },
        ],
      },
      resolve: {
        extensions: ['.js'],
      },
    }

    this.serverConfig ={
      name: 'server',
      target: 'node',
      devtool: 'eval',
      entry: path.resolve(process.cwd(), 'node_modules/extensive-react-server/lib/utils/server-render'),
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader',
          }
        ],
      },
      resolve: {
        extensions: ['.js'],
      },
    }

    if (props.isDevMode){
      this.setClientConfigDev()
      this.setServerConfigDev()
    }else{
      this.setClientConfigProd()
      this.setServerConfigProd()
    }
  }

  setClientConfigDev(){
    this.clientConfig = webpackMerge(true, this.clientConfig, {
      entry: [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
        'react-hot-loader/patch',
        path.resolve(process.cwd(), 'node_modules/extensive-react-server/lib/utils/client-render'),
      ],
      output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(process.cwd(), 'build/client'),
        publicPath: '/static/',
      },
      plugins: [
        new webpack.optimize.CommonsChunkPlugin({
          names: ['bootstrap'],
          filename: '[name].js',
          minChunks: Infinity,
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('development'),
          }
        }),
      ],
    })
  }

  setClientConfigProd(){
    this.clientConfig = webpackMerge(true, this.clientConfig, {
      entry: path.resolve(process.cwd(), 'node_modules/extensive-react-server/lib/utils/client-render'),
      output: {
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        path: path.resolve(process.cwd(), 'build/client'),
        publicPath: '/static/',
      },
      plugins: [
        new webpack.optimize.CommonsChunkPlugin({
          names: ['bootstrap'],
          filename: '[name].[chunkhash].js',
          minChunks: Infinity,
        }),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production'),
          },
        }),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            screw_ie8: true,
            warnings: false,
          },
          mangle: {
            screw_ie8: true,
          },
          output: {
            screw_ie8: true,
            comments: false,
          },
          sourceMap: true,
        }),
        new webpack.HashedModuleIdsPlugin(),
      ],
    })
  }

  setServerConfigDev(){
    let externals = this.externals;
    this.serverConfig = webpackMerge(true, this.serverConfig, {
      externals,
      output: {
        path: path.resolve(__dirname, 'build/ssr'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
      },
      plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('development'),
          }
        }),
      ],
    })
  }

  setServerConfigProd(){
    this.serverConfig = webpackMerge(true, this.serverConfig, {
      devtool: 'source-map',
      output: {
        path: path.resolve(process.cwd(), 'build/ssr'),
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        libraryTarget: 'commonjs2',
      },
      plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),

        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production'),
          },
        }),
      ],
    })
  }

  /**
   * [updateClientConfig description]
   * @param  {[type]} cfg [description]
   * @return {[type]}     [description]
   */
  updateClientConfig(cfg={}){
    let strategy ={}
    if (cfg.entry && cfg.entry.length > 0){
      strategy.entry = 'replace'
    }
    this.clientConfig = webpackMerge.strategy(strategy)(this.clientConfig, cfg)
  }

  /**
   * [updateServerConfig description]
   * @param  {[type]} cfg [description]
   * @return {[type]}     [description]
   */
  updateServerConfig(cfg={}){
    let strategy ={}
    if (cfg.entry && cfg.entry.length > 0){
      strategy.entry = 'replace'
    }
    this.serverConfig = webpackMerge.strategy(strategy)(this.serverConfig, cfg)
  }

  /**
   * [addToCompile description]
   * @param {[type]} cfg [description]
   */
  addToCompile(cfg={}){
    this.compileConfigs.push(cfg)
    return this.compileConfigs.length-1
  }

  /**
   * [updateConfigWithStrategy description]
   * @param  {[type]} strategy [description]
   * @param  {[type]} config   [description]
   * @return {[type]}          [description]
   */
  async updateConfigWithStrategy(strategy, config){
    if (!typeof strategy === 'object' || !typeof config === 'object'){
      this.parent.logger.warn('[Webpack] updateConfigWithStrategy(strategy, object) - You must pass a object')
    }
    this.updateServerConfigWithStrategy(strategy, config)
    this.updateClientConfigWithStrategy(strategy, config)
  }

  /**
   * [updateServerConfigWithStrategy description]
   * @param  {[type]} strategy [description]
   * @param  {[type]} config   [description]
   * @return {[type]}          [description]
   */
  async updateServerConfigWithStrategy(strategy, config){
    if (!typeof strategy === 'object' || !typeof config === 'object'){
      this.parent.logger.warn('[Webpack] updateServerConfigWithStrategy(strategy, object) - You must pass a object')
    }
    this.serverConfig = webpackMerge.strategy(strategy)(this.serverConfig, config)
  }

  /**
   * [updateClientConfigWithStrategy description]
   * @param  {[type]} strategy [description]
   * @param  {[type]} config   [description]
   * @return {[type]}          [description]
   */
  async updateClientConfigWithStrategy(strategy={}, config={}){
    if (!typeof strategy === 'object' || !typeof config === 'object'){
      this.parent.logger.warn('[Webpack] updateClientConfigWithStrategy(strategy, object) - You must pass a object')
    }
    this.clientConfig = webpackMerge.strategy(strategy)(this.clientConfig, config)
  }

  /**
   * Add webpack module bundler
   * @param {object} config [description]
   */
  async addPlugin(config={}){
    if (!typeof config === 'object'){
      this.parent.logger.warn('[Webpack] updateClientConfigWithStrategy(strategy, object) - You must pass a object')
    }
    this.updateConfigWithStrategy({'plugins':'append'}, {plugins: [config]})
  }

  /**
   * [addPlugins description]
   * @param {[type]} config [description]
   */
  async addPlugins(config=[]){
    if (!config.isArray){
      this.parent.logger.warn('[Webpack] updateClientConfigWithStrategy(strategy, object) - You must pass a object')
    }
    configs.map(config => this.addPlugin(config))
  }


  /**
   * Add webpack module bundler
   * @param {object} config [description]
   */
  async addModule(config={}){
    if (!typeof config === 'object'){
      this.parent.logger.warn('[Webpack] updateClientConfigWithStrategy(strategy, object) - You must pass a object')
    }
    this.updateConfigWithStrategy({'module.rules':'append'}, {module:{rules: [config]}})
  }

  /**
   * [addModules description]
   * @param {[type]} configs [description]
   */
  async addModules(configs=[]){
    if (!config.isArray){
      this.parent.logger.warn('[Webpack] updateClientConfigWithStrategy(strategy, object) - You must pass a object')
    }
    configs.map(config => this.addModule(config))
  }

  /**
   * [addVariable description]
   * @param {[type]} obj [description]
   */
  async addVariable(obj={}){
    if (!typeof obj === 'object'){
      this.parent.logger.warn('[Webpack] addVariable(object) - You must pass a object')
    }
    this.updateConfigWithStrategy({'plugins':'append'}, {plugins: [new webpack.DefinePlugin(obj)]})
  }
  
  /**
   * [compile description]
   * @return {[type]} [description]
   */
  async compile(){
    await this.updateClientConfig({name: this.clientConfig.name+'-'+uuidv4()})
    await this.updateServerConfig({name: this.serverConfig.name+'-'+uuidv4()})
    let compile = await webpack([this.clientConfig, this.serverConfig])
    return compile
  }

  /**
   * [compileWithCallback description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  async compileWithCallback(callback){
    await this.updateClientConfig({name: this.clientConfig.name+'-'+uuidv4()})
    await this.updateServerConfig({name: this.serverConfig.name+'-'+uuidv4()})
    let compile = await webpack([this.clientConfig, this.serverConfig]).run(callback)
    return compile
  }

  /**
   * [createUniqueName description]
   * @param  {[type]} c [description]
   * @return {[type]}   [description]
   */
  createUniqueName(c){
    let id = uuidv4()
    return Object.assign(c, {name: c.name+'-'+uuidv4()})
  }

}
