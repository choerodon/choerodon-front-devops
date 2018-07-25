/* eslint-disable prefer-arrow-callback,no-undef */
const { getAppTemplateByPage, checkTempalteCode, checkTempalteName, getAppTemplateAll } = require('../../apiFunction/AppManagement/AppTemplateFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');


const organizationId = 645;
const pageInfo = { page: 0, size: 15, sort: { field: 'id', order: 'desc' } };
const query = { searchParam: {}, param: '' };
const code = `mk-test-code-${uuidv1().substring(0, 5)}`;
const name = `mk-test-name-${uuidv1().substring(0, 5)}`;
// const name = 'MicroService';


describe('AppTemplate Api', function () {
  before(function () {
    this.timeout(5000);
    const reqBody = {
      username: utils.oauth.name,
      password: utils.oauth.password,
    };
    return utils.login(reqBody);
  });

  it('[POST] 组织下分页查询应用模板', function () {
    return getAppTemplateByPage(organizationId, pageInfo, query);
  });

  it('[GET] 组织下查询所有应用模板', function () {
    return getAppTemplateAll(organizationId);
  });

  it('[GET] 创建模板校验编码是否存在', function () {
    return checkTempalteCode(organizationId, code);
  });

  it('[GET] 创建模板校验名称是否存在', function () {
    return checkTempalteName(organizationId, name);
  });

  after(function () {
    utils.logout();
  });
});
