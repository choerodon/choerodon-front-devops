import { observable, action, computed } from "mobx";
import { axios, store, stores } from "choerodon-front-boot";
import Storage from "../utils/storage";

const REFRESH_INTERVAL = 1000 * 10;
const REFRESH_AGE = 7 * 24 * 60 * 60 * 1000;

@store("DevopsStore")
class DevopsStore {
  @observable timer = null;

  @observable switchValue = false;

  @action setSwitchValue(data) {
    this.switchValue = data;
  }

  @computed get getSwitchValue() {
    return this.switchValue;
  }

  // true 自动刷新
  // false 手动刷新
  @observable isAuto = {};

  @action setAutoFlag(data) {
    const autoPage = Object.assign(this.isAuto, data);
    this.isAuto = autoPage;
    Storage.setAge(REFRESH_AGE).set("autorefresh", autoPage);
  }

  @action setTimer(fn) {
    this.clearTimer();
    this.timer = setInterval(() => {
      fn(false);
    }, REFRESH_INTERVAL);
  }

  @action clearTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  clearAutoRefresh() {
    this.setSwitchValue(false);
    this.clearTimer();
  }

  /**
   * 页面加载时开启自动刷新
   * @param {*} name
   * @param callback 刷新函数
   */
  initAutoRefresh(name, callback) {
    if (_isEmpty(this.isAuto)) {
      const saveAutoFlags = Storage.get("autorefresh");
      let flags = null;
      if (!_isEmpty(saveAutoFlags)) {
        flags = saveAutoFlags;
      } else {
        flags = {
          app: false,
          template: false,
          domain: false,
          network: false,
          env: false,
          ist: false,
          ci: false,
          overview: false,
          cert: false,
          configMap: false,
          secret: false,
        };
      }
      this.isAuto = flags;
    }

    if (this.isAuto[name]) {
      this.setSwitchValue(true);
      this.setTimer(callback);
    } else {
      this.clearAutoRefresh();
    }
  }
}

/**
 * 只能判断对象或null是否为空
 * @param {object} obj
 * @returns
 */
function _isEmpty(obj) {
  const hasOwnProperty = Object.prototype.hasOwnProperty;

  if (obj === null) {
    return true;
  }

  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      return false;
    }
  }

  return true;
}

const devopsStore = new DevopsStore();

export default devopsStore;
