import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import axios from 'Axios';
import store from 'Store';

@store('EnvPipelineStore')
class EnvPipelineStore {
  @observable isLoading = true;
  @observable envcardPosition = [];
  @observable disEnvcardPosition = [];
  @observable envdata = [];
  @observable ist = [];
  @observable envId = null;
  @observable show = false;
  @observable ban = false;
  @observable sideType = 'key';
  @observable shell = '';

  @action setIst(ist) {
    this.ist = ist;
  }

  @computed get getIst() {
    return this.ist;
  }

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
    return axios.get(`devops/v1/projects/${projectId}/envs?active=${active}`).then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else if (data && active) {
        this.setEnvcardPosition(data);
      } else {
        this.setDisEnvcardPosition(data);
      }
      this.changeLoading(false);
    });
  };

  createEnv(projectId, data) {
    return axios.post(`/devops/v1/projects/${projectId}/envs`, JSON.stringify(data));
  }

  updateSort = (projectId, envIds) => {
    this.changeLoading(true);
    return axios.put(`/devops/v1/projects/${projectId}/envs/sort`, JSON.stringify(envIds)).then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setEnvcardPosition(data);
        this.changeLoading(false);
      }
    });
  };

  updateEnv(projectId, data) {
    return axios.put(`/devops/v1/projects/${projectId}/envs`, JSON.stringify(data));
  }

  loadEnvById = (projectId, id) =>
    axios.get(`/devops/v1/projects/${projectId}/envs/${id}`).then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setEnvData(data);
      }
    });

  loadShell = (projectId, id, update) =>
    axios.get(`/devops/v1/projects/${projectId}/envs/${id}/shell?update=${update}`).then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setShell(data);
      }
    });

  loadInstance = (projectId, page, size = 10, sorter = { id: 'asc' }, envId, datas = {
    searchParam: {},
    param: '',
  }) => axios.post(`devops/v1/projects/${projectId}/app_instances/list_by_options?envId=${envId}&page=${page}&size=${size}`, JSON.stringify(datas)).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setIst(data.content);
    }
  });

  banEnvById(projectId, id, active) {
    return axios.put(`/devops/v1/projects/${projectId}/envs/${id}/active?active=${active}`);
  }

  loadName(projectId, name) {
    return axios.get(`/devops/v1/projects/${projectId}/envs/checkName?name=${name}`);
  }

  loadCode(projectId, code) {
    return axios.get(`/devops/v1/projects/${projectId}/envs/checkCode?code=${code}`);
  }
}

const envPipelineStore = new EnvPipelineStore();
export default envPipelineStore;
