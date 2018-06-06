/* eslint-disable no-console */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Button, Form, Tooltip, Modal, Progress } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import _ from 'lodash';
import Permission from 'PerComponent';
import NetworkCreate from '../createNetwork';
import './NetworkHome.scss';
import '../../../main.scss';
import LoadingBar from '../../../../components/loadingBar';
import EditNetwork from '../editNetwork';
import { commonComponent } from '../../../../components/commonFunction';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';


@inject('AppState')
@commonComponent('NetworkConfigStore')
@observer
class NetworkHome extends Component {
  constructor(props, context) {
    const menu = props.AppState.currentMenuType;
    super(props, context);
    this.state = {
      upDown: [],
      show: false,
      projectId: menu.id,
      openRemove: false,
    };
  }
  componentDidMount() {
    this.loadAllData();
  }
  /**
   * 展开/收起实例
   */
  showChange = (id, networkId, length) => {
    const { upDown } = this.state;
    const cols = document.getElementsByClassName(`col-${id}-${networkId}`);
    if (_.indexOf(upDown, id) === -1) {
      for (let i = 0; i < cols.length; i += 1) {
        cols[i].style.height = `${length * 31}px`;
      }
      upDown.push(id);
      this.setState({
        upDown,
      });
      // console.log(upDown, length);
    } else {
      for (let i = 0; i < cols.length; i += 1) {
        cols[i].style.height = '31px';
      }
      _.pull(upDown, id);
      this.setState({
        upDown,
      });
      // console.log(upDown, length);
    }
  };

  /**
   * 关闭侧边栏
   */
  handleCancelFun = () => {
    this.setState({ show: false, showEdit: false });
    this.loadAllData();
  };

  /**
   *
   */
  showSideBar =() => {
    const { NetworkConfigStore } = this.props;
    NetworkConfigStore.setInstance([]);
    NetworkConfigStore.setVersionDto([]);
    NetworkConfigStore.setApp([]);
    NetworkConfigStore.setVersions([]);
    NetworkConfigStore.setEnv([]);
    this.setState({ show: true });
  };

