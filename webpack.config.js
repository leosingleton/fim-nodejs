const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = (env, argv) => {
  var typeScriptRule = {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/
  };

  return [
    // fim-nodejs library
    {
      target: 'node',
      entry: './src/index.ts',
      devtool: 'source-map',
      module: {
        rules: [ typeScriptRule ]
      },
      resolve: {
        extensions: [ '.ts' ]
      },
      externals: [
        '@leosingleton/commonlibs',
        'canvas',
        'gl',
        'jpeg-js',
        nodeExternals()
      ],
      output: {
        path: path.resolve(__dirname, 'build/dist'),
        filename: 'index.js',
        library: 'library',
        libraryTarget: 'commonjs2',
        umdNamedDefine: true,
        globalObject: '(typeof self !== "undefined" ? self : this)'
      }
    },

    // Sample NodeJS application
    {
      target: 'node',
      entry: './samples/index.ts',
      devtool: 'source-map',
      module: {
        rules: [ typeScriptRule ]
      },
      resolve: {
        extensions: [ '.ts' ]
      },
      externals: [ nodeExternals() ],
      output: {
        path: path.resolve(__dirname, 'build/samples'),
        filename: 'samples.js'
      }
    }
  ];
};
