import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Button, Form, Select, Popover, Modal } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import Permission from 'PerComponent';
import _ from 'lodash';
import CreateDomain from '../createDomain';
import LoadingBar from '../../../../components/loadingBar';
import './DomainHome.scss';
import '../../../main.scss';
import { commonComponent } from '../../../../components/commonFunction';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';


@inject('AppState')
@commonComponent('DomainStore')
@observer
class DomainHome extends Component {
  constructor(props, context) {
    const menu = props.AppState.currentMenuType;
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
    const menu = this.props.AppState.currentMenuType;
    const projectName = menu.name;
    const { type, id: projectId, organizationId: orgId } = menu;
    const columns = [{
      title: '域名',
      className: 'c7n-network-text_top',
      // dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
      render: record => (
        <MouserOverWrapper text={record.name || ''} width={100}>
          {record.name}</MouserOverWrapper>
      ),
    }, {
      title: '域名地址',
      className: 'c7n-network-text_top',
      // dataIndex: 'domain',
      key: 'domain',
      // sorter: true,
      filters: [],
      render: record => (
        <MouserOverWrapper text={record.name || ''} width={120}>
          {record.name}</MouserOverWrapper>
      ),
    }, {
      title: '环境名称',
      className: 'c7n-network-text_top',
      // dataIndex: 'envName',
      key: 'envName',
      sorter: true,
      filters: [],
      render: record => (
        <MouserOverWrapper text={record.envName || ''} width={120}>
          <div className={record.envStatus ? 'c7n-network-status status-success' : 'c7n-network-status status-error'}>
            <div>{record.envStatus ? '运行中' : '未连接'}</div>
          </div>
          {record.envName}</MouserOverWrapper>),
    }, {
      title: '路径',
      className: 'c7n-network-col',
      width: '100px',
      key: 'path',
      sorter: true,
      filters: [],
      render: record => (
        <div>
          {_.map(record.devopsIngressPathDTOList, router =>
            (<div className="c7n-network-col_border">
              <span>{router.path}</span>
            </div>))}
        </div>
      ),
    }, {
      title: '网络',
      // width: '200px',
      className: 'c7n-network-col',
      key: 'serviceName',
      // sorter: true,
      filters: [],
      render: record => (
        <div>
          {_.map(record.devopsIngressPathDTOList, instance =>
            (<MouserOverWrapper text={instance.serviceName || ''} width={140} className="c7n-network-col_border">
              <span>{instance.serviceName}</span>
            </MouserOverWrapper>
            ))}
        </div>
      ),
    }, {
      key: 'action',
      width: '96px',
      className: 'c7n-network-text_top',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.devops-ingress.update']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            {record.envStatus ? <Popover placement="bottom" content={<div><span>修改域名</span></div>}>
              <Button shape="circle" onClick={this.showSideBar.bind(this, 'edit', record.id)}>
                <span className="icon-mode_edit" />
              </Button>
            </Popover>
              : <span className="c7n-app-icon-disabled icon-mode_edit" /> }
          </Permission>
          <Permission
            service={['devops-service.devops-ingress.delete']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            {record.envStatus ? <Popover placement="bottom" content={<div><span>删除域名</span></div>}>
              <Button shape="circle" onClick={this.openRemove.bind(this, record.id)}>
                <span className="icon-delete_forever" />
              </Button>
            </Popover> : <span className="c7n-app-icon-disabled icon-delete_forever" /> }

          </Permission>
        </div>),
    }];
    return (
      <div className="c7n-region page-container c7n-domain-wrapper">
        { DomainStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <PageHeader title="域名管理">
            <Permission
              service={['devops-service.devops-ingress.create']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                className="leftBtn"
                funcType="flat"
                onClick={this.showSideBar.bind(this, 'create', '')}
              >
                <span className="icon-playlist_add page-head-icon" />
                <span className="icon-space">{Choerodon.getMessage('创建域名', 'Create Domain')}</span>
              </Button>
            </Permission>
            <Permission
              service={['devops-service.devops-ingress.pageByOptions']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                className="leftBtn2"
                funcType="flat"
                onClick={this.loadAllData}
              >
                <span className="icon-refresh page-head-icon" />
                <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
              </Button>
            </Permission>
          </PageHeader>
          <div className="page-content">
            <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的域名管理</h2>
            <p>
              域名管理是将您已经预定义好的域名在平台中进行配置，使外部能够通过指定的域名访问到系统内部的实例。
              <a href="http://v0-5.choerodon.io/zh/docs/user-guide/deployment-pipeline/ingress/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                    了解详情
                </span>
                <span className="icon-open_in_new" />
              </a>
            </p>
            <Table
              loading={DomainStore.loading}
              onChange={this.tableChange}
              pagination={DomainStore.pageInfo}
              columns={columns}
              dataSource={data}
              rowKey={record => record.domainId}
            />

          </div>
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
      </div>
    );
  }
}

export default Form.create({})(withRouter(DomainHome));
