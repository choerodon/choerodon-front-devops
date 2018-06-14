import React from 'react';
import { stores } from 'choerodon-front-boot';

const { AppState } = stores;

/*eslint-disable*/
export const commonComponent =(storeName) => {

  return component => class extends component {

    static displayName = 'commonComponent';

    /***
     * 加载table数据
     */
    loadAllData = (isRefresh = false) => {
      const store = this.props[storeName];
      const menu = AppState.currentMenuType;
      const organizationId = menu.id;
      store.loadData(isRefresh,organizationId)};

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
      const menu = AppState.currentMenuType;
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
      this.loadAllData(true);
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
      const menu = AppState.currentMenuType;
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
      let page = pagination.current - 1;
      // if (Object.keys(filters).length) {
      //   searchParam = filters;
      //   page = 0;
      // }
      const postData = {
        searchParam,
        param: paras.toString(),
      };
      store
        .loadData(false, organizationId, page, pagination.pageSize, sort, postData);
    };
    /**
     * 获取屏幕的高度
     * @returns {number}
     */
    getHeight = () => {
      const screenHeight = window.screen.height;
      let height = 310;
      if (screenHeight <= 800) {
        height = 310;
      } else if (screenHeight > 800 && screenHeight <= 900) {
        height = 450;
      } else if (screenHeight > 900 && screenHeight <= 1050) {
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
