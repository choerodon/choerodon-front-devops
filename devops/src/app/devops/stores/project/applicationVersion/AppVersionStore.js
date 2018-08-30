import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';

const ORDER = {
  ascend: 'asc',
  descend: 'desc',
};

@store('AppVersionStore')
class AppVersionStore {
  @observable appData = [];

  @observable allData = [];

  @observable isRefresh = false;

  // 页面的loading
  @observable loading = false;

  // 打开tab的loading
  @observable pageInfo = {
    current: 0,
    total: 0,
    pageSize: 10,
  };

  @action setAppDate(data) {
    this.appData = data;
  }

  @computed get getAppData() {
    return this.appData;
  }

  @action setPageInfo(pages) {
    this.pageInfo = pages;
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

  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  /**
   * 查询项目下的应用
   * @param projectId
   * @returns {Promise<T | never>}
   */
  queryAppData = projectId => axios.get(`/devops/v1/projects/${projectId}/apps`)
    .then((data) => {
      const result = handleProptError(data);
      if (result) {
        this.setAppDate(result);
      }
    })
    .catch(err => Choerodon.prompt(err));

  loadData = (proId, app, page, pageSize, sort, filter) => {
    this.changeLoading(true);
    axios.post(`/devops/v1/projects/${proId}/app_version/list_by_options?appId=${app}&page=${page}&size=${pageSize}&sort=${sort.field || 'id'},${ORDER[sort.order]}`, JSON.stringify(filter))
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          const { number, size, totalElements, content } = res;
          this.setAllData(content);
          this.setPageInfo({ current: number + 1, pageSize: size, total: totalElements });
        }
        this.changeLoading(false);
      });
  };
}

const appVersionStore = new AppVersionStore();
export default appVersionStore;
