const uuidv1 = require('uuid/v1');
const appVersion = require('../../apiFunction/appManagement/AppVersion');
const { oauth, login } = require('../../Utils');

describe('AppVersion Api', () => {
  it('[POST] 分页查询应用版本', () => {
    const data = { searchParam: {}, param: '' };
    const project = oauth.project;
    return appVersion.getVersionList({ project, data });
  });
});
