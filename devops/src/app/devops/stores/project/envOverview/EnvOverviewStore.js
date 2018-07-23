import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';

@store('EnvOverviewStore')
class EnvOverviewStore {
  @observable isLoading = true;
  @observable envcard = [];

  @action setEnvcard(envcard) {
    this.envcard = envcard;
  }

  @computed get getEnvcard() {
    return this.envcard;
  }

  @action
  changeLoading(flag) {
    this.isLoading = flag;
  }

  @computed
  get getIsLoading() {
    return this.isLoading;
  }

  loadActiveEnv = projectId => axios.get(`devops/v1/projects/${projectId}/envs?active=true`).then((data) => {
    if (data && data.failed) {
      Choerodon.prompt(data.message);
    } else {
      this.setEnvcard(data);
    }
  });
}

const envOverviewStore = new EnvOverviewStore();
export default envOverviewStore;
