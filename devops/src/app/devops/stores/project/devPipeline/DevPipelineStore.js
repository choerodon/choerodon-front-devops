import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { handleProptError } from '../../../utils';
import AppTagStore from '../appTag';
import BranchStore from '../branchManage';
import MergeRequestStore from '../mergeRequest';
import CiPipelineStore from '../ciPipelineManage';

const { AppState } = stores;

@store('DevPipelineStore')
class DevPipelineStore {
  @observable appData = [];

  @observable selectedApp = null;

  @observable defaultAppName = null;

  @action setAppData(data) {
    this.appData = data;
  }

  @computed get getAppData() {
    return this.appData.slice();
  }

  @action setSelectApp(app) {
    this.selectedApp = app;
  }

  @computed get getSelectApp() {
    return this.selectedApp;
  }

  @action setDefaultAppName(name) {
    this.defaultAppName = name;
  }

  @computed get getDefaultAppName() {
    return this.defaultAppName;
  }

  /**
   * 查询该项目下的所有应用
   * @param projectId
   * @param type
   * @returns {Promise<T>}
   */
  queryAppData = (projectId = AppState.currentMenuType.id, type) => {
    AppTagStore.setTagData([]);
    BranchStore.setBranchList([]);
    this.setAppData([]);
    axios.get(`/devops/v1/projects/${projectId}/apps`)
      .then((data) => {
        const result = handleProptError(data);
        if (result) {
          this.setAppData(result);
          if (result.length) {
            if (this.selectedApp) {
              if (_.filter(result, ['id', this.selectedApp]).length === 0) {
                this.setSelectApp(result[0].id);
              }
            } else {
              this.setSelectApp(result[0].id);
            }
            switch (type) {
              case 'branch':
                BranchStore.loadBranchList({ projectId });
                break;
              case 'tag':
                AppTagStore.queryTagData(projectId, 0, 10);
                break;
              case 'merge':
                MergeRequestStore.loadMergeRquest(this.selectedApp);
                MergeRequestStore.loadUrl(projectId, this.selectedApp);
                break;
              case 'ci':
                CiPipelineStore.loadPipelines(this.selectedApp);
                break;
              default:
                break;
            }
            AppTagStore.setDefaultAppName(result[0].name);
          } else {
            AppTagStore.setLoading(false);
          }
        }
      }).catch(err => Choerodon.handleResponseError(err));
  };
}

const devPipelineStore = new DevPipelineStore();
export default devPipelineStore;
