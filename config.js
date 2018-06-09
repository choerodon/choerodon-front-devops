process.env.NODE_ENV = 'development';
let env;
switch (process.env.NODE_ENV) {
    case ('development'):
        env = {
            'process.env.DEVOPS_HOST': JSON.stringify(process.env.DEVOPS_HOST || 'devops-service.staging.saas.hand-china.com')
        };
        break;
    case ('production'):
        env = {
            'process.env.DEVOPS_HOST': JSON.stringify(process.env.DEVOPS_HOST || 'devops-service.staging.saas.hand-china.com')
        };
        break;
    default:
        break;
}

const config = {
    port: 9090,
    output: './dist',
    htmlTemplate: 'index.template.html',
    devServerConfig: {},
    webpackConfig(config) {
        const webpack = require('./devops/node_modules/webpack');
        config.plugins.push(new webpack.DefinePlugin(env));
        return config;
    },
    entryName: 'index',
    root: '/',
    routes: null, //by default, routes use main in package.json
    server: 'http://api.staging.saas.hand-china.com', //api server
    clientid: 'localhost',
    titlename: 'Choerodon', //html title
    favicon: 'favicon.ico', //page favicon
    theme: { // less/sass modify vars
        'primary-color': '#3F51B5',
        'icon-font-size-base': '16px',
    },
};

module.exports = config;
