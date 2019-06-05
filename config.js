process.env.NODE_ENV = "development";
let env;
switch (process.env.NODE_ENV) {
  case "development":
    env = {
      "process.env.DEVOPS_HOST": JSON.stringify(
        process.env.DEVOPS_HOST || "devops-service.staging.saas.hand-china.com"
      )
    };
    break;
  case "production":
    env = {
      "process.env.DEVOPS_HOST": JSON.stringify(
        process.env.DEVOPS_HOST || "devops-service.staging.saas.hand-china.com"
      )
    };
    break;
  default:
    break;
}

const config = {
  port: 9090,
  output: "./dist",
  htmlTemplate: "index.template.html",
  devServerConfig: {},
  webpackConfig(configs) {
    const webpack = require("./devops/node_modules/webpack");
    configs.plugins.push(new webpack.DefinePlugin(env));
    return configs;
  },
  entryName: "index",
  root: "/",
  routes: null,
  server: "http://api.staging.saas.test.com", // api server
  clientid: "localhost",
  fileServer: "http://minio.staging.saas.test.com",
  titlename: "Choerodon",
  favicon: "favicon.ico",
  theme: {
    "primary-color": "#3F51B5",
    "icon-font-size-base": "16px"
  },
  dashboard: {
    devops: {
      components: "src/app/devops/dashboard/*",
      locale: "src/app/devops/locale/dashboard/*"
    }
  }
};

module.exports = config;
