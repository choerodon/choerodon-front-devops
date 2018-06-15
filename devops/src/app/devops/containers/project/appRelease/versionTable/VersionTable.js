import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Modal } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import _ from 'lodash';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
import './../AppRelease.scss';

const Sidebar = Modal.Sidebar;
const { AppState } = stores;
@observer
class VersionTable extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      id: props.match.params.id || '',
      projectId: menu.id,
      show: false,
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const { projectId } = this.state;
    const app = this.props.store.app;
    this.handleSelectData();
    this.props.store.loadAllVersion({ projectId, appId: app.id });
  }


  /**
   * 获取未发布版本
   * @returns {*}
   */
  getSidebarTable =() => {
    const { store } = this.props;
    const data = store.getVersionData || [{
      id: 1,
      appName: 'ssd',
      creationDate: '2018-05-22 11:19:41',
    }, {
      id: 2,
      appName: 'ssdeee',
      creationDate: '2018-05-22 11:19:41',
    }];
    const columns = [{
      title: '版本',
      dataIndex: 'version',
    }, {
      title: '生成时间',
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys || [],
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows, selectedRowKeys });
      },
    };
    return (<Table
      filterBarPlaceholder={'过滤表'}
      className="c7n-table-512"
      loading={store.loading}
      pagination={store.versionPage}
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      rowKey={record => record.id}
      onChange={this.versionTableChange}
    />);
  };
  /**
   * table app表格搜索
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  versionTableChange =(pagination, filters, sorter, paras) => {
    const { store } = this.props;
    const app = store.app;
    const menu = AppState.currentMenuType;
    const organizationId = menu.id;
    const sort = { field: 'id', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      // sort = sorter;
      if (sorter.order === 'ascend') {
        sort.order = 'asc';
      } else if (sorter.order === 'descend') {
        sort.order = 'desc';
      }
    }
    let searchParam = {};
    let page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
      page = 0;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    store
      .loadAllVersion({
        projectId: organizationId,
        sorter: sort,
        postData,
        appId: app.id,
        page,
        size: pagination.pageSize,
      });
  };
  handleSelectData =() => {
    const selectData = _.map(this.props.store.selectData, 'id') || [];
    this.setState({ selectedRowKeys: selectData });
  }
  /**
   * 关闭弹框
   */
  handleClose = () => {
    this.props.store.changeShow(false);
  }
  /**
   * 切换tabs
   * @param value
   */
  changeTabs = (value) => {
    this.setState({ key: value });
    this.props.store
      .loadAllVersion({ projectId: this.state.projectId, appId: this.props.appId, key: value });
  }
  /**
   * 添加版本
   */
  handleAddVersion = () => {
    const { selectedRows } = this.state;
    if (selectedRows && selectedRows.length) {
      this.props.store.setSelectData(selectedRows);
    }
    this.props.store.changeShow(false);
  };

  render() {
    const { store } = this.props;
    const menu = AppState.currentMenuType;
    const content = '您可以在此勾选并添加需要发布的版本。';
    const contentDom = (<div className="c7n-region version-wrapper">
      <h2 className="c7n-space-first">添加应用&quot;{store.app && store.app.name}&quot;发布的版本</h2>
      <p>
        {content}
        <a
          href="http://v0-6.choerodon.io/zh/docs/user-guide/development-pipeline/application-release/"
          rel="nofollow me noopener noreferrer"
          target="_blank"
          className="c7n-external-link"
        >
          <span className="c7n-external-link-content">
              了解详情
          </span>
          <span className="icon icon-open_in_new" />
        </a>
      </p>
      {this.getSidebarTable()}
    </div>);
    return (
      <Sidebar
        okText="添加"
        cancelText="取消"
        visible={this.props.show}
        title="添加应用版本"
        onCancel={this.handleClose}
        onOk={this.handleAddVersion}
      >
        {contentDom}
      </Sidebar>
    );
  }
}

export default withRouter(VersionTable);
