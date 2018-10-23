import { observable, action } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';

const { AppState } = stores;
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

@store('CiPipelineStore')
class CiPipelineStore {
  @observable apps = [];

  @observable currentApp = {};

  @observable ciPipelines = [];

  @observable commits = [];

  @observable pagination = {
    current: 1, pageSize: HEIGHT <= 900 ? 10 : 15, total: 0,
  };

  @observable loading = true;

  loadPipelines(appId, page = 0, size = this.pagination.pageSize, projectId = AppState.currentMenuType.id) {
    this.setCiPipelines([]);
    this.setLoading(true);
    axios.get(`/devops/v1/projects/${projectId}/pipeline/page?appId=${appId}&page=${page}&size=${size}`)
      .then((res) => {
        const response = this.handleProptError(res);
        if (response) {
          this.setPagination({
            current: res.number + 1,
            pageSize: res.size,
            total: res.totalElements,
          });
          this.setCiPipelines(res.content);
        }
        this.setLoading(false);
      });
  }

  cancelPipeline(gitlabProjectId, pipelineId) {
    return axios.post(`/devops/v1/projects/${AppState.currentMenuType.id}/gitlab_projects/${gitlabProjectId}/pipelines/${pipelineId}/cancel`)
      .then(datas => this.handleProptError(datas));
  }

  retryPipeline(gitlabProjectId, pipelineId) {
    return axios.post(`/devops/v1/projects/${AppState.currentMenuType.id}/gitlab_projects/${gitlabProjectId}/pipelines/${pipelineId}/retry`)
      .then(datas => this.handleProptError(datas));
  }

  @action setCiPipelines(data) {
    this.ciPipelines = data;
  }

  @action setCommits(data) {
    this.commits = data;
  }

  @action setPagination(data) {
    this.pagination = data;
  }

  @action setLoading(data) {
    this.loading = data;
  }

  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}

const ciPipelineStore = new CiPipelineStore();
export default ciPipelineStore;
