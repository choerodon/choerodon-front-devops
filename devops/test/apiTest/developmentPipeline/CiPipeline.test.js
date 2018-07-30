/* eslint-disable prefer-arrow-callback,no-undef */
const { getCiPipeline, getCommits, pipelineAction } = require('../../apiFunction/developmentPipeline/CiPipelineFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');


const organizationId = utils.oauth.organization;
const projectId = utils.oauth.project;
const gitlabProjectId = 1323;
const appId = 349;
const pipelineId = 913;
const commits = ['df864f65be2a9032e6f48dc3064faca465224c6f', '0598e42ad265089c7d7be486807e9592cc7e63f4', '0598e42ad265089c7d7be486807e9592cc7e63f4'];

describe('CiPipeline Api', function () {
  it('[GET] 项目下查询应用CiPipeline', function () {
    return getCiPipeline(projectId, appId);
  });

  it('[POST] 项目下查询应用Commits', function () {
    return getCommits(projectId, gitlabProjectId, commits);
  });

  it('[POST] 重试pipeline', function () {
    return pipelineAction(projectId, gitlabProjectId, pipelineId, 'retry');
  });

  it('[POST] 取消pipeline', function () {
    return pipelineAction(projectId, gitlabProjectId, pipelineId, 'cancel');
  });
});
