/* eslint-disable no-console */
const chai = require('chai');
const chaiHttp = require('chai-http');
const utils = require('../../Utils');

chai.should();
chai.use(chaiHttp);

/**
 * 组织下分页查询应用模板
 * @param organizationId
 * @param pageInfo
 * @param query
 * @param msg
 * @returns {Promise<T>}
 */
function getAppTemplateByPage(organizationId, pageInfo, query, msg) {
  msg = 'success';
  return chai.request(utils.oauth.gateway)
    .post(`/devops/v1/organizations/${organizationId}/app_templates/list_by_options?page=${pageInfo.page}&size=${pageInfo.size}&sort=${pageInfo.sort.field || 'id'}`)
    .send(query)
    .set('Authorization', global.user.token)
    .then((res) => {
      res.should.have.status(200);
      if (msg === 'success') {
        res.should.not.have.property('failed');
      } else {
        res.should.have.property('failed');
        res.body.message.should.equal(msg);
      }
      return res;
    });
}

function checkTempalteCode(organizationId, code) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/organizations/${organizationId}/app_templates/checkCode?code=${code}`)
    .set('Authorization', global.user.token)
    .then((res) => {
      res.should.have.status(204);
      res.should.not.have.property('failed');
      return res;
    });
}

function checkTempalteName(organizationId, name) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/organizations/${organizationId}/app_templates/checkName?name=${name}`)
    .set('Authorization', global.user.token)
    .then((res) => {
      res.should.have.status(204);
      res.should.not.have.property('failed');
      return res;
    });
}

function getAppTemplateAll(organizationId) {
  return chai.request(utils.oauth.gateway)
    .get(`/devops/v1/organizations/${organizationId}/app_templates`)
    .set('Authorization', global.user.token)
    .then((res) => {
      res.should.have.status(200);
      res.should.not.have.property('failed');
      return res;
    });
}

// function createTemplate(organizationId, data, msg) {
//   msg = 'success';
//   return chai.request(utils.oauth.gateway)
//     .post(`/devops/v1/organizations/${organizationId}/app_templates`)
//     .send(data)
//     .set('Authorization', global.user.token)
//     .then((res) => {
//       res.should.have.status(200);
//       if (msg === 'success') {
//         res.should.not.have.property('failed');
//       } else {
//         res.should.have.property('failed');
//         res.body.message.should.equal(msg);
//       }
//       return res;
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }

module.exports = {
  getAppTemplateByPage,
  checkTempalteCode,
  checkTempalteName,
  getAppTemplateAll,
  // createTemplate,
};
