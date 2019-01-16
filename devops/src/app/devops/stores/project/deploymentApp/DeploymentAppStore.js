import { observable, action, computed } from "mobx";
import { axios, store, stores } from "choerodon-front-boot";
import { handleProptError } from "../../../utils";

const { AppState } = stores;

@store("DeploymentAppStore")
class DeploymentAppStore {
  @observable apps = [];

  @observable versions = [];

  @observable envs = [];

  @observable value = null;

  @observable currentMode = "new";

  @observable currentInstance = [];

  @action setApps(data) {
    this.apps = data;
  }

  @action setVersions(data) {
    this.versions = data;
  }

  @action setEnvs(data) {
    this.envs = data;
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

  @action setCurrentInstance(data) {
    this.currentInstance = data;
  }

  @computed get getCurrentInstance() {
    return this.currentInstance.slice(0);
  }

  @computed get getCurrentStage() {
    return this.showArr.lastIndexOf(true) + 1;
  }

  @computed get getValue() {
    return this.value;
  }

  loadApps(id, projectId = AppState.currentMenuType.id) {
    return axios
      .get(`/devops/v1/projects/${projectId}/apps/${id}/detail`)
      .then(data => handleProptError(data));
  }

  /**
   *
   *
   * @param {*} appId
   * @param {*} projectId
   * @param {string} [flag=""] 是否发布
   * @returns
   * @memberof DeploymentAppStore
   */
  loadVersion(appId, projectId, flag = "") {
    return axios
      .get(
        `/devops/v1/projects/${projectId}/app_versions/list_by_app/${appId}?is_publish=${flag}`
      )
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setVersions(res);
        }
        return res;
      });
  }

  loadEnv(projectId = AppState.currentMenuType.id) {
    return axios
      .get(`/devops/v1/projects/${projectId}/envs?active=true`)
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setEnvs(res);
        }
        return res;
      });
  }

  loadValue(appId, verId, envId, projectId = AppState.currentMenuType.id) {
    return axios
      .get(
        `/devops/v1/projects/${projectId}/app_instances/value?appId=${appId}&appVersionId=${verId}&envId=${envId}`
      )
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setValue(res);
        }
        return res;
      });
  }

  checkYaml = (value, projectId = AppState.currentMenuType.id) =>
    axios.post(`/devops/v1/projects/${projectId}/app_instances/value_format`, {
      yaml: value,
    });

  loadInstances(appId, envId, projectId = AppState.currentMenuType.id) {
    return axios
      .get(
        `/devops/v1/projects/${projectId}/app_instances/listByAppIdAndEnvId?envId=${envId}&appId=${appId}`
      )
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setCurrentInstance(res);
        }
        return res;
      });
  }

  deploymentApp(applicationDeployDTO, projectId = AppState.currentMenuType.id) {
    return axios
      .post(
        `/devops/v1/projects/${projectId}/app_instances`,
        applicationDeployDTO
      )
      .then(data => handleProptError(data));
  }

  checkIstName = (projectId, value) =>
    axios.get(
      `/devops/v1/projects/${projectId}/app_instances/check_name?instance_name=${value}`
    );
}
const deploymentAppStore = new DeploymentAppStore();
export default deploymentAppStore;
