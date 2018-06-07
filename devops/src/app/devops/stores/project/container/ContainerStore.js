import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { Observable } from 'rxjs';

const height = window.screen.height;
@store('ContainerStore')
class ContainerStore {
  @observable allData = [];
  @observable isRefresh = false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable show = false;
  @observable logs = '';
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
  @action changeShow(flag) {
    this.show = flag;
  }
  @computed get getAllData() {
    return this.allData;
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

  @action setLog(logs) {
    this.logs = logs;
  }

  @computed get getLog() {
    return this.logs;
  }


  loadData = (isRefresh = false, proId, page = this.pageInfo.current - 1, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return Observable.fromPromise(axios.post(`/devops/v1/projects/${proId}/app_pod/list_by_options?page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(datas)))
      .subscribe((data) => {
        const res = this.handleProptError(datas);
        if (res) {
          this.handleData(data);
        }
        this.changeLoading(false);
        this.changeIsRefresh(false);
      });
  };

  handleData = (data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };

  loadPodParam(projectId, id) {
    return axios.get(`devops/v1/projects/${projectId}/app_pod/${id}/containers/logs`)
      .then(datas => this.handleProptError(datas));
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

const containerStore = new ContainerStore();
export default containerStore;
