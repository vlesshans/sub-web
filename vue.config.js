/* eslint-disable */
const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // 🔧 部署路径（相对路径，适配 Cloudflare Pages）
  publicPath: './',

  // 📦 打包输出目录
  outputDir: 'dist',

  // 🚀 关闭 SourceMap，加快构建速度
  productionSourceMap: false,

  // 🚫 全局禁用 ESLint 检查（解决 no-console 报错）
  lintOnSave: false,

  // 🧠 Webpack 配置链式修改
  chainWebpack: config => {
    config.plugin('copy').tap(args => {
      const newPatterns = [];

      // ✅ 复制 _headers（Cloudflare Pages 自定义 Header 文件）
      const headersSrc = path.resolve(__dirname, '_headers');
      if (fs.existsSync(headersSrc)) {
        newPatterns.push({
          from: headersSrc,
          to: path.resolve(__dirname, 'dist'),
          noErrorOnMissing: true
        });
      }

      // ✅ 复制 _redirects（Cloudflare Pages 路由规则）
      const redirectsSrc = path.resolve(__dirname, 'public/_redirects');
      if (fs.existsSync(redirectsSrc)) {
        newPatterns.push({
          from: redirectsSrc,
          to: path.resolve(__dirname, 'dist/_redirects.txt'),
          noErrorOnMissing: true
        });
      }

      // ✅ 复制 config.json（Subconverter 配置文件）
      const configSrc = path.resolve(__dirname, 'public/config.json');
      if (fs.existsSync(configSrc)) {
        newPatterns.push({
          from: configSrc,
          to: path.resolve(__dirname, 'dist/config.json'),
          noErrorOnMissing: true
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

  // ⚙️ 构建完成后自动重命名文件
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
        }
      }
    ],
    optimization: { minimize: true },
    performance: { hints: false }
  }
};
