/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const _ = require('lodash');
const utils = require('../../Utils');

chai.should();
chai.use(chaiHttp);

function getInstanceAll(projectId, pageInfo, query, idArr) {
  let url = `/devops/v1/projects/${projectId}/app_instances/list_by_options?page=${pageInfo.page}&size=${pageInfo.size}`;
  if (idArr && idArr.envId && idArr.versionId && idArr.appId) {
    url = `/devops/v1/projects/${projectId}/app_instances/list_by_options?page=${pageInfo.page}&size=${pageInfo.size}&envId=${idArr.envId}&versionId=${idArr.versionId}&appId=${idArr.appId}`;
  } else if (idArr && idArr.envId && idArr.appId) {
    url = `/devops/v1/projects/${projectId}/app_instances/list_by_options?page=${pageInfo.page}&size=${pageInfo.size}&envId=${idArr.envId}&appId=${idArr.appId}`;
  } else if (idArr && idArr.envId) {
    url = `/devops/v1/projects/${projectId}/app_instances/list_by_options?page=${pageInfo.page}&size=${pageInfo.size}&envId=${idArr.envId}`;
  }
  return chai.request(utils.oauth.gateway)
    .post(url)
    .send(query)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getAllApp(projectId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/apps/list_all`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getMultiAppIst(projectId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/app_instances/all`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getAppByEnvId(projectId, envId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/apps/pages?envId=${envId}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getIstStages(projectId, appInstanceId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/app_instances/${appInstanceId}/stages`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getIstResources(projectId, appInstanceId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/app_instances/${appInstanceId}/resources`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getIstValue(projectId, appInstanceId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/app_instances/${appInstanceId}/value`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getIstValueByIds(projectId, idArr) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/app_instances/value?appId=${idArr.appId}&envId=${idArr.envId}&appVersionId=${idArr.versionId}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function delIstById(projectId, appInstanceId) {
  return chai.request(utils.oauth.gateway)
    .delete(`/devops/v1/projects/${projectId}/app_instances/${appInstanceId}/delete`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(204);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function istAction(projectId, appInstanceId, active) {
  return chai.request(utils.oauth.gateway)
    .put(`/devops/v1/projects/${projectId}/app_instances/${appInstanceId}/${active}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      if (active === 'stop') {
        res.should.have.status(204);
      } else {
        res.should.have.status(200);
      }
      res.body.should.not.have.property('failed');
      return res;
    });
}

function istUpdateVersion(projectId, versionId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/version/${versionId}/upgrade_version`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

module.exports = {
  getInstanceAll,
  getAllApp,
  getMultiAppIst,
  getAppByEnvId,
  getIstStages,
  getIstResources,
  getIstValue,
  getIstValueByIds,
  delIstById,
  istAction,
  istUpdateVersion,
};
