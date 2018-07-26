const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

class AppFunction {
  createApp(project, data) {
    console.log(data);
    return chai.request(oauth.gateway)
      .post(`/devops/v1/projects/${project}/apps`)
      .send(data)
      .set('Authorization', global.user_token.token)
      .set('Content-type', 'application/json')
      .then((res) => {
        console.log(res.status);
        expect(res).to.have.status(200);
      });
  }
}

const appFunction = new AppFunction();

module.exports = appFunction;
