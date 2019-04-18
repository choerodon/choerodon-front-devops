import { observable, action, computed, set, remove } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import _ from 'lodash';
import { handleProptError } from '../../../utils';
import {
  STAGE_FLOW_AUTO,
  STAGE_FLOW_MANUAL,
  TASK_TYPE_MANUAL,
} from '../../../containers/project/pipeline/components/Constans';

const INIT_INDEX = 0;

@store('PipelineCreateStore')
class PipelineCreateStore {
  @observable isDisabled = false;

  @action setIsDisabled(data) {
    this.isDisabled = data;
  }

  @computed get getIsDisabled() {
    return this.isDisabled;
  }

  /**
   * 流水线的触发方式
   */
  @observable trigger = 'auto';

  @action setTrigger(type) {
    // 切换触发方式，对第一个阶段的首个任务的类型校验
    if (type === STAGE_FLOW_MANUAL) {
      this.setIsDisabled(false);
    } else {
      const headStageId = (_.head(this.stageList) || {}).tempId;
      const headTask = _.find(this.taskList[headStageId], 'isHead');
      this.setIsDisabled(headTask && headTask.type === TASK_TYPE_MANUAL);
    }

    this.trigger = type;
  }

  @computed get getTrigger() {
    return this.trigger;
  }

  /******************阶段相关设置*******************/
  @observable stageIndex = INIT_INDEX;

  @action setStageIndex(index) {
    this.stageIndex = index;
  }

  @computed get getStageIndex() {
    return this.stageIndex;
  }

  @observable stageList = [
    {
      tempId: INIT_INDEX,
      stageName: '阶段一',
      triggerType: 'auto',
      pipelineTaskDTOS: null,
      stageUserRelDTOS: null,
      isParallel: 0,
    },
  ];

  /**
   * 添加阶段
   * @param id 前一个阶段的id
   * @param data
   */
  @action addStage(id, data) {
    const index = _.findIndex(this.stageList, ['tempId', id]);
    if (index === -1) return;
    this.stageList.splice(index + 1, 0, data);
  }

  /**
   * 修改阶段
   * @param id 当前修改阶段的id
   * @param data
   */
  @action editStage(id, data) {
    const stage = _.find(this.stageList, ['tempId', id]);
    set(stage, { ...data });
  }

  @action setStageList(id, data) {
    const stage = _.find(this.stageList, ['tempId', id]);
    if (!stage) return;

    set(stage, { ...data });
  }

  @observable taskSettings = {};

  /**
   * 设置任务执行模式：并行和串行
   * @param id
   * @param data
   */
  @action setTaskSettings(id, data) {
    const stage = _.find(this.stageList, ['tempId', id]);
    set(stage, { isParallel: _.toNumber(data) });
    set(this.taskSettings, { [id]: data });
  }

  @action removeStage(id) {
    const index = _.findIndex(this.stageList, ['tempId', id]);
    if (!~index) return;
    remove(this.stageList, index);
    set(this.taskList, { [id]: null });
    set(this.taskSettings, { [id]: null });

    /**
     * 自动触发的流水线中
     * 删除第一个阶段，需要判断第二个阶段的第一个任务是不是部署类型
     */
    if (index === 0 && this.stageList.length) {
      const headStageId = this.stageList[0].tempId;
      const tasks = this.taskList[headStageId];
      if (tasks && tasks.length) {
        tasks[0].isHead = true;
        this.setIsDisabled(
          tasks[0].type === TASK_TYPE_MANUAL &&
          this.trigger === STAGE_FLOW_AUTO,
        );
      }
    }
  }

  @action clearStageList() {
    this.stageList = [
      {
        tempId: INIT_INDEX,
        stageName: '阶段一',
        triggerType: 'auto',
        pipelineTaskDTOS: null,
        stageUserRelDTOS: null,
        isParallel: 0,
      },
    ];
  }

  @action clearTaskSettings() {
    this.taskSettings = {};
  }

  @computed get getTaskSettings() {
    return this.taskSettings;
  }

  @computed get getStageList() {
    return this.stageList.slice();
  }

  /************task 相关****************/

    // 缓存不同阶段的task的序号
  @observable taskIndex = {
    0: INIT_INDEX,
  };