  /**
   * 打开编辑的操作框
   * @param id
   */
  editNetwork = (id) => {
    const { NetworkConfigStore } = this.props;
    NetworkConfigStore.setInstance([]);
    NetworkConfigStore.setVersionDto([]);
    NetworkConfigStore.setApp([]);
    NetworkConfigStore.setVersions([]);
    NetworkConfigStore.setEnv([]);
    this.setState({ showEdit: true, id });
  };
  render() {
    const { NetworkConfigStore } = this.props;
    const menu = this.props.AppState.currentMenuType;
    const projectName = menu.name;
    const { upDown } = this.state;
    const data = NetworkConfigStore.getAllData;
    const { type, id: projectId, organizationId: orgId } = menu;
    const columns = [{
      title: '网络状态',
      key: 'status',
      render: (record) => {
        let statusDom = null;
        switch (record.status) {
          case 'failed':
            statusDom = (<div className="c7n-network-status c7n-network-status-failed">
              <div>失败</div>
            </div>);
            break;
          case 'operating':
            statusDom = (<div className="c7n-network-status c7n-network-status-operating">
              <div>处理中</div>
            </div>);
            break;
          default:
            statusDom = (<div className="c7n-network-status c7n-network-status-running">
              <div>运行中</div>
            </div>);
        }
        return (statusDom);
      },
    }, {
      title: '网络名称',
      key: 'name',
      sorter: true,
      filters: [],
      render: (record) => {
        let statusDom = null;
        switch (record.commandStatus) {
          case 'failed':
            statusDom = (<Tooltip title={record.error}>
              <span className="icon-error c7n-status-failed c7n-network-icon" />
            </Tooltip>);
            break;
          case 'doing':
            statusDom = (<Tooltip title={Choerodon.languageChange(`ist_${record.commandType}`)}>
              <Progress type="loading" width="15px" className="c7n-network-icon" />
            </Tooltip>);
            break;
          default:
            statusDom = null;
        }
        return (<React.Fragment>
          {statusDom}
          <MouserOverWrapper text={record.name || ''} width={80} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            {record.name}</MouserOverWrapper>
        </React.Fragment>);
      },
    }, {
      title: '环境名称',
      key: 'envName',
      sorter: true,
      filters: [],
      render: record => (
        <React.Fragment>
          { record.envStatus ? <Tooltip title="已连接"> <span className="env-status-success" /></Tooltip> : <Tooltip title="未连接">
            <span className="env-status-error" />
          </Tooltip> }
          <MouserOverWrapper text={record.envName || ''} width={64} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            {record.envName}</MouserOverWrapper>
        </React.Fragment>
      ),
    }, {
      title: '外部IP',
      key: 'ip',
      filters: [],
      render: record => (
        <MouserOverWrapper text={record.externalIp || ''} width={50}>
          {record.externalIp}</MouserOverWrapper>
      ),
    }, {
      title: '端口',
      // className: 'c7n-network-text_top',
      key: 'port',
      sorter: true,
      filters: [],
      render: record => (
        <MouserOverWrapper text={record.port || ''} width={50}>
          {record.port}</MouserOverWrapper>
      ),
    }, {
      title: '应用',
      key: 'appName',
      filters: [],
      sorter: true,
      render: record => (
        <React.Fragment>
          <span className="icon-store_mall_directory c7n-network-icon" />
          <MouserOverWrapper text={record.appName || ''} width={60} style={{ display: 'inline-block', verticalAlign: 'middle' }} >
            <span>{record.appName}</span>
          </MouserOverWrapper>
        </React.Fragment>
      ),
    }, {
      title: '版本',
      className: 'c7n-network-col',
      key: 'version',
      sorter: true,
      filters: [],
      render: record => (
        <React.Fragment>
          {_.map(record.appVersion, versions =>
            (<div key={versions.id} className={`c7n-network-col_border col-${record.id}-${versions.id}`}>
              <MouserOverWrapper text={versions.version || ''} width={51} className="c7n-network-column-version" >
                <span>{versions.version}</span>
              </MouserOverWrapper>
            </div>))}
        </React.Fragment>
      ),
    }, {
      width: 150,
      title: '部署实例',
      className: 'c7n-network-col',
      key: 'code',
      filters: [],
      render: record => (
        <React.Fragment>
          {_.map(record.appVersion, versions =>
            (<div key={versions.version} role="none" className={`c7n-network-col_border col-${record.id}-${versions.id}`} onClick={this.showChange.bind(this, record.id, versions.id, versions.appInstance.length)}>
              {versions.appInstance && versions.appInstance.length > 1
              && <span className={_.indexOf(upDown, record.id) !== -1
                ? 'c7n-network-change icon-keyboard_arrow_up' : 'c7n-network-change icon-keyboard_arrow_down'}
              />
              }
              {_.map(versions.appInstance, datas =>
                (<MouserOverWrapper key={datas.id} width={115} className="c7n-network-square" text={datas.code}>{datas.code}</MouserOverWrapper>))}
            </div>))}
        </React.Fragment>
      ),
    }, {
      width: '98px',
      key: 'action',
      render: (record) => {
        let editDom = null;
        let deletDom = null;
        switch (record.status) {
          case 'operating':
            editDom = (<Tooltip trigger="hover" placement="bottom" title={Choerodon.languageChange(`network_${record.commandType}`)}>
              <span className="icon-mode_edit c7n-app-icon-disabled" />
            </Tooltip>);
            deletDom = (<Tooltip trigger="hover" placement="bottom" title={Choerodon.languageChange(`network_${record.commandType}`)}>
              <span className="icon-delete_forever c7n-app-icon-disabled" />
            </Tooltip>);
            break;
          default:
            editDom = (<React.Fragment>
              {record.envStatus ? <Tooltip trigger="hover" placement="bottom" title={<div>修改</div>}>
                <Button shape="circle" funcType="flat" onClick={this.editNetwork.bind(this, record.id)}>
                  <span className="icon-mode_edit" />
                </Button>
              </Tooltip> : <Tooltip trigger="hover" placement="bottom" title={<div>请先连接环境</div>}>
                <span className="icon-mode_edit c7n-app-icon-disabled" />
              </Tooltip>}
            </React.Fragment>);
            deletDom = (<React.Fragment>
              {record.envStatus ? <Tooltip trigger="hover" placement="bottom" title={<div>删除</div>}>
                <Button shape="circle" funcType="flat" onClick={this.openRemove.bind(this, record.id)}>
                  <span className="icon-delete_forever" />
                </Button>
              </Tooltip> : <Tooltip trigger="hover" placement="bottom" title={<div>请先连接环境</div>}>
                <span className="icon-delete_forever c7n-app-icon-disabled" />
              </Tooltip>}
            </React.Fragment>);
        }
        return (<div>
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
            {deletDom}
          </Permission>
        </div>);
      },
    }];
    return (
      <div className="c7n-region page-container c7n-network-wrapper">
        {NetworkConfigStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <PageHeader title="网络配置">
            <Permission
              service={['devops-service.devops-service.create']}
              // service={''}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                className="leftBtn"
                funcType="flat"
                onClick={this.showSideBar}
              >
                <span className="icon-playlist_add page-head-icon" />
                <span className="icon-space">{Choerodon.getMessage('创建网络', 'Create Network')}</span>
              </Button>
            </Permission>
            <Permission
              service={['devops-service.devops-service.pageByOptions']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                className="leftBtn2"
                funcType="flat"
                onClick={this.handleRefresh}
              >
                <span className="icon-refresh page-head-icon" />
                <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
              </Button>
            </Permission>
          </PageHeader>
          <div className="page-content">
            <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的网络配置</h2>
            <p>
              网络管理是定义了一种访问网络的策略，是指内部的负载均衡以及网络转发，会将网络流量定向转发到指定的单个或者多个实例容器组。
              <a href="http://choerodon.io/zh/docs/user-guide/deploy/network-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                 了解详情
                </span>
                <span className="icon-open_in_new" />
              </a>
            </p>
            <Table
              filterBarPlaceholder={'过滤表'}
              loading={NetworkConfigStore.loading}
              pagination={NetworkConfigStore.getPageInfo}
              columns={columns}
              onChange={this.tableChange}
              dataSource={data}
              rowKey={record => record.id}
            />
          </div>
        </React.Fragment>
        }

        {this.state.show && <NetworkCreate
          visible={this.state.show}
          store={NetworkConfigStore}
          onClose={this.handleCancelFun}
        /> }
        {this.state.showEdit && <EditNetwork
          id={this.state.id}
          visible={this.state.showEdit}
          store={NetworkConfigStore}
          onClose={this.handleCancelFun}
        /> }
        <Modal
          visible={this.state.openRemove}
          title="删除网络"
          footer={[
            <Button key="back" onClick={this.closeRemove}>取消</Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete}>
              删除
            </Button>,
          ]}
        >
          <p>删除网络后，需要您再去修改相关的域名信息。确定要删除该网络吗？</p>
        </Modal>
      </div>
    );
  }
}

export default Form.create({})(withRouter(NetworkHome));
