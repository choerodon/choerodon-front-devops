/* eslint-disable prefer-arrow-callback,no-undef */
const { getAppTemplateByPage, checkTempalteCode, checkTempalteName, getAppTemplateAll, createTemplate, updateTemplate, getAppTemplateById, delAppTemplateById } = require('../../apiFunction/appManagement/AppTemplateFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');


const organizationId = utils.oauth.organization;
const pageInfo = { page: 0, size: 15, sort: { field: 'id', order: 'desc' } };
const query = { searchParam: {}, param: '' };
const code = `mk-test-code-${uuidv1().substring(0, 5)}`;
const name = `mk-test-name-${uuidv1().substring(0, 5)}`;
const template = { name, description: `mk-test-description-${uuidv1().substring(0, 10)}`, code, organizationId };
const updateData = { name, description: `update-description-${uuidv1().substring(0, 10)}`, organizationId, objectVersionNumber: null, id: 56 };
const JavaLib = { name: `${name}-javalib`, description: `JavaLib mk-test-description-${uuidv1().substring(0, 10)}`, code: `${code}-javalib`, organizationId, copyFrom: 3 };
const MicroServiceFront = { name: `${name}-front`, description: `MicroServiceFront mk-test-description-${uuidv1().substring(0, 10)}`, code: `${code}-front`, organizationId, copyFrom: 2 };
const MicroService = { name: `${name}-mics`, description: `MicroService mk-test-description-${uuidv1().substring(0, 10)}`, code: `${code}-mics`, organizationId, copyFrom: 1 };
// const name = 'MicroService';


describe('AppTemplate Api', function () {
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

  it('[PUT] 更新应用模板', function () {
    return updateTemplate(organizationId, updateData);
  });

  it('[GET] 根据ID查询单个应用模板', function () {
    const id = 56;
    return getAppTemplateById(organizationId, id);
  });

  it('[DELETE] 根据ID删除单个应用模板', function () {
    const id = 52;
    this.skip();
    return delAppTemplateById(organizationId, id);
  });

  it('[GET] 创建空应用模板', function () {
    this.skip();
    return createTemplate(organizationId, template);
  });

  it('[GET] 创建复制于JavaLib的应用模板', function () {
    this.skip();
    return createTemplate(organizationId, JavaLib);
  });

  it('[GET] 创建复制于MicroService的应用模板', function () {
    this.skip();
    return createTemplate(organizationId, MicroService);
  });

  it('[GET] 创建复制于MicroServiceFront的应用模板', function () {
    this.skip();
    return createTemplate(organizationId, MicroServiceFront);
  });
});
