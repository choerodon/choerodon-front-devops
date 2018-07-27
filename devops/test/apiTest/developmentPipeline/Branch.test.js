const branchFunction = require('../../apiFunction/developmentPipeline/BranchFunction');
const uuidv1 = require('uuid/v1');
const { oauth, login } = require('../../Utils');

describe('Branch api', function () {
  it('[POST] 创建custom分支', function () {
    const { project } = oauth;
    const data = {
      branchName: `custom-${uuidv1().slice(0, 4)}`,
      issueId: 7524,
      originBranch: 'master',
      type: 'custom',
    };
    this.skip();
    return branchFunction.createBranch(project, 347, data);
  });
  it('[POST] 创建feature分支', function () {
    const { project } = oauth;
    const data = {
      branchName: `feature-${uuidv1().slice(0, 4)}`,
      issueId: 7524,
      originBranch: 'master',
      type: 'feature',
    };
    this.skip();
    return branchFunction.createBranch(project, 347, data);
  });
  it('[POST] 创建bugfix分支', function () {
    const { project } = oauth;
    const data = {
      branchName: `bugfix-${uuidv1().slice(0, 4)}`,
      issueId: 7524,
      originBranch: 'master',
      type: 'bugfix',
    };
    this.skip();
    return branchFunction.createBranch(project, 347, data);
  });
  it('[POST] 创建release分支', function () {
    const { project } = oauth;
    const data = {
      branchName: `release-${uuidv1().slice(0, 4)}`,
      issueId: 7524,
      originBranch: 'master',
      type: 'release',
    };
    this.skip();
    return branchFunction.createBranch(project, 347, data);
  });
  it('[POST] 创建hotfix分支', function () {
    const { project } = oauth;
    const data = {
      branchName: `hotfix-${uuidv1().slice(0, 4)}`,
      issueId: 7524,
      originBranch: 'master',
      type: 'hotfix',
    };
    this.skip();
    return branchFunction.createBranch(project, 347, data);
  });
  it('[POST] 根据tag创建分支', function () {
    const { project } = oauth;
    const data = {
      branchName: `feature-${uuidv1().slice(0, 4)}`,
      issueId: 7524,
      originBranch: '0.0.1',
      type: 'feature',
    };
    this.skip();
    return branchFunction.createBranch(project, 347, data);
  });
  it('[POST] 分支已存在', function () {
    const { project } = oauth;
    const data = {
      branchName: 'feature-devops0725-1',
      issueId: 7524,
      originBranch: 'master',
      type: 'feature',
    };
    return branchFunction.createBranch(project, 347, data, false);
  });
});
