import { observable, action, computed } from 'mobx';
import axios from 'Axios';
import store from 'Store';

@store('AppStore')
class AppStore {
  @observable serviceData = [];
  @observable branchData = [];
  @observable tagData = [];
  @observable pipeData = [];
  @observable tagTotalSize = [];
  @observable tagTotalPage = [];
  @observable serviceVersion = [];
  @observable totalSize;
  @observable totalPage;
  @observable releVersionData = [];
  @observable releVersionTotalSize;
  @observable pipeTotalSize;
  @observable releVersionTotalPage;
  @observable pipeTotalPage;
  @observable VersionTotalSize;
  @observable VersionTotalPage;
  @observable isLoading = true;
  @observable versionLoading = false;

  constructor(totalPage = 1, totalSize = 0) {
    this.totalPage = totalPage;
    this.totalSize = totalSize;
  }

  @action setTotalSize(totalSize) {
    this.totalSize = totalSize;
  }

  @computed get getTotalSize() {
    return this.totalSize;
  }

  @action setTotalPage(totalPage) {
    this.totalPage = totalPage;
  }

  @computed get getTotalPage() {
    return this.totalPage;
  }

  @computed get getTagTotalPage() {
    return this.tagTotalPage;
  }

  @computed get getPipeTotalPage() {
    return this.pipeTotalPage;
  }

  @action setServiceData(data) {
    this.serviceData = data;
  }

  @action setReleVersionTotalSize(totalSize) {
    this.releVersionTotalSize = totalSize;
  }

  @action setPipeTotalSize(totalSize) {
    this.pipeTotalSize = totalSize;
  }

  @action setTagTotalSize(totalSize) {
    this.tagTotalSize = totalSize;
  }

  @computed get getReleVersionTotalSize() {
    return this.releVersionTotalSize;
  }

  @computed get getPipeTotalSize() {
    return this.pipeTotalSize;
  }

  @computed get getTagTotalSize() {
    return this.tagTotalSize;
  }

  @action setVersionTotalSize(totalSize) {
    this.VersionTotalSize = totalSize;
  }

  @computed get getVersionTotalSize() {
    return this.VersionTotalSize;
  }

  @action setReleVersionTotalPage(totalPage) {
    this.releVersionTotalPage = totalPage;
  }

  @action setTagTotalPage(totalPage) {
    this.tagTotalPage = totalPage;
  }

  @action setPipeTotalPage(totalPage) {
    this.pipeTotalPage = totalPage;
  }

  @computed get getReleVersionTotalPage() {
    return this.releVersionTotalPage;
  }

  @action setVersionTotalPage(totalPage) {
    this.VersionTotalPage = totalPage;
  }

  @computed get getVersionTotalPage() {
    return this.VersionTotalPage;
  }

  @action setReleVersionData(data) {
    this.releVersionData = data;
  }

  @action setPipeData(data) {
    this.pipeData = data;
  }

  @action setServiceVersion(data) {
    this.serviceVersion = data;
  }

  @computed get getServiceVersion() {
    return this.serviceVersion.slice();
  }

  @computed get getReleVersionData() {
    return this.releVersionData.slice();
  }

  @computed get getServiceData() {
    return this.serviceData.slice();
  }

  @computed get getPipeData() {
    return this.pipeData;
  }

  @computed get getBranchData() {
    return this.branchData.slice();
  }

  @action setBranchData(data) {
    this.branchData = data;
  }

  @computed get getTagData() {
    return this.tagData.slice();
  }

  @action setTagData(data) {
    this.tagData = data;
  }

  @action changeLoading(flag) {
    this.isLoading = flag;
  }

  @action changeVersionLoading(flag) {
    this.versionLoading = flag;
  }

  @computed get getIsLoading() {
    return this.isLoading;
  }

  loadService = (proId, orgId, page, size) => {
    this.changeLoading(true);
    return axios.get(`/devops/v1/project/${proId}/service/page?organizationId=${orgId}&page=${page}&size=${size}`).then((data) => {
      if (data) {
        this.setServiceData(data.content);
        this.setTotalPage(data.totalPages);
        this.setTotalSize(data.totalElements);
      }
      this.changeLoading(false);
    });
  };

