const appVersion = require('../../apiFunction/appManagement/AppVersion');
const uuidv1 = require('uuid/v1');
const { oauth, login } = require('../../Utils');

describe('AppVersion Api', function () {
  it('[POST] 分页查询应用版本', function () {
    const data = {searchParam: {}, param: ""}
    const project = oauth.project;
    return appVersion.getVersionList({project,data});
  });
});