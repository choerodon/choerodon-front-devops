import { observable, action, computed } from 'mobx';
import { axios, store } from 'choerodon-front-boot';
import { handleProptError } from '../../../utils';
import { HEIGHT } from '../../../common/Constants';

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
    console.log(page, size, sort, param);
    this.setLoading(true);
    try {
      let field = sort.field || 'id';
      if (sort.field === 'origin') {
        field = 'projectId';
      }
      // const data = await axios.post(
      //   `/devops/v1/projects/${projectId}/project_config/list_by_options?page=${page}&size=${size}&sort=${field},${sort.order}`,
      //   JSON.stringify(param),
      // );
      // status  0 ro 1
      //
      const data = {
        totalPages: 1,
        totalElements: 9,
        numberOfElements: 9,
        size: 10,
        number: 0,
        content: [
          {
            id: 33,
            name: 'Docker备用',
            triggerType: 'auto',
            createUserRealName: 'admin',
            isEnabled: 1,
            project: null,
            lastUpdateDate: 1554368582225,
            createUserName: 3,
          },
          {
            id: 32,
            name: 'Dockertest',
            triggerType: 'auto',
            createUserRealName: 'admin',
            isEnabled: 1,
            project: null,
            lastUpdateDate: 1554368682225,
            createUserName: 2,
          },
          {
            id: 28,
            name: 'Helm备用',
            triggerType: 'manual',
            createUserRealName: 'admin',
            isEnabled: 0,
            project: null,
            lastUpdateDate: 1554368682225,
            createUserName: 2,
          },
        ],
        empty: false,
      };

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
    } catch (e) {
      this.setLoading(false);
      Choerodon.handleResponseError(e);
    }
  }

  deletePipelie(projectId, id) {
    console.log(id);
  };

  changeStatus(projectId, id) {
    console.log(id);
  };

}

const pipelineStore = new PipelineStore();

export default pipelineStore;