  queryService = (proId, orgId, page, size, state) => {
    this.changeLoading(true);
    if (!state) {
      return axios.get(`/devops/v1/project/${proId}/service/page?organizationId=${orgId}&page=${page}&size=${size}`)
        .then((data) => {
          this.setServiceData(data.content);
          this.setTotalPage(data.totalPages);
          this.setTotalSize(data.totalElements);
          this.changeLoading(false);
        });
    } else if (state.code === '') {
      return axios.get(`/devops/v1/project/${proId}/service/page?organizationId=${orgId}&page=${page}&size=${size}&param=${state.input}`)
        .then((data) => {
          this.setServiceData(data.content);
          this.setTotalPage(data.totalPages);
          this.setTotalSize(data.totalElements);
          this.changeLoading(false);
        });
    } else {
      return axios.get(`/devops/v1/project/${proId}/service/page?organizationId=${orgId}&${state.code}=${state.input}&page=${page}&size=${size}`).then((data) => {
        this.setServiceData(data.content);
        this.setTotalPage(data.totalPages);
        this.setTotalSize(data.totalElements);
        this.changeLoading(false);
      });
    }
  };

  queryReleaseService = (proId, page, size, state) => {
    this.changeLoading(true);
    this.changeVersionLoading(true);
    if (!state) {
      return axios.get(`/devops/v1/project/${proId}/serviceversions?page=${page}&size=${size}`)
        .then((data) => {
          this.setReleVersionData(data.content);
          this.setReleVersionTotalPage(data.totalPages);
          this.setReleVersionTotalSize(data.totalElements);
          this.changeLoading(false);
          this.changeVersionLoading(false);
        });
    } else if (state.code === '') {
      return axios.get(`/devops/v1/project/${proId}/serviceversions?page=${page}&size=${size}&param=${state.input}`)
        .then((data) => {
          this.setReleVersionData(data.content);
          this.setReleVersionTotalPage(data.totalPages);
          this.setReleVersionTotalSize(data.totalElements);
          this.changeLoading(false);
          this.changeVersionLoading(false);
        });
    } else {
      return axios.get(`/devops/v1/project/${proId}/serviceversions?page=${page}&size=${size}&${state.code}=${state.input}`).then((data) => {
        this.setReleVersionData(data.content);
        this.setReleVersionTotalPage(data.totalPages);
        this.setReleVersionTotalSize(data.totalElements);
        this.changeLoading(false);
        this.changeVersionLoading(false);
      });
    }
  };

  loadServiceVersion = (proId, serId, page, size) => {
    this.changeLoading(true);
    return axios.get(`/devops/v1/project/${proId}/service/${serId}
  /version/page?page=${page}&size=${size}`).then((data) => {
      if (data) {
        this.setServiceVersion(data.content);
        this.setTotalPage(data.totalPages);
        this.setTotalSize(data.totalElements);
      }
      this.changeLoading(false);
    });
  };
  createService = (proId, orgId, serviceData) =>
    axios.post(`devops/v1/project/${proId}/service?organizationId=${orgId}`, JSON.stringify(serviceData), { timeout: 60000 });

  updateService = (proId, id, serviceData) =>
    axios.put(`/devops/v1/project/${proId}/service/${id}`, JSON.stringify(serviceData));

  getServiceById = (proId, orgId, id) =>
    axios.get(`/devops/v1/project/${proId}/service/${id}?organizationId=${orgId}`);

  deleteServiceById = (proId, id) =>
    axios.delete(`/devops/v1/project/${proId}/service/${id}`);

  loadServiceType() {
    return axios.get('/devops/v1/service/type');
  }

  loadServiceCode(proId, groupName, code) {
    return axios.get(`/devops/v1/project/${proId}/service/code?groupName=${groupName}&code=${code}`);
  }

  loadServiceName(proId, name) {
    return axios.get(`/devops/v1/project/${proId}/service/name?name=${name}`);
  }

  loadEnvironment(orgId, proId, svId) {
    return axios.get(`/devops/v1/organization/${orgId}/project/${proId}/environment/serviceVersion/${svId}`);
  }

  loadEnvironmentAuto(orgId, proId) {
    return axios.get(`/devops/v1/organization/${orgId}/project/${proId}/environment/autoRelease`);
  }

