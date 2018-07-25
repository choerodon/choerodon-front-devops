const chai = require('chai');
const utils = require('../Utils');

const expect = chai.expect;

const token = null;

describe('Login Flow Test', function () {
  it('should get Token when login success', function () {
    const user = {
      username: 'test',
      password: 'test',
    };
    return utils.login(user, 'success')
      .then(function (res) {
        console.log(res.header);
      });
  });
});
