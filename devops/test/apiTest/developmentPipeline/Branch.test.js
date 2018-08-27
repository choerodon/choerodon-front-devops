const uuidv1 = require('uuid/v1');
const branchFunction = require('../../apiFunction/developmentPipeline/BranchFunction');
const { oauth, login } = require('../../Utils');

describe('Branch api', () => {
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
  it('[POST] 分支已存在', () => {
    const { project } = oauth;
    const data = {
      branchName: 'feature-devops0725-1',
      issueId: 7524,
      originBranch: 'master',
      type: 'feature',
    };
    return branchFunction.createBranch(project, 347, data, false);
  });
  it('[POST] 获取分支列表', () => {
    const { project } = oauth;
    return branchFunction.getBranchList({ project, app: 347 });
  });
  it('[GET] 根据分支名查询分支', () => {
    const { project } = oauth;
    return branchFunction.queryBranchByName(project, 347, 'master');
  });
  it('[GET] 根据分支名查询不存在的分支', () => {
    const { project } = oauth;
    return branchFunction.queryBranchByName(project, 347, '不存在的分支', false);
  });
  it('[PUT] 修改分支关联问题', () => {
    const { project } = oauth;
    const data = {
      branchName: '关联问题测试',
      issueId: 7534,
    };
    return branchFunction.editBranchLinkIssue(project, 347, data);
  });
  it('[DELETE] 删除分支', function () {
    const { project } = oauth;
    this.skip();
    return branchFunction.deleteBranch(project, 347, '');
  });
  it('[DELETE] 不存在该分支，删除报错', function () {
    const { project } = oauth;
    this.skip();
    return branchFunction.deleteBranch(project, 347, '不存在的分支', false);
  });
});
