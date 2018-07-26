const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

class AppFunction {
  createApp(project, data, flag = true) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/apps`)
      .set('Authorization', global.user_token.token)
      .set('Content-type', 'application/json')
      .send(data)
      .then((res) => {
        if (flag) {
          expect(res).to.have.status(200);
        } else {
          expect(res.body.failed).to.be.true;
        }
      });
  }

  editApp(project, data, flag = true) {
    return chai.request(oauth.gateway)
      .put(`/devops/v1/projects/${project}/apps`)
      .set('Authorization', global.user_token.token)
      .send(data)
      .then((res) => {
        if (flag) {
          expect(res.body).to.be.true;
        } else {
          expect(res.body.failed).to.be.true;
          expect(res.body.code).to.be.equal('error.name.exist');
        }
      });
  }

  checkCodeUnique(project, code, flag = true) {
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${project}/apps/checkCode?code=${code}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        if (flag) {
          expect(res).to.have.status(204);
        } else {
          expect(res.body.failed).to.be.true;
          expect(res.body.code).to.be.equal('error.code.exist');
        }
      });
  }

  checkNameUnique(project, name, flag = true) {
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${project}/apps/checkName?name=${name}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        if (flag) {
          expect(res).to.have.status(204);
        } else {
          expect(res.body.failed).to.be.true;
          expect(res.body.code).to.be.equal('error.name.exist');
        }
      });
  }

  getAppList(project, page = 0, size = 10, type = 'name', sort = 'asc', data = { searchParam: {}, param: '' }) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/apps/list_by_options?page=${page}&size=${size}&sort=${type},${sort}`)
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

  invalidApp(project, app, state) {
    return chai.request(oauth.gateway)
      .put(`/devops/v1/projects/${project}/apps/${app}?active=${state}`)
      .set('Authorization', global.user_token.token)
      .then((res) => { expect(res.body).to.be.true; });
  }
}

const appFunction = new AppFunction();

module.exports = appFunction;