  @action setTaskIndex(stageId, index) {
    set(this.taskIndex, { [stageId]: index });
  }

  @action clearTaskIndex() {
    this.taskIndex = {
      0: INIT_INDEX,
    };
  }

  @computed get getTaskIndex() {
    return this.taskIndex;
  }

  @observable taskList = {};

  /**
   * 设置某阶段的任务列表
   * @param stage 阶段标识
   * @param data
   */
  @action setTaskList(stage, data) {
    set(this.taskList, { [stage]: [...(this.taskList[stage] || []), data] });
  }

  @action updateTaskList(stage, id, data) {
    const task = this.taskList[stage];
    const current = _.findIndex(task, ['index', id]);

    if (current || current === 0) {
      task[current] = data;
    }
    if (data.isHead) {
      this.setIsDisabled(data.type === TASK_TYPE_MANUAL);
    }
    set(this.taskList, { [stage]: task });
  }

  /**
   * 移除阶段内的任务
   * @param stage 阶段的 tempId
   * @param id 任务的 index
   * @param isHead 是否是整个流水线的第一个任务
   */
  @action removeTask(stage, id, isHead) {
    if (!this.taskList[stage]) return;

    const newTaskList = _.filter(
      this.taskList[stage],
      item => item.index !== id,
    );
    if (isHead && newTaskList[0]) {
      newTaskList[0].isHead = true;
      // 类型错误，禁止创建
      this.setIsDisabled(
        newTaskList[0].type === TASK_TYPE_MANUAL &&
        this.trigger === STAGE_FLOW_AUTO,
      );
    }
    set(this.taskList, { [stage]: newTaskList });
  }

  @action clearTaskList() {
    this.taskList = {};
  }

  @computed get getTaskList() {
    return this.taskList;
  }

