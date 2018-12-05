import { observable, action, computed } from "mobx";
import { axios, store, stores } from "choerodon-front-boot";
import { relativeTimeThreshold } from "moment";

const REFRESH_INTERVAL = 1000 * 10;

@store("DevopsStore")
class DevopsStore {
  @observable timer = null;

  @observable radioValue = "manual";

  @action setRadioValue(data) {
    this.radioValue = data;
  }

  @computed get getRadioValue() {
    return this.radioValue;
  }

  // true 自动刷新
  // false 手动刷新
  @observable isAuto = {
    app: false,
    template: false,
    domain: false,
    network: false,
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

  /**
   * 加载页面刷新模式
   * @memberof DevopsStore
   */
  loadStatus() {}
}

const devopsStore = new DevopsStore();

export default devopsStore;
