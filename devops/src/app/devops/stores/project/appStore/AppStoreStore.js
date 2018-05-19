import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import axios from 'Axios';
import store from 'Store';

@store('AppStoreStore')
class AppStoreStore {
  @observable isLoading = true;
  @observable envcardPosition = [];
  @observable disEnvcardPosition = [];
  @observable envdata = [];
  @observable envId = null;
  @observable show = false;
  @observable ban = false;
  @observable sideType = 'key';
  @observable shell = '';

  @action
  setEnvcardPosition(envcardPosition) {
    this.envcardPosition = envcardPosition;
  }

  @action
  setShow(show) {
    this.show = show;
  }

  @action
  setBan(ban) {
    this.ban = ban;
  }

  @action
  setShell(shell) {
    this.shell = shell;
  }

  @action
  setDisEnvcardPosition(disEnvcardPosition) {
    this.disEnvcardPosition = disEnvcardPosition;
  }

  @action
  switchData(a, b) {
    const t1 = _.findIndex(this.envcardPosition, o => o.sequence === a);
    const t2 = _.findIndex(this.envcardPosition, o => o.sequence === b);
    [this.envcardPosition[t1], this.envcardPosition[t2]] =
      [this.envcardPosition[t2], this.envcardPosition[t1]];
  }

  @computed
  get getEnvcardPosition() {
    return this.envcardPosition;
  }

  @computed
  get getShow() {
    return this.show;
  }

  @computed
  get getBan() {
    return this.ban;
  }

  @computed
  get getDisEnvcardPosition() {
    return this.disEnvcardPosition;
  }

  @action
  setEnvData(data) {
    this.envdata = data;
  }

  @computed
  get getEnvData() {
    return this.envdata;
  }

  @action
  setSideType(data) {
    this.sideType = data;
  }

  @computed
  get getSideType() {
    return this.sideType;
  }

  @action
  changeLoading(flag) {
    this.isLoading = flag;
  }

  @computed
  get getIsLoading() {
    return this.isLoading;
  }

  loadEnv = (projectId, active) => {
    this.changeLoading(true);
    return axios.get(`devops/v1/project/${projectId}/envs?active=${active}`).then((data) => {
      if (data && active) {
        this.setEnvcardPosition(data);
      } else {
        this.setDisEnvcardPosition(data);
      }
      this.changeLoading(false);
    });
  };

  createEnv = (projectId, data) =>
    axios.post(`/devops/v1/project/${projectId}/envs`, JSON.stringify(data));

  updateSort = (projectId, envIds) => {
    this.changeLoading(true);
    return axios.put(`/devops/v1/project/${projectId}/envs/sort`, JSON.stringify(envIds)).then((data) => {
      if (data) {
        this.setEnvcardPosition(data);
        this.changeLoading(false);
      }
    });
  };

  updateEnv = (projectId, data) =>
    axios.put(`/devops/v1/project/${projectId}/envs`, JSON.stringify(data));

  loadEnvById = (projectId, id) =>
    axios.get(`/devops/v1/project/${projectId}/envs/${id}`).then((data) => {
      if (data) {
        this.setEnvData(data);
      }
    });

  loadShell = (projectId, id) =>
    axios.get(`/devops/v1/project/${projectId}/envs/${id}/shell`).then((data) => {
      if (data) {
        this.setShell(data);
      }
    });

  banEnvById(projectId, id, active) {
    return axios.put(`/devops/v1/project/${projectId}/envs/${id}/active?active=${active}`);
  }

  loadName = (projectId, name) =>
    axios.get(`/devops/v1/project/${projectId}/envs/checkName?name=${name}`);

  loadCode = (projectId, code) =>
    axios.get(`/devops/v1/project/${projectId}/envs/checkCode?code=${code}`);

  checkUrl = (organizationId, envId, url, token) => {
    if (envId) {
      return axios.get(`/devops/v1/organization/${organizationId}/environment/token?environmentId=${envId}&url=${url}&token=${token}`);
    } else {
      return axios.get(`/devops/v1/organization/${organizationId}/environment/token?url=${url}&token=${token}`);
    }
  };
}

const appStoreStore = new AppStoreStore();
export default appStoreStore;
