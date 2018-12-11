import { observable, action, computed } from "mobx";
import { axios, store } from "choerodon-front-boot";

@store("InstanceDetailStore")
class InstanceDetailStore {
  @observable isLoading = true;

  @observable logVisible = false;

  @observable value = "";

  @observable istEvent = [];

  @observable resource = null;

  @action changeLogVisible(flag) {
    this.logVisible = flag;
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

  @action
  setIstEvent(value) {
    this.istEvent = value;
  }

  @computed
  get getIstEvent() {
    return this.istEvent.slice();
  }

  getInstanceValue = (projectId, id) =>
    axios
      .get(`/devops/v1/projects/${projectId}/app_instances/${id}/value`)
      .then(stage => {
        const res = this.handleProptError(stage);
        if (res) {
          this.setValue(stage);
        }
      });

  loadIstEvent = (projectId, id) =>
    axios
      .get(`/devops/v1/projects/${projectId}/app_instances/${id}/events`)
      .then(event => {
        const res = this.handleProptError(event);
        if (res) {
          this.setIstEvent(event);
        }
      });

  getResourceData = (proId, id) =>
    axios
      .get(`/devops/v1/projects/${proId}/app_instances/${id}/resources`)
      .then(stage => {
        const res = this.handleProptError(stage);
        if (res) {
          this.setResource(stage);
        }
      });

  loadAllData = (projectId, id) => {
    this.changeLoading(true);
    axios
      .all([
        this.getInstanceValue(projectId, id),
        this.getResourceData(projectId, id),
        this.loadIstEvent(projectId, id),
      ])
      .then(
        axios.spread((value, resource, event) => {
          if (!(value.failed && resource.failed && event.failed)) {
            this.setResource(resource);
            this.setIstEvent(event);
            this.setValue(value);
          }
          this.changeLoading(false);
        })
      )
      .catch(() => {
        this.changeLoading(false);
      });
  };

  handleProptError = error => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  };
}

const deployDetailStore = new InstanceDetailStore();
export default deployDetailStore;
