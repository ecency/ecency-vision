'use strict';

module.exports = {
  plugins: ['typescript', 'scss'],
  modifyWebpackConfig({
    env: {
      dev
    },
    webpackConfig,
  }) {
    webpackConfig.devtool = dev ? 'source-map' : false;
    return webpackConfig;
  },
  options: {
    buildType: 'spa'
  },
};