/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const { oauth } = require('../../Utils');
const _ = require('lodash');

const { expect } = chai;
chai.use(chaiHttp);
class ContainerFunction {
  getConainersList(project, page = 0, size = 10, type = 'id', sort = 'asc', data = { searchParam: {}, param: '' }) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/app_pod/list_by_options?page=${page}&size=${size}&sort=${type},${sort}`)
      .set('Authorization', global.user_token.token)
      .set('Content-type', 'application/json')
      .send(data)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.content).to.be.an.instanceOf(Array);
        expect(res.body.number).to.be.equal(page);
        expect(res.body.size).to.be.equal(size);
      });
  }

  getContainerLogs(project, podId, podName) {
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${project}/app_pod/${podId}/containers/logs`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.podName).to.be.equal(podName);
      });
  }
}

const container = new ContainerFunction();
module.exports = container;
