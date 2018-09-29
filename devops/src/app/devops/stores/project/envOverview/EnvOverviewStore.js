import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
@store('EnvOverviewStore')
class EnvOverviewStore {
  @observable isLoading = false;

  @observable val = '';

  @observable envcard = [];

  @observable ist = null;

  @observable log = null;

  @observable domin = null;

  @observable sync = null;

  @observable network = null;

  @observable tpEnvId = null;

  @observable pageInfo = {
    current: 1, total: 0, pageSize: HEIGHT <= 900 ? 10 : 15,
  };

  @observable Info = {
    filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [],
  };

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action setEnvcard(envcard) {
    this.envcard = envcard;
  }

  @action setIst(ist) {
    this.ist = ist;
  }

  @action setLog(log) {
    this.log = log;
  }

  @action setSync(sync) {
    this.sync = sync;
  }

  @action setDomin(domin) {
    this.domin = domin;
  }

  @action setNetwork(network) {
    this.network = network;
  }

  @computed get getEnvcard() {
    return this.envcard;
  }

  @action setVal(val) {
    this.val = val;
  }

  @action setTpEnvId(tpEnvId) {
    this.tpEnvId = tpEnvId;
  }

  @action setInfo(Info) {
    this.Info = Info;
  }

  @computed get getTpEnvId() {
    return this.tpEnvId;
  }

  @computed get getVal() {
    return this.val;
  }

  @computed get getIst() {
    return this.ist;
  }

  @computed get getSync() {
    return this.sync;
  }

  @computed get getLog() {
    return this.log;
  }

  @computed get getDomain() {
    return this.domin;
  }

  @computed get getNetwork() {
    return this.network;
  }

  @computed get getInfo() {
    return this.Info;
  }

  @action
  changeLoading(flag) {
    this.isLoading = flag;
  }

  @computed
  get getIsLoading() {
    return this.isLoading;
  }

  loadActiveEnv = projectId => axios.get(`devops/v1/projects/${projectId}/envs?active=true`)
    .then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setEnvcard(data);
      }
      return data;
    });

  loadIstOverview = (projectId, envId, datas = {
    searchParam: {},
    param: '',
  }) => {
    this.changeLoading(true);
    this.setIst(null);
    axios.post(`/devops/v1/projects/${projectId}/app_instances/${envId}/listByEnv`, JSON.stringify(datas))
      .then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setIst(data);
        }
        this.changeLoading(false);        
      });
  };

  loadDomain = (proId, envId, page = this.pageInfo.current - 1, pageSize = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    this.changeLoading(true);
    return axios.post(`/devops/v1/projects/${proId}/ingress/${envId}/listByEnv?page=${page}&size=${pageSize}&sort=${sort.field || 'id'},${sort.order}`, JSON.stringify(datas))
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          const { number, size, totalElements } = data;
          this.setPageInfo({ number, size, totalElements });
          this.setDomin(data.content);
        }
        this.changeLoading(false);
      });
  };

  loadNetwork = (proId, envId, page = this.pageInfo.current - 1, pageSize = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    this.changeLoading(true);
    return axios.post(`/devops/v1/projects/${proId}/service/${envId}/listByEnv?page=${page}&size=${pageSize}&sort=${sort.field || 'id'},${sort.order}`, JSON.stringify(datas))
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          const { number, size, totalElements } = data;
          this.setPageInfo({ number, size, totalElements });
          this.setNetwork(data.content);
        }
        this.changeLoading(false);
      });
  };

  loadLog = (proId, envId, page = this.pageInfo.current - 1, pageSize = this.pageInfo.pageSize) => {
    this.changeLoading(true);
    return axios.get(`/devops/v1/projects/${proId}/envs/${envId}/error_file/list_by_page?page=${page}&size=${pageSize}`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          const { number, size, totalElements } = data;
          this.setPageInfo({ number, size, totalElements });
          this.setLog(data.content);
        }
        this.changeLoading(false);
      });
  };

  loadSync = (proId, envId) => axios.get(`/devops/v1/projects/${proId}/envs/${envId}/status`)
    .then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
        this.setSync(null);
      } else {
        this.setSync(data);
      }
    }).catch((error) => {
      this.setSync(null);
      Choerodon.prompt(error);
    });

  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      this.changeLoading(false);
      return false;
    } else {
      this.changeLoading(false);
      return error;
    }
  }
}

const envOverviewStore = new EnvOverviewStore();
export default envOverviewStore;
