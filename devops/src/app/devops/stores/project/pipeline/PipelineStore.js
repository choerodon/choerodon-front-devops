import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';
import { HEIGHT, SORTER_MAP } from '../../../common/Constants';

@store('PipelineStore')
class PipelineStore {
  @observable listData = [];
  @observable loading = false;
  @observable pageInfo = {
    current: 1,
    total: 0,
    pageSize: HEIGHT <= 900 ? 10 : 15,
  };

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

  async loadListData(projectId, page, size, sort, param) {
    this.setLoading(true);

    const sortPath = sort ? `&sort=${sort.field || sort.columnKey || 'id'},${SORTER_MAP[sort.order] || 'descend'}` : '';
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
   * 启/停用流水线
   * @param projectId
   * @param id
   * @param status
   * @returns {void | IDBRequest<IDBValidKey> | Promise<void>}
   */
  changeStatus(projectId, id, status) {
    return axios.put(`/devops/v1/projects/${projectId}/pipeline/${id}?isEnabled=${status}`);
  };

  /**
   * 执行手动触发的流水线
   * @param projectId
   * @param id
   * @returns {*}
   */
  executePipeline(projectId, id) {
    return axios.get(`/devops/v1/projects/${projectId}/pipeline/${id}/execute`);
  }

  /**
   * 检查是否可以执行
   * @param projectId
   * @param id
   * @returns {*}
   */
  checkExecute(projectId, id) {
    return axios.get(`/devops/v1/projects/${projectId}/pipeline/check_deploy?pipeline_id=${id}`);
  }
}

const pipelineStore = new PipelineStore();

export default pipelineStore;
