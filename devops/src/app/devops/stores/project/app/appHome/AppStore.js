import { observable, action, computed } from "mobx";
import { axios, store, stores } from "choerodon-front-boot";

const { AppState } = stores;
const HEIGHT =
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

@store("AppStore")
class AppStore {
  @observable allData = [];

  @observable isRefresh = false;

  // 页面的loading
  @observable loading = false;

  @observable tableLoading = false;

  // 打开tab的loading
  @observable singleData = null;

  @observable selectData = [];

  @observable mbr = [];

  @observable tagKeys = [];

  @observable pageInfo = {
    current: 1,
    total: 0,
    pageSize: HEIGHT <= 900 ? 10 : 15,
  };

  @observable mbrPageInfo = {
    current: 1,
    total: 0,
    pageSize: HEIGHT <= 900 ? 10 : 15,
  };

  @observable Info = {
    filters: {},
    sort: { columnKey: "id", order: "descend" },
    paras: [],
  };

  @observable mbrInfo = {
    filters: {},
    sort: { columnKey: "id", order: "descend" },
    paras: [],
  };

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action setMbrPageInfo(page) {
    this.mbrPageInfo.current = page.number + 1;
    this.mbrPageInfo.total = page.totalElements;
    this.mbrPageInfo.pageSize = page.size;
  }

  @computed get getMbrPageInfo() {
    return this.mbrPageInfo;
  }

  @computed get getAllData() {
    return this.allData.slice();
  }

  @action setAllData(data) {
    this.allData = data;
  }

  @computed get getSelectData() {
    return this.singleData.slice();
  }

  @action setSelectData(data) {
    this.selectData = data.slice();
  }

  @action changeIsRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsRefresh() {
    return this.isRefresh;
  }

  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setTableLoading(flag) {
    this.tableLoading = flag;
  }

  @computed get getTableLoading() {
    return this.tableLoading;
  }

  @action setSingleData(data) {
    this.singleData = data;
  }

  @computed get getSingleData() {
    return this.singleData;
  }

  @action setInfo(Info) {
    this.Info = Info;
  }

  @computed get getInfo() {
    return this.Info;
  }

  @action setMbrInfo(Info) {
    this.mbrInfo = Info;
  }

  @computed get getMbrInfo() {
    return this.mbrInfo;
  }

  @action setMbr(mbr) {
    this.mbr = mbr;
  }

  @computed get getMbr() {
    return this.mbr.slice();
  }

  @action setTagKeys(tagKeys) {
    this.tagKeys = tagKeys;
  }

  @computed get getTagKeys() {
    return this.tagKeys.slice();
  }

  loadData = (
    loading,
    isRefresh = false,
    projectId,
    envId,
    page = this.pageInfo.current - 1,
    size = this.pageInfo.pageSize,
    sort = { field: "", order: "desc" },
    postData = { searchParam: {}, param: "" }
  ) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    let url =
      sort.field !== "" ? `${url}&sort=${sort.field},${sort.order}` : "";
    loading && this.changeLoading(true);
    return axios
      .post(
        `/devops/v1/projects/${projectId}/apps/list_by_options?page=${page}&size=${size}${url}`,
        JSON.stringify(postData)
      )
      .then(data => {
        const res = this.handleProptError(data);
        if (res) {
          this.handleData(data);
        }
        loading && this.changeLoading(false);
        this.changeIsRefresh(false);
      });
  };

  handleData = data => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };

  loadSelectData = projectId =>
    axios.get(`/devops/v1/projects/${projectId}/apps/template`).then(data => {
      const res = this.handleProptError(data);
      if (res) {
        this.setSelectData(res);
      }
    });

  loadDataById = (projectId, id) =>
    axios
      .get(`/devops/v1/projects/${projectId}/apps/${id}/detail`)
      .then(data => {
        const res = this.handleProptError(data);
        if (res) {
          this.setSingleData(data);
        }
        return res;
      });

  checkCode = (projectId, code) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/check_code?code=${code}`);

  checkName = (projectId, name) =>
    axios.get(`/devops/v1/projects/${projectId}/apps/check_name?name=${name}`);

  updateData = (projectId, data) =>
    axios
      .put(`/devops/v1/projects/${projectId}/apps`, JSON.stringify(data))
      .then(datas => {
        const res = this.handleProptError(datas);
        return res;
      });

  addData = (projectId, data) =>
    axios
      .post(`/devops/v1/projects/${projectId}/apps`, JSON.stringify(data))
      .then(datas => {
        const res = this.handleProptError(datas);
        return res;
      });

  changeAppStatus = (projectId, id, status) =>
    axios
      .put(`/devops/v1/projects/${projectId}/apps/${id}?active=${status}`)
      .then(datas => {
        const res = this.handleProptError(datas);
        return res;
      });

  deleteApps = (projectId, id) =>
    axios.delete(`/devops/v1/projects/${projectId}/apps/${id}`).then(datas => {
      const res = this.handleProptError(datas);
      return res;
    });

  /**
   * 分页查询项目下用户权限
   * @param projectId
   * @param page
   * @param size
   * @param sort
   * @param postData
   */
  loadPrm = (
    projectId,
    page = 0,
    size = 10,
    sort = { field: "", order: "desc" },
    postData = { searchParam: {}, param: "" }
  ) => {
    this.setTableLoading(true);
    return axios
      .post(
        `/devops/v1/projects/${projectId}/envs/list?page=${page}&size=${size}`,
        JSON.stringify(postData)
      )
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setMbr(data.content);
          const { number, size, totalElements } = data;
          const page = { number, size, totalElements };
          this.setMbrPageInfo(page);
        }
        this.setTableLoading(false);
      });
  };

  loadTagKeys = (projectId, id) =>
    axios
      .get(`/devops/v1/projects/${projectId}/apps/${id}/list_all`)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setTagKeys(data);
        }
      });

  handleProptError = error => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      this.changeLoading(false);
      this.changeIsRefresh(false);
      return false;
    } else {
      return error;
    }
  };
}

const appStore = new AppStore();
export default appStore;
