/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');

chai.should();
chai.use(chaiHttp);

function getEnv(projectId, active) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/envs?active=${active}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function createEnv(projectId, data) {
  return chai.request(utils.oauth.gateway)
    .post(`/devops/v1/projects/${projectId}/envs`)
    .send(data)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function checkEnvCode(projectId, code) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/envs/checkCode?code=${code}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(204);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function checkEnvName(projectId, name) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/envs/checkName?name=${name}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(204);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function updateEnv(projectId, data) {
  return chai.request(utils.oauth.gateway)
    .put(`/devops/v1/projects/${projectId}/envs`)
    .send(data)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getEnvById(projectId, envId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/envs/${envId}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function getEnvShell(projectId, envId, update) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/projects/${projectId}/envs/${envId}/shell?update=${update}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

function envAction(projectId, envId, active) {
  return chai.request(utils.oauth.gateway)
    .put(`/devops/v1/projects/${projectId}/envs/${envId}/active?active=${active}`)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

module.exports = {
  getEnv,
  createEnv,
  updateEnv,
  checkEnvCode,
  checkEnvName,
  getEnvById,
  envAction,
  getEnvShell,
};
