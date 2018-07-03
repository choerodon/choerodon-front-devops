import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { Observable } from 'rxjs';

const height = window.screen.height;

@store('AppVersionStore')
class AppVersionStore {
  @observable allData = [];
  @observable isRefresh = false;// 页面的loading
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

  loadData = (isRefresh = false, proId, page = this.pageInfo.current - 1, pageSize = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return axios.post(`/devops/v1/projects/${proId}/app_version/list_by_options?page=${page}&size=${pageSize}&sort=${sort.field},${sort.order}`, JSON.stringify(datas))
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
  }
  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}

const appVersionStore = new AppVersionStore();
export default appVersionStore;

// autorun(() => {
//   window.console.log(templateStore.allData.length);
//   whyRun();
// });
