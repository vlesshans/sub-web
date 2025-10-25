const path = require('path');
const fs = require('fs');

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugin('copy').tap(args => {
      const newPatterns = [];

      // 复制 _headers
      const headersSrc = path.resolve(__dirname, '_headers');
      if (fs.existsSync(headersSrc)) {
        newPatterns.push({
          from: headersSrc,
          to: path.resolve(__dirname, 'dist'),
          noErrorOnMissing: true,
        });
      }

      // 复制 _redirects（修复 EISDIR 错误）
      const redirectsSrc = path.resolve(__dirname, 'public/_redirects');
      if (fs.existsSync(redirectsSrc)) {
        newPatterns.push({
          from: redirectsSrc,
          to: path.resolve(__dirname, 'dist/_redirects'),
          noErrorOnMissing: true,
        });
      }

      // 复制 config/config.json（修复配置加载问题）
      const configDir = path.resolve(__dirname, 'public/config');
      if (fs.existsSync(configDir)) {
        newPatterns.push({
          from: configDir,
          to: path.resolve(__dirname, 'dist/config'),
          noErrorOnMissing: true,
        });
      }

      // 注入 patterns
      if (Array.isArray(args[0].patterns)) {
        args[0].patterns.push(...newPatterns);
      } else if (Array.isArray(args)) {
        args.push(...newPatterns);
      } else {
        args[0] = { patterns: newPatterns };
      }

      return args;
    });
  },
};
