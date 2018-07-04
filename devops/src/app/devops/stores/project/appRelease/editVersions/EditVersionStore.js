import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
// import { Observable } from 'rxjs';

const height = window.screen.height;
@store('EditVersionStore')
class EditVersionStore {
  @observable isRefresh= false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable selectData = [];
  @observable apps = [];
  @observable pageInfo = {
    current: 1, total: 0, pageSize: height <= 900 ? 10 : 15,
  };
  @observable versionPage = {
    current: 0, total: 0, pageSize: height <= 900 ? 10 : 15,
  };
  @observable versionData = [];
  @observable type = [];

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

  @action setSelectData(data) {
    this.selectData = data;
  }
  @computed get getSelectData() {
    return this.selectData.slice();
  }

  @computed get getVersionData() {
    return this.versionData.slice();
  }

  @action setVersionData(data) {
    this.versionData = data;
  }

  @action setApps(data) {
    this.apps = data;
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

  @action setType(data) {
    this.type = data;
  }

  loadData = ({ isRefresh = false, projectId, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, postData = { searchParam: {}, param: '' }, key = '1', id }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    if (key === '1') {
      return axios.post(`/devops/v1/projects/${projectId}/apps_market/${id}/versions?is_publish=false&page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(postData))
        .then((data) => {
          const res = this.handleProptError(data);
          if (res) {
            this.handleData(data);
          }
          this.changeLoading(false);
          this.changeIsRefresh(false);
        });
    } else {
      return axios.post(`/devops/v1/projects/${projectId}/apps_market/${id}/versions?is_publish=true&page=${page}&size=${size}&sort=updatedDate,desc`, JSON.stringify(postData))
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

  updateData = (projectId, id, data) =>
    axios.put(`/devops/v1/projects/${projectId}/apps_market/${id}/versions`, JSON.stringify(data))
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

const editVersionStore = new EditVersionStore();
export default editVersionStore;
