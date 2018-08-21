import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Button, Form, Tooltip, Modal, Popover, Icon } from 'choerodon-ui';
import { Permission, Content, Header, Page, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import './NetworkHome.scss';
import '../../../main.scss';
import LoadingBar from '../../../../components/loadingBar';
import CreateNetwork from '../createNetwork';
import EditNetwork from '../editNetwork';
import { commonComponent } from '../../../../components/commonFunction';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const { AppState } = stores;

// commonComponent装饰器
@commonComponent('NetworkConfigStore')
@observer
class NetworkHome extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      show: false,
      openRemove: false,
      submitting: false,
    };
  }

  componentDidMount() {
    // 这个方法定义在 commonComponent装饰器中
    this.loadAllData();
  }

  /**
   * 关闭侧边栏
   */
  handleCancelFun = () => {
    this.setState({ show: false, showEdit: false });
    this.loadAllData();
  };

  /**
   * 打开创建操作框
   */
  showSideBar = () => {
    this.clearStoreData();
    this.setState({ show: true });
  };

  /**
   * 打开编辑的操作框
   * @param id
   */
  editNetwork = (id) => {
    this.clearStoreData();
    this.setState({ showEdit: true, id });
  };

  /**
   * 清除缓存数据
   */
  clearStoreData = () => {
    const { NetworkConfigStore } = this.props;
    NetworkConfigStore.setApp([]);
    NetworkConfigStore.setEnv([]);
    NetworkConfigStore.setIst([]);
  };

  /**
   * 状态 列
   * @param record
   * @returns {*}
   */
  statusColumn = (record) => {
    let msg = null;
    let styles = '';
    switch (record.status) {
      case 'failed':
        msg = 'network.failed';
        styles = 'c7n-network-status-failed';
        break;
      case 'operating':
        msg = 'operating';
        styles = 'c7n-network-status-operating';
        break;
      default:
        msg = 'running';
        styles = 'c7n-network-status-running';
    }
    return (<div className={`c7n-network-status ${styles}`}>
      <FormattedMessage id={msg} />
    </div>);
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
        node.push(<div
          className={`network-column-instance ${statusStyle}`}
          key={id}
        >
          <Tooltip
            title={instanceStatus ? <FormattedMessage id={instanceStatus} /> : ''}
            placement="top"
          >{code}</Tooltip>
        </div>);
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
    const { intl } = this.props;
    let editDom = null;
    let deleteDom = null;
    if (envStatus) {
      if (status === 'running') {
        editDom = (<Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="edit" />}>
          <Button shape="circle" size="small" funcType="flat" onClick={this.editNetwork.bind(this, id)}>
            <i className="icon icon-mode_edit" />
          </Button>
        </Tooltip>);
        deleteDom = (<Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="delete" />}>
          <Button shape="circle" size="small" funcType="flat" onClick={this.openRemove.bind(this, id)}>
            <i className="icon icon-delete_forever" />
          </Button>
        </Tooltip>);
      } else {
        editDom = (<Tooltip trigger="hover" placement="bottom" title={intl.formatMessage({ id: `network_${status}` })}>
          <i className="icon icon-mode_edit c7n-app-icon-disabled" />
        </Tooltip>);
        deleteDom = (<Tooltip trigger="hover" placement="bottom" title={intl.formatMessage({ id: `network_${status}` })}>
          <i className="icon icon-delete_forever c7n-app-icon-disabled" />
        </Tooltip>);
      }
    } else {
      editDom = (<Tooltip trigger="hover" placement="bottom" title={intl.formatMessage({ id: 'network.env.tooltip' })}>
        <i className="icon icon-mode_edit c7n-app-icon-disabled" />
      </Tooltip>);
      deleteDom = (<Tooltip trigger="hover" placement="bottom" title={intl.formatMessage({ id: 'network.env.tooltip' })}>
        <i className="icon icon-delete_forever c7n-app-icon-disabled" />
      </Tooltip>);
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

  render() {
    const { NetworkConfigStore, intl } = this.props;
    const { show, showEdit, id, openRemove, submitting } = this.state;
    const {
      type,
      id: projectId,
      organizationId: orgId,
      name: projectName } = AppState.currentMenuType;
    const data = NetworkConfigStore.getAllData;
    const columns = [{
      title: <FormattedMessage id="network.column.status" />,
      key: 'status',
      width: '82px',
      render: record => this.statusColumn(record),
    }, {
      title: <FormattedMessage id="network.column.name" />,
      key: 'name',
      sorter: true,
      filters: [],
      render: record => (<MouserOverWrapper text={record.name || ''} width={0.12} className="network-list-name">
        {record.name}</MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="network.column.env" />,
      key: 'envName',
      sorter: true,
      filters: [],
      render: record => (
        <div className="env-status-wrap">
          { record.envStatus ? <Tooltip title={<FormattedMessage id="connect" />}> <span className="env-status-success" /></Tooltip> : <Tooltip title={<FormattedMessage id="disconnect" />}>
            <span className="env-status-error" />
          </Tooltip> }
          <MouserOverWrapper text={record.envName || ''} width={0.12} className="network-list-name">
            {record.envName}</MouserOverWrapper>
        </div>
      ),
    }, {
      title: <FormattedMessage id="network.target" />,
      key: 'target',
      filters: [],
      render: record => this.targetColumn(record),
    }, {
      width: 108,
      title: <FormattedMessage id="network.config.column" />,
      key: 'config',
      filters: [],
      render: record => this.configColumn(record),
    }, {
      width: 82,
      key: 'action',
      render: record => this.opColumn(record, type, projectId, orgId),
    }];
    return (
      <Page
        service={[
          'devops-service.devops-service.create',
          'devops-service.devops-service.checkName',
          'devops-service.devops-service.pageByOptions',
          'devops-service.devops-service.query',
          'devops-service.devops-service.update',
          'devops-service.devops-service.delete',
          'devops-service.devops-service.listByEnvId',
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.application.listByEnvIdAndStatus',
          'devops-service.application-version.queryByAppIdAndEnvId',
          'devops-service.application-instance.listByAppVersionId',
        ]}
        className="c7n-region c7n-network-wrapper"
      >
        {NetworkConfigStore.isRefresh ? <LoadingBar display /> : <Fragment>
          <Header title={<FormattedMessage id="network.header.title" />}>
            <Permission
              service={['devops-service.devops-service.create']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                funcType="flat"
                onClick={this.showSideBar}
              >
                <i className="icon-playlist_add icon" />
                <span><FormattedMessage id="network.header.create" /></span>
              </Button>
            </Permission>
            <Permission
              service={['devops-service.devops-service.pageByOptions']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                funcType="flat"
                onClick={this.handleRefresh}
              >
                <i className="icon-refresh icon" />
                <span><FormattedMessage id="refresh" /></span>
              </Button>
            </Permission>
          </Header>
          <Content code="network" values={{ name: projectName }}>
            <Table
              filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
              loading={NetworkConfigStore.getLoading}
              pagination={NetworkConfigStore.getPageInfo}
              columns={columns}
              onChange={this.tableChange}
              dataSource={data}
              rowKey={record => record.id}
            />
          </Content>
        </Fragment>
        }

        {show && <CreateNetwork
          visible={show}
          store={NetworkConfigStore}
          onClose={this.handleCancelFun}
        /> }
        {showEdit && <EditNetwork
          netId={id}
          visible={showEdit}
          store={NetworkConfigStore}
          onClose={this.handleCancelFun}
        /> }
        <Modal
          confirmLoading={submitting}
          visible={openRemove}
          title={<FormattedMessage id="network.delete" />}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove}><FormattedMessage id="cancel" /></Button>,
            <Button key="submit" loading={this.state.submitting} type="danger" onClick={this.handleDelete}>
              <FormattedMessage id="delete" />
            </Button>,
          ]}
        >
          <p><FormattedMessage id="network.delete.tooltip" />？</p>
        </Modal>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(NetworkHome)));
