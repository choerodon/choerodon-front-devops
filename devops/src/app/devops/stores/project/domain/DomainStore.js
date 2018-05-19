/**
 * Created by mading on 2017/11/27.
 */
import { observable, action, computed, autorun, whyRun } from 'mobx';
// import axios from 'Axios';
import axios from 'Axios';
import _ from 'lodash';
import store from 'Store';
import { Observable } from 'rxjs';
import { List, formJS } from 'immutable';

@store('DomainStore')
class DomainStore {
  @observable allData = [];
  @observable isRefresh = false;// 页面的loading
  @observable loading = false; // 打开tab的loading
  @observable singleData = null;
  @observable network = [];
  @observable env = [];
  @observable dto = [];
  @observable pageInfo = {
    current: 1, total: 0, pageSize: 10,
  };

  @action setPageInfo(page) {
    this.pageInfo.current = page.number + 1;
    this.pageInfo.total = page.totalElements;
    this.pageInfo.pageSize = page.size;
  }

  @computed get getPageInfo() {
    return this.pageInfo;
  }

  @computed
  get getAllData() {
    return this.allData.slice();
  }

  @action
  setAllData(data) {
    this.allData = data;
  }

  @computed
  get getDto() {
    return this.dto.slice();
  }

  @action
  setDto(data) {
    this.dto = data;
  }

  @computed
  get getNetwork() {
    return this.network.slice();
  }

  @action
  setNetwork(data) {
    this.network = data;
  }

  @action
  changeLoading(flag) {
    this.loading = flag;
  }

  @computed
  get getLoading() {
    return this.loading;
  }

  @action changeIsRefresh(flag) {
    this.isRefresh = flag;
  }

  @computed get getIsRefresh() {
    return this.isRefresh;
  }
  @action
  setSingleData(data) {
    this.singleData = data;
  }

  @computed
  get getSingleData() {
    return this.singleData;
  }

  @computed
  get getEnv() {
    return this.env.slice();
  }

  @action
  setEnv(data) {
    this.env = data;
  }

  loadData = (isRefresh = true, proId, page = this.pageInfo.current, pageSize = this.pageInfo.pageSize, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    if (isRefresh) {
      this.changeIsRefresh(true);
    }
    this.changeLoading(true);
    return Observable.fromPromise(axios.post(`/devops/v1/project/${proId}/ingress/list_by_options?page=${page}&size=${pageSize}&sort=${sort.field},${sort.order}`, JSON.stringify(datas)))
      .subscribe((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.handleData(data);
        }
        this.changeLoading(false);
        this.changeIsRefresh(false);
      });
  };
  handleData =(data) => {
    this.setAllData(data.content);
    const { number, size, totalElements } = data;
    this.setPageInfo({ number, size, totalElements });
    // DomainStore.setTotalPage(data.totalPages);
    // DomainStore.setTotalSize(data.totalElements);
  };

  loadDataById = (projectId, id) =>
    axios.get(`/devops/v1/project/${projectId}/ingress/${id}`).then((data) => {
      const res = this.handleProptError(data);
      if (res) {
        this.setSingleData(data);
        this.setDto(data.devopsIngressPathDTOList);
        const serviseDto = _.map(data.devopsIngressPathDTOList, service =>
          ({
            id: service.serviceId,
            name: service.serviceName,
            serviceStatus: service.serviceStatus,
          }));
        axios.get(`/devops/v1/project/${projectId}/service?envId=${res.envId}`)
          .then((datass) => {
            const ress = this.handleProptError(datass);
            if (ress) {
              let resss = ress;
              serviseDto.map((s, index) => {
                if (s.serviceStatus !== 'running') {
                  resss = resss.concat(serviseDto[index]);
                }
                // window.console.log(resss);
                this.setNetwork(resss);
                return ress;
              });
            }
          });
        // this.setNetwork(serviseDto);
        // this.loadNetwork(projectId, data.envId);
        return data;
      }
      return res;
    });

  loadEnv = projectId =>
    axios.get(`devops/v1/project/${projectId}/envs?active=true`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setEnv(data);
        }
        // this.loadNetwork(projectId, data.id);
      });


  checkName = (projectId, envId, value) =>
    axios.get(`/devops/v1/project/${projectId}/ingress/check_name?name=${envId}&envId=${value}`).then((datas) => {
      const res = this.handleProptError(datas);
      return res;
    });

  checkPath =(projectId, domain, value) =>
    axios.get(`/devops/v1/project/${projectId}/ingress/check_domain?domain=${domain}&path=${value}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  updateData = (projectId, id, data) =>
    axios.put(`/devops/v1/project/${projectId}/ingress/${id}`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  addData = (projectId, data) =>
    axios.post(`/devops/v1/project/${projectId}/ingress`, JSON.stringify(data))
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  deleteData = (projectId, id) =>
    axios.delete(`/devops/v1/project/${projectId}/ingress/${id}`)
      .then((datas) => {
        const res = this.handleProptError(datas);
        return res;
      });

  loadNetwork = (projectId, envId) =>
    axios.get(`/devops/v1/project/${projectId}/service?envId=${envId}`)
      .then((data) => {
        const res = this.handleProptError(data);
        if (res) {
          this.setNetwork(data);
        }
      });

  handleProptError =(error) => {
    if (error && error.failed) {
      Choerodon.prompt(error.message);
      return false;
    } else {
      return error;
    }
  }
}

const domainStore = new DomainStore();
export default domainStore;
// autorun(() => {
//   window.console.log(templateStore.allData.length);
//   whyRun();
// });
