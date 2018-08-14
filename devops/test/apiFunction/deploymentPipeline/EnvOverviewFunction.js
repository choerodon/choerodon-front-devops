const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');


chai.should();
chai.use(chaiHttp);

class EnvOverviewFunction {
  getlistByEnv(projectId, envId, data) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/app_instances/${envId}/listByEnv`)
      .send(data)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }
  getDomain(projectId, envId, pageInfo, data) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/ingress/${envId}/listByEnv?page=${pageInfo.page}&size=${pageInfo.size}&sort=${pageInfo.sort.field || 'id'},${pageInfo.sort.order}`)
      .send(data)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }
  getService(projectId, envId, pageInfo, data) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/service/${envId}/listByEnv?page=${pageInfo.page}&size=${pageInfo.size}&sort=${pageInfo.sort.field || 'id'},${pageInfo.sort.order}`)
      .send(data)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }
  getErrorFiles(projectId, envId, pageInfo) {
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${projectId}/envs/${envId}/error_file/list_by_page?page=${pageInfo.page}&size=${pageInfo.size}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }
  getStatus(projectId, envId) {
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${projectId}/envs/${envId}/status`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }
}

const envOverviewFunction = new EnvOverviewFunction();

module.exports = envOverviewFunction;
