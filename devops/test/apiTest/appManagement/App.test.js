const uuidv1 = require('uuid/v1');
const appFunction = require('../../apiFunction/appManagement/AppFunction');
const { oauth, login } = require('../../Utils');

describe('App Api', () => {
  before(() => login(oauth));
  // 并不能保证不重复
  const uidName = `app-${uuidv1().slice(0, 8)}`;
  const uidCode = `code-${uuidv1().slice(0, 16)}`;

  it('[POST] 创建应用成功', function () {
    const app = {
      applictionTemplateId: 2,
      code: uidCode,
      name: uidName,
      projectId: oauth.project,
    };
    this.skip();
    return appFunction.createApp(oauth.project, app);
  });
  it('[PUT] 修改应用名称成功', function () {
    const app = {
      id: 317,
      name: `c-${uidName}`,
    };
    this.skip();
    return appFunction.editApp(oauth.project, app);
  });
  it('[PUT] 应用名称已存在，不能创建修改应用', () => {
    const app = {
      id: 317,
      name: 'app',
    };
    return appFunction.editApp(oauth.project, app, false);
  });
  it('[GET] code已存在，不可使用', () => appFunction.checkCodeUnique(oauth.project, 'code', false));
  it('[GET] code不存在，可以使用', () => {
    const newCode = `new-code-${uuidv1().slice(0, 10)}`;
    return appFunction.checkCodeUnique(oauth.project, newCode);
  });
  it('[GET] name已存在，不可使用', () => appFunction.checkNameUnique(oauth.project, 'app', false));
  it('[GET] name不存在，可以使用', () => {
    const newName = `new-${uuidv1().slice(0, 8)}`;
    return appFunction.checkNameUnique(oauth.project, newName);
  });
  it('[GET] code为必须字段', () => {
    const app = {
      applictionTemplateId: 1,
      code: '',
      name: '',
      projectId: oauth.project,
    };
    return appFunction.createApp(oauth.project, app, false);
  });
  it('[POST] 获取App列表信息', () => {
    const info = {
      searchParam: { code: ['static'] },
      param: '',
    };
    return appFunction.getAppList(oauth.project, 0, 30, 'code', 'desc', info);
  });
  it('[PUT] 应用生失效', () => appFunction.invalidApp(oauth.project, 320, true));
});
