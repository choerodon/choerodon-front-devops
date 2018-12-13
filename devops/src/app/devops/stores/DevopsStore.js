import { observable, action, computed } from "mobx";
import { axios, store, stores } from "choerodon-front-boot";
import { relativeTimeThreshold } from "moment";

const REFRESH_INTERVAL = 1000 * 10;

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
  @observable isAuto = {
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

  @action setAutoFlag(data) {
    const autoPage = Object.assign(this.isAuto, data);
    this.isAuto = autoPage;
  }

  @computed get getAutoFlag() {
    return this.isAuto;
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
    if (this.isAuto[name]) {
      this.setSwitchValue(true);
      this.setTimer(callback);
    } else {
      this.clearAutoRefresh();
    }
  }

  /**
   * 加载页面刷新模式
   * @memberof DevopsStore
   */
  loadStatus() {}
}

const devopsStore = new DevopsStore();

export default devopsStore;
