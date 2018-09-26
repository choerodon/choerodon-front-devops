import { observable, action } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import _ from 'lodash';

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

  loadInitData = () => {
    this.setLoading(true);
    this.setCiPipelines([]);
    this.loadApps(AppState.currentMenuType.id).then((res) => {
      this.setApps(res || []);
      const response = this.handleProptError(res);
      if (response) {
        if (res.length) {
          const defaultApp = res[0];
          this.setCurrentApp(defaultApp);
          this.loadPipelines(defaultApp.id);
        } else {
          this.setLoading(false);
        }
      }
    });
  };

  loadApps(projectId) {
    return axios.get(`/devops/v1/projects/${projectId}/apps`)
      .then(datas => this.handleProptError(datas));
  }

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

  loadCommits(content, shas, projectId = AppState.currentMenuType.id) {
    this.setCommits([]);
    axios.post(`/devops/v1/projects/${projectId}/gitlab_projects/${content[0].gitlabProjectId}/commit_sha`, shas)
      .then((res) => {
        const response = this.handleProptError(res);
        if (response) {
          this.setCommits(res);
          this.setCiPipelines(content);
        }
        this.setLoading(false);
      })
      .catch((error) => {
        this.setLoading(false);
        Choerodon.prompt(error.message);
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

  @action setApps(data) {
    this.apps = data;
  }

  @action setCurrentApp(data) {
    this.currentApp = data;
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
