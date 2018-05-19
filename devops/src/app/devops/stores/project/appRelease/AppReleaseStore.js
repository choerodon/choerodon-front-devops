import { observable, action, computed, autorun, whyRun } from 'mobx';
// import axios from 'Axios';
import axios from 'Axios';
import store from 'Store';
import { Observable } from 'rxjs';
import { List, formJS } from 'immutable';

@store('AppReleaseStore')
class AppReleaseStore {
  @observable allData = [];
  @observable isRefresh= false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable selectData = [];
  @observable pageInfo = {
    current: 1, total: 0, pageSize: 10,
  };
  @observable data1 = 'replicaCount: 1\n' +
    '\n' +
    'image:\n' +
    '  repository: registry.saas.hand-china.com/choerodon-devops/choerodon-front-devops\n' +
    '  tag: develop.20180502172827\n' +
    '  pullPolicy: Always\n' +
    '\n' +
    'preJob:\n' +
    '  preConfig:\n' +
    '    mysql:\n' +
    '      host: 192.168.12.175\n' +
    '      port: 3306\n' +
    '      username: root\n' +
    '      password: handhand\n' +
    '      dbname: iam_service\n' +
    '    lable:\n' +
    '      servicecode: choerodon-front-devops\n' +
    '      servicegroup: com.hand.devops\n' +
    '      servicekind: MicroServiceUI\n' +
    '\n' +
    'service:\n' +
    '  enable: false\n' +
    '  type: ClusterIP\n' +
    '  port: 80\n' +
    '  name: choerodon-front-devops\n' +
    '\n' +
    'ingress:\n' +
    '  enable: false\n' +
    '  host: devops.choerodon.alpha.saas.hand-china.com\n' +
    '\n' +
    'env:\n' +
    '  open:\n' +
    '    PRO_API_HOST: gateway.alpha.saas.hand-china.com\n' +
    'resources: \n';

  @observable data2 = 'replicaCount: 1\n' +
    '\n' +
    'image:\n' +
    '  repository: registry.saas.hand-china.com/choerodon-devops/choerodon-front-devops\n' +
    '  tag: develop.20180502172827\n' +
    '  pullPolicy: Always\n' +
    '\n' +
    'preJob:\n' +
    '  preConfig:\n' +
    '    mysql:\n' +
    '      host: 192.168.12.175\n' +
    '      port: 3308\n' +
    '      username: root\n' +
    '      password: handhand\n' +
    '      dbname: iam_service\n' +
    '    lable:\n' +
    '      servicecode: choerodon-front-devops\n' +
    '      servicegroup: com.hand.devops\n' +
    '      servicekind: MicroServiceUI\n' +
    '\n' +
    'service:\n' +
    '  enable: false\n' +
    '  type: ClusterIP\n' +
    '  port: 80\n' +
    '  name: choerodon-front-devops\n' +
    '\n' +
    'ingress:\n' +
    '  enable: true\n' +
    '  host: devops.choerodon.alpha.saas.hand-china.com\n' +
    '\n' +
    'env:\n' +
    '  open:\n' +
    '    PRO_API_HOST: gateway.alpha.saas.hand-china.com\n' +
    'resources: \n';

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }


  @computed get getAllData() {
    // window.console.log(this.allData);
    return this.allData.slice();
  }

  @action setAllData(data) {
    this.allData = data;
    // window.console.log(this.allData);
  }
  @computed get getSelectData() {
    // window.console.log(this.allData);
    return this.singleData.slice();
  }

  @action setSelectData(data) {
    this.selectData = data;
    // window.console.log(this.allData);
  }

  @action changeIsRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsRefresh() {
    return this.isRefresh;
  }
  @action changeLoading(flag) {
    this.loading = flag;
  }

  @computed get getLoading() {
    return this.loading;
  }

  @action setSingleData(data) {
    this.singleData = data;
  }

  @computed get getSingleData() {
    return this.singleData;
  }

  loadData = (isRefresh = false, projectId, page = this.pageInfo.current, size = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, postData = { searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return Observable.fromPromise(axios.post(`/devops/v1/project/${projectId}/apps_market/list_in_project?page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(postData)))
      .subscribe((data) => {
        this.handleData(data);
        this.changeLoading(false);
        this.changeIsRefresh(false);
      });
  };
  handleData =(data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    const page = { number, size, totalElements };
    this.setPageInfo(page);
  };

  loadSelectData =orgId =>
    axios.get(`/devops/v1/organization/${orgId}/app_templates`)
      .then((data) => {
        this.setSelectData(data);
      });

  loadDataById =(projectId, id) =>
    axios.get(`/devops/v1/project/${projectId}/apps/${id}`).then((data) => {
      this.setSingleData(data);
    });

  checkCode =(projectId, code) =>
    axios.get(`/devops/v1/project/${projectId}/apps/checkCode?code=${code}`);

  checkName = (projectId, name) =>
    axios.get(`/devops/v1/project/${projectId}/apps/checkName?name=${name}`);

  updateData = (projectId, data) =>
    axios.put(`/devops/v1/project/${projectId}/apps`, JSON.stringify(data));

  addData = (projectId, data) =>
    axios.post(`/devops/v1/project/${projectId}/apps`, JSON.stringify(data));

  deleteData =(projectId, id) =>
    axios.delete(`/devops/v1/organization/${projectId}/appTemplates/${id}`);

  changeAppStatus = (projectId, id, status) =>
    axios.put(`/devops/v1/project/${projectId}/apps/${id}?active=${status}`);
}

const appReleaseStore = new AppReleaseStore();
export default appReleaseStore;

// autorun(() => {
//   window.console.log(templateStore.allData.length);
//   whyRun();
// });
