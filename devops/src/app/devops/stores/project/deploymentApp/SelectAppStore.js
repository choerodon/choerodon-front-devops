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

@store('SelectAppStore')
class SelectAppStore {
  @observable allData = [];
  @observable isRefresh= false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable selectData = [];
  @observable pageInfo = {
    current: 1, total: 0, pageSize: height <= 900 ? 10 : 16,
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

  loadData = ({ projectId, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, postData = { searchParam: {},
    param: '',
  } }) => {
    this.changeLoading(true);
    return Observable.fromPromise(axios.post(`/devops/v1/projects/${projectId}/apps/list_by_options?page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(postData)))
      .subscribe((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.handleData(data);
        }
        this.changeLoading(false);
      });
  };
  loadApps = ({ projectId, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, postData = { searchParam: {},
    param: '',
  } }) => axios.post(`devops/v1/projects/${projectId}/apps_market/list_all?page=${page}&size=${size}`, JSON.stringify(postData)).then((data) => {
    this.changeLoading(true);
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.handleData(data);
      this.changeLoading(false);
    }
  });
  handleData =(data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };

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

const selectAppStore = new SelectAppStore();
export default selectAppStore;

// autorun(() => {
//   window.console.log(templateStore.allData.length);
//   whyRun();
// });
