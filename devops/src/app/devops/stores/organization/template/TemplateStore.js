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
@store('TemplateStore')
class TemplateStore {
  @observable allData = [];
  @observable isRefresh = false;// 页面的loading
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
    return this.allData.slice();
  }

  @action setAllData(data) {
    this.allData = data;
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

  @computed get getSelectData() {
    return this.selectData.slice();
  }

  @action setSelectData(data) {
    this.selectData = data;
  }

  loadData = (isRefresh = false, orgId, page = this.pageInfo.current, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return Observable.fromPromise(axios.post(`/devops/v1/organizations/${orgId}/app_templates/list_by_options?page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(datas)))
      .subscribe((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.handleData(data);
          this.changeLoading(false);
          this.changeIsRefresh(false);
        }
      });
  };
  handleData =(data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };
  loadSelectData =orgId =>
    axios.get(`/devops/v1/organizations/${orgId}/app_templates`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setSelectData(data);
        }
      });

  loadDataById =(orgId, id) =>
    axios.get(`/devops/v1/organizations/${orgId}/app_templates/${id}`).then((data) => {
      const res = this.handleProptError(data);
      if (res) {
        this.setSingleData(data);
      }
    });

  checkCode =(orgId, code) =>
    axios.get(`/devops/v1/organizations/${orgId}/app_templates/checkCode?code=${code}`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });

  checkName = (orgId, name) =>
    axios.get(`/devops/v1/organizations/${orgId}/app_templates/checkName?name=${name}`)
      .then((data) => {
        const res = this.handleProptError(data);
        return res;
      });

  updateData = (orgId, data) =>
    axios.put(`/devops/v1/organizations/${orgId}/app_templates`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  addData = (orgId, data) =>
    axios.post(`/devops/v1/organizations/${orgId}/app_templates`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });;

  deleteData =(orgId, id) =>
    axios.delete(`/devops/v1/organizations/${orgId}/app_templates/${id}`)
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

const templateStore = new TemplateStore();
export default templateStore;
// autorun(() => {
//   window.console.log(templateStore.allData.length);
//   whyRun();
// });
