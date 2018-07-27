const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

class TagFunction {
  constructor() {
    this.app = {
      projectId: oauth.project,
      appId: 347,
      ref: 'master',
    };
  }

  createTag(name, appId = this.app.appId, ref = this.app.ref, flag = true) {
    const { projectId } = this.app;
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/apps/${appId}/git/tags?tag=${name}&ref=${ref}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        if (flag) {
          expect(res).to.have.status(200);
        } else {
          expect(res.body.failed).to.be.true;
          expect(res.body.code).to.be.equal('error.app.project.notMatch');
        }
      });
  }

  checkTag(name, flag = true) {
    const { projectId, appId } = this.app;
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${projectId}/apps/${appId}/git/tags_check?tag_name=${name}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        if (flag) {
          expect(res.body).to.be.true;
        } else {
          expect(res.body).to.be.false;
        }
      });
  }

  getTagListByOption(page = 0, size = 10, data = { searchParam: {}, param: '' }) {
    const { projectId, appId } = this.app;
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/apps/${appId}/git/tags_list_options?page=${page}&size=${size}`)
      .set('Authorization', global.user_token.token)
      .set('Content-type', 'application/json')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.content).to.be.an.instanceOf(Array);
        expect(res.body.number).to.be.equal(page);
        expect(res.body.size).to.be.equal(size);
      });
  }

  deleteTag(name, flag = true) {
    const { projectId, appId } = this.app;
    return chai.request(oauth.gateway)
      .delete(`/devops/v1/projects/${projectId}/apps/${appId}/git/tags?tag=${name}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        if (flag) {
          expect(res).to.have.status(200);
        } else {
          expect(res.body.failed).to.be.true;
          expect(res.body.code).to.be.equal('error.app.project.notMatch');
        }
      });
  }
}

const tagFunction = new TagFunction();

module.exports = tagFunction;
