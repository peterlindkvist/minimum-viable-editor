'use strict';

var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    index : path.join(__dirname, 'client', 'index.js'),
    loader : path.join(__dirname, 'client', 'loader.js'),
  },
  output: {
    path: path.join(__dirname, 'assets'),
    filename: '[name].js'
    //publicPath: path.join(__dirname, 'assets')
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
          presets: ['es2015', 'stage-2'],
      }
    }, {
      test: /\.json?$/,
      loader: 'json-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
};
