import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

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
  @observable value = [];
  @observable pageInfo = {};
  @observable appPageInfo = {};
  @observable appPage = 0;
  @observable appPageSize = 1;
  @observable tabActive = 'instance';
  @observable filterValue = '';
  @observable envId = false;
  @observable verId = false;
  @observable appId = false;

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
    return this.istAll;
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

  loadInstanceAll = (projectId, page, size = 10, sorter = { id: 'asc' }, envId, versionId, appId, datas = {
    searchParam: {},
    param: '',
  }) => {
    this.changeLoading(true);
    if (versionId && appId && envId) {
      return axios.post(`devops/v1/projects/${projectId}/app_instances/list_by_options?versionId=${versionId}&envId=${envId}&appId=${appId}&page=${page}&size=${size}`, JSON.stringify(datas)).then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handleData(data);
          this.changeLoading(false);
        }
      });
    } else if (appId && envId) {
      return axios.post(`devops/v1/projects/${projectId}/app_instances/list_by_options?envId=${envId}&appId=${appId}&page=${page}&size=${size}`, JSON.stringify(datas)).then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handleData(data);
          this.changeLoading(false);
        }
      });
    } else if (envId) {
      return axios.post(`devops/v1/projects/${projectId}/app_instances/list_by_options?envId=${envId}&page=${page}&size=${size}`, JSON.stringify(datas)).then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handleData(data);
          this.changeLoading(false);
        }
      });
    } else {
      return axios.post(`devops/v1/projects/${projectId}/app_instances/list_by_options?page=${page}&size=${size}`, JSON.stringify(datas)).then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handleData(data);
          this.changeLoading(false);
        }
      });
    }
  };

  handleData =(data) => {
    this.setIstAll(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
    this.changeLoading(false);
  };


  loadAppNames = projectId => axios.get(`devops/v1/projects/${projectId}/apps/list_all`).then((data) => {
    this.changeLoading(true);
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setAppNames(data);
      this.changeLoading(false);
    }
  });

  loadVersionFeature(projectId, id) {
    return axios.get(`devops/v1/projects/${projectId}/app_instances/${id}/version_features`);
  }

  loadActiveEnv = projectId => axios.get(`devops/v1/projects/${projectId}/envs?active=true`).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setEnvcard(data);
    }
  });

  loadAppVersion = (projectId, appId) => axios.get(`devops/v1/projects/${projectId}/apps/${appId}/version/list_deployed`).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setAppVer(data);
    }
  });

  loadAppNameByEnv = (projectId, envId, page, appPageSize) => axios.get(`devops/v1/projects/${projectId}/apps/pages?envId=${envId}&page=${page}&size=${appPageSize}`).then((data) => {
    this.changeLoading(true);
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setAppNameByEnv(data.content);
      const { number, size, totalElements } = data;
      const pageInfo = { number, size, totalElements };
      this.setAppPageInfo(pageInfo);
      this.changeLoading(false);
    }
  });

  loadMutiData = projectId => axios.get(`devops/v1/projects/${projectId}/app_instances/all`).then((data) => {
    this.changeLoading(true);
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setMutiData(data);
      this.changeLoading(false);
    }
  });

  loadValue(projectId, appId, envId, verId) {
    return axios.get(`devops/v1/projects/${projectId}/app_instances/value?appId=${appId}&envId=${envId}&appVersionId=${verId}`)
      .then((data) => {
        if (data) {
          this.setValue(data);
        }
        return data;
      });
  }

  checkYaml = (value, projectId)=> {
    return axios.post(`/devops/v1/projects/${projectId}/app_instances/value_format`, { yaml: value })
  };

  changeIstActive(projectId, istId, active) {
    return axios.put(`devops/v1/projects/${projectId}/app_instances/${istId}/${active}`);
  }

  reDeploy(projectId, data) {
    return axios.post(`devops/v1/projects/${projectId}/app_instances`, JSON.stringify(data));
  }

  deleteIst(projectId, istId) {
    return axios.delete(`devops/v1/projects/${projectId}/app_instances/${istId}/delete`);
  }
}

const appDeploymentStore = new AppDeploymentStore();
export default appDeploymentStore;
