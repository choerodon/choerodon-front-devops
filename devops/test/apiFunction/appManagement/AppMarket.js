const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');
const fs = require('fs');

const { expect } = chai;

chai.use(chaiHttp);

class AppMarket {
  getMarketList({ project, page = 0, size = 10, type = 'id', sort = 'asc', data = { searchParam: {}, param: '' } }) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/apps_market/list_all?page=${page}&size=${size}&sort=${type},${sort}`)
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

  getAppInMarket(projectId, appId) {
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${projectId}/apps_market/${appId}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.id).to.be.equal(appId);
      });
  }

  exportAppInMarket(projectId, data) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/apps_market/export`)
      .set('Authorization', global.user_token.token)
      .set('Content-type', 'application/json')
      .send(data)
      .then((res) => {
        expect(res).to.have.status(200);
      });
  }

  upAppInMarket(project, file, fileName, flag = true) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/apps_market/upload`)
      .set('Authorization', global.user_token.token)
      .attach('file', fs.readFileSync(file), fileName)
      .then((res) => {
        expect(res).to.have.status(200);
        if (flag) {
          expect(res.body.appMarketList).to.be.an.instanceOf(Array);
        } else {
          expect(res.body.failed).to.be.true;
          expect(res.body.code).to.be.equal('error.zip.illegal');
        }
      });
  }

  importAppIntoMarket(project, filename, isPublic, flag = true) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/apps_market/import?file_name=${filename}&public=${isPublic}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        expect(res).to.have.status(200);
        if (flag) {
          expect(res.body).to.be.true;
        } else {
          expect(res.body.failed).to.be.true;
        }
      });
  }
}

const appMarket = new AppMarket();
module.exports = appMarket;
