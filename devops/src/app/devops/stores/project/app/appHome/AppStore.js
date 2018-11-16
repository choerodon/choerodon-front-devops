import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import DeploymentPipelineStore from '../../deploymentPipeline';

const { AppState } = stores;
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

@store('AppStore')
class AppStore {
  @observable allData = [];

  @observable isRefresh= false;

  // 页面的loading
  @observable loading = false;

  // 打开tab的loading
  @observable singleData = null;

  @observable selectData = [];

  @observable pageInfo = {
    current: 1, total: 0, pageSize: HEIGHT <= 900 ? 10 : 15,
  };

  @observable Info = {
    filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [],
  };

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @computed get getAllData() {
    return this.allData.slice();
  }

  @action setAllData(data) {
    this.allData = data;
  }

  @computed get getSelectData() {
    return this.singleData.slice();
  }

  @action setSelectData(data) {
    this.selectData = data.slice();
  }

  @action changeIsRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsRefresh() {
    return this.isRefresh;
  }

  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setSingleData(data) {
    this.singleData = data;
  }

  @computed get getSingleData() {
    return this.singleData;
  }

  @action setInfo(Info) {
    this.Info = Info;
  }

  @computed get getInfo() {
    return this.Info;
  }

  loadData = (isRefresh = false, projectId, envId, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize, sort = { field: '', order: 'desc' }, postData = { searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    let url = `/devops/v1/projects/${projectId}/apps/list_by_options?page=${page}&size=${size}`;
    if (sort.field !== '') {
      url = `/devops/v1/projects/${projectId}/apps/list_by_options?page=${page}&size=${size}&sort=${sort.field},${sort.order}`;
    }
    this.changeLoading(true);
    return axios.post(url, JSON.stringify(postData))
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
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };

  loadSelectData = projectId => axios.get(`/devops/v1/projects/${projectId}/apps/template`)
    .then((data) => {
      const res = this.handleProptError(data);
      if (res) {
        this.setSelectData(res);
      }
    });

  loadDataById =(projectId, id) => axios.get(`/devops/v1/projects/${projectId}/apps/${id}/detail`).then((data) => {
    const res = this.handleProptError(data);
    if (res) {
      this.setSingleData(data);
    }
  });

  checkCode =(projectId, code) => axios.get(`/devops/v1/projects/${projectId}/apps/checkCode?code=${code}`)
    .then((data) => {
      const res = this.handleProptError(data);
      return res;
    });

  checkName = (projectId, name) => axios.get(`/devops/v1/projects/${projectId}/apps/checkName?name=${name}`)
    .then((data) => {
      const res = this.handleProptError(data);
      return res;
    });

  updateData = (projectId, data) => axios.put(`/devops/v1/projects/${projectId}/apps`, JSON.stringify(data))
    .then((datas) => {
      const res = this.handleProptError(datas);
      return res;
    });

  addData = (projectId, data) => axios.post(`/devops/v1/projects/${projectId}/apps`, JSON.stringify(data))
    .then((datas) => {
      const res = this.handleProptError(datas);
      return res;
    });

  changeAppStatus = (projectId, id, status) => axios.put(`/devops/v1/projects/${projectId}/apps/${id}?active=${status}`)
    .then((datas) => {
      const res = this.handleProptError(datas);
      return res;
    });

  deleteApps = (projectId, id) => axios.delete(`/devops/v1/projects/${projectId}/apps/${id}`)
    .then((datas) => {
      const res = this.handleProptError(datas);
      return res;
    });

  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      this.changeLoading(false);
      this.changeIsRefresh(false);
      return false;
    } else {
      return error;
    }
  }
}

const appStore = new AppStore();
export default appStore;
