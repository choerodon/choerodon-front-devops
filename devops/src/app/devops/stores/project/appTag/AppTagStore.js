import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

function handleProptError(data) {
  if (data && data.failed) {
    Choerodon.prompt(data.message);
    return false;
  } else {
    return data;
  }
}

@store('AppTagStore')
class AppTagStore {
  @observable tagData = [];
  @observable appData = [];
  @observable defaultApp = null;
  @observable loading = true;
  @observable pageInfo = {
    current: 0,
    total: 0,
    pageSize: 10,
  };

  @action setTagData(data) {
    this.tagData = data;
  }

  @computed get getTagData() {
    return this.tagData.slice();
  }

  @action setAppData(data) {
    this.appData = data;
  }

  @computed get getAppData() {
    return this.appData.slice();
  }

  @action setDefaultApp(app) {
    this.defaultApp = app.id || app;
  }

  @computed get getDefaultApp() {
    return this.defaultApp;
  }

  @action setLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setPageInfo(pages) {
    this.pageInfo = {
      current: pages.page,
      total: pages.totalElements,
      pageSize: pages.sizes,
    };
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  /**
   * 根据应用ID查询该应用下所有的标签
   * @param projectId
   * @param appId
   * @param page
   * @param sizes
   * @returns {Promise<T>}
   */
  queryTagData = (projectId, appId, page = 0, sizes = 10) => {
    this.setLoading(true);
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/tags?page=${page}&size=${sizes}`)
      .then((data) => {
        this.setLoading(false);
        const result = handleProptError(data);
        if (result) {
          const { tagList, totalElements } = result;
          this.setTagData(tagList);
          this.setPageInfo({ page, sizes, totalElements });
        }
      }).catch(err => Choerodon.prompt(err));
  };

  /**
   * 查询该项目下的所有应用
   * @param projectId
   */
  queryAppData = projectId =>
    axios.get(`/devops/v1/projects/${projectId}/apps`)
      .then((data) => {
        const result = handleProptError(data);
        if (result) {
          this.setAppData(result);
          this.setDefaultApp(result[0]);
          this.queryTagData(projectId, result[0].id, 0);
        }
      }).catch(err => Choerodon.prompt(err));
}

const appTagStore = new AppTagStore();
export default appTagStore;
