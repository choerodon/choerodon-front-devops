import { observable, action, computed } from "mobx";
import { axios, store, stores } from "choerodon-front-boot";
import { handleProptError } from "../../../utils/index";

const { AppState } = stores;

const HEIGHT =
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;
@store("SecretStore")
class SecretStore {
  @observable data = [];

  @observable secretData = false;

  @observable loading = false;

  @observable preProId = AppState.currentMenuType.id;

  @observable pageInfo = {
    current: 1,
    total: 0,
    pageSize: HEIGHT <= 900 ? 10 : 15,
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

  @action setPreProId(id) {
    this.preProId = id;
  }

  @computed get getData() {
    return this.data.slice();
  }

  @action setData(data) {
    this.data = data;
  }

  @computed get getSecretData() {
    return this.secretData.slice();
  }

  @action setSecretData(data) {
    this.secretData = data;
  }

  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setInfo(Info) {
    this.Info = Info;
  }

  @computed get getInfo() {
    return this.Info;
  }

  @action
  setSideType(data) {
    this.sideType = data;
  }

  @computed
  get getSideType() {
    return this.sideType;
  }

  loadSecret = (
    spin,
    projectId,
    envId,
    page = this.pageInfo.current - 1,
    size = this.pageInfo.pageSize,
    sort = { field: "id", order: "desc" },
    postData = {
      searchParam: {},
      param: "",
    }
  ) => {
    if (Number(this.preProId) !== Number(projectId)) {
      this.setData([]);
    }
    this.setPreProId(projectId);
    spin && this.changeLoading(true);
    return axios
      .post(`/devops/v1/projects/${projectId}/secret/${envId}/list_by_option?page=${page}&size=${size}&sort=${sort.field || 'id'},${sort.order}`, JSON.stringify(postData))
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setData(res.content);
          const { number, size, totalElements } = data;
          const page = { number, size, totalElements };
          this.setPageInfo(page);
          spin && this.changeLoading(false);
        }
      });
  };

  loadKVById(projectId, id) {
    return axios
      .get(`/devops/v1/projects/${projectId}/secret/${id}`)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setSecretData(data);
        }
        return data;
      });
  }

  postKV(projectId, data) {
    return axios.put(`/devops/v1/projects/${projectId}/secret`, JSON.stringify(data));
  }


  deleteSecret(projectId, id, envId) {
    return axios.delete(`/devops/v1/projects/${projectId}/secret/${envId}/${id}`);
  }

  checkName(projectId, envId, name){
    return axios.get(`/devops/v1/projects/${projectId}/secret/${envId}/check_name?secret_name=${name}`);
  }
}

const secretStore = new SecretStore();
export default secretStore;
