import React from 'react'
import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import WriteFilePlugin from 'write-file-webpack-plugin'



export default class Webpack {
  constructor(props, parent) {
    this.parent = parent;
    this.compileConfigs = [];

    this.externals = fs
      .readdirSync(path.resolve(process.cwd(), '..', 'node_modules'))
      .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x))
      .reduce((externals, mod) => {
        externals[mod] = `commonjs ${mod}`
        return externals
      }, {})

    this.clientConfig = {
      name: 'client',
      target: 'web',
      devtool: 'eval',
      entry: [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
        'react-hot-loader/patch',
        path.resolve(process.cwd(), '../src/utils/client-render'),
      ],
      output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'build/client'),
        publicPath: '/static/',
      },
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
      plugins: [
        new WriteFilePlugin(),
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
    }

    this.serverConfig ={
      name: 'server',
      target: 'node',
      devtool: 'eval',
      entry: path.resolve(process.cwd(), '../src/utils/server-render'),
      externals: this.externals,
      output: {
        path: path.resolve(__dirname, 'build/ssr'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
      },
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
      plugins: [
        new WriteFilePlugin(),
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('development'),
          }
        }),
      ],
    }

  }

  setupClientConfig(config){
    Object.assign(this.clientConfig, config)
    return this
  }

  setupServerConfig(config){
    Object.assign(this.serverConfig, config)
    return this
  }

  addToCompile(){
    this.compileConfigs.push(config)
    return this.compileConfigs.length-1
  }

  async addVariable(obj){
    if (!typeof obj === 'object'){
      this.parent.logger.warn('[Webpack] addVariable(object) - You must pass a object')
    }

    Object.assign(this.clientConfig, {
      plugins:[ new webpack.DefinePlugin(obj) ]
    })
    Object.assign(this.serverConfig, {
      plugins:[ new webpack.DefinePlugin(obj) ]
    })
  }

  async compile(){
    let compile = await webpack(this.compileConfigs)
    return compile
  }

}
