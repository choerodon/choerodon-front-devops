import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';

const { AppState } = stores;

@store('CertificateStore')
class CertificateStore {
  @observable envData = [];

  @action setEnvData(data) {
    this.envData = data;
  }

  @computed get getEnvData() {
    return this.envData;
  }

  loadEnvData = (projectId) => {
    const activeEnv = axios.get(`/devops/v1/projects/${projectId}/envs?active=true`);
    const invalidEnv = axios.get(`/devops/v1/projects/${projectId}/envs?active=false`);
    Promise.all(activeEnv, invalidEnv).then((values) => {

    });
  }
}

const certificateStore = new CertificateStore();

export default certificateStore;
