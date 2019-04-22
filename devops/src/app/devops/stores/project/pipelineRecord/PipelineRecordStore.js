import { observable, action, computed } from "mobx";
import { axios, store, stores } from "choerodon-front-boot";
import _ from 'lodash';
import { handleProptError } from "../../../utils/index";
import { HEIGHT } from '../../../common/Constants';

@store("PipelineRecordStore")
class PipelineRecordStore {
  @observable recordList = [];

  @observable pipelineData = [];

  @observable loading = false;

  @observable pageInfo = {
    current: 1,
    total: 0,
    pageSize: HEIGHT <= 900 ? 10 : 15,
  };

  @observable Info = {
    filters: {},
    sort: { columnKey: "id", order: "descend" },
    paras: [],
  };

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @computed get getRecordList() {
    return this.recordList.slice();
  }

  @action setRecordListList(data) {
    this.recordList = data;
  }

  @computed get getPipelineData() {
    return this.pipelineData;
  }

  @action setPipelineData(data) {
    this.pipelineData = data;
  }

  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setInfo(Info) {
    this.Info = Info;
  }

  @computed get getInfo() {
    return this.Info;
  }


  /**
   ** 查询流水线执行总览列表
   */
  loadRecordList = (
    projectId,
    pipelineId,
    page = this.pageInfo.current - 1,
    size = this.pageInfo.pageSize,
    sort = { field: "id", order: "desc" },
    postData = {
      searchParam: {},
      param: "",
    }
  ) => {
    this.changeLoading(true);
    const url = pipelineId ? `pipeline_id=${pipelineId}&` : "";
    return axios.post(`/devops/v1/projects/${projectId}/pipeline/list_record?${url}page=${page}&size=${size}&sort=${sort.field || 'id'},${sort.order}`, JSON.stringify(postData))
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          const {content, totalElements, number, size} = res;
          this.setPageInfo({number, totalElements, size});
          this.setRecordListList(content);
        }
        this.changeLoading(false);
      });
  };

  /**
   ** 查询所有流水线
   * @param projectId
   */
  loadPipelineData = projectId =>
    axios.get(`/devops/v1/projects/${projectId}/pipeline/all_pipeline`)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          this.setPipelineData(res);
        }
        return res;
      });

  /**
   ** 流水线重试
   * @param projectId
   * @param recordId
   */
  retry = (projectId, recordId) =>
    axios.get(`/devops/v1/projects/${projectId}/pipeline/${recordId}/retry`);

  /**
   ** 人工审核阶段或任务
   * @param projectId
   * @param recordId 流水线记录id
   * @param id 阶段id或任务id
   * @param type 中止或通过
   */
  checkData = (projectId, data) =>
    axios.post(`/devops/v1/projects/${projectId}/pipeline/audit`, JSON.stringify(data));
}

const pipelineRecordStore = new PipelineRecordStore();
export default pipelineRecordStore;
