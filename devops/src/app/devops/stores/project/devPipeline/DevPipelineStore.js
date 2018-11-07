import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import moment from 'moment';
import { handleProptError } from '../../../utils';
import AppTagStore from '../appTag';
import BranchStore from '../branchManage';
import MergeRequestStore from '../mergeRequest';
import CiPipelineStore from '../ciPipelineManage';
import DevConsoleStore from '../devConsole';
import ReportsStore from '../reports';
import DeploymentPipelineStore from '../deploymentPipeline';

const { AppState } = stores;
const START = moment().subtract(6, 'days').format().split('T')[0].replace(/-/g, '/');
const END = moment().format().split('T')[0].replace(/-/g, '/');

function findDataIndex(collection, value) {
  return collection ? collection.findIndex(
    ({ id, projectId }) => id === value.id && (
      (!projectId && !value.projectId)
      || projectId === value.projectId
    ),
  ) : -1;
}

// 保留多少recent内容,更新最新顺序
function saveRecent(collection = [], value, number) {
  const index = findDataIndex(collection, value);
  if (index !== -1) {
    return collection.splice(index, 1).concat(collection.slice());
  } else {
    collection.unshift(value);
    return collection.slice(0, number);
  }
}

@store('DevPipelineStore')
class DevPipelineStore {
  @observable appData = [];

  @observable selectedApp = null;

  @observable defaultAppName = null;

  @observable recentApp = null;

  @observable preProId = AppState.currentMenuType.id;

  @action setAppData(data) {
    this.appData = data;
  }

  @computed get getAppData() {
    return this.appData.slice();
  }

  @action setSelectApp(app) {
    this.selectedApp = app;
  }

  @action setPreProId(id) {
    this.preProId = id;
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

  @computed
  get getRecentApp() {
    let recents = [];
    if (this.recentApp) {
      recents = this.recentApp;
    } else if (localStorage.recentApp) {
      recents = JSON.parse(localStorage.recentApp);
    }
    return recents.filter(
      value => findDataIndex(this.appData, value) !== -1,
    );
  }

  @action
  setRecentApp(id) {
    if (id) {
      if (this.appData.length) {
        const recent = this.appData.filter(value => value.id === id)[0];
        const recentApp = saveRecent(this.getRecentApp, recent, 3);
        localStorage.recentApp = JSON.stringify(recentApp);
        this.recentApp = recentApp;
      } else {
        localStorage.recentApp = JSON.stringify([id]);
        this.recentApp = [id];
      }
    }
  }

  /**
   * 查询该项目下的所有应用
   * @param projectId
   * @param type
   * @param apps
   */
  queryAppData = (projectId = AppState.currentMenuType.id, type, apps) => {
    AppTagStore.setTagData([]);
    BranchStore.setBranchList([]);
    if (Number(this.preProId) !== Number(projectId)) {
      this.setAppData([]);
      DeploymentPipelineStore.setProRole('app', '');
    }
    this.setPreProId(projectId);
    axios.get(`/devops/v1/projects/${projectId}/apps`)
      .then((data) => {
        const result = handleProptError(data);
        if (result) {
          this.setAppData(result);
          if (result.length) {
            if (apps) {
              this.setSelectApp(apps);
            } else if (this.selectedApp) {
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
              case 'all':
                DevConsoleStore.loadBranchList(projectId, this.selectedApp);
                AppTagStore.queryTagData(projectId, 0, 10);
                MergeRequestStore.loadMergeRquest(this.selectedApp, 'opened', 0, 5);
                MergeRequestStore.loadMergeRquest(this.selectedApp, 'merged', 0, 5);
                MergeRequestStore.loadUrl(projectId, this.selectedApp);
                ReportsStore.loadCommits(projectId, START, END, [this.selectedApp]);
                break;
              default:
                break;
            }
            AppTagStore.setDefaultAppName(result[0].name);
          } else {
            this.setSelectApp(null);
            AppTagStore.setLoading(false);
            CiPipelineStore.setLoading(false);
            MergeRequestStore.setLoading(false);
            DevConsoleStore.setBranchLoading(false);
            DeploymentPipelineStore.judgeRole('app');
          }
        }
      }).catch(err => Choerodon.handleResponseError(err));
  };
}

const devPipelineStore = new DevPipelineStore();
export default devPipelineStore;
