import React from 'react';
import { stores } from 'choerodon-front-boot';
import EnvOverviewStore from "../stores/project/envOverview";

const { AppState } = stores;

/*eslint-disable*/
export const commonComponent =(storeName) => {

  return component => class extends component {

    static displayName = 'commonComponent';

    /***
     * 加载table数据
     */
    loadAllData = (envId, isRefresh = false) => {
      const store = this.props[storeName];
      const { id } = AppState.currentMenuType;
      store.loadData(isRefresh, id, envId);
    };

    /**
     * 打开删除数据模态框
     * @param id
     */
    openRemove =(id, name) => this.setState({ openRemove: true, id, name });

    /***
     * 删除数据
     */
    handleDelete = () => {
      const store = this.props[storeName];
      store.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
      const { id } = this.state;
      const { id: projectId } = AppState.currentMenuType;
      const lastDatas = store.getPageInfo.total % 10;
      const page = store.getPageInfo.current;
      const totalPage = Math.ceil(store.getPageInfo.total / store.getPageInfo.pageSize);
      this.setState({ submitting: true });
      const envId = EnvOverviewStore.getTpEnvId;
      store.deleteData(projectId, id).then((data) => {
        this.setState({ submitting: false });
        if (data) {
          if (lastDatas === 1 && page === totalPage) {
            this.loadAllData(envId, false, store.getPageInfo.current - 2);
          } else {
            this.loadAllData(envId, false, store.getPageInfo.current - 1);
          }
        }
        this.closeRemove();
      }).catch((error) => {
        this.setState({ submitting: false });
        Choerodon.handleResponseError(error);
      });
    };


    /***
     * 关闭删除数据的模态框
     */

    closeRemove = () => this.setState({ openRemove: false });

    /***
     * 处理刷新函数
     */
    handleRefresh = () => {
      const store = this.props[storeName];
      const { filters, sort, paras } = store.getInfo;
      const pagination = store.getPageInfo;
      this.tableChange(pagination, filters, sort, paras);
    };

    /***
     * 处理页面跳转
     * @param url 跳转地址
     */
    linkToChange = (url) => {
      const { history } = this.props;
      history.push(url);
    };

    /**
     * table 操作
     * @param pagination
     * @param filters
     * @param sorter
     * @param paras
     */
    tableChange =(pagination, filters, sorter, paras) => {
      const store = this.props[storeName];
      const { id } = AppState.currentMenuType;
      const envId = EnvOverviewStore.getTpEnvId;
      store.setInfo({ filters, sort: sorter, paras });
      let sort = { field: '', order: 'desc' };
      if (sorter.column) {
        sort.field = sorter.field || sorter.columnKey;
        if(sorter.order === 'ascend') {
          sort.order = 'asc';
        } else if(sorter.order === 'descend'){
          sort.order = 'desc';
        }
      }
      let searchParam = {};
      let page = pagination.current - 1;
      if (Object.keys(filters).length) {
        searchParam = filters;
      }
      const postData = {
        searchParam,
        param: paras.toString(),
      };
      store
        .loadData(false, id, envId, page, pagination.pageSize, sort, postData);
    };

    /**
     * 获取屏幕的高度
     * @returns {number}
     */
    getHeight = () => {
      const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      let height = 310;
      if (HEIGHT <= 800) {
        height = 310;
      } else if (HEIGHT > 800 && HEIGHT <= 900) {
        height = 450;
      } else if (HEIGHT > 900 && HEIGHT <= 1050) {
        height = 600;
      } else {
        height = 630;
      }
      return height;
    };

    handleProptError =(error) => {
      if(error && error.failed) {
        Choerodon.prompt(error.message);
        return false;
      } else {
        return error;
      }
    }

  }
};
