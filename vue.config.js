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

      // ✅ 复制 _headers
      const headersSrc = path.resolve(__dirname, '_headers');
      if (fs.existsSync(headersSrc)) {
        newPatterns.push({
          from: headersSrc,
          to: path.resolve(__dirname, 'dist'),
          noErrorOnMissing: true,
        });
      }

      // ✅ 复制 _redirects（修复 EISDIR 错误）
      const redirectsSrc = path.resolve(__dirname, 'public/_redirects');
      if (fs.existsSync(redirectsSrc)) {
        newPatterns.push({
          from: redirectsSrc,
          to: path.resolve(__dirname, 'dist/_redirects.txt'), // 临时改名防止目录冲突
          noErrorOnMissing: true,
        });
      }

      // ✅ 复制 config.json
      const configSrc = path.resolve(__dirname, 'public/config.json');
      if (fs.existsSync(configSrc)) {
        newPatterns.push({
          from: configSrc,
          to: path.resolve(__dirname, 'dist/config.json'),
          noErrorOnMissing: true,
        });
      }

      // 注入 patterns
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

  // ✅ 构建完成后重命名 _redirects.txt → _redirects
  configureWebpack: {
    plugins: [
      {
        apply: (compiler) => {
          compiler.hooks.done.tap('RenameRedirectsPlugin', () => {
            const src = path.resolve(__dirname, 'dist/_redirects.txt');
            const dest = path.resolve(__dirname, 'dist/_redirects');
            if (fs.existsSync(src)) {
              fs.renameSync(src, dest);
              console.log('✅ _redirects file renamed successfully.');
            }
          });
        },
      },
    ],
    optimization: { minimize: true },
    performance: { hints: false }
  }
};
