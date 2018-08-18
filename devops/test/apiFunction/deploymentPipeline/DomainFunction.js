/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');

chai.should();
chai.use(chaiHttp);

class DomainFunction {
  getDomain(projectId, pageInfo, query) {
    return chai.request(utils.oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/ingress/list_by_options?page=${pageInfo.page}&size=${pageInfo.size}&sort=${pageInfo.sort.field || 'id'}`)
      .send(query)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }

  checkDomainName(projectId, name, envId) {
    return chai.request(utils.oauth.gateway)
      .get(`/devops/v1/projects/${projectId}/ingress/check_name?name=${name}&envId=${envId}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }

  checkDomainPath(projectId, domain, path, id = '') {
    return chai.request(utils.oauth.gateway)
      .get(`/devops/v1/projects/${projectId}/ingress/check_domain?domain=${domain}&path=${path}&id=${id}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }

  createDomain(projectId, data) {
    return chai.request(utils.oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/ingress`, JSON.stringify(data))
      .send(data)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(204);
        res.body.should.not.have.property('failed');
        return res;
      });
  }

  delDomainById(projectId, id) {
    return chai.request(utils.oauth.gateway)
      .delete(`/devops/v1/projects/${projectId}/ingress/${id}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(204);
        res.body.should.not.have.property('failed');
        return res;
      });
  }

  updateDomain(projectId, id, data) {
    return chai.request(utils.oauth.gateway)
      .put(`/devops/v1/projects/${projectId}/ingress/${id}`)
      .send(data)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }

  getDomainById(projectId, id) {
    return chai.request(utils.oauth.gateway)
      .get(`/devops/v1/projects/${projectId}/ingress/${id}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }
}

const domainFunction = new DomainFunction();

module.exports = domainFunction;
