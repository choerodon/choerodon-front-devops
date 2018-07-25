const appFunction = require('../../apiFunction/AppManagement/AppFunction');
const uuidv1 = require('uuid/v1');
const { oauth, login, logout } = require('../../Utils');

describe('App Api', function () {
  before(function () {
    return login(oauth);
  });
  after(function () {
    return logout();
  });
  const uid = `app${uuidv1().slice(0, 5)}`;
  it('[POST] 创建应用成功', function () {
    const app = {
      applictionTemplateId: 2,
      code: uid,
      name: uid,
      projectId: oauth.project,
    };
    return appFunction.createApp(oauth.project, app);
  });
});
