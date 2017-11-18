const path = require('path')
const webpack = require('webpack')
const WriteFilePlugin = require('write-file-webpack-plugin')
const dotenv = require('dotenv').config()
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  name: 'client',
  target: 'web',
  devtool: 'eval',
  entry: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
    'react-hot-loader/patch',
    path.resolve(__dirname, '../node_modules/universal-app/lib/utils/client-render'),
  ],
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, '../build/client'),
    publicPath: '/static/',
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
    new webpack.optimize.CommonsChunkPlugin({
      names: ['bootstrap'],
      filename: '[name].js',
      minChunks: Infinity,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin("styles.css"),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      }
    }),
  ],
}
