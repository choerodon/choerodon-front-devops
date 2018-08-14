/* eslint-disable prefer-arrow-callback,no-undef, func-names */
const envOverviewFunction = require('../../apiFunction/deploymentPipeline/EnvOverviewFunction');
const { oauth } = require('../../Utils');

const projectId = oauth.project;
const envId = oauth.env;
const query = { searchParam: {}, param: '' };
const pageInfo = { page: 0, size: 10, sort: { field: 'id', order: 'desc' } };


describe('EnvOverview Api', function () {
  it('[POST] 环境总览应用实例查询', function () {
    return envOverviewFunction.getlistByEnv(projectId, envId, query);
  });

  it('[POST] 分页查询环境总览域名', function () {
    return envOverviewFunction.getDomain(projectId, envId, pageInfo, query);
  });

  it('[POST] 分页查询环境总览网络', function () {
    return envOverviewFunction.getService(projectId, envId, pageInfo, query);
  });

  it('[GET] 项目下查询环境文件错误列表', function () {
    return envOverviewFunction.getErrorFiles(projectId, envId, pageInfo);
  });

  it('[GET] 查询环境同步状态', function () {
    return envOverviewFunction.getStatus(projectId, envId);
  });
});
