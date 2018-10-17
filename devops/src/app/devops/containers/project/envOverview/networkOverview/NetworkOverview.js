/* eslint-disable react/sort-comp */
import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Button, Form, Tooltip, Modal, Progress, Popover, Icon } from 'choerodon-ui';
import { Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import '../EnvOverview.scss';
import '../../../main.scss';
import '../../networkConfig/networkHome/NetworkHome.scss';
import NetworkConfigStore from '../../../../stores/project/networkConfig';
import EditNetwork from '../../networkConfig/editNetwork';
import StatusIcon from '../../../../components/StatusIcon';

const { AppState } = stores;

@observer
class NetworkOverview extends Component {
  @observable openRemove = false;

  @observable showEdit = false;

  @observable submitting = false;

  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  /**
   * 打开编辑的操作框
   * @param id
   */
  @action
  editNetwork = (id) => {
    NetworkConfigStore.setApp([]);
    NetworkConfigStore.setEnv([]);
    NetworkConfigStore.setIst([]);
    this.showEdit = true;
    this.id = id;
  };

  /**
   * 删除数据
   */
  @action
  handleDelete = () => {
    const { store, envId } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const lastDatas = store.getPageInfo.total % 10;
    const page = store.getPageInfo.current;
    const totalPage = Math.ceil(store.getPageInfo.total / store.getPageInfo.pageSize);
    this.submitting = true;
    NetworkConfigStore.deleteData(projectId, this.id).then(() => {
      this.submitting = false;
      if (lastDatas === 1 && page === totalPage) {
        store.loadNetwork(projectId, envId, store.getPageInfo.current - 2);
      } else {
        store.loadNetwork(projectId, envId, store.getPageInfo.current - 1);
      }
      this.closeRemove();
    }).catch((error) => {
      this.submitting = false;
      Choerodon.handleResponseError(error);
    });
    store.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
  };

  /**
   * 按环境加载网络
   * @param envId
   */
  loadNetwork = (envId) => {
    const { store } = this.props;
    const projectId = AppState.currentMenuType.id;
    store.loadNetwork(projectId, envId);
  };

  /**
   * 关闭删除数据的模态框
   */
  @action
  closeRemove = () => {
    this.openRemove = false;
  };

  /**
   * 关闭侧边栏
   */
  @action
  handleCancelFun = (isload) => {
    this.showEdit = false;
    if (isload) {
      this.loadNetwork(this.props.envId);
      const { store } = this.props;
      store.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
    }
  };

  /**
   * 打开删除网络弹框
   * @param id
   */
  @action
  openRemoveModal = (id) => {
    this.openRemove = true;
    this.id = id;
  };

  /**
   * 配置类型 列
   * @param record
   * @returns {Array}
   */
  configColumn = (record) => {
    const { config, type } = record;
    const { externalIps, ports } = config;
    const iPArr = [];
    const portArr = [];
    if (externalIps && externalIps.length) {
      _.forEach(externalIps, item => iPArr.push(<div key={item} className="network-config-item">{item}</div>));
    }
    if (ports && ports.length) {
      _.forEach(ports, (item) => {
        const { nodePort, port, targetPort } = item;
        portArr.push(<div key={port} className="network-config-item">{nodePort} {port} {targetPort}</div>);
      });
    }
    const content = (type === 'ClusterIP') ? (<Fragment>
      <div className="network-config-wrap">
        <div className="network-type-title"><FormattedMessage id="network.column.ip" /></div>
        <div>{externalIps ? iPArr : '-'}</div>
      </div>
      <div className="network-config-wrap">
        <div className="network-type-title"><FormattedMessage id="network.column.port" /></div>
        <div>{portArr}</div>
      </div>
    </Fragment>) : (<Fragment>
      <div className="network-config-item"><FormattedMessage id="network.node.port" /></div>
      <div>{portArr}</div>
    </Fragment>);
    return (<div className="network-column-config">
      <span className="network-config-type">{type}</span>
      <Popover
        arrowPointAtCenter
        placement="bottomRight"
        getPopupContainer={triggerNode => triggerNode.parentNode}
        content={content}
      >
        <Icon type="expand_more" className="network-expend-icon" />
      </Popover>
    </div>);
  };

  /**
   * 生成 目标对象 列
   * @param record
   * @returns {Array}
   */
  targetColumn = (record) => {
    const { appInstance, labels } = record.target;
    const node = [];
    if (appInstance && appInstance.length) {
      _.forEach(appInstance, (item) => {
        const { id, code, instanceStatus } = item;
        const statusStyle = (instanceStatus !== 'operating' && instanceStatus !== 'running')
          ? 'c7n-network-status-failed' : '';
        if (code) {
          node.push(<div
            className={`network-column-instance ${statusStyle}`}
            key={id}
          >
            <Tooltip
              title={instanceStatus ? <FormattedMessage id={instanceStatus} /> : <FormattedMessage id="network.ist.deleted" />}
              placement="top"
            >{code}</Tooltip>
          </div>);
        }
      });
    }
    if (!_.isEmpty(labels)) {
      _.forEach(labels, (value, key) => node.push(<div className="network-column-entry" key={key}>
        <span>{key}</span>
        =
        <span>{value}</span>
      </div>));
    }
    return (<div className="network-column-target">
      {node[0] || null}
      {node.length > 1 && (<Popover
        arrowPointAtCenter
        placement="bottomRight"
        getPopupContainer={triggerNode => triggerNode.parentNode}
        content={<Fragment>
          {node}
        </Fragment>}
      >
        <Icon type="expand_more" className="network-expend-icon" />
      </Popover>)}
    </div>);
  };

  /**
   * 操作 列
   * @param record
   * @param type
   * @param projectId
   * @param orgId
   * @returns {*}
   */
  opColumn = (record, type, projectId, orgId) => {
    const { status, envStatus, id } = record;
    let editDom = null;
    let deleteDom = null;
    if (status !== 'operating' && envStatus) {
      editDom = (<Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="edit" />}>
        <Button shape="circle" size="small" funcType="flat" onClick={this.editNetwork.bind(this, id)}>
          <i className="icon icon-mode_edit" />
        </Button>
      </Tooltip>);
      deleteDom = (<Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="delete" />}>
        <Button shape="circle" size="small" funcType="flat" onClick={this.openRemoveModal.bind(this, id)}>
          <i className="icon icon-delete_forever" />
        </Button>
      </Tooltip>);
    } else {
      editDom = (<i className="icon icon-mode_edit c7n-app-icon-disabled" />);
      deleteDom = (<i className="icon icon-delete_forever c7n-app-icon-disabled" />);
    }
    return (<Fragment>
      <Permission
        service={['devops-service.devops-service.update']}
        type={type}
        projectId={projectId}
        organizationId={orgId}
      >
        {editDom}
      </Permission>
      <Permission
        service={['devops-service.devops-service.delete']}
        type={type}
        projectId={projectId}
        organizationId={orgId}
      >
        {deleteDom}
      </Permission>
    </Fragment>);
  };

  /**
   * table 操作
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange =(pagination, filters, sorter, paras) => {
    const { store, envId } = this.props;
    const { id } = AppState.currentMenuType;
    const sort = { field: '', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
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
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    store.setInfo({ filters, sort: sorter, paras });
    store.loadNetwork(id, envId, page, pagination.pageSize, sort, postData);
  };

  render() {
    const { store, intl } = this.props;
    const data = store.getNetwork;
    const { filters, sort: { columnKey, order }, paras } = store.getInfo;
    const { type, id: projectId, organizationId: orgId } = AppState.currentMenuType;

    const columns = [{
      title: <FormattedMessage id="network.column.name" />,
      key: 'name',
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filters: [],
      filteredValue: filters.name || [],
      render: record => <StatusIcon
        name={record.name}
        status={record.commandStatus || ''}
        error={record.error || ''}
      />,
    }, {
      title: <FormattedMessage id="network.target" />,
      key: 'target',
      render: record => this.targetColumn(record),
    }, {
      title: <FormattedMessage id="network.config.column" />,
      key: 'type',
      render: record => this.configColumn(record),
    }, {
      width: '82px',
      key: 'action',
      render: record => this.opColumn(record, type, projectId, orgId),
    }];

    return (<div className="c7n-network-wrapper">
      <Table
        filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
        loading={store.isLoading}
        pagination={store.pageInfo}
        columns={columns}
        onChange={this.tableChange}
        dataSource={data}
        rowKey={record => record.id}
        filters={paras.slice()}
      />
      {this.showEdit && <EditNetwork
        netId={this.id}
        visible={this.showEdit}
        store={NetworkConfigStore}
        onClose={this.handleCancelFun}
      />}
      <Modal
        visible={this.openRemove}
        title={<FormattedMessage id="network.delete" />}
        closable={false}
        footer={[
          <Button key="back" onClick={this.closeRemove}><FormattedMessage id="cancel" /></Button>,
          <Button key="submit" type="danger" onClick={this.handleDelete} loading={this.submitting}>
            <FormattedMessage id="delete" />
          </Button>,
        ]}
      >
        <p><FormattedMessage id="network.delete.tooltip" /></p>
      </Modal>
    </div>);
  }
}

export default Form.create({})(withRouter(injectIntl(NetworkOverview)));
