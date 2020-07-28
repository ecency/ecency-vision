'use strict';

module.exports = {
  plugins: ['typescript', 'scss'],
  modify: (config, { target, dev }) => {
    config.devtool = dev ? 'source-map' : false;
    return config;
  },
};