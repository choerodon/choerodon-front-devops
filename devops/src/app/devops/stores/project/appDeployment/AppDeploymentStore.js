import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import _ from 'lodash';
import { handleProptError } from '../../../utils';

const height = window.screen.height;
@store('AppDeploymentStore')
class AppDeploymentStore {
  @observable isLoading = true;

  @observable deployData = [];

  @observable appNames = [];

  @observable appNameByEnv = [];

  @observable envcard = [];

  @observable size = 10;

  @observable show = false;

  @observable featureData = [];

  @observable istAll = [];

  @observable appVersion = [];

  @observable mutiData = [];

  @observable alertType = '';

  @observable value = null;

  @observable pageInfo = {
    current: 1, total: 0, pageSize: height <= 900 ? 10 : 15,
  };

  @observable appPageInfo = {};

  @observable appPage = 0;

  @observable appPageSize = 1;

  @observable tabActive = 'singleEnv';

  @observable filterValue = '';

  @observable envId = false;

  @observable verId = false;

  @observable appId = false;

  @observable sigAppId = false;

  @observable istParams = { filters: {}, param: [] };

  @observable verValue = undefined;

  // 单环境下是否存在该应用
  @observable hasApp = true;

  @action setHasApp(flag) {
    this.hasApp = flag;
  }

  @computed get getHasApp() {
    return this.hasApp;
  }

  @action setIstTableFilter(param) {
    if (param) {
      this.istParams = param;
    } else {
      this.istParams = { filters: {}, param: [] };
    }
  }

  @computed get getIstParams() {
    return this.istParams;
  }

