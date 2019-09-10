const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

var config = {
  target: 'node',
  entry: './samples/index.ts',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.ts' ]
  },
  externals: [ nodeExternals() ],
  output: {
    path: path.resolve(__dirname, 'build/samples'),
    filename: 'samples.js'
  }
};

module.exports = config;
