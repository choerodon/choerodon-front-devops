import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import _ from 'lodash';
import { handleProptError } from '../../../utils';

const height = window.screen.height;
@store('NetworkConfigStore')
class NetworkConfigStore {
  @observable env = [];
  @observable app = [];
  @observable ist = [];
  @observable allData = [];
  @observable isRefresh = false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable selectData = [];
  @observable instance = [];
  @observable versions = [];
  @observable pageInfo = {
    current: 1, total: 0, pageSize: height <= 900 ? 10 : 15,
  };
  @observable versionDto = [];

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @computed get getInstance() {
    return this.instance;
  }

  @action setInstance(type = 'add', index = '', data) {
    if (type instanceof Array) {
      this.instance = [];
    } else if (type === 'add') {
      if (this.instance.length === 0) {
        this.instance.push(data);
      } else {
        const newData = this.instance;
        _.map(newData, (ins, i) => {
          if (ins.id === data.id) {
            newData[i].options = data.options;
            this.instance = newData;
          } else {
            this.instance.push(data);
          }
        });
      }
    } else if (type === 'remove') {
      this.instance.splice(index, 1);
    }
  }

  @computed get getSelectData() {
    return this.selectData.slice();
  }

  @action setSelectData(data) {
    this.selectData = data;
  }

  @action changeIsRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsRefresh() {
    return this.isRefresh;
  }

  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setSingleData(data) {
    this.singleData = data;
  }

  @computed get getSingleData() {
    return this.singleData;
  }

  /**
   * 获取网络列表
   */
  @action setAllData(data) {
    this.allData = data;
  }

  @computed get getAllData() {
    return this.allData;
  }

  /**
   * 环境
   */
  @action setEnv(data) {
    this.env = data;
  }

  @computed get getEnv() {
    return this.env;
  }

  /**
   * 应用
   */
  @action setApp(data) {
    this.app = data;
  }

  @computed get getApp() {
    return this.app;
  }

  /**
   * 实例
   */
  @action setIst(data) {
    this.ist = data;
  }

  @computed get getIst() {
    return this.ist;
  }

  loadDataById = (projectId, id) => {
    this.changeLoading(true);
    return axios.get(`/devops/v1/projects/${projectId}/service/${id}`).then((data) => {
      const res = handleProptError(data);
      if (res) {
        this.setSingleData(data);
        return data;
      }
      this.changeLoading(false);
      return res;
    });
  };

  updateData = (projectId, id, data) =>
    axios.put(`/devops/v1/projects/${projectId}/service/${id}`, JSON.stringify(data))
      .then((datas) => {
        const res = handleProptError(datas);
        return res;
      });

  /**
   * 删除网络
   * @param projectId
   * @param id
   */
  deleteData = (projectId, id) =>
    axios.delete(`/devops/v1/projects/${projectId}/service/${id}`)
      .then((datas) => {
        const res = handleProptError(datas);
        return res;
      });

  /**
   * 加载网络列表数据
   * @param isRefresh
   * @param proId
   * @param page
   * @param pageSize
   * @param sort
   * @param datas
   * @returns {JQueryPromise<any>}
   */
  loadData = (isRefresh = false, proId, page = this.pageInfo.current - 1, pageSize = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return axios.post(`/devops/v1/projects/${proId}/service/list_by_options?page=${page}&size=${pageSize}&sort=${sort.field || 'id'},${sort.order}`, JSON.stringify(datas))
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          const { number, size, totalElements, content } = res;
          this.setAllData(content);
          this.setPageInfo({ number, size, totalElements });
        }
        this.changeLoading(false);
        this.changeIsRefresh(false);
      });
  };

  /**
   * 加载项目下的环境
   * @param projectId
   * @returns {Promise<T | never>}
   */
  loadEnv = projectId => axios.get(`/devops/v1/projects/${projectId}/envs?active=true`)
    .then((data) => {
      const res = handleProptError(data);
      if (res) {
        this.setEnv(res);
      }
    })
    .catch(err => Choerodon.handleResponseError(err));

  /**
   * 加载应用
   * @param projectId
   * @param envId
   * @returns {Promise<T | never>}
   */
  loadApp = (projectId, envId) => axios.get(`/devops/v1/projects/${projectId}/apps/options?envId=${envId}&status=running`)
    .then((data) => {
      const res = handleProptError(data);
      if (res) {
        this.setApp(res);
      }
    })
    .catch(err => Choerodon.handleResponseError(err));

  /**
   * 加载实例
   * @param projectId
   * @param envId
   * @param appId
   * @returns {Promise<T | never>}
   */
  loadInstance = (projectId, envId, appId) => axios.get(`/devops/v1/projects/${projectId}/app_instances/options?envId=${envId}&appId=${appId}`)
    .then((data) => {
      const res = handleProptError(data);
      if (res) {
        this.setIst(res);
      }
    })
    .catch(err => Choerodon.handleResponseError(err));

  /**
   * 检查网络名称
   * @param projectId
   * @param envId
   * @param value
   */
  checkNetWorkName = (projectId, envId, value) =>
    axios.get(`/devops/v1/projects/${projectId}/service/check?envId=${envId}&name=${value}`)
      .then((datas) => {
        const res = handleProptError(datas);
        return res;
      })
      .catch(err => Choerodon.handleResponseError(err));

  /**
   * 创建网络
   * @param projectId
   * @param data
   * @returns {Promise<T | never> | *}
   */
  createNetwork = (projectId, data) =>
    axios.post(`/devops/v1/projects/${projectId}/service`, JSON.stringify(data))
      .then(res => handleProptError(res));
}

const networkConfigStore = new NetworkConfigStore();
export default networkConfigStore;
