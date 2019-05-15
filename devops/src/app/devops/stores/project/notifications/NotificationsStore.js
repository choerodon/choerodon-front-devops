/**
 * @author ale0720@163.com
 * @date 2019-05-13 14:46
 */
import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';
import { HEIGHT, SORTER_MAP } from '../../../common/Constants';
import _ from "lodash";

@store('NotificationsStore')
class NotificationsStore {
  @observable listData = [];
  @observable loading = false;
  @observable pageInfo = {
    current: 1,
    total: 0,
    pageSize: HEIGHT <= 900 ? 10 : 15,
  };

  @observable envData = [];

  @observable users = [];

  @observable singleData = {};

  @action setListData(data) {
    this.listData = data;
  }

  @computed get getListData() {
    return this.listData.slice();
  }

  @action setPageInfo(data) {
    this.pageInfo = data;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @action setLoading(data) {
    this.loading = data;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @observable detail = {};

  @action setDetail(data) {
    this.detail = data;
  }

  @computed get getDetail() {
    return this.detail;
  }

  @observable detailLoading = false;

  @action setDetailLoading(data) {
    this.detailLoading = data;
  }

  @computed get getDetailLoading() {
    return this.detailLoading;
  }

  @observable recordDate = [];

  @action setRecordDate(data) {
    this.recordDate = data;
  }

  @computed get getRecordDate() {
    return this.recordDate.slice();
  }

  @computed get getEnvData() {
    return this.envData.slice();
  }

  @action setEnvData(data) {
    this.envData = data;
  }

  @computed get getUsers() {
    return this.users.slice();
  }

  @action setUsers(data) {
    this.users = data;
  }

  @computed get getSingleData() {
    return this.singleData;
  }

  @action setSingleData(data) {
    this.singleData = data;
  }

  async loadListData(projectId, page, size, sort, param) {
    this.setLoading(true);

    const sortPath = sort ? `&sort=${sort.field || sort.columnKey},${SORTER_MAP[sort.order] || 'desc'}` : '';
    const data = await axios
      .post(
        `/devops/v1/projects/${projectId}/pipeline/list_by_options?page=${page}&size=${size}${sortPath}`,
        JSON.stringify(param),
      )
      .catch(e => {
        this.setLoading(false);
        Choerodon.handleResponseError(e);
      });

    const result = handleProptError(data);
    if (result) {
      const { number, totalElements: total, size: pageSize, content } = result;

      const pageInfo = {
        current: number + 1,
        total,
        pageSize,
      };
      this.setListData(content);
      this.setPageInfo(pageInfo);
    }
    this.setLoading(false);
  }

  deletePipeline(projectId, id) {
    return axios.delete(`/devops/v1/projects/${projectId}/pipeline/${id}`);
  };

  /**
   ** 查询所有环境
   */
  loadEnvData = projectId =>
    axios.get(`/devops/v1/projects/${projectId}/envs?active=true`)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          this.setEnvData(res);
        }
      });

  /**
   * 查询项目所有者和项目成员
   * @param projectId
   */
  loadUsers = projectId =>
    axios.get(`/devops/v1/projects/${projectId}/pipeline/all_users`)
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setUsers(res);
        }
      });

  createData = (projectId, data) =>
    axios.post(`/devops/v1/projects/${projectId}/notification`, JSON.stringify(data));

  updateData = (projectId, data) =>
    axios.put(`/devops/v1/projects/${projectId}/notification`, JSON.stringify(data));

  loadSingleData = (projectId, id) =>
    axios.get(`/devops/v1/projects/${projectId}/notification/${id}`)
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setSingleData(data);
        }
        return res;
      });
}

const notificationsStore = new NotificationsStore();

export default notificationsStore;


