import { observable, action } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import _ from 'lodash';

const { AppState } = stores;

@store('CiPipelineStore')
class CiPipelineStore {
  @observable apps = [];

  @observable currentApp = {};

  @observable ciPipelines = [];

  @observable commits = [];

  @observable pagination = {};

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

  loadPipelines(appId, page = 0, size = 10, projectId = AppState.currentMenuType.id) {
    this.setCiPipelines([]);
    this.setLoading(true);
    axios.get(`/devops/v1/projects/${projectId}/applications/${appId}/pipelines?page=${page}&size=${size}`)
      .then((res) => {
        const response = this.handleProptError(res);
        if (response) {
          this.setPagination({
            current: res.number + 1,
            pageSize: res.size,
            total: res.totalElements,
          });
          if (res.content) {
            this.loadCommits(res.content, _.map(res.content, 'sha'));
          } else {
            this.setLoading(false);
          }
        }
      })
      .catch((error) => {
        this.setLoading(false);
        Choerodon.prompt(error.message);
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
