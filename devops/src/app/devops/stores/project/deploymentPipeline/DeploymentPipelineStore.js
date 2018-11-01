import { observable, action, computed } from 'mobx';
import { axios, store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('DeploymentPipelineStore')
class DeploymentPipelineStore {
  @observable proRole = '';

  @action setProRole(data) {
    this.proRole = data;
  }

  @computed get getProRole() {
    return this.proRole;
  }

  /**
   * 判断该角色是否有权限创建环境
   */
  judgeRole = () => {
    const { projectId, organizationId, type } = AppState.currentMenuType;
    const datas = [{
      code: 'devops-service.devops-environment.create',
      organizationId,
      projectId,
      resourceType: type,
    }];
    axios.post('/iam/v1/permissions/checkPermission', JSON.stringify(datas))
      .then((data) => {
        const res = this.handleProptError(data);
        if (res && res.length) {
          const { approve } = res[0];
          this.setProRole(approve ? 'owner' : 'member');
        }
      });
  };

  handleProptError = (error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}

const deploymentPipelineStore = new DeploymentPipelineStore();
export default deploymentPipelineStore;
