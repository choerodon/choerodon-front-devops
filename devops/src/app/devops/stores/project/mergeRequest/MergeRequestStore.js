import { observable, action, computed } from 'mobx';
import _ from 'lodash';
import { axios, store, stores } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';

const { AppState } = stores;

@store('MergeRequestStore')
class MergeRequestStore {
  @observable loading = true;

  @observable apps = [];

  @observable mergeData = {
    closed: [],
    merged: [],
    opened: [],
    all: [],
  };

  @observable assignee = {};

  @observable params = [];

  @observable pageInfo = {
    closed: {},
    merged: {},
    opened: {},
    all: {},
  };

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

  @action setPageInfo(page, key) {
    this.pageInfo[key] = page;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
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

  @action setMerge(mergeData, key) {
    this.mergeData[key] = mergeData;
  }

  @computed get getMerge() {
    return this.mergeData;
  }

  @action setAssignee(assignee) {
    this.assignee = assignee;
  }

  @action setAssigneeCount(assigneeCount) {
    this.assigneeCount = assigneeCount;
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

  @action setCount(data) {
    this.count = data;
  }

  @computed get getCount() {
    return this.count;
  }

  @computed get getAssigneeCount() {
    return this.assigneeCount;
  }

  loadMergeRquest(appId, key = 'opened', page = 0, size = 10, projectId = AppState.currentMenuType.id) {
    this.setMerge([]);
    this.setLoading(true);
    const userId = this.getUserId;
    if (key === 'all') {
      axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/merge_request/list?page=${page}&size=${size}`)
        .then((res) => {
          const response = handleProptError(res);
          if (response) {
            const { pageResult, closeCount, mergeCount, openCount, totalCount } = response;
            const { number, totalElements, content } = pageResult;
            this.setPageInfo({
              current: number + 1,
              pageSize: pageResult.size,
              total: totalElements,
            }, key);
            this.setMerge(content, key);
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
      // 针对opened和assignee的数据不分页处理，原因是前端从opened中分离assignee数据，会导致分页数据都显示opened的，期待后端修改
      axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/merge_request/list?state=${key}&page=${page}&size=${key === 'opened' ? 30 : size}`)
        .then((res) => {
          const response = handleProptError(res);
          if (response) {
            const { pageResult, closeCount, mergeCount, openCount, totalCount } = response;
            const { number, totalElements, content } = pageResult;
            this.setPageInfo({
              current: number + 1,
              pageSize: pageResult.size,
              total: totalElements,
            }, key);
            this.setMerge(content, key);
            if (key === 'opened') {
              const assignee = pageResult
                ? _.filter(content, a => a.assignee && a.assignee.id === userId) : [];
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
      .then(datas => handleProptError(datas));
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
}

const mergeRequestStore = new MergeRequestStore();
export default mergeRequestStore;
