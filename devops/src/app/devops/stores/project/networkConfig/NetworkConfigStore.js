import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
// import { Observable } from 'rxjs';
// import _ from 'lodash';

const height = window.screen.height;
@store('NetworkConfigStore')
class NetworkConfigStore {
  @observable allData = [];
  @observable isRefresh = false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable selectData = [];
  @observable env = [];
  @observable instance = [];
  @observable versions = [];
  @observable app = [];
  @observable envLoading = false;
  @observable pageInfo = {
    current: 1, total: 0, pageSize: height <= 900 ? 10 : 15,
  };
  @observable versionDto = [];

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }


  @computed
  get getAllData() {
    return this.allData.slice();
  }

  @action
  setAllData(data) {
    this.allData = data;
  }

  @computed
  get getApp() {
    return this.app.slice();
  }

  @action
  setApp(data) {
    this.app = data;
  }

  @computed
  get getInstance() {
    return this.instance;
  }

  @action
  setInstance(type = 'add', index = '', data) {
    if (type instanceof Array) {
      this.instance = [];
    } else if (type === 'add') {
      if (this.instance.length === 0) {
        this.instance.push(data);
      } else {
        const newData = this.instance;
        _.map(newData, (ins, i) => {
          if (ins.id === data.id) {
            newData[i].options = data.options;
            this.instance = newData;
          } else {
            this.instance.push(data);
          }
        });
      }
    } else if (type === 'remove') {
      this.instance.splice(index, 1);
      // window.console.log(this.instance);
    }
    // window.console.log(this.instance);
  }

  @computed
  get getVersions() {
    return this.versions.slice();
  }

  @action
  setVersions(data) {
    this.versions = data;
  }

  @computed
  get getEnv() {
    return this.env.slice();
  }

  @action
  setEnv(data) {
    this.env = data;
  }

  @computed
  get getSelectData() {
    return this.selectData.slice();
  }

  @action
  setSelectData(data) {
    this.selectData = data;
  }

  @action changeIsRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsRefresh() {
    return this.isRefresh;
  }

  @action
  changeLoading(flag) {
    this.loading = flag;
  }

  @computed
  get getLoading() {
    return this.loading;
  }

  @action
  setSingleData(data) {
    this.singleData = data;
  }

  @computed
  get getSingleData() {
    return this.singleData;
  }

  @action
  setVersionDto(type = 'add', index = '', data) {
    if (type === 'add') {
      this.versionDto = data;
    } else if (type === 'remove') {
      this.versionDto.splice(index, 1);
    } else {
      this.versionDto = [];
    }
  }

  @computed
  get getVersionDto() {
    return this.versionDto.slice();
  }

  @action
  changEnvLoading(flag) {
    this.envLoading = flag;
  }

  loadData = (isRefresh = false, proId, page = this.pageInfo.current - 1, pageSize = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return axios.post(`/devops/v1/projects/${proId}/service/list_by_options?page=${page}&size=${pageSize}&sort=${sort.field || 'id'},${sort.order}`, JSON.stringify(datas))
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.handleData(data);
        }
        this.changeLoading(false);
        this.changeIsRefresh(false);
      });
  };

  handleData =(data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    this.setPageInfo({ number, size, totalElements });
  };

  loadDataById = (projectId, id) => {
    this.changeLoading(true);
    return axios.get(`/devops/v1/projects/${projectId}/service/${id}`).then((data) => {
      const res = this.handleProptError(data);
      if (res) {
        this.setSingleData(data);
        return data;
      }
      this.changeLoading(false);
      return res;
    });
  };

  checkDomainName = (projectId, envId, value) =>
    axios.get(`/devops/v1/projects/${projectId}/service/check?envId=${envId}&name=${value}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  updateData = (projectId, id, data) =>
    axios.put(`/devops/v1/projects/${projectId}/service/${id}`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  addData = (projectId, data) =>
    axios.post(`/devops/v1/projects/${projectId}/service`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  deleteData = (projectId, id) =>
    axios.delete(`/devops/v1/projects/${projectId}/service/${id}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });


  loadEnv = (projectId) => {
    return axios.get(`/devops/v1/projects/${projectId}/envs?active=true`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setEnv(data);
        }
        this.changEnvLoading(false);
        return res;
      });
  };
  loadApp = (projectId, envId) => {
    return axios.get(`/devops/v1/projects/${projectId}/apps/options?envId=${envId}&status=running`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setApp(data);
        }
        this.changeLoading(false);
        return res;
      });
  };
  loadVersion = (projectId, envId, appId) => {
    return axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/version?envId=${envId}`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setVersions(data);
        }
        this.changeLoading(false);
        return res;
      });
  };

  loadInstance = (projectId, envId, appId, versionId) => {
    this.changeLoading(true);
    return axios.get(`/devops/v1/projects/${projectId}/app_instances/options?envId=${envId}&appId=${appId}&appVersionId=${versionId}`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });
  };
  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}

const networkConfigStore = new NetworkConfigStore();
export default networkConfigStore;
