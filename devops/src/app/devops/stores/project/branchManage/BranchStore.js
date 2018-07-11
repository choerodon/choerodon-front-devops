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
  @observable issueDto = null;
  @observable issueTime = [];
  @observable issueLoading = false;
  @observable issueInitValue = null;

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

  @action setIssueDto(data) {
    this.issueDto = data;
  }

  @action setIssueTime(time) {
    this.issueTime = time;
  }
  @action setIssueLoading(flag) {
    this.issueLoading = flag;
  }
  @action setIssueInitValue(value) {
    this.issueInitValue = value;
  }

  loadApps = (proId = AppState.currentMenuType.id) => {
    return axios.get(`/devops/v1/projects/${proId}/apps`)
      .then((data) => {
        const res = this.handleProptError(data);
        this.setApps(data);
        this.setApp(data[0].id);
        this.loadBranchData(proId, data[0].id);
        return res;
      });
  };

  loadIssue = (proId = AppState.currentMenuType.id, search = '', issueId = '', issueNum = '') => {
    this.setIssueLoading(true);
    return axios.get(`/agile/v1/projects/${proId}/issues/summary?issueId=${issueId}&self=true&issueNum=${issueNum}&content=${search}`)
      .then((data) => {
        this.setIssueLoading(false);
        const res = this.handleProptError(data);
        this.setIssue(data.content);
        return res;
      });
  };


  loadIssueById =(proId, id) => {
    this.setIssueDto(null);
    this.changeLoading(true);
    return axios.get(`/agile/v1/projects/${proId}/issues/${id}`)
      .then((datas) => {
        this.changeLoading(false);
        const res = this.handleProptError(datas);
        if (res) {
          this.setIssueDto(datas);
        }
      });
  };


  loadIssueTimeById =(proId, id) => axios.get(`/agile/v1/projects/${proId}/work_log/issue/${id}`)
    .then((datas) => {
      const res = this.handleProptError(datas);
      if (res) {
        this.setIssueTime(datas);
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
    axios.get(`/devops/v1/projects/${projectId}/apps/${appId}/git/tag_list`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setTagData(data);
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
      this.setIssueInitValue(null);
      this.setIssueDto(null);
      const res = this.handleProptError(branch);
      if (!branch.issueId) {
        const types = ['feature', 'release', 'bugfix', 'master', 'hotfix'];
        axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}`)
          .then((data) => {
            const type = branch.branchName.split('-')[0];
            let issueName = '';
            if (types.includes(type)) {
              issueName = branch.branchName.split(`${type}-`)[1];
            } else {
              issueName = branch.branchName;
            }
            if (issueName.indexOf(data.code) === 0) {
              const issueNum = `${parseInt(branch.branchName.split(`${data.code}-`)[1].split('-')[0], 10)}`;
              this.setIssueInitValue(`${data.code}-${issueNum}`);
              this.loadIssue(AppState.currentMenuType.id, '', '', issueNum);
            }
          });
      } else {
        this.loadIssue(AppState.currentMenuType.id, '', branch.issueId, '');
      }
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
