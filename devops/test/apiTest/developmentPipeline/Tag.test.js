const tagFunction = require('../../apiFunction/developmentPipeline/TagFunction');
const uuidv1 = require('uuid/v1');
const { oauth, login } = require('../../Utils');

/**
 * 获取两个数之间的整数，包括边界
 * @param min
 * @param max
 * @returns {*}
 */
function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

describe('Tag Api', function () {
  it('[POST] 创建标签', function () {
    const tag = `${getRandom(200, 310)}.${getRandom(10, 200)}.${getRandom(0, 100)}`;
    this.skip();
    return tagFunction.createTag(tag);
  });
  it('[POST] 应用不在该项目下，无法创建标签', function () {
    const tag = `${getRandom(200, 310)}.${getRandom(10, 20)}.${getRandom(0, 100)}`;
    const randomAppId = getRandom(3000, 5000);
    return tagFunction.createTag(tag, randomAppId, 'master', false);
  });
  it('[POST] 分支不存在，无法创建标签', function () {
    const tag = `${getRandom(200, 310)}.${getRandom(10, 20)}.${getRandom(0, 100)}`;
    this.skip();
    return tagFunction.createTag(tag, '347', '不存在的分支', false);
  });
  it('[GET] 标签名可用', function () {
    return tagFunction.checkTag('0.0.100');
  });
  it('[GET] 标签名重复，不可用', function () {
    return tagFunction.checkTag('0.0.1', false);
  });
  it('[POST] 分页获取tag列表', function () {
    const info = {
      searchParam: { tagName: ['0.0.1'] },
      param: '',
    };
    return tagFunction.getTagListByOption(0, 30, info);
  });
  it('[DELETE] 删除标签', function () {
    this.skip();
    return tagFunction.deleteTag('224.19.8');
  });
});
