const network = require('../../apiFunction/deploymentPipeline/NetworkFunction');
const { oauth } = require('../../Utils');

describe('NetWork test', () => {
  const { project, env } = oauth;

  it('[POST] 分页查询网络列表', () => network.getServiceList(project));

  it('[POST] 创建网络', function createNetworkTest() {
    this.skip();
  });

  it('[PUT] 编辑网络', function editNetworkTest() {
    this.skip();
  });

  it('[DELETE] 删除网络', function deleteNetworkTest() {
    this.skip();
  });

  it('[GET] 检查网络名称唯一性成功', () => network.checkNetworkName(project, env, 'abcd'));

  it('[GET] 检查网络名称唯一性失败', () => network.checkNetworkName(project, env, 'baiyisantest-ed20', false));
});
