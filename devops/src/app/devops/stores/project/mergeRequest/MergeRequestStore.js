import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import { axios, store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('MergeRequestStore')
class MergeRequestStore {
  @observable loading = true;
  @observable apps = [];
  @observable mergeData = {};
  @observable assignee = {};
  @observable params = [];
  @observable pageInfo = {};
  @observable currentApp = {};
  @observable url = '';
  @observable id = null;
  @observable assigneeCount = 0;
  @observable count = {
    closeCount: 0,
    mergeCount: 0,
    openCount: 0,
    totalCount: 0,
  };

  @action setTableFilter(param) {
    if (param) {
      this.params = param;
    } else {
      this.params = [];
    }
  }

  @computed get getParams() {
    return this.params.slice();
  }

  @action setPageInfo(page) {
    this.pageInfo = page;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action setApps(apps) {
    this.apps = apps;
  }

  @computed get getApps() {
    return this.apps;
  }

  @action setUrl(url) {
    this.url = url;
  }

  @computed get getUrl() {
    return this.url;
  }

  @action setUserId(id) {
    this.id = id;
  }

  @computed get getUserId() {
    return this.id;
  }

  @action setMerge(mergeData) {
    this.mergeData = mergeData;
  }

  @action setAssignee(assignee) {
    this.assignee = assignee;
  }

  @action setAssigneeCount(assigneeCount) {
    this.assigneeCount = assigneeCount;
  }

  @computed get getMerge() {
    return this.mergeData;
  }

  @computed get getAssignee() {
    return this.assignee;
  }

  @computed
  get getIsLoading() {
    return this.loading;
  }

  @action setLoading(data) {
    this.loading = data;
  }

  @action setCurrentApp(data) {
    this.currentApp = data;
  }

  @action setCount(data) {
    this.count = data;
  }

  @computed get getCount() {
    return this.count;
  }

  @computed get getAssigneeCount() {
    return this.assigneeCount;
  }

  loadInitData = () => {
    this.setLoading(true);
    this.loadApps(AppState.currentMenuType.id).then((res) => {
      this.setApps(res || []);
      const response = this.handleProptError(res);
      if (response) {
        if (res.length) {
          const defaultApp = res[0];
          this.setCurrentApp(defaultApp);
          this.loadMergeRquest(defaultApp.id);
          this.loadUrl(AppState.currentMenuType.id, defaultApp.id);
        } else {
          this.setLoading(false);
        }
      }
    });
  };

  loadMergeRquest(appId, key = 'opened', page = 0, size = 10, projectId = AppState.currentMenuType.id) {
    this.setMerge([]);
    this.setLoading(true);
    const userId = this.getUserId;
    if (key === 'all') {
      axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/merge_request/list?page=${page}&size=${size}`)
        .then((res) => {
          const response = this.handleProptError(res);
          if (response) {
            const { pageResult, closeCount, mergeCount, openCount, totalCount } = response;
            this.setPageInfo({
              current: pageResult.number + 1,
              pageSize: pageResult.size,
              total: pageResult.totalElements,
            });
            this.setMerge(pageResult);
            this.setCount({
              closeCount,
              mergeCount,
              openCount,
              totalCount,
            });
          }
          this.setLoading(false);
        })
        .catch((error) => {
          this.setLoading(false);
          Choerodon.prompt(error.message);
        });
    } else {
      axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/merge_request/list?state=${key}&page=${page}&size=${size}`)
        .then((res) => {
          const response = this.handleProptError(res);
          if (response) {
            const { pageResult, closeCount, mergeCount, openCount, totalCount } = response;
            this.setPageInfo({
              current: pageResult.number + 1,
              pageSize: pageResult.size,
              total: pageResult.totalElements,
            });
            this.setMerge(pageResult);
            if (key === 'opened') {
              const assignee = pageResult ?
                _.filter(pageResult.content, a => a.assignee && a.assignee.id === userId) : [];
              this.setAssignee(assignee);
              this.setAssigneeCount(assignee.length);
            }
            this.setCount({
              closeCount,
              mergeCount,
              openCount,
              totalCount,
            });
          }
          this.setLoading(false);
        })
        .catch((error) => {
          this.setLoading(false);
          Choerodon.prompt(error.message);
        });
    }
  }


  loadApps(projectId) {
    return axios.get(`/devops/v1/projects/${projectId}/apps`)
      .then(datas => this.handleProptError(datas));
  }

  loadUser = () => axios.get('iam/v1/users/self').then((data) => {
    this.setUserId(data.id);
  });

  loadUrl(projectId, appId) {
    return axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/url`)
      .then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setUrl(data);
        }
      });
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

const mergeRequestStore = new MergeRequestStore();
export default mergeRequestStore;
