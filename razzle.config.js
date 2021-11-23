'use strict';
const path = require('path');
const modifyBuilder = require('razzle-plugin-pwa').default

const pwaConfig = {
  swDest: path.resolve(__dirname, "build", "sw.js"),
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [{
      urlPattern: new RegExp('https://ecency.com'),
      handler: 'networkFirst'
  }]
}

const manifestConfig = {
  filename: 'manifest.json',
  name: 'Razzle App',
  short_name: 'Razzle',
  description: 'Another Razzle App',
  orientation: 'portrait',
  display: 'fullscreen',
  start_url: '.',
  theme_color: '#ffffff',
  background_color: '#ffffff',
  related_applications: [],
  icons: [
    {
      'src': require.resolve(path.join(__dirname,'public', 'logo192.png')),
      'sizes': '192x192',
      'type': 'image/png'
    },
    {
        'src': require.resolve(path.join(__dirname, 'public', 'logo512.png')),
        'sizes': '512x512',
        'type': 'image/png'
    }
  ]
}

const modify = modifyBuilder({ pwaConfig, manifestConfig })


module.exports = {
  plugins: ['typescript', 'scss', { func: modify }],
  options: {
    buildType: 'iso'
  },
  modifyWebpackConfig({
    env: {
      target, // the target 'node' or 'web'
      dev, // is this a development build? true or false
    },
    webpackConfig, // the created webpack config
    webpackObject, // the imported webpack node module
    options: {
      pluginOptions, // the options passed to the plugin ({ name:'pluginname', options: { key: 'value'}})
      razzleOptions, // the modified options passed to Razzle in the `options` key in `razzle.config.js` (options: { key: 'value'})
      webpackOptions, // the modified options that was used to configure webpack/ webpack loaders and plugins
    },
    paths, // the modified paths that will be used by Razzle.
  }) {
    // Do some stuff to webpackConfig
    webpackConfig.devtool = dev ? 'source-map' : false;


    webpackConfig.plugins.push(
      new InjectManifest({ swDest: "sw.js", swSrc: "services.js" }),
    );

    return webpackConfig;
  }
};
