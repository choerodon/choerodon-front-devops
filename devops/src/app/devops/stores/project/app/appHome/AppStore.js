/**
 * Created by mading on 2017/11/27.
 */
import { observable, action, computed, autorun, whyRun } from 'mobx';
// import axios from 'Axios';
import axios from 'Axios';
import store from 'Store';
import { Observable } from 'rxjs';
import { List, formJS } from 'immutable';

const height = window.screen.height;

@store('AppStore')
class AppStore {
  @observable allData = [];
  @observable isRefresh= false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable selectData = [];
  @observable pageInfo = {
    current: 1, total: 0, pageSize: height <= 900 ? 10 : 15,
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
    // window.console.log(this.allData);
    return this.allData.slice();
  }

  @action setAllData(data) {
    this.allData = data;
    // window.console.log(this.allData);
  }
  @computed get getSelectData() {
    // window.console.log(this.allData);
    return this.singleData.slice();
  }

  @action setSelectData(data) {
    this.selectData = data;
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

  loadData = (isRefresh = false, projectId, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, postData = { searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return Observable.fromPromise(axios.post(`/devops/v1/projects/${projectId}/apps/list_by_options?page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(postData)))
      .subscribe((data) => {
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

  loadSelectData =orgId =>
    axios.get(`/devops/v1/projects/${orgId}/apps/template`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setSelectData(res);
        }
      });

  loadDataById =(projectId, id) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/${id}`).then((data) => {
      const res = this.handleProptError(data);
      if (res) {
        this.setSingleData(data);
      }
    });

  checkCode =(projectId, code) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/checkCode?code=${code}`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });

  checkName = (projectId, name) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/checkName?name=${name}`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });

  updateData = (projectId, data) =>
    axios.put(`/devops/v1/projects/${projectId}/apps`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  addData = (projectId, data) =>
    axios.post(`/devops/v1/projects/${projectId}/apps`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  deleteData =(projectId, id) =>
    axios.delete(`/devops/v1/organizations/${projectId}/appTemplates/${id}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  changeAppStatus = (projectId, id, status) =>
    axios.put(`/devops/v1/projects/${projectId}/apps/${id}?active=${status}`)
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

// autorun(() => {
//   window.console.log(templateStore.allData.length);
//   whyRun();
// });
