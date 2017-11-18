const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const WriteFilePlugin = require('write-file-webpack-plugin')
const dotenv = require('dotenv').config()
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// if you're specifying externals to leave unbundled, you need to tell Webpack
// to still bundle `react-universal-component`, `webpack-flush-chunks` and
// `require-universal-module` so that they know they are running
// within Webpack and can properly make connections to client modules:
const externals = fs
  .readdirSync(path.resolve(process.cwd(), 'node_modules'))
  .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x))
  .reduce((externals, mod) => {
    externals[mod] = `commonjs ${mod}`
    return externals
  }, {})

externals['react-dom/server'] = 'commonjs react-dom/server'

module.exports = {
  name: 'server',
  target: 'node',
  devtool: 'eval',
  entry: path.resolve(__dirname, '../node_modules/universal-app/lib/utils/server-render'),
  externals,
  output: {
    path: path.resolve(__dirname, '../build/ssr'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      { 
        test: /\.css$/, 
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader', options: {
                minimize: true,
                sourceMap: true
              }
            }
          ]
        })
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
    new ExtractTextPlugin("styles.css"),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      }
    }),
  ],
}
