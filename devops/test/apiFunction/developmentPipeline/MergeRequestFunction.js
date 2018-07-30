/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');

chai.should();
chai.use(chaiHttp);

function getEnableApp(projectId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/apps`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getBaseUrl(projectId, appId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/apps/${appId}/git/url`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getAllMergeRequest(projectId, appId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/apps/${appId}/git/merge_request/list`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getMergeRequest(projectId, appId, state) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/apps/${appId}/git/merge_request/list?state=${appId}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

module.exports = {
  getEnableApp,
  getBaseUrl,
  getAllMergeRequest,
  getMergeRequest,
};
