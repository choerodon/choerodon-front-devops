/* eslint-disable prefer-arrow-callback,no-undef */
const domainFunction = require('../../apiFunction/deploymentPipeline/DomainFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');

const projectId = utils.oauth.project;
const envId = utils.oauth.env;
const name = `ym-${uuidv1().substring(0, 5)}`;
const path = `/${uuidv1().substring(0, 3)}`;
const pageInfo = { page: 0, size: 15, sort: { field: 'id', order: 'desc' } };
const query = { searchParam: {}, param: '' };
const data = { domain: `${uuidv1().substring(0, 5)}.hand-china.com`, name, envId, pathList: [{ path, serviceId: 185 }] };

describe('Domain Api', function () {
  it('[POST] 项目下查询域名', function () {
    return domainFunction.getDomain(projectId, pageInfo, query);
  });

  it('[GET] 项目下查询单个域名', function () {
    const id = 80;
    return domainFunction.getDomainById(projectId, id);
  });


  it('[GET] 域名名称唯一性', function () {
    return domainFunction.checkDomainName(projectId, name, envId);
  });

  it('[GET] 域名唯一性', function () {
    return domainFunction.checkDomainPath(projectId, name, path);
  });

  it('[POST] 创建域名', function () {
    return domainFunction.createDomain(projectId, data);
  });

  it('[DEL] 删除域名', function () {
    this.skip();
    const delId = 103; // 已删除
    return domainFunction.delDomainById(projectId, delId);
  });

  it('[PUT] 更新域名', function () {
    const editId = 80;
    const datas = { domain: `${uuidv1().substring(0, 4)}.hand-china.com`, name, envId, pathList: [{ path: `/${uuidv1().substring(0, 2)}`, serviceId: 185 }] };
    return domainFunction.updateDomain(projectId, editId, datas);
  });
});
