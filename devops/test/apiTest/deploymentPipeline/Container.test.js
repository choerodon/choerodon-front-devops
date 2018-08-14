const container = require('../../apiFunction/deploymentPipeline/ContainerFunction');
const { oauth } = require('../../Utils');

describe('Container test', () => {
  const { project } = oauth;

  it('[POST] 分页查询容器列表', () => container.getConainersList(project));

  it('[GET] 通过podId获取日志信息', () => {
    const podId = 341;
    const podName = 'baiyisantest-e5654-65dc985446-8mxbh';
    return container.getContainerLogs(project, podId, podName);
  });
});
