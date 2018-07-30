/* eslint-disable prefer-arrow-callback,no-undef */
const { getEnableApp, getBaseUrl, getAllMergeRequest, getMergeRequest } = require('../../apiFunction/developmentPipeline/MergeRequestFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');


const organizationId = utils.oauth.organization;
const projectId = utils.oauth.project;
const appId = 349;

describe('MergeRequest Api', function () {
  it('[GET] 项目下查询所有已经启用的应用', function () {
    return getEnableApp(projectId);
  });

  it('[GET] 获取工程下地址', function () {
    return getBaseUrl(projectId, appId);
  });

  it('[GET] 项目下查看所有合并请求', function () {
    return getAllMergeRequest(projectId, appId);
  });

  it('[GET] 项目下查看开放的合并请求', function () {
    return getMergeRequest(projectId, appId, 'opened');
  });
  it('[GET] 项目下查看已合并的合并请求', function () {
    return getMergeRequest(projectId, appId, 'merged');
  });
  it('[GET] 项目下查看已关闭的合并请求', function () {
    return getMergeRequest(projectId, appId, 'closed');
  });
});