  releaseVersion(proId, sevId, svId, envId) {
    return axios.post(`/devops/v1/project/${proId}/service/${sevId}/release?serviceVersionId=${svId}&environmentId=${envId}`);
  }

  startFeature(projectId, sevId, name) {
    const names = encodeURIComponent(`${name}`);
    return axios.post(`/devops/v1/project/${projectId}/service/${sevId}/gitFlow/feature/start?name=${names}`);
  }

  startHotfix(projectId, sevId, name) {
    const names = encodeURIComponent(`${name}`);
    return axios.post(`/devops/v1/project/${projectId}/service/${sevId}/gitFlow/hotfix/start?name=${names}`);
  }

  getRelease(projectId, sevId) {
    return axios.get(`/devops/v1/project/${projectId}/service/${sevId}/gitFlow/release/tag`);
  }

  getHotfix(projectId, sevId) {
    return axios.get(`/devops/v1/project/${projectId}/service/${sevId}/gitFlow/hotfix/tag`);
  }

  startRelease(projectId, sevId, name) {
    const names = encodeURIComponent(`${name}`);
    return axios.post(`/devops/v1/project/${projectId}/service/${sevId}/gitFlow/release/start?name=${names}`);
  }

  loadSonar(proId, serId) {
    return axios.get(`/devops/v1/project/${proId}/service/${serId}/sonar`);
  }

  loadReleaseVersion(proId, page) {
    this.changeVersionLoading(true);
    return axios.get(`/devops/v1/project/${proId}/serviceversion?page=${page}&size=10`).then((data) => {
      if (data) {
        this.changeVersionLoading(false);
        this.setReleVersionData(data.content);
        this.setReleVersionTotalPage(data.totalPages);
        this.setReleVersionTotalSize(data.totalElements);
      }
      this.changeLoading(false);
    });
  }

  loadReleVersionById(orgId, proId, versionId) {
    return axios.get(`/devops/v1/project/${proId}/serviceversion/${versionId}?organizationId=${orgId}`);
  }

  queryVersions = (state, id) => {
    if (state.code === '') {
      this.changeVersionLoading(true);
      axios.post(`/devops/v1/project/${id}/serviceversions?page=0&size=10&param=${state.input}`).then((data) => {
        this.setReleVersionData(data.content);
        this.setReleVersionTotalPage(data.totalPages);
        this.setReleVersionTotalSize(data.totalElements);
        this.changeVersionLoading(false);
      });
    } else {
      this.changeVersionLoading(true);
      const para = state.code;
      const value = state.input;
      const datas = {};
      datas[para] = value;
      axios.post(`/devops/v1/project/${id}/serviceversions?page=0&size=10`, JSON.stringify(datas)).then((data) => {
        this.setReleVersionData(data.content);
        this.setReleVersionTotalPage(data.totalPages);
        this.setReleVersionTotalSize(data.totalElements);
        this.changeVersionLoading(false);
      });
    }
  }

  deleteBranch(projectId, proId, name) {
    return axios.delete(`/devops/v1/project/${projectId}/gitflow/gitlab/${proId}/branches?branchName=${name}`);
  }

  autoRealse = (projectId, serviceId, checked) =>
    axios.post(`/devops/v1/project/${projectId}/service/autoRelease?autoRelease=${checked}&serviceId=${serviceId}`);

  autoRealseEnv = (projectId, serviceId, env) =>
    axios.post(`/devops/v1/project/${projectId}/service/serviceAutoRelease?serviceId=${serviceId}`, JSON.stringify(env));

  activeServices = (projectId, serviceId, active) =>
    axios.post(`/devops/v1/project/${projectId}/service/${serviceId}/active?active=${active}`);

  // testPermission = arr =>
  //   axios.post('/v1/testPermission', JSON.stringify(arr));

  loadPipeline(projectId, serviceId, page, size) {
    this.changeLoading(true);
    return axios.get(`/devops/v1/project/${projectId}/service/pipelines/${serviceId}?page=${page}&size=${size}`).then((data) => {
      if (data) {
        this.setPipeData(data.pipelines);
        this.setPipeTotalPage(data.totalPages);
        this.setPipeTotalSize(data.totalElements);
      }
      this.changeLoading(false);
    });
  }
}
const appStore = new AppStore();
export default appStore;
