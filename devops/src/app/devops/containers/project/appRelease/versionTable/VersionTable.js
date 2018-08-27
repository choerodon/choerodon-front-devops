import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Modal } from 'choerodon-ui';
import { stores, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
import '../AppRelease.scss';

const Sidebar = Modal.Sidebar;
const { AppState } = stores;
@observer
class VersionTable extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      projectId: menu.id,
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
    const data = store.getVersionData;
    const columns = [{
      title: <FormattedMessage id="deploy.ver" />,
      dataIndex: 'version',
    }, {
      title: <FormattedMessage id="app.createTime" />,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys || [],
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows, selectedRowKeys });
      },
    };
    return (<Table
      filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
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
    const page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
      // page = 0;
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
    const contentDom = (<Content className="c7n-region version-wrapper sidebar-content" code="release.addVersion" values={{ name: store.app && store.app.name }}>
      {this.getSidebarTable()}
    </Content>);
    return (
      <Sidebar
        okText={this.props.intl.formatMessage({ id: 'release.addVersion.btn.confirm' })}
        cancelText={this.props.intl.formatMessage({ id: 'cancel' })}
        visible={this.props.show}
        title={<FormattedMessage id="release.addVersion.header.title" />}
        onCancel={this.handleClose}
        onOk={this.handleAddVersion}
      >
        {contentDom}
      </Sidebar>
    );
  }
}

export default withRouter(injectIntl(VersionTable));
