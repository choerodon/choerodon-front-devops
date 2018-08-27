const uuidv1 = require('uuid/v1');
const appPublish = require('../../apiFunction/appManagement/AppPublish');
const { oauth, login } = require('../../Utils');
const path = require('path');

describe('AppPublish Api', () => {
  it('[POST] 查询已启用但未发布且有版本的应用', () => {
    const data = { searchParam: {}, param: '' };
    const project = oauth.project;
    return appPublish.getUnPublishList({ project, data });
  });

  it('[GET] 查询单个应用市场的应用详情', () => {
    const project = oauth.project;
    const data = {
      id: 88,
      appId: 368,
    };
    return appPublish.getApplicationDetail({ project, data });
  });

  it('[PUT] 更新单个应用市场的应用', function () {
    const project = oauth.project;
    const data = {
      contributor: `贡献-${uuidv1().slice(0, 15)}`,
      category: `分类-${uuidv1().slice(0, 15)}`,
      description: `描述-${uuidv1().slice(0, 15)}`,
      id: 88,
      appId: 368,
      publishLevel: 'orgnization',
    };
    this.skip();
    return appPublish.updateApplicationDetail({ project, data });
  });

  it('[PUT] 发布单个未发布的应用的所有版本', function () {
    const project = oauth.project;
    const appVersions = [
      {
        id: 312,
        version: '2018.7.30-144557-master',
        creationDate: '2018-07-30 14:56:32',
        updatedDate: '2018-07-30 14:56:32',
        publish: null,
        deployed: false,
      },
    ];
    this.skip();
    return appPublish.publishApplicationVersion({
      project,
      id: 87,
      appVersions,
    });
  });

  it('[POST] 发布单个应用', function () {
    const project = oauth.project;
    const appVersions = [
      {
        id: 368,
        version: '2018.8.13-171020-master',
        commit: '57ec4c5327ca46b11baa331f1d39798bf1de4520',
        appName: '813fronttest',
        appCode: 'baiyisantest',
        appId: 368,
        appStatus: true,
        creationDate: '2018-08-13 17:19:19',
      },
    ];
    const data = {
      appId: 368,
      category: '分类1',
      contributor: '贡献1',
      description: '描述1',
      imgUrl: 'http://minio.staging.saas.hand-china.com/devops-service/file_60a53ee6f063477db9ff361d82fd6dd4_icon',
      publishLevel: 'orgnization',
    };
    this.skip();
    return appPublish.publishApplication({ project, appVersions, data });
  });

  it('[POST] 获取单个应用的已发布的版本', () => {
    const project = oauth.project;
    const id = 87;
    return appPublish.getApplicationVersions({ project, id, is_publish: true });
  });

  it('[POST] 获取单个应用的未发布的版本', () => {
    const project = oauth.project;
    const id = 87;
    return appPublish.getApplicationVersions({
      project,
      id,
      is_publish: false,
    });
  });

  it('[POST] 上传单个应用的图标', () => {
    const file_name = 'icon.jpg';
    const filePath = path.join(__dirname, file_name);
    return appPublish.sendApplicationIcon({ filePath, file_name });
  });
});
