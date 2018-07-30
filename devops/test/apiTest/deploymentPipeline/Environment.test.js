/* eslint-disable prefer-arrow-callback,no-undef */
const { getEnv, checkEnvCode, checkEnvName, createEnv, updateEnv, getEnvById, envAction, getEnvShell, exchangeOrder } = require('../../apiFunction/deploymentPipeline/EnvironmentFunction');
const uuidv1 = require('uuid/v1');
const utils = require('../../Utils');

const projectId = utils.oauth.project;
const envId = 61;
const code = `env-code-${uuidv1().substring(0, 5)}`;
const name = `env-${uuidv1().substring(0, 5)}`;
const env = { name, description: `mk-env-description-${uuidv1().substring(0, 10)}`, code, projectId };
const updateData = { name: `update-${name.substring(4, 9)}`, description: `update-description-${uuidv1().substring(0, 10)}`, id: envId };

describe('Environment Api', function () {
  it('[GET] 项目下查询已启用环境', function () {
    return getEnv(projectId, true);
  });

  it('[GET] 项目下查询停用环境', function () {
    return getEnv(projectId, false);
  });

  it('[GET] 项目下校验环境Code唯一性', function () {
    return checkEnvCode(projectId, code);
  });

  it('[GET] 项目下校验环境Name唯一性', function () {
    return checkEnvName(projectId, name);
  });

  it('[POST] 项目下创建环境', function () {
    this.skip();
    return createEnv(projectId, env);
  });

  it('[PUT] 项目下更新环境', function () {
    return updateEnv(projectId, updateData);
  });

  it('[GET] 项目下查询单个环境', function () {
    return getEnvById(projectId, envId);
  });

  it('[PUT] 项目下停用单个环境', function () {
    return envAction(projectId, envId, false);
  });

  it('[PUT] 项目下启用单个环境', function () {
    return envAction(projectId, envId, true);
  });

  it('[GET] 获取激活环境指令', function () {
    return getEnvShell(projectId, envId, false);
  });

  it('[PUT] 调整启用环境流水线顺序', function () {
    return exchangeOrder(projectId, true);
  });
});
