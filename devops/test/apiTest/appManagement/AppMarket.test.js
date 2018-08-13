const appMarket = require('../../apiFunction/appManagement/AppMarket');
const uuidv1 = require('uuid/v1');
const { oauth, login } = require('../../Utils');

describe('appMarket test', function () {
  const { project } = oauth;
  it('[POST]获取用用市场中所有应用', function () {
    const data = {
      param: 'app',
      searchParam: {},
    };
    return appMarket.getMarketList({ project, data });
  });
  it('[GET]获取应用市场中单个应用的信息', function () {
    return appMarket.getAppInMarket(project, 14);
  });
  it('[POST]导出应用市场中的应用', function () {
    const exportInfo = [{ appMarketId: 16, appVersionIds: [39] },
      { appMarketId: 48, appVersionIds: [167] }];
    this.skip();
    return appMarket.exportAppInMarket(project, exportInfo);
  });
});
