const webpack = require('./boot/node_modules/webpack');

process.env.NODE_ENV = 'development';
let env;
switch (process.env.NODE_ENV) {
    case ('development'):
        env = {
            'process.env.DEVOPS_HOST': JSON.stringify('devops-service.staging.saas.hand-china.com')
        };
        break;
    case ('production'):
        env = {
            'process.env.DEVOPS_HOST': JSON.stringify('devops-service.staging.saas.hand-china.com')
        };
        break;
    default:
        break;
}

module.exports = (config) => {
    config.plugins.push(new webpack.DefinePlugin(env));
    return config;
}
