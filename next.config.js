const path = require("path");
const withPWA = require("next-pwa")({
  dest: "public"
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA(
  {
    sassOptions: {
      includePaths: [path.join(__dirname, "src/styles")]
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.(mp3)$/,
        type: "asset/resource",
        generator: {
          filename: "static/chunks/[path][name].[hash][ext]"
        }
      });

      return config;
    }
  },
  {
    disableDevLogs: true
  }
);
module.exports = nextConfig;
