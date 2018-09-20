import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import moment from 'moment';
import { handleProptError } from '../../../utils';

const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

@store('ReportsStore')
class ReportsStore {
  @observable pageInfo = {
    current: 1, total: 0, pageSize: HEIGHT <= 900 ? 10 : 15,
  };

  @observable Info = {
    filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [],
  };

  @observable startTime = moment().day(-5);

  @observable endTime = moment();

  @observable envId = null;

  @observable ddChart = [];

  @observable allData = [];

  @observable apps = [];

  @observable appId = null;

  @observable BuildNumber = {};

  @observable echartsLoading = true;

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action setInfo(Info) {
    this.Info = Info;
  }

  @computed get getInfo() {
    return this.Info;
  }

  @computed get getStartTime() {
    return this.startTime;
  }

  @action setStartTime(data) {
    this.startTime = data;
  }

  @computed get getEndTime() {
    return this.endTime;
  }

  @action setEndTime(data) {
    this.endTime = data;
  }

  @action setEnvId(id) {
    this.envId = id;
  }

  @computed get getEnvId() {
    return this.envId;
  }

  @action setDdChart(data) {
    this.ddChart = data;
  }

  @computed get getDdChart() {
    return this.ddChart;
  }

  @computed get getAllData() {
    return this.allData;
  }

  @action setAllData(data) {
    this.allData = data;
  }

  @action changeIsRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsRefresh() {
    return this.isRefresh;
  }

  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @computed get getApps() {
    return this.apps;
  }

  @computed get getAppId() {
    return this.appId;
  }

  @computed get getBuildNumber() {
    return this.BuildNumber;
  }

  @computed get getEchartsLoading() {
    return this.echartsLoading;
  }

  @action setApps(data) {
    this.apps = data;
  }

  @action setAppId(id) {
    this.appId = id;
  }

  @action setBuildNumber(data) {
    this.BuildNumber = data;
  }

  @action setEchartsLoading(data) {
    this.echartsLoading = data;
  }

  /**
   * 加载项目下的应用
   * @param proId
   */
  loadApps = proId => axios.get(`/devops/v1/projects/${proId}/apps`).then((data) => {
    const res = handleProptError(data);
    if (res) {
      this.setApps(data);
      if (data.length) {
        this.setAppId(data[0].id);
      }
    }
    return res;
  });

  /**
   * 加载构建次数
   * @param proId
   */
  loadBuildNumber = (projectId, appId, startTime, endTime) => {
    this.setEchartsLoading(true);
    return axios.post(`/devops/v1/projects/${projectId}/app_instances/env_commands/frequency?appId=${appId}&startTime=${startTime}&endTime=${endTime}`, JSON.stringify([]))
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          this.setBuildNumber(data);
        }
        this.setEchartsLoading(false);
        return res;
      });
  };

  loadDeployDurationChart = (projectId, envId, startTime, endTime, appIds) => {
    this.setEchartsLoading(true);
    return axios.post(`devops/v1/projects/${projectId}/app_instances/env_commands/time?envId=${envId}&endTime=${endTime}&startTime=${startTime}`, JSON.stringify(appIds))
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          this.setDdChart(data);
        }
        this.setEchartsLoading(false);
        return res;
      });
  }

  loadDeployDurationTable = (projectId, envId, startTime, endTime, appIds, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize) => axios.post(`devops/v1/projects/${projectId}/app_instances/env_commands/timeDetail?envId=${envId}&endTime=${endTime}&startTime=${startTime}&page=${page}&size=${size}`, JSON.stringify(appIds))
    .then((data) => {
      const res = handleProptError(data);
      if (res) {
        this.handleData(data);
      }
      this.changeLoading(false);
      this.changeIsRefresh(false);
    });

  handleData = (data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };
}

const reportsStore = new ReportsStore();

export default reportsStore;
