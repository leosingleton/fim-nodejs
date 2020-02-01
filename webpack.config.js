const nodeExternals = require('webpack-node-externals');
const path = require('path');

const config = {
  target: 'node',
  entry: './src/index.ts',
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
    path: path.resolve(__dirname, 'build/dist'),
    filename: 'index.js',
    library: 'library',
    libraryTarget: 'commonjs2',
    umdNamedDefine: true,
    globalObject: '(typeof self !== "undefined" ? self : this)'
  }
};

module.exports = config;
