import { observable, action, computed, set, remove } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';

@store('PipelineCreateStore')
class PipelineCreateStore {
  @observable taskList = {};

  /**
   * 设置某阶段的任务列表
   * @param stage 阶段标识
   * @param data
   */
  @action setTaskList(stage, data) {
    set(this.taskList, { [stage]: [...(this.taskList[stage] || []), data] });
  }

  @action removeTask(stage, name) {
    if (!this.taskList[stage]) return;
    const list = this.taskList[stage].filter(item => item.name !== name);
    set(this.taskList, { [stage]: list });
  };

  @computed get getTaskList() {
    return this.taskList;
  }

  @observable stageInfoList = [];

  @action setStageInfoList(data) {
    this.stageInfoList = data;
  }

  @computed get getStageInfoList() {
    return this.stageInfoList.slice();
  }

  @observable taskSettings = {};

  @action setTaskSettings(name, data) {
    set(this.taskSettings, { [name]: data });
  }

  @computed get getTaskSettings() {
    return this.taskSettings;
  }

  @observable envData = [];

  @action setEnvData(data) {
    this.envData = data;
  }

  @computed get getEnvData() {
    return this.envData.slice();
  }

  @observable appData = [];

  @action setAppDate(data) {
    this.appData = data;
  }

  @computed get getAppData() {
    return this.appData.slice();
  }

  @observable loading = {
    instance: false,
    app: false,
    env: false,
    config: false,
  };

  @action setLoading(name, flag) {
    set(this.loading, { [name]: flag });
  }

  @computed get getLoading() {
    return this.loading;
  }

  @observable config;

  @action setConfig(data) {
    this.config = data;
  }

  @computed get getConfig() {
    return this.config;
  }

  @observable instances = [];

  @action setInstances(data) {
    this.instances = data;
  }

  @computed get getInstance() {
    return this.instances.slice();
  }

  async loadEnvData(projectId) {
    this.setLoading('env', true);
    const response = await axios
      .get(`/devops/v1/projects/${projectId}/envs?active=${true}`)
      .catch(e => {
        this.setLoading('env', false);
        Choerodon.handleResponseError(e);
      });
    this.setLoading('env', false);
    const data = handleProptError(response);
    if (data) {
      this.setEnvData(data);
    }
  }

  async loadAppData(projectId) {
    this.setLoading('app', true);
    const response = await axios
      .post(`/devops/v1/projects/${projectId}/apps/list_by_options?active=true&type=normal&doPage=false&has_version=true`, JSON.stringify({
        searchParam: {},
        param: '',
      }))
      .catch(e => {
        this.setLoading('app', false);
        Choerodon.handleResponseError(e);
      });
    this.setLoading('app', false);
    const data = handleProptError(response);
    if (data) {
      this.setAppDate(data.content);
    }
  };

  async loadInstances(projectId, envId, appId) {
    this.setLoading('instance', true);
    let response = await axios
      .get(
        `/devops/v1/projects/${projectId}/app_instances/getByAppIdAndEnvId?envId=${envId}&appId=${appId}`,
      )
      .catch(e => {
        this.setLoading('instance', false);
        Choerodon.handleResponseError(e);
      });
    this.setLoading('instance', false);
    const res = handleProptError(response);
    if (res) {
      this.setInstances(res);
    }
  }

  /**
   ** 查询配置信息
   */
  async loadValue(projectId, appId) {
    this.setLoading('config', true);
    let response = await axios
      .get(`/devops/v1/projects/${projectId}/app_versions/value?app_id=${appId}`)
      .catch(e => {
        this.setLoading('config', false);
        Choerodon.handleResponseError(e);
      })
    ;
    this.setLoading('config', false);
    const data = handleProptError(response);
    if (data) {
      this.setConfig(data);
    }
  };

}

const pipelineCreateStore = new PipelineCreateStore();

export default pipelineCreateStore;
