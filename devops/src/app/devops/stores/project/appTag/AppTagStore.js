import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

/**
 * 处理错误请求
 * @param data
 * @returns {*}
 */
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
  @observable selectedApp = null;
  @observable defaultAppName = null;
  @observable loading = true;
  @observable pageInfo = {
    current: 0,
    total: 0,
    pageSize: 4,
  };
  @observable branchData = [];

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

  @action setSelectApp(app) {
    this.selectedApp = app;
  }

  @computed get getSelectApp() {
    return this.selectedApp;
  }

  @action setDefaultAppName(name) {
    this.defaultAppName = name;
  }

  @computed get getDefaultAppName() {
    return this.defaultAppName;
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

  @action setBranchData(data) {
    this.branchData = data;
  }

  @computed get getBranchData() {
    return this.branchData;
  }

  /**
   * 根据应用ID查询该应用下所有的标签
   * @param projectId
   * @param appId
   * @param page
   * @param sizes
   * @returns {Promise<T>}
   */
  queryTagData = (projectId, page = 0, sizes = 10, postData = { searchParam: {}, param: '' }) => {
    this.setLoading(true);
    axios.post(`/devops/v1/projects/${projectId}/apps/${this.selectedApp}/git/tags_list_options?page=${page}&size=${sizes}`, JSON.stringify(postData))
      .then((data) => {
        this.setLoading(false);
        const result = handleProptError(data);
        if (result) {
          const { content, totalElements } = result;
          this.setTagData(content);
          this.setPageInfo({ page, sizes, totalElements });
        }
      }).catch(err => Choerodon.prompt(err));
  };

  /**
   * 查询该项目下的所有应用
   * @param projectId
   * @returns {Promise<T>}
   */
  queryAppData = projectId =>
    axios.get(`/devops/v1/projects/${projectId}/apps`)
      .then((data) => {
        const result = handleProptError(data);
        if (result) {
          this.setAppData(result);
          this.setSelectApp(result[0].id);
          this.setDefaultAppName(result[0].name);
          this.queryTagData(projectId, 0, 4);
        }
      }).catch(err => Choerodon.prompt(err));

  /**
   * 查询应用下的所有分支
   * @param projectId
   * @param appId
   * @returns {Promise<T>}
   */
  queryBranchData = ({ projectId, sorter = { field: 'createDate', order: 'asc' }, postData = { searchParam: {}, param: '' }, size = 3 }) => {
    axios.post(`/devops/v1/projects/${projectId}/apps/${this.selectedApp}/git/branches?page=0&size=${size}`, JSON.stringify(postData)).then((data) => {
      const result = handleProptError(data);
      if (result) {
        this.setBranchData(result);
      }
    }).catch(err => Choerodon.prompt(err));
  };

  /**
   * 检查标记名称的唯一性
   * @param projectId
   * @param value
   */
  checkTagName = (projectId, name) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/${this.selectedApp}/git/tags_check?tag_name=${name}`);

  /**
   * 创建tag
   * @param projectId
   * @param appId
   * @param tag
   * @param ref
   * @returns {JQueryXHR | * | void}
   */
  createTag = (projectId, tag, ref) =>
    axios.post(`/devops/v1/projects/${projectId}/apps/${this.selectedApp}/git/tags?tag=${tag}&ref=${ref}`);

  /**
   * 删除标记
   * @param projectId
   * @param tag
   */
  deleteTag = (projectId, tag) =>
    axios.delete(`/devops/v1/projects/${projectId}/apps/${this.selectedApp}/git/tags?tag=${tag}`);
}

const appTagStore = new AppTagStore();
export default appTagStore;
