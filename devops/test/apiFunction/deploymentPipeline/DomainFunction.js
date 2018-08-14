/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');
const _ = require('lodash');

chai.should();
chai.use(chaiHttp);

class DomainFunction {
  getDomain(projectId, pageInfo, query) {
    return chai.request(utils.oauth.gateway)
      .post(`/devops/v1/projects/${projectId}/ingress/list_by_options?page=${pageInfo.page}&size=${pageInfo.size}&sort=${pageInfo.sort.field || 'id'}`)
      .send(query)
      .set('Authorization', global.user_token.token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.not.have.property('failed');
        return res;
      });
  }
}

const domainFunction = new DomainFunction();

module.exports = domainFunction;
