/* eslint-disable */
const fs = require('fs');
const YamlJs = require('yamljs');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

global.user_token = null;

/**
 * 读取yaml文件
 * @param file
 * @returns {*}
 */
function loadYamlFile(file) {
  return YamlJs.parse(fs.readFileSync(file, 'utf-8'));
}

const signConfig = loadYamlFile(path.resolve(__dirname, 'config.yaml'));

const oauth = {
  gateway: signConfig.gateway,
  organization: signConfig.id.organization,
  project: signConfig.id.project,
  code: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  username: signConfig.login.username,
  password: signConfig.login.password,
};

/**
 * 密码字符串编码
 * @param password
 * @returns {string}
 */
function encode(password) {
  let loginKey = oauth.code;
  let output = '';
  let chr1, chr2, chr3 = '';
  let enc1, enc2, enc3, enc4 = '';
  let i = 0;
  do {
    chr1 = password.charCodeAt(i++);
    chr2 = password.charCodeAt(i++);
    chr3 = password.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + loginKey.charAt(enc1) + loginKey.charAt(enc2)
      + loginKey.charAt(enc3) + loginKey.charAt(enc4);
  } while (i < password.length);
  return output;
}

/**
 * 登录，获取token
 * @param user
 * @returns {JQueryPromise<any> | JQueryPromise<void> | Request | PromiseLike<T> | Promise<T> | *}
 */
function login(user) {
  const password = encode(user.password);
  const req = Object.assign(user, { password });
  const authorize = '/oauth/oauth/authorize?scope=default&redirect_uri=http://api.staging.saas.hand-china.com&response_type=token&realm=default&state=client&client_id=client';
  return chai.request(oauth.gateway)
    .get(authorize)
    .redirects(0)
    .then((res) => {
      if (res.header['set-cookie']) {
        let cookie = res.header['set-cookie'][0].split(';')[0];
        return chai.request(oauth.gateway)
          .post('/oauth/login')
          .redirects(0)
          .set('Cookie', cookie)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(req)
          .then((res) => {
            if (res.header['set-cookie']) {
              cookie = res.header['set-cookie'][0].split(';')[0];
              return chai.request(oauth.gateway)
                .get(authorize)
                .redirects(0)
                .set('Cookie', cookie)
                .then((res) => {
                  const location = res.header['location'];
                  if (!location) {
                    throw new Error("未能获取Token");
                  }
                  // return location;
                  // Bearer 是 oauth2 框架规范
                  global.user_token = {
                    username: req.username,
                    token: `Bearer ${location.split('#access_token=')[1].split('&token_type')[0]}`,
                  };
                })
            }
          });
      }
    });
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * 登出
 */
function logout() {
  return chai.request(oauth.gateway)
    .get('/oauth/logout')
    .set('Authorization', global.user_token.token)
    .then(() => {
      global.user_token = null;
    });
}

module.exports = {
  oauth,
  login,
  logout,
  sleep,
};
