const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

class AppVersion {
    getVersionList({project, page = 0, size = 10, type = 'id', sort = 'asc', data = { searchParam: {}, param: '' }}){
        return chai.request(oauth.gateway)
        .post(`/devops/v1/projects/${project}/app_version/list_by_options?page=${page}&size=${size}&sort=${type},${sort}`)
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
}

const appVersion = new AppVersion();
module.exports = appVersion;
