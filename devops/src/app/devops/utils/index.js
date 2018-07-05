/**
 * 处理数据请求错误
 * @param data
 * @returns {*}
 */
function handleProptError(data) {
  if (data && data.failed) {
    Choerodon.prompt(data.message);
    return false;
  } else {
    return data;
  }
}
