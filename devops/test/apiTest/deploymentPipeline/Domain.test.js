/* eslint-disable prefer-arrow-callback,no-undef */
const domainFunction = require('../../apiFunction/deploymentPipeline/DomainFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');

const projectId = utils.oauth.project;
const pageInfo = { page: 0, size: 15, sort: { field: 'id', order: 'desc' } };
const query = { searchParam: {}, param: '' };
const envId = 92;

describe('Domain Api', function () {
  it('[POST] 项目下查询域名', function () {
    return domainFunction.getDomain(projectId, pageInfo, query);
  });
});
