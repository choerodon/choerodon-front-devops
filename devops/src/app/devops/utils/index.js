/**
 * 处理数据请求错误
 * @param data
 * @returns {*}
 */
/* eslint-disable import/prefer-default-export */
export function handleProptError(data) {
  if (data && data.failed) {
    Choerodon.prompt(data.message);
    return false;
  } else {
    return data;
  }
}

/**
 * 参数 长度低于2则前面加 0，否则不加
 * @param {string | number} str
 * @returns {string} 
 */
function padZero(str) {
  return str.toString().padStart(2, '0');
}

/**
 * 格式化时间，转化为 YYYY-MM-DD hh:mm:ss
 * @param {Date} timestamp 
 * @returns {string}
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${[year, month, day].map(padZero).join('-')} ${[hour, minutes, seconds].map(padZero).join(':')}`;
}

/**
 * 点击平滑滚动
 * @param change
 * @param element
 * @param duration
 */
export function scrollTo(element, change, duration = 0.5) {
  const domPosition = element.scrollLeft;
  const startTime = performance.now();
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function animateScroll() {
    const now = performance.now();
    const elapsed = (now - startTime) / 1000;
    const t = (elapsed / duration);
    element.scrollLeft = domPosition + change * easeInOutQuad(t);
    if (t < 1) {
      window.requestAnimationFrame(animateScroll);
    }
  }
  animateScroll();
}

/**
 * 计算剩余时间
 * @param nowTime 当前时间 时间戳
 * @param endTime 结束时间 时间戳
 * @returns {string}
 */
export function getTimeLeft(nowTime, endTime) {
  const resTime = endTime - nowTime;
  const days = Math.floor(resTime / (24 * 3600 * 1000));
  // const lefts = resTime % (24 * 3600 * 1000);
  // const hours = Math.floor(lefts / (3600 * 1000));
  // return `剩余 ${days} 天 ${hours} 小时`;
  return `剩余 ${days} 天`;
}
