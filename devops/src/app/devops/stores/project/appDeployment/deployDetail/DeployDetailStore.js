import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('DeployDetailStore')
class DeployDetailStore {
  @observable isLoading = true;

  @observable logVisible = false;

  @observable value = '';

  @observable stage = [];

  @observable resource = null;

  @action changeLogVisible(flag) {
    this.logVisible = flag;
  }

  @action setStage(deployData) {
    this.stage = deployData;
  }

  @computed get getStage() {
    return this.stage.slice();
  }

  @action setResource(deployData) {
    this.resource = deployData;
  }

  @computed get getResource() {
    return this.resource;
  }

  @action
  changeLoading(flag) {
    this.isLoading = flag;
  }

  @computed
  get getIsLoading() {
    return this.isLoading;
  }

  @action
  setValue(value) {
    this.value = value;
  }

  @computed
  get getValue() {
    return this.value;
  }

  getStageData = (proId, instanceId) => {
    this.changeLoading(true);
    return axios.get(`/devops/v1/projects/${proId}/app_instances/${instanceId}/stages`)
      .then((stage) => {
        const res = this.handleProptError(stage);
        if (res) {
          this.setStage(stage);
          this.changeLoading(false);
          return res;
        }
        this.changeLoading(false);
        return false;
      });
  };

  getInstanceValue = (projectId, id) => axios.get(`/devops/v1/projects/${projectId}/app_instances/${id}/value`)
    .then((stage) => {
      const res = this.handleProptError(stage);
      if (res) {
        this.setValue(stage);
      }
    });


  getResourceData = (proId, id) => axios.get(`/devops/v1/projects/${proId}/app_instances/${id}/resources`)
    .then((stage) => {
      const res = this.handleProptError(stage);
      if (res) {
        this.setResource(stage);
      }
    });

  loadAllData = (projectId, id) => {
    this.changeLoading(true);
    axios.all([this.getInstanceValue(projectId, id), this.getResourceData(projectId, id),
      this.getStageData(projectId, id)])
      .then(axios.spread((value, resource, stage) => {
        if (!(value.failed && resource.failed && stage.failed)) {
          this.setResource(resource);
          this.setStage(stage);
          this.setValue(value);
        }
        this.changeLoading(false);
      }))
      .catch(() => {
        this.changeLoading(false);
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


const deployDetailStore = new DeployDetailStore();
export default deployDetailStore;
