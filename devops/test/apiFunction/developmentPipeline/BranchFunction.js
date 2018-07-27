const chai = require('chai');
const { oauth } = require('../../Utils');
const chaiHttp = require('chai-http');

const { expect } = chai;

chai.use(chaiHttp);

class BranchFunction {
  createBranch() {}
  getBranchList() {}
}

const branchFunction = new BranchFunction();

module.exports = branchFunction;
