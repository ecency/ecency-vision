const path = require("path");
const withPWA = require("next-pwa")({
  dest: "public"
});

const config = {
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
};

/** @type {import('next').NextConfig} */
const nextWithPWA = withPWA(config, {
  disableDevLogs: true
});
module.exports = process.env.NODE_ENV === "production" ? nextWithPWA : config;
