"use strict";
const LoadableWebpackPlugin = require("@loadable/webpack-plugin");
const { loadableTransformer } = require("loadable-ts-transformer");
const path = require("path");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  plugins: ["typescript", "scss"],
  resolve: {
    alias: {
      styles: path.join(__dirname, "src/style/")
    }
  },
  options: {
    buildType: "iso"
  },
  modifyWebpackConfig({
    env: {
      target, // the target 'node' or 'web'
      dev // is this a development build? true or false
    },
    webpackConfig, // the created webpack config
    webpackObject, // the imported webpack node module
    options: {
      pluginOptions, // the options passed to the plugin ({ name:'pluginname', options: { key: 'value'}})
      razzleOptions, // the modified options passed to Razzle in the `options` key in `razzle.config.js` (options: { key: 'value'})
      webpackOptions // the modified options that was used to configure webpack/ webpack loaders and plugins
    },
    paths // the modified paths that will be used by Razzle.
  }) {
    // Do some stuff to webpackConfig
    if (target === "web") {
      const filename = path.resolve(__dirname, "build");
      // saving stats file to build folder
      // without this, stats files will go into
      // build/public folder
      webpackConfig.plugins.push(
        new LoadableWebpackPlugin({
          outputAsset: true,
          writeToDisk: { filename }
        })
      );
    }

    // Enable SSR lazy-loading
    const tsLoader = webpackConfig.module.rules.find(
      (rule) => !(rule.test instanceof Array) && rule.test && rule.test.test(".tsx")
    );
    tsLoader.use[0].options.getCustomTransformers = () => ({ before: [loadableTransformer] });

    if (target === "web" && dev) {
      webpackConfig.plugins.push(new BundleAnalyzerPlugin());
    }
    webpackConfig.devtool = dev ? "source-map" : false;
    return webpackConfig;
  }
};
