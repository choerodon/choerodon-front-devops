import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';

@store('AppStoreStore')
class AppStoreStore {
  @observable isLoading = true;
  @observable appCards = [];
  @observable pageInfo = {};

  @action setPageInfo(page) {
    this.pageInfo = { current: page.number + 1, total: page.totalElements, pageSize: page.size };
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action
  setAppCards(appCards) {
    this.appCards = appCards;
  }

  @computed
  get getAppCards() {
    return this.appCards;
  }

  loadApps = (projectId, page = 0, size = 20, sorter = { id: 'asc' }, datas = {
    searchParam: {},
    param: '',
  }) => axios.post(`devops/v1/project/${projectId}/apps_market/list_all?page=${page}&size=${size}`, JSON.stringify(datas)).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.handleData(data);
    }
  });

  handleData =(data) => {
    this.setAppCards(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
    // this.changeLoading(false);
  };
}

const appStoreStore = new AppStoreStore();
export default appStoreStore;
