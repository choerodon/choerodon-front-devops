/* eslint-disable prefer-arrow-callback,no-undef */
const { getInstanceAll, getAllApp, getMultiAppIst, getAppByEnvId, getIstStages, getIstResources, getIstValue, getIstValueByIds, delIstById, istAction, istUpdateVersion } = require('../../apiFunction/deploymentPipeline/InstanceFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');

const { project, env } = utils.oauth;
const pageInfo = { page: 0, size: 15, sort: { field: 'id', order: 'desc' } };
const query = { searchParam: {}, param: '' };
const delAppInstanceId = 175;
const appInstanceId = 176;
const idArr = {
  env,
  versionId: 322,
  appId: 368,
};
const idArr1 = {
  env,
  appId: 368,
};
const idArr2 = {
  env,
};

describe('Instance Api', function () {
  it('[POST] 分页查询应用实例', function () {
    return getInstanceAll(project, pageInfo, query);
  });

  it('[POST] 根据环境ID分页查询应用实例', function () {
    return getInstanceAll(project, pageInfo, query, idArr2);
  });

  it('[POST] 根据环境ID&应用ID分页查询应用实例', function () {
    return getInstanceAll(project, pageInfo, query, idArr1);
  });

  it('[POST] 根据环境ID&应用ID&版本ID分页查询应用实例', function () {
    return getInstanceAll(project, pageInfo, query, idArr);
  });

  it('[GET] 查询项目下所有应用', function () {
    return getAllApp(project);
  });

  it('[GET] 多应用实例查询', function () {
    return getMultiAppIst(project);
  });

  it('[GET] 根据环境ID分页获取已部署正在运行实例的应用', function () {
    this.skip();
    return getAppByEnvId(project, idArr.envId);
  });

  it('[GET] 获取部署实例hook阶段', function () {
    return getIstStages(project, appInstanceId);
  });

  it('[GET] 获取部署实例资源对象', function () {
    return getIstResources(project, appInstanceId);
  });

  it('[GET] 获取部署Value', function () {
    return getIstValue(project, appInstanceId);
  });

  it('[GET] 根据IDS获取部署Value', function () {
    this.skip();
    return getIstValueByIds(project, idArr);
  });

  it('[DEL] 删除实例', function () {
    this.skip();
    return delIstById(project, delAppInstanceId);
  });

  it('[PUT] 停止实例', function () {
    this.skip();
    return istAction(project, appInstanceId, 'stop');
  });

  it('[PUT] 重启实例', function () {
    this.skip();
    return istAction(project, appInstanceId, 'start');
  });

  it('[GET] 获取升级实例版本', function () {
    return istUpdateVersion(project, idArr.versionId);
  });
});