  /*************task相关结束**************/

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
    value: false,
    user: false,
  };

  @action setLoading(name, flag) {
    set(this.loading, { [name]: flag });
  }

  @computed get getLoading() {
    return this.loading;
  }

  @observable instances = [];

  @action setInstances(data) {
    this.instances = data;
  }

  @computed get getInstance() {
    return this.instances.slice();
  }

  @observable configList = [];

  @action setConfigList(data) {
    this.configList = data;
  }

  @computed get getConfigList() {
    return this.configList.slice();
  }

  @observable user = [];

  @action setUser(data) {
    this.user = data;
  }

  @computed get getUser() {
    return this.user.slice();
  }

  @observable detailLoading = false;

  @action setDetailLoading(data) {
    this.detailLoading = data;
  }

  @computed get getDetailLoading() {
    return this.detailLoading;
  }

  @observable pipeline = {};

  @action setPipeline(data) {
    this.pipeline = data;
  }

  @computed get getPipeline() {
    return this.pipeline;
  }

  @action initPipeline(data) {
    const { pipelineStageDTOS, triggerType } = data;
    const taskList = {};
    let stageIndex = INIT_INDEX;
    let taskIndex = { 0: INIT_INDEX };

    const stageList = _.map(pipelineStageDTOS, ({ pipelineTaskDTOS, ...item }) => {
      let index = 1;
      const tasks = _.map(pipelineTaskDTOS, task => ({
        ...task,
        isHead: stageIndex === INIT_INDEX && index === 1,
        index: index++,
      }));

      const stage = { ...item, tempId: ++stageIndex, pipelineTaskDTOS: tasks };
      taskList[stageIndex] = tasks;
      taskIndex[stageIndex] = index;
      return stage;
    });

    this.trigger = triggerType;
    this.taskIndex = taskIndex;
    this.stageIndex = stageIndex;
    this.stageList = stageList;
    this.taskList = taskList;
  }

  /**
   * 检查流水线名称唯一性
   * @param projectId
   * @param name
   * @returns {*}
   */
  checkName(projectId, name) {
    return axios.get(
      `/devops/v1/projects/${projectId}/pipeline/check_name?name=${name}`,
    );
  }

  /**
   * 校验实例名称
   * 1. 校验本地所有为上传的任务中的实例
   * 2. 校验已创建的实例
   * @param projectId
   * @param name
   * @returns {*}
   */
  checkInstanceName(projectId, name) {
    // 正在创建的流水线中是否存在同名实例
    const taskList = _.values(this.taskList).slice();
    let hasName = false;
    for (let i = 0, len = taskList.length; i < len; i++) {
      const task = _.find(taskList[i], ({ appDeployDTOS }) => appDeployDTOS && appDeployDTOS.instanceName === name);
      if (task) {
        hasName = true;
        break;
      }
    }

    return hasName
      ? Promise.resolve({ failed: true })
      : axios.get(`/devops/v1/projects/${projectId}/app_instances/check_name?instance_name=${name}`);
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
      // 让连接的环境排在前面
      this.setEnvData(_.sortBy(data, value => Number(!value.connect)));
    }
  }

  async loadAppData(projectId) {
    this.setLoading('app', true);
    const response = await axios
      .post(
        `/devops/v1/projects/${projectId}/apps/list_by_options?active=true&type=normal&doPage=false&has_version=true`,
        JSON.stringify({
          searchParam: {},
          param: '',
        }),
      )
      .catch(e => {
        this.setLoading('app', false);
        Choerodon.handleResponseError(e);
      });
    this.setLoading('app', false);
    const data = handleProptError(response);
    if (data) {
      this.setAppDate(data.content);
    }
  }

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
   * 查询部署配置列表
   * @param projectId
   * @param envId
   * @param appId
   * @returns {Promise<void>}
   */
  async loadConfig(projectId, envId, appId) {
    this.setLoading('config', true);
    let response = await axios
      .get(
        `/devops/v1/projects/${projectId}/pipeline_value/list?app_id=${appId}&env_id=${envId}`,
      )
      .catch(e => {
        this.setLoading('config', false);
        Choerodon.handleResponseError(e);
      });
    this.setLoading('config', false);
    const res = handleProptError(response);
    if (res) {
      this.setConfigList(res);
    }
  }

  /**
   * 查询部署信息
   * @param projectId
   * @param valueId
   * @returns {Promise<void>}
   */
  async loadValue(projectId, valueId) {
    this.setLoading('value', true);
    let response = await axios
      .get(
        `/devops/v1/projects/${projectId}/pipeline_value?value_id=${valueId}`,
      )
      .catch(e => {
        this.setLoading('value', false);
        Choerodon.handleResponseError(e);
      });
    this.setLoading('value', false);
    const data = handleProptError(response);
    if (data) {
      return data.value;
    }
    return;
  }

  /**
   * 项目所有者和项目成员
   * @param projectId
   * @returns {Promise<void>}
   */
  async loadUser(projectId) {
    this.setLoading('user', true);
    let response = await axios
      .get(`/devops/v1/projects/${projectId}/pipeline/all_users`)
      .catch(e => {
        this.setLoading('user', false);
        Choerodon.handleResponseError(e);
      });
    this.setLoading('user', false);
    const res = handleProptError(response);
    if (res) {
      this.setUser(res);
    }
  }

  /**
   * 创建流水线
   * @param projectId
   * @param data
   *
   * data 属性：
   *  - name
   *  - triggerType 触发方式，值为 'auto' 和 'manual'
   *  - pipelineUserRelDTOS 触发人员，id的数组格式，如果 triggerType 是 'auto'， 则值为null
   *  - pipelineStageDTOS 阶段信息，数组
   */
  createPipeline(projectId, data) {
    return axios.post(
      `/devops/v1/projects/${projectId}/pipeline`,
      JSON.stringify(data),
    );
  }

  editPipeline(projectId, data) {
    return axios.put(`/devops/v1/projects/${projectId}/pipeline`, JSON.stringify(data));
  }

  async loadDetail(projectId, id) {
    this.setDetailLoading(true);
    let response = await axios
      .get(`/devops/v1/projects/${projectId}/pipeline/${id}/detail`)
      .catch(e => {
        this.setDetailLoading(false);
        Choerodon.handleResponseError(e);
      });
    this.setDetailLoading(false);
    const res = handleProptError(response);
    if (res) {
      this.setPipeline(res);
      this.initPipeline(res);
    }
  }

}

const pipelineCreateStore = new PipelineCreateStore();

export default pipelineCreateStore;
