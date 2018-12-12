import { observable, action, computed } from "mobx";
import { axios, store } from "choerodon-front-boot";
import { handleProptError } from "../../../utils";

@store("DeploymentStore")
class DeploymentStore {
  @observable dataSource = {};

  @observable loading = true;

  @action setLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setData(data) {
    this.dataSource = data;
  }

  @computed get getData() {
    return this.dataSource;
  }

  /**
   * 根据实例id获取更多部署详情(Json格式)
   * @param project 项目id
   * @param instance 实例id
   * @param name deployment名称
   * @memberof DeploymentStore
   */
  loadDeploymentsJson = (project, instance, name) => {
    this.setLoading(true);
    axios
      .get(
        `devops/v1/projects/${project}/app_instances/${instance}/deployment_detail_json?deployment_name=${name}`
      )
      .then(data => {
        const res = handleProptError(data);
        if (res) {
          this.setData(res);
        }
        this.setLoading(false);
      })
      .catch(err => {
        this.setLoading(false);
        Choerodon.handleResponseError(err);
      });
  };
}

const deploymentStore = new DeploymentStore();
export default deploymentStore;
