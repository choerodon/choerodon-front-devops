const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

class BranchFunction {
  createBranch(project, app, data, flag = true) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/apps/${app}/git/branch`)
      .set('Authorization', global.user_token.token)
      .set('Content-type', 'application/json')
      .send(data)
      .then((res) => {
        if (flag) {
          expect(res).to.have.status(200);
        } else {
          expect(res.body.failed).to.be.true;
          expect(res.body.code).to.be.equal('error.branch.exist');
        }
      });
  }

  getBranchList({ project, app, page = 0, size = 10, sort = { code: 'creationDate', state: 'asc' }, data = { searchParam: { branchName: ['master'] }, param: '' } }) {
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/apps/${app}/git/branches?page=${page}&size=${size}&sort=${sort.code},${sort.state}`)
      .send(data)
      .set('Authorization', global.user_token.token)
      .set('Content-type', 'application/json')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res.body.content).to.be.an.instanceOf(Array);
        expect(res.body.number).to.be.equal(page);
        expect(res.body.size).to.be.equal(size);
      });
  }

  queryBranchByName(project, app, name, flag = true) {
    return chai.request(oauth.gateway)
      .get(`/devops/v1/projects/${project}/apps/${app}/git/branch?branchName=${name}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        if (flag) {
          expect(res).to.have.status(200);
          expect(res.body.branchName).to.be.equal(name);
        } else {
          expect(res).to.have.status(200);
          expect(res.body).to.be.null;
        }
      });
  }

  editBranchLinkIssue(project, app, data) {
    return chai.request(oauth.gateway)
      .put(`/devops/v1/projects/${project}/apps/${app}/git/branch`)
      .set('Authorization', global.user_token.token)
      .send(data)
      .then((res) => {
        expect(res).to.have.status(200);
      });
  }

  deleteBranch(project, app, name, flag = true) {
    return chai.request(oauth.gateway)
      .delete(`/devops/v1/projects/${project}/apps/${app}/git/branch?branchName=${name}`)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        if (flag) {
          expect(res).to.have.status(204);
        } else {
          expect(res).to.have.status(500);
        }
      });
  }
}

const branchFunction = new BranchFunction();

module.exports = branchFunction;
