/** @type {import("next").NextConfig} */
const path = require("path");
const webpack = require("webpack");

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: [/* This is where the domain urls are put */]
  },
  webpack: config => {
    config.resolve.alias["@"] = path.join(__dirname, "src");
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("cesium")
      }),
    );
    return config;
  }
};

module.exports = nextConfig;
