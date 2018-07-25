const chai = require('chai');
const { login, logout } = require('../Utils');

const { expect } = chai;

const token = null;

describe('Login flow test', function () {
  it('登录未成功，不能获取access_token', function () {
    const user = {
      username: 'test-error',
      password: 'test-error',
    };
    return login(user)
      .then(function () {
        expect(global.user_token).to.be.null;
      });
  });
  it('登录成功并获取access_token', function () {
    const user = {
      username: 'test',
      password: 'test',
    };
    return login(user)
      .then(function () {
        expect(global.user_token).to.be.an('object');
      });
  });
  it('登出成功', function () {
    return logout()
      .then(() => {
        expect(global.user_token).to.be.null;
      });
  });
});
