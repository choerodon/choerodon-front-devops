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
  getBranchList() {}
}

const branchFunction = new BranchFunction();

module.exports = branchFunction;
