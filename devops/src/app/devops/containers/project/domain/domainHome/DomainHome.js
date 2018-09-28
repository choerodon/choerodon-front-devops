import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Button, Form, Tooltip, Modal, Progress } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import CreateDomain from '../createDomain';
import LoadingBar from '../../../../components/loadingBar';
import './DomainHome.scss';
import '../../../main.scss';
import { commonComponent } from '../../../../components/commonFunction';
import StatusIcon from '../../../../components/StatusIcon';

const { AppState } = stores;

@commonComponent('DomainStore')
@observer
class DomainHome extends Component {
  constructor(props, context) {
    const menu = AppState.currentMenuType;
    super(props, context);
    this.state = {
      openRemove: false,
      submitting: false,
      show: false,
    };
  }

  componentDidMount() {
    this.loadAllData();
  }

  /**
   * 关闭侧边栏
   */
  handleCancelFun = (isload) => {
    const { DomainStore } = this.props;
    this.props.form.resetFields();
    this.setState({ show: false, id: null });
    if (isload) {
      DomainStore.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
      this.loadAllData();
    }
  };

  /**
   *打开域名创建弹框
   */
  showSideBar =(type, id = '') => {
    const { form, DomainStore } = this.props;
    form.resetFields();
    DomainStore.setCertificates([]);
    if (type === 'create') {
      this.setState({ show: true, title: this.props.intl.formatMessage({ id: 'domain.header.create' }), type, id });
    } else {
      this.setState({ title: this.props.intl.formatMessage({ id: 'domain.header.update' }), type, id }, () => {
        this.setState({ show: true });
      });
    }
  };

