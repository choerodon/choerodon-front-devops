import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import { handleProptError } from "../../../utils";

const { AppState } = stores;

@store('DeploymentAppStore')
class DeploymentAppStore {
  @observable apps = [];

  @observable currentApp = {};

  @observable versions = [];

  @observable currentVersion = {};

  @observable envs = [];

  @observable currentEnv = {};

  @observable value = null;

  @observable currentMode = 'new';

  @observable instances = [];

  @observable currentInstance = {};

  loadApps(id, projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/projects/${projectId}/apps/${id}/detail`)
      .then(data => handleProptError(data));
  }

  loadVersion(appId, projectId, flag = '') {
    return axios.get(`/devops/v1/projects/${projectId}/app_versions/list_by_app/${appId}?is_publish=${flag}`)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          this.setVersions(res);
        }
        return res;
      });
  }

  loadEnv(projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/projects/${projectId}/envs?active=true`)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          this.setEnvs(res);
        }
        return res;
      });
  }

  loadValue(appId, verId, envId, projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/projects/${projectId}/app_instances/value?appId=${appId}&appVersionId=${verId}&envId=${envId}`)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          this.setValue(res);
        }
        return res;
      });
  }

  checkYaml = (value, projectId = AppState.currentMenuType.id) => axios.post(`/devops/v1/projects/${projectId}/app_instances/value_format`, { yaml: value });

  loadInstances(appId, envId, projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/projects/${projectId}/app_instances/listByAppIdAndEnvId?envId=${envId}&appId=${appId}`)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          this.setCurrentInstance(res);
        }
        return res;
      });
  }

  deploymentApp(applicationDeployDTO, projectId = AppState.currentMenuType.id) {
    return axios.post(`/devops/v1/projects/${projectId}/app_instances`, applicationDeployDTO)
      .then(data => handleProptError(data));
  }

  checkIstName = (projectId, value) => axios.get(`/devops/v1/projects/${projectId}/app_instances/check_name?instance_name=${value}`)
    .then(data => handleProptError(data));

  @action setApps(data) {
    this.apps = data;
  }

  @action setCurrentApp(data) {
    this.currentApp = data;
  }

  @action setVersions(data) {
    this.versions = data;
  }

  @action setCurrentVersion(data) {
    this.currentVersion = data;
  }

  @action setEnvs(data) {
    this.envs = data;
  }

  @action setCurrentEnv(data) {
    this.currentEnv = data;
  }

  @action setValue(data) {
    this.value = data;
  }

  @action setShowArr(data) {
    this.showArr = data;
  }

  @action setLoadingArr(data) {
    this.loadingArr = data;
  }

  @action setCurrentMode(data) {
    this.currentMode = data;
  }

  @action setInstances(data) {
    this.instances = data;
  }

  @action setCurrentInstance(data) {
    this.currentInstance = data;
  }

  @computed get getCurrentStage() {
    return this.showArr.lastIndexOf(true) + 1;
  }

  @computed get getValue() {
    return this.value;
  }
}
const deploymentAppStore = new DeploymentAppStore();
export default deploymentAppStore;
