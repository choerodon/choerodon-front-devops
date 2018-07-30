import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
// import { Observable } from 'rxjs';
// import { formJS } from 'immutable';

const height = window.screen.height;

@store('SelectAppStore')
class SelectAppStore {
  @observable localData = [];
  @observable storeData = [];
  @observable isRefresh= false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable selectData = [];
  @observable pageInfo = {
    current: 1, total: 0, pageSize: 15,
  };

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  /**
   * 项目应用数据
   */
  @computed get getAllData() {
    return this.localData.slice();
  }

  @action setAllData(data) {
    this.localData = data;
  }

  /**
   * 应用市场数据
   */
  @action setStoreData(data) {
    this.storeData = data;
  }

  @computed get getStoreData() {
    return this.storeData.slice();
  }

  @computed get getSelectData() {
    return this.singleData.slice();
  }

  @action setSelectData(data) {
    this.selectData = data;
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
    return axios.post(`/devops/v1/projects/${projectId}/apps/list_by_options?active=true&page=${page}&size=${size}&sort=${sort.field},${sort.order}&has_version=true`, JSON.stringify(postData))
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.handleData(data, 'local');
        }
        this.changeLoading(false);
      });
  };
  loadApps = ({ projectId, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, postData = { searchParam: {},
    param: '',
  } }) => {
    this.changeLoading(true);
    return axios.post(`devops/v1/projects/${projectId}/apps_market/list_all?page=${page}&size=${size}`, JSON.stringify(postData))
      .then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handleData(data, 'store');
          this.changeLoading(false);
        }
      });
  };
  handleData =(data, type) => {
    const { number, size, totalElements, content } = data;
    if (type === 'local') {
      this.setAllData(content);
    } else {
      this.setStoreData(content);
    }
    this.setPageInfo({ number, size, totalElements });
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