  render() {
    const { DomainStore, intl } = this.props;
    const data = DomainStore.getAllData;
    const { filters, sort: { columnKey, order } } = DomainStore.getInfo;
    const menu = AppState.currentMenuType;
    const projectName = menu.name;
    const { type, id: projectId, organizationId: orgId } = menu;
    const columns = [{
      title: intl.formatMessage({ id: 'domain.column.name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filters: [],
      filteredValue: filters.name || [],
      render: (text, record) => <StatusIcon
        name={text}
        status={record.commandStatus || ''}
        error={record.error || ''}
      />,
    }, {
      title: intl.formatMessage({ id: 'domain.column.domain' }),
      key: 'domain',
      filters: [],
      filteredValue: filters.domain || [],
      dataIndex: 'domain',
    }, {
      title: intl.formatMessage({ id: 'domain.column.env' }),
      key: 'envName',
      sorter: true,
      sortOrder: columnKey === 'envName' && order,
      filters: [],
      filteredValue: filters.envName || [],
      render: record => (
        <React.Fragment>
          { record.envStatus ? <Tooltip title={<FormattedMessage id="connect" />}>
            <span className="env-status-success" />
          </Tooltip> : <Tooltip title={<FormattedMessage id="disconnect" />}>
            <span className="env-status-error" />
          </Tooltip> }
          {record.envName}
        </React.Fragment>
      ),
    }, {
      title: intl.formatMessage({ id: 'domain.column.path' }),
      className: 'c7n-network-col',
      key: 'path',
      filters: [],
      filteredValue: filters.path || [],
      render: record => _.map(record.pathList, router => (<div className="c7n-network-col_border" key={`${record.id}-${router.path}`}>
        <span>{router.path}</span>
      </div>)),
    }, {
      title: intl.formatMessage({ id: 'domain.column.network' }),
      className: 'c7n-network-col',
      key: 'serviceName',
      filters: [],
      filteredValue: filters.serviceName || [],
      render: record => (
        <div>
          {_.map(record.pathList, instance => (<div className="c7n-network-col_border" key={`${record.id}-${instance.path}-${instance.serviceId}`}>
            <Tooltip title={intl.formatMessage({ id: `${instance.serviceStatus || 'null'}` })} placement="top">
              <span className={instance.serviceStatus === 'running' ? 'env-status-success' : 'env-status-error'} />
            </Tooltip>
            {instance.serviceName}
          </div>
          ))}
        </div>
      ),
    }, {
      key: 'action',
      align: 'right',
      // width: '96px',
      className: 'c7n-network-text_top',
      render: (record) => {
        let editDom = null;
        let deletDom = null;
        switch (record.status) {
          case 'operating':
            editDom = (<Tooltip trigger="hover" placement="bottom" title={intl.formatMessage({ id: `domain_${record.status}` })}>
              <i className="icon icon-mode_edit c7n-app-icon-disabled" />
            </Tooltip>);
            deletDom = (<Tooltip trigger="hover" placement="bottom" title={intl.formatMessage({ id: `domain_${record.status}` })}>
              <i className="icon icon-delete_forever c7n-app-icon-disabled" />
            </Tooltip>);
            break;
          default:
            editDom = (<React.Fragment>
              {record.envStatus ? <Tooltip trigger="hover" placement="bottom" title={<div>{intl.formatMessage({ id: 'edit' })}</div>}>
                <Button shape="circle" size="small" funcType="flat" onClick={this.showSideBar.bind(this, 'edit', record.id)}>
                  <i className="icon icon-mode_edit" />
                </Button>
              </Tooltip> : <Tooltip trigger="hover" placement="bottom" title={<div>{intl.formatMessage({ id: 'network.env.tooltip' })}</div>}>
                <i className="icon icon-mode_edit c7n-app-icon-disabled" />
              </Tooltip>}
            </React.Fragment>);
            deletDom = (<React.Fragment>
              {record.envStatus ? <Tooltip trigger="hover" placement="bottom" title={<div>{intl.formatMessage({ id: 'delete' })}</div>}>
                <Button shape="circle" size="small" funcType="flat" onClick={this.openRemove.bind(this, record.id)}>
                  <i className="icon icon-delete_forever" />
                </Button>
              </Tooltip> : <Tooltip trigger="hover" placement="bottom" title={<div>{intl.formatMessage({ id: 'network.env.tooltip' })}</div>}>
                <i className="icon icon-delete_forever c7n-app-icon-disabled" />
              </Tooltip>}
            </React.Fragment>);
        }
        return (<div>
          <Permission
            service={['devops-service.devops-ingress.update']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            {editDom}
          </Permission>
          <Permission
            service={['devops-service.devops-ingress.delete']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            {deletDom}
          </Permission>
        </div>);
      },
    }];
    return (
      <Page
        className="c7n-region c7n-domain-wrapper"
        service={[
          'devops-service.devops-ingress.create',
          'devops-service.devops-ingress.checkDomain',
          'devops-service.devops-ingress.checkName',
          'devops-service.devops-ingress.pageByOptions',
          'devops-service.devops-ingress.queryDomainId',
          'devops-service.devops-ingress.update',
          'devops-service.devops-ingress.delete',
          'devops-service.devops-service.listByEnvId',
          'devops-service.devops-environment.listByProjectIdAndActive',
        ]}
      >
        { DomainStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <Header title={intl.formatMessage({ id: 'domain.header.title' })}>
            <Permission
              service={['devops-service.devops-ingress.create']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                funcType="flat"
                onClick={this.showSideBar.bind(this, 'create', '')}
              >
                <i className="icon icon-playlist_add icon" />
                <FormattedMessage id="domain.header.create" />
              </Button>
            </Permission>
            <Permission
              service={['devops-service.devops-ingress.pageByOptions']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                funcType="flat"
                onClick={this.handleRefresh}
              >
                <i className="icon-refresh icon" />
                <FormattedMessage id="refresh" />
              </Button>
            </Permission>
          </Header>
          <Content code="domain" values={{ name: projectName }}>
            <Table
              filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
              loading={DomainStore.loading}
              onChange={this.tableChange}
              pagination={DomainStore.pageInfo}
              columns={columns}
              dataSource={data}
              rowKey={record => record.id}
            />

          </Content>
        </React.Fragment> }

        {this.state.show && <CreateDomain
          id={this.state.id}
          title={this.state.title}
          visible={this.state.show}
          type={this.state.type}
          store={DomainStore}
          onClose={this.handleCancelFun}
        />}
        <Modal
          visible={this.state.openRemove}
          title={<FormattedMessage id="domain.header.delete" />}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove}>{<FormattedMessage id="cancel" />}</Button>,
            <Button key="submit" loading={this.state.submitting} type="danger" onClick={this.handleDelete}>
              {intl.formatMessage({ id: 'delete' })}
            </Button>,
          ]}
        >
          <p>{intl.formatMessage({ id: 'confirm.delete' })}</p>
        </Modal>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(DomainHome)));
