import { observable, action, computed } from "mobx";
import { axios, store } from "choerodon-front-boot";
import _ from "lodash";
import { handleProptError } from "../../../utils/index";

const HEIGHT =
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;
@store("ClusterStore")
class ClusterStore {
  @observable clusterData = [];

  @observable loading = false;

  @observable tLoading = false;

  @observable proData = [];

  @observable shell = '';

  @observable clsData = null;

  @observable tagKeys = [];

  @observable pageInfo = {
    current: 1,
    total: 0,
    pageSize: HEIGHT <= 900 ? 10 : 15,
  };

  @observable clsPageInfo = {
    current: 1,
    total: 0,
    pageSize: HEIGHT <= 900 ? 12 : 18,
  };

  @observable Info = {
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

  @action setClsPageInfo(page) {
    this.clsPageInfo.current = page.number + 1;
    this.clsPageInfo.total = page.totalElements;
    this.clsPageInfo.pageSize = page.size;
  }

  @computed get getClsPageInfo() {
    return this.clsPageInfo;
  }

  @computed get getData() {
    return this.clusterData.slice();
  }

  @action setData(data) {
    this.clusterData = data;
  }

  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action tableLoading(flag) {
    this.tLoading = flag;
  }

  @computed get getTableLoading() {
    return this.tLoading;
  }

  @action setProData(data) {
    this.proData = data;
  }

  @computed get getProData() {
    return this.proData.slice();
  }

  @computed get getClsData() {
    return this.clsData;
  }

  @action setClsData(data) {
    this.clsData = data;
  }

  @action setInfo(Info) {
    this.Info = Info;
  }

  @computed get getInfo() {
    return this.Info;
  }

  @action
  setShell(shell) {
    this.shell = shell;
  }

  @computed
  get getShell() {
    return this.shell;
  }

  @action
  setSideType(data) {
    this.sideType = data;
  }

  @computed
  get getSideType() {
    return this.sideType;
  }

  @action setTagKeys(tagKeys) {
    this.tagKeys = tagKeys;
  }

  @computed get getTagKeys() {
    return this.tagKeys.slice();
  }

  loadCluster = (
    orgId,
    page = this.clsPageInfo.current - 1,
    size = this.clsPageInfo.pageSize,
    sort = { field: "id", order: "desc" },
    postData = {
      searchParam: {},
      param: "",
    }
  ) => {
    this.changeLoading(true);
    return axios
      .post(
        `/devops/v1/organizations/${orgId}/clusters/page_cluster?page=${page}&size=${size}&sort=${sort.field ||
          "id"},${sort.order}`,
        JSON.stringify(postData)
      )
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setData(res.content);
          const { number, size, totalElements } = data;
          const page = { number, size, totalElements };
          this.setClsPageInfo(page);
          this.changeLoading(false);
        }
      });
  };

  loadPro = (
    orgId,
    clusterId,
    page = this.pageInfo.current - 1,
    size = this.pageInfo.pageSize,
    sort = { field: "id", order: "desc" },
    postData = []
  ) => {
    this.tableLoading(true);
    const url = clusterId
      ? `/devops/v1/organizations/${orgId}/clusters/page_projects?clusterId=${clusterId}&page=${page}&size=${size}&sort=${sort.field ||
          "id"},${sort.order}`
      : `/devops/v1/organizations/${orgId}/clusters/page_projects?page=${page}&size=${size}&sort=${sort.field ||
          "id"},${sort.order}`;
    return axios.post(url, JSON.stringify(postData)).then(data => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setProData(data.content);
        const { number, size, totalElements } = data;
        const page = { number, size, totalElements };
        this.setPageInfo(page);
      }
      this.tableLoading(false);
    });
  };

  loadClsById(orgId, id) {
    return axios
      .get(`/devops/v1/organizations/${orgId}/clusters/${id}`)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setClsData(data);
        }
        return data;
      });
  }

  loadTagKeys = (orgId, id) =>
    axios
      .get(
        `/devops/v1/organizations/${orgId}/clusters/list_cluster_projects/${id}`
      )
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setTagKeys(data);
        }
      });

  createCluster(orgId, data) {
    return axios.post(
      `/devops/v1/organizations/${orgId}/clusters`,
      JSON.stringify(data)
    );
  }

  updateCluster(orgId, id, data) {
    return axios.put(
      `/devops/v1/organizations/${orgId}/clusters?clusterId=${id}`,
      JSON.stringify(data)
    );
  }

  delCluster(orgId, id) {
    return axios.delete(`/devops/v1/organizations/${orgId}/clusters/${id}`);
  }

  loadShell = (orgId, id) =>
    axios
      .get(`/devops/v1/organizations/${orgId}/clusters/query_shell/${id}`)
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setShell(res);
        }
      });

  checkCode(orgId, code) {
   return axios.get(`/devops/v1/organizations/${orgId}/clusters/check_code?code=${code}`);
  }

  checkName(orgId, name){
    return axios.get(`/devops/v1/organizations/${orgId}/clusters/check_name?name=${name}`);
  }
}

const clusterStore = new ClusterStore();
export default clusterStore;
