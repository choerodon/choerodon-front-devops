import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
// import { Observable } from 'rxjs';
// import { formJS } from 'immutable';

const height = window.screen.height;
@store('AppReleaseStore')
class AppReleaseStore {
  @observable allData = [];
  @observable isRefresh= false;// 页面的loading
  @observable loading = false; // 打开tab的loading
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

  loadData = ({ isRefresh = false, projectId, page = 0, size = 10, sorter = { field: 'id', order: 'desc' }, postData = { searchParam: {},
    param: '' }, key = '1' }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    if (key === '1') {
      return axios.post(`/devops/v1/projects/${projectId}/apps/list_unpublish?page=${page}&size=${size}&sort=${sorter.field},${sorter.order}`, JSON.stringify(postData))
        .then((data) => {
          const res = this.handleProptError(data);
          if (res) {
            this.handleData(data);
          }
          this.changeLoading(false);
          this.changeIsRefresh(false);
        });
    } else {
      return axios.post(`/devops/v1/projects/${projectId}/apps_market/list?page=${page}&size=${size}&sort=${sorter.field},${sorter.order}`, JSON.stringify(postData))
        .then((data) => {
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
