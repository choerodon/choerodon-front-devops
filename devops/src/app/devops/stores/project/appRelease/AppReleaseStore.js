import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { Observable } from 'rxjs';
import { formJS } from 'immutable';

const height = window.screen.height;
@store('AppReleaseStore')
class AppReleaseStore {
  @observable allData = [];
  @observable isRefresh= false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable apps = [];
  @observable pageInfo = {
    current: 1, total: 0, pageSize: height <= 900 ? 10 : 15,
  };
  @observable versionPage = {
    current: 0, total: 0, pageSize: height <= 900 ? 10 : 15,
  };
  @observable versionData = [];

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action setVersionPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getVersionPageInfo() {
    return this.pageInfo;
  }


  @computed get getAllData() {
    // window.console.log(this.allData);
    return this.allData.slice();
  }

  @action setAllData(data) {
    this.allData = data;
    // window.console.log(this.allData);
  }

  @computed get getVersionData() {
    // window.console.log(this.allData);
    return this.versionData.slice();
  }

  @action setVersionData(data) {
    this.versionData = data;
    // window.console.log(this.allData);
  }

  @action setApps(data) {
    this.apps = data;
    // window.console.log(this.allData);
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

  loadData = ({ isRefresh = false, projectId, page = 0, size = 10, sort = { field: 'id', order: 'desc' }, postData = { searchParam: {},
    param: '' }, key = '1' }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    if (key === '1') {
      return Observable.fromPromise(axios.post(`/devops/v1/projects/${projectId}/apps/list_unpublish?page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(postData)))
        .subscribe((data) => {
          const res = this.handleProptError(data);
          if (res) {
            this.handleData(data);
          }
          this.changeLoading(false);
          this.changeIsRefresh(false);
        });
    } else {
      return Observable.fromPromise(axios.post(`/devops/v1/projects/${projectId}/apps_market/list?page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(postData)))
        .subscribe((data) => {
          const res = this.handleProptError(data);
          if (res) {
            this.handleData(data);
          }
          this.changeLoading(false);
          this.changeIsRefresh(false);
        });
    }
  };

  handleData =(data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };


  loadAllVersion = ({ isRefresh = false, projectId, appId, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, postData = { searchParam: {},
    param: '',
  } }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return Observable.fromPromise(axios.post(`/devops/v1/projects/${projectId}/apps/${appId}/version/list_by_options?page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(postData)))
      .subscribe((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.handleVersionData(data);
        }
        this.changeLoading(false);
        this.changeIsRefresh(false);
      });
  };
  handleVersionData = (data) => {
    this.setVersionData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setVersionPageInfo(page);
  };

  loadApps = orgId =>
    axios.get(`/devops/v1/organizations/${orgId}/app_templates`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setApps(data);
        }
      });

  loadDataById =(projectId, id) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/${id}/detail`).then((data) => {
      const res = this.handleProptError(data);
      if (res) {
        this.setSingleData(data);
      }
    });

  checkCode =(projectId, code) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/checkCode?code=${code}`);

  checkName = (projectId, name) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/checkName?name=${name}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  updateData = (projectId, data) =>
    axios.put(`/devops/v1/projects/${projectId}/apps`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  addData = (projectId, data, img) =>
    axios.post(`/devops/v1/projects/${projectId}/apps?appId=${data.appId}&description=${data.description}&category=${data.category}&contributor=${data.contributor}&publishLevel=${data.publishLevel}&appVersions=${data.appVersions}`, img, {
      header: { 'Content-Type': 'multipart/form-data' },
    })
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  deleteData =(projectId, id) =>
    axios.post(`devops/v1/projects/${projectId}/apps_market/${id}/unpublish`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });
  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}

const appReleaseStore = new AppReleaseStore();
export default appReleaseStore;

// autorun(() => {
//   window.console.log(templateStore.allData.length);
//   whyRun();
// });
