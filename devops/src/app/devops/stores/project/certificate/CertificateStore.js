import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { handleProptError } from '../../../utils';

const { AppState } = stores;

@store('CertificateStore')
class CertificateStore {
  @observable envData = [];

  @observable certData = [{
    id: 10,
    certName: 'test-env-Cert',
    commonName: 'localhost:9090',
    envName: 'Staging',
    status: 'operating',
    domains: ['localhost:9090', 'localhost:9091', 'localhost:9092'],
  }];

  @observable loading = false;

  @observable pageInfo = {
    current: 0,
    total: 0,
    pageSize: 10,
  };

  @action setEnvData(data) {
    this.envData = data;
  }

  @computed get getEnvData() {
    return this.envData;
  }

  @action setCertData(data) {
    this.certData = data;
  }

  @computed get getCertData() {
    return this.certData;
  }

  @action setCertLoading(flag) {
    this.loading = flag;
  }

  @computed get getCertLoading() {
    return this.loading;
  }

  @action setPageInfo(pages) {
    this.pageInfo = pages;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  /**
   * 加载项目下所有环境
   * @param projectId
   */
  loadEnvData = (projectId) => {
    const activeEnv = axios.get(`/devops/v1/projects/${projectId}/envs?active=true`);
    const invalidEnv = axios.get(`/devops/v1/projects/${projectId}/envs?active=false`);
    Promise.all([activeEnv, invalidEnv]).then((values) => {
      this.setEnvData(_.concat(values[0], values[1]));
    }).catch((err) => {
      Choerodon.handleResponseError(err);
    });
  };

  /**
   * 加载证书列表
   * @param projectId
   * @param envId
   * @param page
   * @param sizes
   * @param sort
   * @param postData
   */
  loadCertData = ({ projectId, page = 0, sizes = 10, sort = { field: 'id', order: 'asc' }, postData = { searchParam: {}, param: '' } }) => {
    this.setCertLoading(true);
    axios.post(`/devops/v1/projects/${projectId}/cert?page=${page}&size=${sizes}&sort=${sort.field},${sort.order}`, JSON.stringify(postData))
      .then((data) => {
        this.setCtfLoading(false);
        const res = handleProptError(data);
        if (res) {
          const { content, totalElements, number, size } = res;
          this.setPageInfo({ current: number + 1, pageSize: size, total: totalElements });
          this.setCtfData(content);
        }
      })
      .catch((err) => {
        this.setCtfLoading(false);
        Choerodon.handleResponseError(err);
      });
  };

  /**
   * 名字唯一性检查
   * @param projectId
   * @param value
   * @param envId
   */
  checkCertName = (projectId, value, envId) => {};

  deleteCertById = (projectId, certId) => axios.delete(`/devops/v1/projects/${projectId}/cert/${certId}/delete`);
}

const certificateStore = new CertificateStore();

export default certificateStore;
