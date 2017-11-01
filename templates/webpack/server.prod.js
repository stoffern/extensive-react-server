const path = require('path')
const webpack = require('webpack')
const dotenv = require('dotenv').config()

module.exports = {
  name: 'server',
  target: 'node',
  devtool: 'source-map',
  entry: path.resolve(__dirname, '../node_modules/universal-app/lib/utils/server-render'),
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
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      }
    }),
  ],
}
