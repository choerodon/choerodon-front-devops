/* eslint-disable prefer-arrow-callback,no-undef */
const { getRepo } = require('../../apiFunction/developmentPipeline/RepositoryFunction');
const utils = require('../../Utils');


const projectId = utils.oauth.project;
const pageInfo = { page: 0, size: 15, sort: { field: 'id', order: 'desc' } };
const query = { searchParam: {}, param: '' };

describe('Repository Api', function () {
  it('[POST] 项目下分页查询代码仓库', function () {
    return getRepo(projectId, pageInfo, query);
  });
});
