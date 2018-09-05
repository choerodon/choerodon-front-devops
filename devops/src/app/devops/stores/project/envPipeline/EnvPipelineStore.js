import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import { axios, store } from 'choerodon-front-boot';

@store('EnvPipelineStore')
class EnvPipelineStore {
  @observable isLoading = true;

  @observable btnLoading = false;

  @observable envcardPosition = [];

  @observable disEnvcardPosition = [];

  @observable envdata = [];

  @observable group = [];

  @observable groupOne = [];

  @observable ist = [];

  @observable envId = null;

  @observable show = false;

  @observable showGroup = false;

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
  setShowGroup(showGroup) {
    this.showGroup = showGroup;
  }

  @action
  setGroup(group) {
    this.group = group;
  }

  @action
  setGroupOne(groupOne) {
    this.groupOne = groupOne;
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
  switchData(a, b, id) {
    let data = {};
    if (id) {
      data = _.filter(this.envcardPosition, { devopsEnvGroupId: id })[0].devopsEnviromentRepDTOs;
    } else {
      data = this.envcardPosition[0].devopsEnviromentRepDTOs;
    }
    const t1 = _.findIndex(data, o => o.sequence === a);
    const t2 = _.findIndex(data, o => o.sequence === b);
    [data[t1], data[t2]] = [data[t2], data[t1]];
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
  get getShowGroup() {
    return this.showGroup;
  }

  @computed
  get getGroup() {
    return this.group;
  }

  @computed
  get getGroupOne() {
    return this.groupOne;
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

  @action
  setBtnLoading(data) {
    this.btnLoading = data;
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

  @computed
  get getBtnLoading() {
    return this.btnLoading;
  }

  loadEnv = (projectId, active) => {
    this.changeLoading(true);
    return axios.get(`devops/v1/projects/${projectId}/envs/groups?active=${active}`).then((data) => {
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

  createGroup(projectId, name) {
    return axios.post(`/devops/v1/projects/${projectId}/env_groups?devopsEnvGroupName=${name}`);
  }

  @action
  updateSort = (projectId, envIds, groupId) => {
    this.changeLoading(true);
    return axios.put(`/devops/v1/projects/${projectId}/envs/sort`, JSON.stringify(envIds)).then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        _.map(this.envcardPosition, (e) => {
          if (e.devopsEnvGroupId === groupId) {
            e.devopsEnviromentRepDTOs = data;
          }
        });
        this.setEnvcardPosition(this.envcardPosition);
        this.loadEnv(projectId, true);
        this.changeLoading(false);
      }
    });
  };

  updateEnv(projectId, data) {
    return axios.put(`/devops/v1/projects/${projectId}/envs`, JSON.stringify(data));
  }

  updateGroup(projectId, data) {
    return axios.put(`/devops/v1/projects/${projectId}/env_groups`, JSON.stringify(data));
  }

  loadEnvById = (projectId, id) => axios.get(`/devops/v1/projects/${projectId}/envs/${id}`).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setEnvData(data);
    }
  });

  loadShell = (projectId, id, update) => axios.get(`/devops/v1/projects/${projectId}/envs/${id}/shell?update=${update}`).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setShell(data);
    }
  });

  loadGroup = projectId => axios.get(`/devops/v1/projects/${projectId}/env_groups`).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setGroup(data);
    }
  });

  // loadGroupById = (projectId, id) => axios.get(`/devops/v1/projects/${projectId}/env_groups/${id}`).then((data) => {
  //   if (data && data.failed) {
  //     Choerodon.prompt(data.message);
  //   } else {
  //     this.setGroupOne(data);
  //   }
  // });

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

  delGroupById(projectId, id) {
    return axios.delete(`/devops/v1/projects/${projectId}/env_groups/${id}`);
  }

  loadName(projectId, name) {
    return axios.get(`/devops/v1/projects/${projectId}/envs/checkName?name=${name}`);
  }

  checkEnvGroup(projectId, name) {
    return axios.get(`/devops/v1/projects/${projectId}/env_groups/checkName?name=${name}`);
  }

  loadCode(projectId, code) {
    return axios.get(`/devops/v1/projects/${projectId}/envs/checkCode?code=${code}`);
  }
}

const envPipelineStore = new EnvPipelineStore();
export default envPipelineStore;
