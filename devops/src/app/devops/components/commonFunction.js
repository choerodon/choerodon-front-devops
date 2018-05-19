/**
 *create by mading on 2018/3/15
 */

import React, { Component } from 'react';
import { Modal } from 'choerodon-ui';
import NewButton from 'NewButton';

/*eslint-disable*/
export const commonComponent =(storeName) => {
  // console.log(storeName);

  return component => class extends component {

    // 2

    static displayName = 'commonComponent';

    /***
     * 加载table数据
     */
    loadAllData = (isRefresh = false, page = 0) => {
      const store = this.props[storeName];
      const menu = this.props.AppState.currentMenuType;
      const organizationId = menu.id;
      store.loadData(isRefresh,organizationId, page)};

    /**
     * 打开删除数据模态框
     * @param id
     */
    openRemove =(id) => {
      this.setState({ openRemove: true, id });
    };

    /***
     * 删除数据
     */
    handleDelete = () => {
      const store = this.props[storeName];
      const { id } = this.state;
      const menu = this.props.AppState.currentMenuType;
      const organizationId = menu.id;
      const lastDatas = store.getPageInfo.total % 10;
      const page = store.getPageInfo.current;
      const totalPage = Math.ceil(store.getPageInfo.total / store.getPageInfo.pageSize);
      store.deleteData(organizationId, id).then((data) => {
        if (data) {
          if (lastDatas === 1 && page === totalPage) {
            this.loadAllData(false, store.getPageInfo.current - 2);
          } else {
            this.loadAllData(false, store.getPageInfo.current - 1);
          }
          this.closeRemove();
        }
      }).catch((error) => {
        Choerodon.handleResponseError(error);
      });
    };


    /***
     * 关闭删除数据的模态框
     */

    closeRemove = () => {
      this.setState({ openRemove: false });
    };

    /***
     * 处理刷新函数
     */
    handleRefresh = () => {
      const store = this.props[storeName];
      this.loadAllData(true, store.getPageInfo.current - 1);
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
     * table 改变的函数
     * @param pagination 分页
     * @param filters 过滤
     * @param sorter 排序
     */
    tableChange =(pagination, filters, sorter, paras) => {
      const store = this.props[storeName];
      const menu = this.props.AppState.currentMenuType;
      const organizationId = menu.id;
      let sort = {field: 'id', order: 'desc' };
      if (sorter.column) {
        sort.field = sorter.field || sorter.columnKey;
        // sort = sorter;
        if(sorter.order === 'ascend') {
          sort.order = 'asc';
        } else if(sorter.order === 'descend'){
          sort.order = 'desc';
        }
      }
      let searchParam = {};
      if (Object.keys(filters).length) {
        searchParam = filters;
      }
      const postData = {
        searchParam,
        param: paras.toString(),
      };
      store
        .loadData(false, organizationId, pagination.current - 1, pagination.pageSize, sort, postData);
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
