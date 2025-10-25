const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // ✅ Cloudflare Pages 相对路径
  publicPath: './',

  // 输出目录
  outputDir: 'dist',

  // 关闭 SourceMap
  productionSourceMap: false,

  // ✅ 自动复制关键文件到 dist/
  chainWebpack: config => {
    config.plugin('copy').tap(args => {
      const newPatterns = [
        // Headers
        { from: path.resolve(__dirname, '_headers'), to: path.resolve(__dirname, 'dist/_headers') },
        // Redirects
        { from: path.resolve(__dirname, 'public/_redirects'), to: path.resolve(__dirname, 'dist/_redirects') },
        // Config.json
        { from: path.resolve(__dirname, 'public/config.json'), to: path.resolve(__dirname, 'dist/config.json') },
      ];

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

  // 优化设置
  configureWebpack: {
    optimization: { minimize: true },
    performance: { hints: false }
  }
};
