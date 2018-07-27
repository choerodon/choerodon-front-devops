/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');

chai.should();
chai.use(chaiHttp);

function getRepo(projectId, pageInfo, query) {
  return chai.request(utils.oauth.gateway)
    .post(`/devops/v1/projects/${projectId}/apps/list_code_repository??page=${pageInfo.page}&size=${pageInfo.size}&sort=${pageInfo.sort.field || 'id'}`)
    .send(query)
    .set('Authorization', global.user_token.token)
    .then((res) => {
      res.should.have.status(200);
      res.body.should.not.have.property('failed');
      return res;
    });
}

module.exports = {
  getRepo,
};
