/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');

chai.should();
chai.use(chaiHttp);

function getCiPipeline(projectId, appId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/applications/${appId}/pipelines`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getCommits(projectId, gitlabProjectId, commits) {
  return chai.request(utils.oauth.gateway)
    .post(`/devops/v1/projects/${projectId}/gitlab_projects/${gitlabProjectId}/commit_sha`)
    .set('Authorization', global.user_token.token)
    .send(commits)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function pipelineAction(projectId, gitlabProjectId, pipelineId, action) {
  return chai.request(utils.oauth.gateway)
    .post(`/devops/v1/projects/${projectId}/gitlab_projects/${gitlabProjectId}/pipelines/${pipelineId}/${action}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

module.exports = {
  getCiPipeline,
  getCommits,
  pipelineAction,
};
