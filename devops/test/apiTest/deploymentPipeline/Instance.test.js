/* eslint-disable prefer-arrow-callback,no-undef */
const { getInstanceAll, getAllApp, getMultiAppIst, getAppByEnvId, getIstStages, getIstResources, getIstValue, getIstValueByIds, delIstById, istAction, istUpdateVersion } = require('../../apiFunction/deploymentPipeline/InstanceFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');

const projectId = utils.oauth.project;
const pageInfo = { page: 0, size: 15, sort: { field: 'id', order: 'desc' } };
const query = { searchParam: {}, param: '' };
const delAppInstanceId = 175;
const appInstanceId = 176;
const idArr = {
  envId: 60,
  versionId: 313,
  appId: 322,
};
const idArr1 = {
  envId: 60,
  appId: 322,
};
const idArr2 = {
  envId: 60,
};

describe('Instance Api', function () {
  it('[POST] 分页查询应用实例', function () {
    return getInstanceAll(projectId, pageInfo, query);
  });

  it('[POST] 根据环境ID分页查询应用实例', function () {
    return getInstanceAll(projectId, pageInfo, query, idArr2);
  });

  it('[POST] 根据环境ID&应用ID分页查询应用实例', function () {
    return getInstanceAll(projectId, pageInfo, query, idArr1);
  });

  it('[POST] 根据环境ID&应用ID&版本ID分页查询应用实例', function () {
    return getInstanceAll(projectId, pageInfo, query, idArr);
  });

  it('[GET] 查询项目下所有应用', function () {
    return getAllApp(projectId);
  });

  it('[GET] 多应用实例查询', function () {
    return getMultiAppIst(projectId);
  });

  it('[GET] 根据环境ID分页获取已部署正在运行实例的应用', function () {
    return getAppByEnvId(projectId, idArr.envId);
  });

  it('[GET] 获取部署实例hook阶段', function () {
    return getIstStages(projectId, appInstanceId);
  });

  it('[GET] 获取部署实例资源对象', function () {
    return getIstResources(projectId, appInstanceId);
  });

  it('[GET] 获取部署Value', function () {
    return getIstValue(projectId, appInstanceId);
  });

  it('[GET] 根据IDS获取部署Value', function () {
    return getIstValueByIds(projectId, idArr);
  });

  it('[DEL] 删除实例', function () {
    this.skip();
    return delIstById(projectId, delAppInstanceId);
  });

  it('[PUT] 停止实例', function () {
    this.skip();
    return istAction(projectId, appInstanceId, 'stop');
  });

  it('[PUT] 重启实例', function () {
    this.skip();
    return istAction(projectId, appInstanceId, 'start');
  });

  it('[GET] 获取升级实例版本', function () {
    return istUpdateVersion(projectId, idArr.versionId);
  });
});
