const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  productionSourceMap: false,

  chainWebpack: config => {
    config.plugin('copy').tap(args => {
      const newPatterns = [];

      // _headers
      if (fs.existsSync(path.resolve(__dirname, '_headers'))) {
        newPatterns.push({
          from: path.resolve(__dirname, '_headers'),
          to: path.resolve(__dirname, 'dist/_headers')
        });
      }

      // _redirects
      if (fs.existsSync(path.resolve(__dirname, 'public/_redirects'))) {
        newPatterns.push({
          from: path.resolve(__dirname, 'public/_redirects'),
          to: path.resolve(__dirname, 'dist/_redirects')
        });
      }

      // config.json
      if (fs.existsSync(path.resolve(__dirname, 'public/config.json'))) {
        newPatterns.push({
          from: path.resolve(__dirname, 'public/config.json'),
          to: path.resolve(__dirname, 'dist/config.json')
        });
      }

      if (Array.isArray(args) && args[0] && args[0].patterns) {
        args[0].patterns.push(...newPatterns);
      } else if (Array.isArray(args)) {
        args.push(...newPatterns);
      } else {
        args[0] = { patterns: newPatterns };
      }

      return args;
    });
  },

  configureWebpack: {
    optimization: { minimize: true },
    performance: { hints: false }
  }
};
