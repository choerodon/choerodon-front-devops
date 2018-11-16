import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import _ from 'lodash';
import { handleProptError } from '../../../utils/index';

const height = window.screen.height;
@store('InstancesStore')
class InstancesStore {
  @observable isLoading = true;

  @observable appNameByEnv = [];

  @observable size = 10;

  @observable istAll = [];

  @observable mutiData = [];

  @observable alertType = '';

  @observable value = null;

  @observable pageInfo = {
    current: 1, total: 0, pageSize: height <= 900 ? 10 : 15,
  };

  @observable appPageInfo = {};

  @observable appPage = 1;

  @observable appPageSize = 10;

  @observable istParams = { filters: {}, param: [] };

  @observable verValue = undefined;

  @observable envId = null;

  @observable isCache = false;

  @observable appId = null;

  @action setAppId(id) {
    this.appId = id;
  }

  @computed get getAppId() {
    return this.appId;
  }

  @action setIsCache(flag) {
    this.isCache = flag;
  }

  @computed get getIsCache() {
    return this.isCache;
  }

  @action setEnvId(id) {
    this.envId = id;
  }

  @computed get getEnvId() {
    return this.envId;
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

  @action setIstAll(istAll) {
    this.istAll = istAll;
  }

  @computed get getIstAll() {
    return this.istAll.slice();
  }

  @action setMutiData(mutiData) {
    this.mutiData = mutiData;
  }

  @computed get getMutiData() {
    return this.mutiData;
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

  // 应用分页器的页码
  @computed get getAppPage() {
    return this.appPage;
  }

  @action setAppPage(appPage) {
    this.appPage = appPage;
  }

  // 应用分页器的每页条数
  @computed get getAppPageSize() {
    return this.appPageSize;
  }

  @action setAppPageSize(appPageSize) {
    this.appPageSize = appPageSize;
  }

  @action setAlertType(data) {
    this.alertType = data;
  }

  /**
   * 查询实例
   * @param projectId
   * @param info
   */
  loadInstanceAll = (projectId, info = {}) => {
    this.changeLoading(true);
    const { page, size, datas } = info;
    const normal = ['page', 'size', 'datas'];
    // 除了normal中的字段必有，其他字段不确定
    // 循环拼接url
    let search = '';
    _.forEach(info, (value, key) => {
      if (value && !normal.includes(key)) {
        search = search.concat(`&${key}=${value}`);
      }
    });
    let searchParam = {};
    let param = '';
    if (datas) {
      param = String(datas.param);
      searchParam = datas.searchParam;
    }
    return axios.post(`devops/v1/projects/${projectId}/app_instances/list_by_options?page=${page || 0}&size=${size || this.pageInfo.pageSize}${search}`, JSON.stringify({ searchParam, param })).then((data) => {
      const res = handleProptError(data);
      if (res) {
        this.handleData(data);
      } else {
        this.changeLoading(false);
      }
    });
  };

  handleData =(data) => {
    const { number, size, totalElements, content } = data;
    if (!_.isEqual(content, this.istAll)) {
      this.setIstAll(content);
    }
    const page = { number, size, totalElements };
    this.setPageInfo(page);
    this.changeLoading(false);
  };

  loadAppNameByEnv = (projectId, envId, page, appPageSize) => axios.get(`devops/v1/projects/${projectId}/apps/pages?env_id=${envId}&page=${page}&size=${appPageSize}`).then((data) => {
    const res = handleProptError(data);
    if (res) {
      this.setAppNameByEnv(data.content);
      const { number, size, totalElements } = data;
      const pageInfo = { number, size, totalElements };
      this.setAppPageInfo(pageInfo);
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

  deleteInstance = (projectId, istId) => axios.delete(`devops/v1/projects/${projectId}/app_instances/${istId}/delete`);

  reStarts = (projectId, id) => axios.put(`devops/v1/projects/${projectId}/app_instances/${id}/restart`);

  loadUpVersion = (projectId, verId) => axios.get(`devops/v1/projects/${projectId}/version/${verId}/upgrade_version`)
    .then((data) => {
      if (data) {
        this.setVerValue(data);
      }
      return data;
    });
}

const instancesStore = new InstancesStore();
export default instancesStore;
