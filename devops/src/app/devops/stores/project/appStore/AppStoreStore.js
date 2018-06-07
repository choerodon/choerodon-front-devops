import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('AppStoreStore')
class AppStoreStore {
  @observable isLoading = true;
  @observable backPath = false;
  @observable listActive = 'card';
  @observable readme = false;
  @observable appCards = [];
  @observable app = [];
  @observable pageInfo = {};

  @action setPageInfo(page) {
    this.pageInfo = { current: page.number + 1, total: page.totalElements, pageSize: page.size };
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @computed get getReadme() {
    return this.readme;
  }

  @action
  setAppCards(appCards) {
    this.appCards = appCards;
  }

  @computed
  get getAppCards() {
    return this.appCards;
  }

  @action
  setApp(app) {
    this.app = app;
  }

  @action
  setReadme(readme) {
    this.readme = readme;
  }

  @action
  setBackPath(backPath) {
    this.backPath = backPath;
  }

  @computed
  get getApp() {
    return this.app;
  }

  @action setListActive(listActive) {
    this.listActive = listActive;
  }

  @computed get getListActive() {
    return this.listActive;
  }

  @action
  changeLoading(flag) {
    this.isLoading = flag;
  }

  @computed
  get getIsLoading() {
    return this.isLoading;
  }


  loadApps = (projectId, page = 0, size = 20, sorter = { id: 'asc' }, datas = {
    searchParam: {},
    param: '',
  }) => axios.post(`devops/v1/projects/${projectId}/apps_market/list_all?page=${page}&size=${size}`, JSON.stringify(datas)).then((data) => {
    this.changeLoading(true);
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.handleData(data);
      this.changeLoading(false);
    }
  });

  loadAppStore = (projectId, id) => axios.get(`devops/v1/projects/${projectId}/apps_market/${id}`).then((data) => {
    this.changeLoading(true);
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setApp(data);
      this.changeLoading(false);
    }
    return data;
  });

  loadReadme = (projectId, id, verId) => axios.get(`devops/v1/projects/${projectId}/apps_market/${id}/versions/${verId}/readme`).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setReadme(data);
    }
  });

  handleData =(data) => {
    this.setAppCards(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };
}

const appStoreStore = new AppStoreStore();
export default appStoreStore;
