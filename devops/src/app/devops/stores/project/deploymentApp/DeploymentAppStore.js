import { observable, action, computed } from 'mobx';
import AppState from 'AppState';
import axios from 'Axios';
import store from 'Store';

const beautify = require('json-beautify');

@store('DeploymentAppStore')
class DeploymentAppStore {
  @observable apps = [];
  @observable currentApp = {};
  @observable versions = [];
  @observable currentVersion = {};
  @observable envs = [];
  @observable currentEnv = {};
  @observable value = [];
  @observable currentMode = 'new';
  @observable instances = [];
  @observable currentInstance = {};
  @observable showArr = [
    true,
    false,
    false,
    false,
    false,
    false,
  ];
  @observable loadingArr = [
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  loadInitData = (appId, verId, envId) => {
    this.setCurrentApp({});
    this.setCurrentVersion({});
    this.setCurrentEnv({});
    this.setValue([]);
    this.setCurrentMode('new');
    this.setShowArr([true, false, false, false, false, false]);
    if (!appId && !verId && !envId) {
      this.loadApps().then((res) => {
        const response = this.handleProptError(res);
        if (response) {
          this.setApps(res || []);
          this.setCurrentApp({});
          this.setShowArr([true, false, false, false, false, false]);
          this.setLoadingArr([false, false, false, false, false, false]);
        }
      });
    } else if (appId && verId && envId) {
      this.setShowArr([true, true, true, true, false, false]);
      this.setLoadingArr([true, true, true, true, false, false]);
      axios
        .all([
          this.loadApps(),
          this.loadVersion(appId),
          this.loadEnv(),
          this.loadValue(appId, verId, envId),
        ])
        .then(
          axios.spread((apps, versions, envs, value) => {
            if (!(apps.failed && versions.failed && envs.failed && value.failed)) {
              this.setApps(apps || []);
              this.setVersions(versions);
              this.setEnvs(envs);
              this.setValue(value);
              this.setLoadingArr([false, false, false, false, false, false]);
              this.setShowArr([true, true, true, true, true, true]);
            }
          }),
        );
    } else if (appId && envId && !verId) {
      this.setShowArr([true, true, false, false, false]);
      this.setLoadingArr([true, true, false, false, false]);
      axios
        .all([
          this.loadApps(),
          this.loadVersion(appId),
        ])
        .then(
          axios.spread((apps, versions) => {
            if (!(apps.failed && versions.failed)) {
              this.setApps(apps || []);
              this.setVersions(versions);
              this.setLoadingArr([false, false, false, false, false]);
            }
          }),
        );
    }
  };

  loadApps(projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/project/${projectId}/apps`).then((data) => {
      const res = this.handleProptError(data);
      return res;
    });
  }

  loadVersion(appId, projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/project/${projectId}/apps/${appId}/version/list`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });
  }

  loadEnv(projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/project/${projectId}/envs?active=true`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });
  }

  loadValue(appId, verId, envId, projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/project/${projectId}/app_instances/value?appId=${appId}&appVersionId=${verId}&envId=${envId}`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });
  }

  loadInstances(appId, envId, projectId = AppState.currentMenuType.id) {
    return axios.get(`/devops/v1/project/${projectId}/app_instances/options?envId=${envId}&appId=${appId}`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });
  }

  deploymentApp(applicationDeployDTO, projectId = AppState.currentMenuType.id) {
    return axios.post(`/devops/v1/project/${projectId}/app_instances`, applicationDeployDTO)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });
  }

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
  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}
const deploymentAppStore = new DeploymentAppStore();
export default deploymentAppStore;
