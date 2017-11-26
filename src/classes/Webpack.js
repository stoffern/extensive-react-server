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

  updateClientConfig(cfg){
    let strategy ={}
    if (cfg.entry && cfg.entry.length > 0){
      strategy.entry = 'replace'
    }
    this.clientConfig = webpackMerge.strategy(strategy)(this.clientConfig, cfg)
  }

  updateServerConfig(cfg){
    let strategy ={}
    if (cfg.entry && cfg.entry.length > 0){
      strategy.entry = 'replace'
    }
    this.serverConfig = webpackMerge.strategy(strategy)(this.serverConfig, cfg)
  }

  addToCompile(cfg){
    this.compileConfigs.push(cfg)
    return this.compileConfigs.length-1
  }

  async addVariable(obj){
    if (!typeof obj === 'object'){
      this.parent.logger.warn('[Webpack] addVariable(object) - You must pass a object')
    }
    this.clientConfig = webpackMerge(this.clientConfig, {
      plugins: this.clientConfig.plugins.concat(new webpack.DefinePlugin(obj))
    })
    this.serverConfig = webpackMerge(this.serverConfig, {
      plugins: this.serverConfig.plugins.concat(new webpack.DefinePlugin(obj))
    })
  }
  
  async compile(){
    await this.updateClientConfig({name: this.clientConfig.name+'-'+uuidv4()})
    await this.updateServerConfig({name: this.serverConfig.name+'-'+uuidv4()})
    let compile = await webpack([this.clientConfig, this.serverConfig])
    return compile
  }

  async compileWithCallback(callback){
    await this.updateClientConfig({name: this.clientConfig.name+'-'+uuidv4()})
    await this.updateServerConfig({name: this.serverConfig.name+'-'+uuidv4()})
    let compile = await webpack([this.clientConfig, this.serverConfig]).run(callback)
    return compile
  }

  createUniqueName(c){
    let id = uuidv4()
    return Object.assign(c, {name: c.name+'-'+uuidv4()})
  }

}
