const appMarket = require('../../apiFunction/appManagement/AppMarket');
const uuidv1 = require('uuid/v1');
const { oauth, login } = require('../../Utils');
const path = require('path');

describe('appMarket test', () => {
  const { project } = oauth;
  it('[POST]获取用用市场中所有应用', () => {
    const data = {
      param: 'app',
      searchParam: {},
    };
    return appMarket.getMarketList({ project, data });
  });
  it('[GET]获取应用市场中单个应用的信息', () => appMarket.getAppInMarket(project, 14));
  it('[POST]导出应用市场中的应用', function () {
    const exportInfo = [{ appMarketId: 16, appVersionIds: [39] },
      { appMarketId: 48, appVersionIds: [167] }];
    this.skip();
    return appMarket.exportAppInMarket(project, exportInfo);
  });
  it('[POST]应用上传成功', function () {
    this.skip();
    const file = path.resolve(__dirname, '../../statics/chart.zip');
    return appMarket.upAppInMarket(project, file, 'chart.zip');
  });
  it('[POST]应用上传失败', () => {
    // this.skip();
    const errorFile = path.resolve(__dirname, '../../statics/chart_error.zip');
    return appMarket.upAppInMarket(project, errorFile, 'chart_error.zip', false);
  });
  it('[POST]上传应用成功', function () {
    const filecode = 'ce272b30617f1df9c6f227f208cfbf6e';
    this.skip();
    return appMarket.importAppIntoMarket(project, filecode, true);
  });
  it('[POST]上传应用失败', function () {
    const filecode = 'ce272b30617f1df9c6f227f208cfbf6e';
    this.skip();
    return appMarket.importAppIntoMarket(project, filecode, false);
  });

  it('[POST] 上传应用取消成功', () => {
    const filecode = 'ce272b30617f1df9c6f227f208cfbf6e';
    return appMarket.cancelAppImport(project, filecode);
  });

  it('[GET] 查询单个应用市场的应用的单个版本README成功', () => {
    const marketId = 87;
    const versionId = 312;
    return appMarket.getAppReadmeByVersion(project, marketId, versionId);
  });

  it('[GET] 查询单个应用市场的应用的单个版本README失败', () => {
    const marketId = 87;
    const versionId = 3122232;
    return appMarket.getAppReadmeByVersion(project, marketId, versionId, false);
  });
});