  @action setPageInfo(page) {
    this.pageInfo = { current: page.number + 1, total: page.totalElements, pageSize: page.size };
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action setAppPageInfo(page) {
    this.appPageInfo = { current: page.number + 1, total: page.totalElements, pageSize: page.size };
  }

  @computed get getAppPageInfo() {
    return this.appPageInfo;
  }

  @action changeShow(flag) {
    this.show = flag;
  }

  @computed get getShow() {
    return this.show;
  }

  @action setFilterValue(filterValue) {
    this.filterValue = filterValue;
  }

  @computed get getFilterValue() {
    return this.filterValue;
  }

  @action setTabActive(tabActive) {
    this.tabActive = tabActive;
  }

  @computed get getTabActive() {
    return this.tabActive;
  }

  @action setAppNames(appNames) {
    this.appNames = appNames;
  }

  @computed get getAppNames() {
    return this.appNames;
  }

  @action setAppNameByEnv(appNameByEnv) {
    this.appNameByEnv = appNameByEnv;
  }

  @computed get getAppNameByEnv() {
    return this.appNameByEnv;
  }

  @action changeLoading(flag) {
    this.isLoading = flag;
  }

  @computed get getIsLoading() {
    return this.isLoading;
  }

  @action setFeature(data) {
    this.featureData = data;
  }

  @computed get getFeature() {
    return this.featureData;
  }

  @action setEnvcard(envcard) {
    this.envcard = envcard;
  }

  @computed get getEnvcard() {
    return this.envcard;
  }

  @action setIstAll(istAll) {
    this.istAll = istAll;
  }

  @computed get getIstAll() {
    return this.istAll.slice();
  }

  @action setAppVer(appVersion) {
    this.appVersion = appVersion;
  }

  @computed get getAppVer() {
    return this.appVersion;
  }

  @action setMutiData(mutiData) {
    this.mutiData = mutiData;
  }

  @computed get getMutiData() {
    return this.mutiData;
  }

  @computed get getEnvId() {
    return this.envId;
  }

  @action setEnvId(envId) {
    this.envId = envId;
  }

  @computed get getAppId() {
    return this.appId;
  }

  @action setAppId(appId) {
    this.appId = appId;
  }

  @computed get getSingleAppId() {
    return this.sigAppId;
  }

  @action setSingleAppId(appId) {
    this.sigAppId = appId;
  }

  @computed get getVerId() {
    return this.verId;
  }

  @action setVerId(verId) {
    this.verId = verId;
  }

  @computed get getValue() {
    return this.value;
  }

  @action setValue(data) {
    this.value = data;
  }

  @computed get getVerValue() {
    return this.verValue;
  }

  @action setVerValue(data) {
    this.verValue = data;
  }

  @computed get getAppPage() {
    return this.appPage;
  }

  @action setAppPage(appPage) {
    this.appPage = appPage;
  }

  @computed get getAppPageSize() {
    return this.appPageSize;
  }

  @action setAppPageSize(appPageSize) {
    this.appPageSize = appPageSize;
  }

  @action setAlertType(data) {
    this.alertType = data;
  }

  loadInstanceAll = (projectId, Info = {}) => {
    this.changeLoading(true);
    const { page, size, datas } = Info;
    const normal = ['page', 'size', 'datas'];
    // 除了normal中的字段外，其他不一定有
    // 所以需要使用下面方法拼接url
    let url = '';
    _.forEach(Info, (value, key) => {
      if (value && !normal.includes(key)) {
        url = url.concat(`&${key}=${value}`);
      }
    });
    return axios.post(`devops/v1/projects/${projectId}/app_instances/list_by_options?page=${page || 0}&size=${size || this.pageInfo.pageSize}${url}`, JSON.stringify(datas || { searchParam: {}, param: '' })).then((data) => {
      const res = handleProptError(data);
      if (res) {
        this.handleData(data);
        this.changeLoading(false);
      }
    });
  };

  handleData =(data) => {
    const { number, size, totalElements, content } = data;
    this.setIstAll(content);
    const page = { number, size, totalElements };
    this.setPageInfo(page);
    this.changeLoading(false);
  };


  loadAppNames = projectId => axios.get(`devops/v1/projects/${projectId}/apps/list_all`).then((data) => {
    this.changeLoading(true);
    const res = handleProptError(data);
    if (res) {
      this.setAppNames(res);
      this.changeLoading(false);
      return res;
    }
  });

  loadActiveEnv = projectId => axios.get(`devops/v1/projects/${projectId}/envs?active=true`).then((data) => {
    const res = handleProptError(data);
    if (res) {
      this.setEnvcard(res);
      return res;
    }
    return false;
  });

  loadAppVersion = (projectId, appId) => axios.get(`devops/v1/projects/${projectId}/apps/${appId}/version/list_deployed`).then((data) => {
    const res = handleProptError(data);
    if (res) {
      this.setAppVer(data);
    }
  });

  loadAppNameByEnv = (projectId, envId, page, appPageSize) => axios.get(`devops/v1/projects/${projectId}/apps/pages?env_id=${envId}&page=${page}&size=${appPageSize}`).then((data) => {
    this.changeLoading(true);
    const res = handleProptError(data);
    if (res) {
      this.setAppNameByEnv(data.content);
      // this.setSelectApp(data.content);
      const { number, size, totalElements } = data;
      const pageInfo = { number, size, totalElements };
      this.setAppPageInfo(pageInfo);
      this.changeLoading(false);
      return data.content;
    }
    return false;
  });

  loadMultiData = projectId => axios.get(`devops/v1/projects/${projectId}/app_instances/all`).then((data) => {
    this.changeLoading(true);
    const res = handleProptError(data);
    if (res) {
      this.setMutiData(data);
      this.changeLoading(false);
    }
  });

  loadValue = (projectId, id, verId) => axios.get(`devops/v1/projects/${projectId}/app_instances/${id}/appVersion/${verId}/value`)
    .then((data) => {
      const res = handleProptError(data);
      if (res) {
        this.setValue(data);
        return res;
      }
      return false;
    });

  checkYaml = (value, projectId) => axios.post(`/devops/v1/projects/${projectId}/app_instances/value_format`, { yaml: value });

  changeIstActive = (projectId, istId, active) => axios.put(`devops/v1/projects/${projectId}/app_instances/${istId}/${active}`);

  reDeploy = (projectId, data) => axios.post(`devops/v1/projects/${projectId}/app_instances`, JSON.stringify(data));

  deleteIst = (projectId, istId) => axios.delete(`devops/v1/projects/${projectId}/app_instances/${istId}/delete`);

  reStarts = (projectId, id) => axios.put(`devops/v1/projects/${projectId}/app_instances/${id}/restart`);

  loadUpVersion = (projectId, verId) => axios.get(`devops/v1/projects/${projectId}/version/${verId}/upgrade_version`)
    .then((data) => {
      if (data) {
        this.setVerValue(data);
      }
      return data;
    });
}

const appDeploymentStore = new AppDeploymentStore();
export default appDeploymentStore;
