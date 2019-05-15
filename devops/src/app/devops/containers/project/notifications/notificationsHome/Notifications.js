/**
 * @author ale0720@163.com
 * @date 2019-05-13 13:23
 */
import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import {
  Permission,
  Content,
  Header,
  Page,
} from 'choerodon-front-boot';
import { Table, Button, Modal, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import NotificationSidebar from '../notificationSidebar';
import { handleCheckerProptError } from '../../../../utils';

@injectIntl
@withRouter
@inject('AppState')
@observer
export default class Notifications extends Component {
  state = {
    page: 0,
    pageSize: NaN,
    param: '',
    filters: {},
    sorter: null,
    showSidebar: false,
    sidebarType: 'create',
    editId: undefined,
    showDelete: false,
    deleteName: '',
    deleteId: undefined,
  };

  componentDidMount() {
    this.loadData();
  }

  tableChange = ({ current, pageSize }, filters, sorter, param) => {
    const {
      NotificationsStore,
      AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
    } = this.props;

    const realSorter = _.isEmpty(sorter) ? null : sorter;

    this.setState({
      page: current - 1,
      pageSize,
      param,
      filters,
      sorter: realSorter,
    });

    NotificationsStore.loadListData(
      projectId,
      current - 1,
      pageSize,
      realSorter,
      {
        searchParam: filters,
        param: param.toString(),
      },
    );
  };

  openCreate = () => {
    this.setState({
      showSidebar: true,
    });
  };

  openEdit(id) {
    this.setState({
      showSidebar: true,
      sidebarType: 'edit',
      editId: id,
    });
  };

  closeSidebar = () => {
    this.setState({
      showSidebar: false,
      sidebarType: 'create',
    });
  };

  handleRefresh = (e, page) => {
    this.loadData(page);
  };

  openRemove(id, name) {
    this.setState({
      showDelete: true,
      deleteName: name,
      deleteId: id,
    });
  }

  closeRemove = () => {
    this.setState({
      deleteId: undefined,
      deleteName: '',
      showDelete: false,
    });
  };

  handleDelete = async () => {
    const {
      NotificationsStore,
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;
    const { deleteId } = this.state;

    this.setState({ deleteLoading: true });

    const response = await NotificationsStore.deletePipeline(projectId, deleteId)
      .catch(e => {
        this.setState({ deleteLoading: false });
        Choerodon.handleResponseError(e);
      });

    if (handleCheckerProptError(response)) {
      this.closeRemove();
      this.handleRefresh(null, 0);
    }

    this.setState({ deleteLoading: false });
  };

  loadData(toPage) {
    const {
      NotificationsStore,
      AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
    } = this.props;
    const { page, pageSize, param, filters, sorter } = this.state;
    const currentPage = (toPage || toPage === 0) ? toPage : page;
    const {
      getPageInfo: {
        pageSize: storePageSize,
      },
    } = NotificationsStore;

    NotificationsStore.loadListData(
      projectId,
      currentPage,
      pageSize || storePageSize,
      sorter,
      {
        searchParam: filters,
        param: param.toString(),
      },
    );
  }

  renderAction = ({ id, name }) => {
    const {
      AppState: {
        currentMenuType: {
          type,
          id: projectId,
          organizationId,
        },
      },
    } = this.props;
    return <Permission
      service={[]}
      type={type}
      projectId={projectId}
      organizationId={organizationId}
    >
      <Tooltip
        trigger="hover"
        placement="bottom"
        title={<FormattedMessage id="edit" />}
      >
        <Button
          shape="circle"
          size="small"
          funcType="flat"
          icon="mode_edit"
          onClick={this.openEdit.bind(this, id)}
        />
      </Tooltip>
      <Tooltip
        trigger="hover"
        placement="bottom"
        title={<FormattedMessage id="delete" />}
      >
        <Button
          shape="circle"
          size="small"
          funcType="flat"
          icon="delete_forever"
          onClick={this.openRemove.bind(this, id, name)}
        />
      </Tooltip>
    </Permission>;
  };

  get getColumns() {
    const { filters, sorter } = this.state;
    const { columnKey, order } = sorter || {};

    return [{
      title: <FormattedMessage id="environment" />,
      key: 'isEnabled',
      dataIndex: 'isEnabled',
      sorter: true,
      sortOrder: columnKey === 'isEnabled' && order,
      filters: [],
      filteredValue: filters.isEnabled || [],
    }, {
      title: <FormattedMessage id="notification.event" />,
      key: 'triggerType',
      dataIndex: 'triggerType',
      sorter: true,
      sortOrder: columnKey === 'triggerType' && order,
      filters: [],
      filteredValue: filters.triggerType || [],
    }, {
      title: <FormattedMessage id="notification.method" />,
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="notification.target" />,
      key: 'lastUpdateDate',
      dataIndex: 'lastUpdateDate',
      sorter: true,
      sortOrder: columnKey === 'lastUpdateDate' && order,
    }, {
      key: 'action',
      align: 'right',
      width: 88,
      render: this.renderAction,
    }];
  };

  render() {
    const {
      AppState: {
        currentMenuType: {
          name,
          type,
          id: projectId,
          organizationId,
        },
      },
      intl: { formatMessage },
      NotificationsStore,
    } = this.props;
    const {
      getLoading,
      getPageInfo,
      getListData,
    } = NotificationsStore;
    const {
      param,
      showDelete,
      deleteLoading,
      deleteName,
      showSidebar,
      sidebarType,
      editId,
    } = this.state;

    return (
      <Page service={[]}>
        <Header title={<FormattedMessage id="notification.header.title" />}>
          <Permission
            service={[]}
            type={type}
            projectId={projectId}
            organizationId={organizationId}
          >
            <Button
              funcType="flat"
              icon="playlist_add"
              onClick={this.openCreate}
            >
              <FormattedMessage id="notification.header.create" />
            </Button>
          </Permission>
          <Button
            icon='refresh'
            onClick={this.handleRefresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="notification" values={{ name }}>
          <Table
            filterBarPlaceholder={formatMessage({ id: 'filter' })}
            loading={getLoading}
            filters={param || []}
            onChange={this.tableChange}
            columns={this.getColumns}
            pagination={getPageInfo}
            dataSource={getListData}
            rowKey={record => record.id}
          />
        </Content>
        {showDelete && (<Modal
          visible={showDelete}
          title={`${formatMessage({ id: 'notification.delete' })}“${deleteName}”`}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove} disabled={deleteLoading}>
              <FormattedMessage id="cancel" />
            </Button>,
            <Button
              key="submit"
              type="danger"
              onClick={this.handleDelete}
              loading={deleteLoading}
            >
              <FormattedMessage id="delete" />
            </Button>,
          ]}
        >
          <div className="c7n-padding-top_8">
            <FormattedMessage id="notification.delete.message" />
          </div>
        </Modal>)}
        {showSidebar && <NotificationSidebar
          type={sidebarType}
          visible={showSidebar}
          id={editId}
          store={NotificationsStore}
          onClose={this.closeSidebar}
        />}
      </Page>
    );
  }
}
