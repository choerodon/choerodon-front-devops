const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

class AppMarket {

}

const appMarket = new AppMarket();
module.exports = appMarket;
