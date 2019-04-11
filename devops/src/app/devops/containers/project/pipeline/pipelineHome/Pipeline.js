import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Button, Modal, Spin, Tooltip } from 'choerodon-ui';
import { Permission, Content, Header, Page, Action } from 'choerodon-front-boot';
import _ from 'lodash';
import StatusTags from '../../../../components/StatusTags';
import TimePopover from '../../../../components/timePopover';
import UserInfo from '../../../../components/userInfo';
import { handleCheckerProptError } from '../../../../utils';
import { SORTER_MAP } from '../../../../common/Constants';

import './Pipeline.scss';

@injectIntl
@withRouter
@inject('AppState')
@observer
export default class Pipeline extends Component {
  constructor(props) {
    super(props);
    this.state = {
      param: '',
      filters: {},
      sorter: {
        columnKey: 'id',
        order: 'descend',
      },
      showDelete: false,
      deleteName: '',
      deleteId: null,
      deleteLoading: false,
      showInvalid: false,
      invalidName: '',
      invalidId: null,
      invalidLoading: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  handleRefresh = (e, page) => {
    const { PipelineStore } = this.props;
    const { current, pageSize } = PipelineStore.getPageInfo;
    const { param, filters, sorter } = this.state;

    const currentPage = (page || page === 0) ? page : current - 1;
    const sort = { field: 'id', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      sort.order = SORTER_MAP[sorter.order];
    }

    const postData = {
      searchParam: filters,
      param: param.toString(),
    };

    this.loadData(currentPage, pageSize, sort, postData);
  };

  linkToChange = (url) => {
    const {
      history,
      AppState: {
        currentMenuType: {
          name,
          type,
          id: projectId,
          organizationId,
        },
      },
    } = this.props;
    const search = `?type=${type}&id=${projectId}&name=${encodeURIComponent(
      name,
    )}&organizationId=${organizationId}`;
    let _url = url;
    if (typeof _url === 'object') {
      _url = { ...url, search };
    } else {
      _url += search;
    }
    history.push(_url);
  };

  tableChange = (pagination, filters, sorter, param) => {
    const page = pagination.current - 1;
    const pageSize = pagination.pageSize;
    const sort = { field: 'id', order: 'desc' };
    const postData = {
      searchParam: filters,
      param: param.toString(),
    };

    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      sort.order = SORTER_MAP[sorter.order];
    }

    this.setState({ param, filters, sorter });
    this.loadData(page, pageSize, sort, postData);
  };

  loadData = (page = 0, size = 10, sort = { field: 'id', order: 'desc' }, filter = { searchParam: {}, param: '' }) => {
    const {
      PipelineStore, AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
    } = this.props;
    PipelineStore.loadListData(projectId, page, size, sort, filter);
  };

  handleCreateClick = () => {
    const { match } = this.props;
    this.linkToChange(`${match.url}/create`);
  };

  openRemove(id, name) {
    this.setState({
      showDelete: true,
      deleteName: name,
      deleteId: id,
    });
  }

  closeRemove = () => {
    this.setState({ deleteId: null, deleteName: '', showDelete: false });
  };

  handleDelete = async () => {
    const {
      PipelineStore,
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;
    const { deleteId } = this.state;
    this.setState({ deleteLoading: true });
    const response = await PipelineStore.deletePipelie(projectId, deleteId).catch(e => {
      this.setState({ deleteLoading: false });
      Choerodon.handleResponseError(e);
    });
    const result = handleCheckerProptError(response);
    if (result) {
      this.closeRemove();
      this.handleRefresh(null, 0);
    }
    this.setState({ deleteLoading: false });
  };

  renderStatus = (record) => {
    const { intl: { formatMessage } } = this.props;
    return <StatusTags
      name={formatMessage({ id: record ? 'active' : 'stop' })}
      color={record ? '#00bfa5' : '#cecece'}
    />;
  };

  actionFun = () => {

  };

  makeStatusInvalid = async () => {
    const {
      PipelineStore,
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;

    const { invalidId } = this.state;

    this.setState({ invalidLoading: true });
    const response = await PipelineStore.changeStatus(projectId, invalidId);
    //   .catch(e => {
    //   this.setState({ invalidLoading: false });
    //   Choerodon.handleResponseError(e);
    // });
    const result = handleCheckerProptError(response);
    if (result) {
      this.closeInvalid();
      this.handleRefresh(null, 0);
    }
    this.setState({ invalidLoading: false });
  };

  makeStatusActive(id) {
    const {
      PipelineStore,
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;
    // PipelineStore.changeStatus(projectId, id).catch(e => Choerodon.handleResponseError(e));
    PipelineStore.changeStatus(projectId, id);
  }

  openInvalid(id, name) {
    this.setState({
      showInvalid: true,
      invalidId: id,
      invalidName: name,
    });
  };

  closeInvalid = () => {
    this.setState({
      showInvalid: false,
      invalidId: null,
      invalidName: '',
    });
  };

  /**
   * 跳转到详情页面
   */
  linkToDetail(data) {
    this.linkToChange({
      pathname: `/devops/pipeline-detail`,
      state: { name: data },
    });
  };

  renderAction = (record) => {
    const {
      intl: { formatMessage },
      AppState: {
        currentMenuType: {
          type,
          id: projectId,
          organizationId,
        },
      },
    } = this.props;
    const { id, name, isEnabled, triggerType } = record;

    const _filterItem = (collection, predicate) => _.filter(collection, item => item !== predicate);

    let action = {
      detail: {
        service: ['devops-service.devops-project-config.pageByOptions'],
        text: formatMessage({ id: 'pipeline.action.detail' }),
        action: this.linkToDetail.bind(this, name),
      },
      execute: {
        service: ['devops-service.devops-project-config.pageByOptions'],
        text: formatMessage({ id: 'pipeline.action.run' }),
        action: this.actionFun.bind(this, record),
      },
      edit: {
        service: ['devops-service.devops-project-config.pageByOptions'],
        text: formatMessage({ id: 'edit' }),
        action: this.actionFun.bind(this, record),
      },
      disabled: {
        service: ['devops-service.devops-project-config.pageByOptions'],
        text: formatMessage({ id: 'stop' }),
        action: this.openInvalid.bind(this, id, name),
      },
      enable: {
        service: ['devops-service.devops-project-config.pageByOptions'],
        text: formatMessage({ id: 'active' }),
        action: this.makeStatusActive.bind(this, id),
      },
      remove: {
        service: ['devops-service.devops-project-config.pageByOptions'],
        text: formatMessage({ id: 'delete' }),
        action: this.openRemove.bind(this, id, name),
      },
    };

    let actionItem = _.keys(action);
    if (isEnabled) {
      actionItem = _filterItem(actionItem, 'enable');
    } else {
      actionItem = _filterItem(actionItem, 'disabled');
    }

    if (triggerType === 'auto') {
      actionItem = _filterItem(actionItem, 'execute');
    }

    return (<Action data={_.map(actionItem, item => ({ ...action[item] }))} />);
  };

  get getColumns() {
    const { filters, sorter: { columnKey, order } } = this.state;

    return [{
      title: <FormattedMessage id="status" />,
      key: 'isEnabled',
      dataIndex: 'isEnabled',
      sorter: true,
      sortOrder: columnKey === 'isEnabled' && order,
      filters: [],
      filteredValue: filters.isEnabled || [],
      render: this.renderStatus,
    }, {
      title: <FormattedMessage id="pipeline.trigger" />,
      key: 'triggerType',
      dataIndex: 'triggerType',
      sorter: true,
      sortOrder: columnKey === 'triggerType' && order,
      filters: [],
      filteredValue: filters.triggerType || [],
      render: _renderTrigger,
    }, {
      title: <FormattedMessage id="name" />,
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="creator" />,
      key: 'createUserRealName',
      sorter: true,
      sortOrder: columnKey === 'createUserRealName' && order,
      filters: [],
      filteredValue: filters.createUserRealName || [],
      render: _renderUser,
    }, {
      title: <FormattedMessage id="updateDate" />,
      key: 'lastUpdateDate',
      dataIndex: 'lastUpdateDate',
      sorter: true,
      sortOrder: columnKey === 'lastUpdateDate' && order,
      render: _renderDate,
    }, {
      key: 'action',
      align: 'right',
      width: 60,
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
      PipelineStore: {
        getListData,
        getPageInfo,
        getLoading,
      },
    } = this.props;
    const {
      param,
      showDelete,
      deleteName,
      deleteLoading,
      showInvalid,
      invalidName,
      invalidLoading,
    } = this.state;

    return (<Page
      className="c7n-region"
      service={[
        'devops-service.devops-project-config.pageByOptions',
      ]}
    >
      <Header title={<FormattedMessage id="pipeline.head" />}>

        <Permission
          service={['devops-service.devops-project-config.create']}
          type={type}
          projectId={projectId}
          organizationId={organizationId}
        >
          <Button
            funcType="flat"
            icon="playlist_add"
            onClick={this.handleCreateClick}
          >
            <FormattedMessage id="pipeline.header.create" />
          </Button>
        </Permission>
        <Button
          icon='refresh'
          onClick={this.handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Content code="pipeline" values={{ name }}>
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
        title={`${formatMessage({ id: 'pipeline.delete' })}“${deleteName}”`}
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
          <FormattedMessage id="pipeline.delete.message" />
        </div>
      </Modal>)}
      {showInvalid && (<Modal
        visible={showInvalid}
        title={`${formatMessage({ id: 'pipeline.invalid' })}“${invalidName}”`}
        closable={false}
        footer={[
          <Button key="back" onClick={this.closeInvalid} disabled={invalidLoading}>
            <FormattedMessage id="cancel" />
          </Button>,
          <Button
            key="submit"
            type="danger"
            onClick={this.makeStatusInvalid}
            loading={invalidLoading}
          >
            <FormattedMessage id="submit" />
          </Button>,
        ]}
      >
        <div className="c7n-padding-top_8">
          <FormattedMessage id="pipeline.invalid.message" />
        </div>
      </Modal>)}
    </Page>);
  }
}

function _renderTrigger(data) {
  return <FormattedMessage id={`pipeline.trigger.${data}`} />;
}

function _renderDate(record) {
  return <TimePopover content={record} />;
}

function _renderUser({ createUserRealName, createUserName, createUserUrl }) {
  return <UserInfo avatar={createUserUrl} name={createUserRealName} id={createUserName} />;
}
