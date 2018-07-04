import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('BranchStore')
class BranchStore {
  @observable apps = [];
  @observable app = null;
  @observable branchData = [];
  @observable tagData = [];
  @observable branchs = [];
  @observable tags = [];
  @observable currentBranch = {};
  @observable loading = true;
  @observable issue = [];
  @observable branch = null;

  @observable createBranchShow = false;
  @observable confirmShow = false;
  @observable pageInfo = {
    current: 1,
    total: 0,
    pageSize: 10,
  };
  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action
  setCurrentBranch(data) {
    this.currentBranch = data;
  }

  @action
  setCreateBranchShow(data) {
    this.createBranchShow = data;
  }

  @action
  setConfirmShow(data) {
    this.confirmShow = data;
  }

  @action
  setBranchData(data) {
    this.branchData = data;
  }

  @computed get
  getBranchData() {
    return this.branchData.slice();
  }

  @action
  setTagData(data) {
    this.tagData = data;
  }

  @computed get
  getTagData() {
    return this.tagData.slice();
  }

  @action changeLoading(flag) {
    this.loading = flag;
  }


  @action setApps(data) {
    this.apps = data;
  }

  @action setApp(data) {
    this.app = data;
  }

  @action setIssue(data) {
    this.issue = data;
  }

  @action setBranch(data) {
    this.branch = data;
  }


  loadApps = (proId = AppState.currentMenuType.id) => {
    this.changeLoading(true);
    return axios.get(`/devops/v1/projects/${proId}/apps`)
      .then((data) => {
        this.changeLoading(false);
        const res = this.handleProptError(data);
        this.setApps(data.reverse());
        this.setApp(data[0].id);
        this.loadBranchData(proId, data[0].id);
        return res;
      });
  };

  loadIssue = (proId = AppState.currentMenuType.id, issueId = -1) => axios.get(`/agile/v1/projects/${proId}/issues/${issueId}/summary`)
    .then((data) => {
      const res = this.handleProptError(data);
      this.setIssue(data.content);
      return res;
    });

  loadIssueById =(proId, id) => axios.get(`/agile/v1/projects/147/issues/sub_issue/677`)
    .then((datas) => {
      const res = this.handleProptError(datas);
      if (res) {
        this.setIssue(datas);
      }
    });

  loadBranchData = (projectId, appId) => {
    this.changeLoading(true);
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/branches`)
      .then((data) => {
        this.changeLoading(false);
        const res = this.handleProptError(data);
        if (res) {
          this.setBranchData(data);
        }
      });
  }

  loadTagData = (projectId, appId, page = this.pageInfo.current - 1,
    sizes = this.pageInfo.pageSize) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/flow/tags?page=${page}&size=${sizes}`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          const { totalElements } = data;
          const number = page;
          const size = sizes;
          const pages = { number, size, totalElements };
          this.setPageInfo(pages);
          this.setTagData(data.tagList);
        }
      });
  loadAllData = (projectId, appId, page = this.pageInfo.current - 1,
    sizes = this.pageInfo.pageSize) => {
    this.changeLoading(true);
    return axios.all([
      axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/flow/branches`),
      axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/flow/tags?page=${page}&size=${sizes}`)])
      .then(axios.spread((branch, tag) => {
        if (!branch.failed && !tag.failed) {
          this.setBranchData(branch);
          this.setTagData(tag.tagList);
          const { totalElements } = tag;
          const number = page;
          const size = sizes;
          const pages = { number, size, totalElements };
          this.setPageInfo(pages);
        }
        this.changeLoading(false);
      }));
  };

  loadBranchByName = (projectId, appId, name) => axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/branch?branchName=${name}`)
    .then((branch) => {
      const res = this.handleProptError(branch);
      this.setBranch(branch);
      return res;
    });

  updateBranchByName = (projectId, appId, postData) => axios.put(`/devops/v1/projects/${projectId}/apps/${appId}/git/branch`, postData)
    .then((datas) => {
      const res = this.handleProptError(datas);
      return res;
    });

  createBranch =(projectId, appId, postData) =>
    axios.post(`/devops/v1/projects/${projectId}/apps/${appId}/git/branch`, postData)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });
  deleteData = (proId = AppState.currentMenuType.id, appId, name) => {
    return axios.delete(`/devops/v1/projects/${proId}/apps/${appId}/git/branch?branchName=${name}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });
  };
  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}

const branchStore = new BranchStore();
export default branchStore;
