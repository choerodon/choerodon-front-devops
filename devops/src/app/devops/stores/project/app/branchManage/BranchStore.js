import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';

@store('BranchStore')
class BranchStore {
  @observable branchData = [];
  @observable tagData = [];
  @observable branchs = [];
  @observable tags = [];
  @observable currentBranch = {};
  @observable loading = true;
  @observable initVersion = null;
  @observable releaseLatestVersion = null;

  @observable createBranchShow = false;
  @observable confirmShow = false;
  @observable pageInfo = {
    current: 0,
    total: 1,
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

  @action changeInitVersion(data) {
    this.releaseLatestVersion = data;
  }

  loadBranchData = (projectId, appId) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/branches`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setBranchData(data);
        }
      });

  loadTagData = (projectId, appId, page = this.pageInfo.current, sizes = this.pageInfo.pageSize) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/tags?page=${page}&size=${sizes}`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setTagData(data.tagList);
          const { totalElements } = data;
          const number = page;
          const size = sizes;
          const pages = { number, size, totalElements };
          this.setPageInfo(pages);
        }
      });
  loadAllData = (projectId, appId, page) => {
    this.changeLoading(true);
    return axios.all([
      axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/branches`),
      axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/tags?page=${page}&size=10`)])
      .then(axios.spread((branch, tag) => {
        if (!branch.failed && !tag.failed) {
          this.setBranchData(branch);
          this.setTagData(tag.tagList);
          const { number, size, totalElements } = tag;
          const pages = { number, size, totalElements };
          this.setPageInfo(pages);
        }
        this.changeLoading(false);
      }));
  }

  getLatestHotfixVersion =(projectId, appId) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/tags/hotfix`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.changeInitVersion(data);
        }
        return res;
      });
  getLatestReleaseVersion =(projectId, appId) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/tags/release`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.changeInitVersion(data);
        }
      });
  createBranch =(projectId, appId, name) =>
    axios.post(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/start?name=${name}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });
  finishFeature =(projectId, appId, name) =>
    axios.post(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/finish_feature?branch=${name}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });
  finishBranch =(projectId, appId, name) =>
    axios.post(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/finish?branch=${name}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });
  getBranchMergeStaus =(projectId, appId, name) =>
    axios.post(`/devops/v1/projects/${projectId}/apps/${appId}/git_flow/update_merge_request_status?branch=${name}`)
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

const branchStore = new BranchStore();
export default branchStore;
