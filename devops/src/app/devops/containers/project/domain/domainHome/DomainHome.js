import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Button, Form, Tooltip, Modal, Progress } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import CreateDomain from '../createDomain';
import LoadingBar from '../../../../components/loadingBar';
import './DomainHome.scss';
import '../../../main.scss';
import { commonComponent } from '../../../../components/commonFunction';

const { AppState } = stores;

@commonComponent('DomainStore')
@observer
class DomainHome extends Component {
  constructor(props, context) {
    const menu = AppState.currentMenuType;
    super(props, context);
    this.state = {
      upDown: -1,
      createVisible: false,
      editVisible: false,
      projectId: menu.id,
      openRemove: false,
      show: false,
    };
  }
  componentDidMount() {
    this.loadAllData();
  }
  /**
   * 展开/收起实例
   */
  showChange = (upDown) => {
    this.setState({
      upDown: upDown * -1,
    });
  };

  /**
   * 关闭侧边栏
   */
  handleCancelFun = () => {
    this.props.form.resetFields();
    this.setState({ show: false, id: null });
    this.loadAllData();
  };

  /**
   *打开域名创建弹框
   */
  showSideBar =(type, id = '') => {
    this.props.form.resetFields();
    if (type === 'create') {
      this.setState({ show: true, title: '创建域名', type, id });
    } else {
      this.setState({ title: '修改域名', type, id }, () => {
        this.setState({ show: true });
      });
    }
  };

  render() {
    const { DomainStore } = this.props;
    const data = DomainStore.getAllData;
    const menu = AppState.currentMenuType;
    const projectName = menu.name;
    const { type, id: projectId, organizationId: orgId } = menu;
    const columns = [{
      title: '域名状态',
      render: (record) => {
        let statusDom = null;
        switch (record.status) {
          case 'failed':
            statusDom = (<div className="c7n-domain-status c7n-domain-status-failed">
              <div>失败</div>
            </div>);
            break;
          case 'operating':
            statusDom = (<div className="c7n-domain-status c7n-domain-status-operating">
              <div>处理中</div>
            </div>);
            break;
          default:
            statusDom = (<div className="c7n-domain-status c7n-domain-status-running">
              <div>运行中</div>
            </div>);
        }
        return (statusDom);
      },
    }, {
      title: '域名名称',
      key: 'name',
      sorter: true,
      filters: [],
      render: (record) => {
        let statusDom = null;
        switch (record.commandStatus) {
          case 'failed':
            statusDom = (<Tooltip title={record.error}>
              <span className="icon icon-error c7n-status-failed" />
            </Tooltip>);
            break;
          case 'doing':
            statusDom = (<Tooltip title={Choerodon.languageChange(`ist_${record.commandType}`)}>
              <Progress type="loading" width={15} style={{ marginRight: 5 }} />
            </Tooltip>);
            break;
          default:
            statusDom = null;
        }
        return (<React.Fragment>
          {record.name}
          {statusDom}
        </React.Fragment>);
      },
    }, {
      title: '域名地址',
      key: 'domain',
      filters: [],
      dataIndex: 'domain',
    }, {
      title: '环境名称',
      key: 'envName',
      sorter: true,
      filters: [],
      render: record => (
        <React.Fragment>
          { record.envStatus ? <Tooltip title="已连接">
            <span className="env-status-success" />
          </Tooltip> : <Tooltip title="未连接">
            <span className="env-status-error" />
          </Tooltip> }
          {record.envName}
        </React.Fragment>
      ),
    }, {
      title: '路径',
      className: 'c7n-network-col',
      key: 'path',
      sorter: true,
      filters: [],
      render: record => (
        <div>
          {_.map(record.pathList, router =>
            (<div className="c7n-network-col_border" key={router.path}>
              <span>{router.path}</span>
            </div>))}
        </div>
      ),
    }, {
      title: '网络',
      className: 'c7n-network-col',
      key: 'serviceName',
      filters: [],
      render: record => (
        <div>
          {_.map(record.pathList, instance =>
            (<div className="c7n-network-col_border" key={`${instance.path}-${instance.serviceId}`}>{instance.serviceName}</div>
            ))}
        </div>
      ),
    }, {
      key: 'action',
      width: '96px',
      className: 'c7n-network-text_top',
      render: (record) => {
        let editDom = null;
        let deletDom = null;
        switch (record.status) {
          case 'operating':
            editDom = (<Tooltip trigger="hover" placement="bottom" title={Choerodon.languageChange(`domain_${record.commandType}`)}>
              <span className="icon icon-mode_edit c7n-app-icon-disabled" />
            </Tooltip>);
            deletDom = (<Tooltip trigger="hover" placement="bottom" title={Choerodon.languageChange(`domain_${record.commandType}`)}>
              <span className="icon icon-delete_forever c7n-app-icon-disabled" />
            </Tooltip>);
            break;
          default:
            editDom = (<React.Fragment>
              {record.envStatus ? <Tooltip trigger="hover" placement="bottom" title={<div>修改</div>}>
                <Button shape="circle" funcType="flat" onClick={this.showSideBar.bind(this, 'edit', record.id)}>
                  <span className="icon icon-mode_edit" />
                </Button>
              </Tooltip> : <Tooltip trigger="hover" placement="bottom" title={<div>请先连接环境</div>}>
                <span className="icon icon-mode_edit c7n-app-icon-disabled" />
              </Tooltip>}
            </React.Fragment>);
            deletDom = (<React.Fragment>
              {record.envStatus ? <Tooltip trigger="hover" placement="bottom" title={<div>删除</div>}>
                <Button shape="circle" funcType="flat" onClick={this.openRemove.bind(this, record.id)}>
                  <span className="icon icon-delete_forever" />
                </Button>
              </Tooltip> : <Tooltip trigger="hover" placement="bottom" title={<div>请先连接环境</div>}>
                <span className="icon icon-delete_forever c7n-app-icon-disabled" />
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
      <Page className="c7n-region c7n-domain-wrapper">
        { DomainStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <Header title="域名管理">
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
                <span className="icon icon-playlist_add icon" />
                <span>{Choerodon.getMessage('创建域名', 'Create Domain')}</span>
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
                onClick={this.loadAllData}
              >
                <span className="icon-refresh icon" />
                <span>{Choerodon.languageChange('refresh')}</span>
              </Button>
            </Permission>
          </Header>
          <Content>
            <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的域名管理</h2>
            <p>
              域名管理是将您已经预定义好的域名在平台中进行配置，使外部能够通过指定的域名访问到系统内部的实例。
              <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/ingress/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                    了解详情
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            <Table
              filterBarPlaceholder={'过滤表'}
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
          title="删除域名"
          footer={[
            <Button key="back" onClick={this.closeRemove}>取消</Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete}>
              确定
            </Button>,
          ]}
        >
          <p>确定要删除吗</p>
        </Modal>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(DomainHome));
