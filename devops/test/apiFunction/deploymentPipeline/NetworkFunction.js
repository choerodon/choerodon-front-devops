/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const { oauth } = require('../../Utils');

const { expect } = chai;
chai.use(chaiHttp);
class NetworkFunction {
  getServiceList(project, page = 0, size = 10, type = 'id', sort = 'asc', data = { searchParam: {}, param: '' }) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/service/list_by_options?page=${page}&size=${size}&sort=${type},${sort}`)
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

  checkNetworkName(project, envId, name, flag = true) {
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${project}/service/check?envId=${envId}&name=${name}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        expect(res).to.have.status(200);
        if (flag) {
          expect(res.body).to.be.true;
        } else {
          expect(res.body).to.be.false;
        }
      });
  }
}

const network = new NetworkFunction();
module.exports = network;
