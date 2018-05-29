/* eslint-disable no-console */
import React, { Component } from 'react';
import { Table, Button, Spin, message, Radio, Input, Form, Modal, Tooltip, Select, Popover } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import PageHeader from 'PageHeader';
import Permission from 'PerComponent';
import { fromJS, is } from 'immutable';
import { Observable } from 'rxjs';
import ReactAce from 'react-ace-editor';
import 'brace/mode/text';
import 'brace/theme/terminal';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import LoadingBar from '../../../../components/loadingBar';
import './ContainerHome.scss';
import '../../../main.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const Sidebar = Modal.Sidebar;

@inject('AppState')
@commonComponent('ContainerStore')
@observer
class ContainerHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      id: '',
      show: false,
      name: '',
      log: [],
    };
  }

  componentDidMount() {
    this.loadAllData(this.state.page);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  };

  /**
   * 获取行
   *
   */
  getColumn = () => {
    const { AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    return [{
      title: Choerodon.languageChange('container.status'),
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: (text, record) => {
        let dom = null;
        switch (record.status) {
          case 'Completed':
            dom = (<div>
              <span className="icon-check_circle c7n-icon-success" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Running':
            dom = (<div>
              <span className="icon-check_circle c7n-icon-running" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Error':
            dom = (<div>
              <span className="icon-cancel c7n-icon-failed" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Pending':
            dom = (<div>
              <span className="icon-timelapse c7n-icon-pending" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          default:
            dom = (<div>
              <span className="icon-help c7n-icon-help" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
        }
        return dom;
      },
    }, {
      title: Choerodon.languageChange('container.name'),
      key: 'name',
      sorter: true,
      filters: [],
      filterMultiple: false,
      render: record => (
        <MouserOverWrapper text={record.name} width={200}>{record.name}</MouserOverWrapper>),
    }, {
      title: Choerodon.languageChange('container.app'),
      dataIndex: 'app',
      key: 'app',
      filters: [],
      filterMultiple: false,
      render: (text, record) => (<div>
        <div className="c7n-container-col-inside">
          {record.publishLevel ? <span className="icon-store_mall_directory c7n-icon-publish" /> : <span className="icon-project c7n-icon-publish" />}
          <span>{record.appName}</span>
        </div>
        <div>
          <span className="c7n-container-circle">V</span>
          <span className="c7n-deploy-text_gray">{record.appVersion}</span>
        </div>
      </div>),
    }, {
      title: Choerodon.languageChange('container.ip'),
      dataIndex: 'ip',
      key: 'ip',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      title: Choerodon.languageChange('container.usable'),
      dataIndex: 'ready',
      key: 'ready',
      filters: [{
        text: '可用',
        value: '1',
      }, {
        text: '不可用',
        value: '0',
      }],
      filterMultiple: false,
      render: (text, record) => (<div className="c7n-container-table">
        {record.ready ? <span className="icon-done" /> : <span className="icon-close" />}
      </div>),
    }, {
      title: Choerodon.languageChange('container.createTime'),
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }, {
      width: '40px',
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.devops-env-pod-container.queryLogByPod']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Popover placement="bottom" content={<div><span>容器日志</span></div>}>
              <Button
                shape="circle"
                onClick={this.showLog.bind(this, record)}
              >
                <span className="icon-insert_drive_file" />
              </Button>
            </Popover>
          </Permission>
        </div>
      ),
    }];
  };

  loadLog = () => {
    const { ContainerStore } = this.props;
    const authToken = document.cookie.split('=')[1];
    const logs = [];
    // const ws = new WebSocket(`ws://10.211.97.81:8060/ws/log?key=env:${this.state.namespace}.log:${this.state.logId}&podName=${this.state.podName}&containerName=${this.state.containerName}&logId=${this.state.logId}&token=${authToken}`);
    const ws = new WebSocket(`ws://${process.env.DEVOPS_HOST}/ws/log?key=env:${this.state.namespace}.log:${this.state.logId}&podName=${this.state.podName}&containerName=${this.state.containerName}&logId=${this.state.logId}&token=${authToken}`);
    const editor = this.ace.editor;
    this.setState({
      ws,
    });
    editor.setValue('No Logs.');
    editor.clearSelection();
    ws.onopen = () => {
      console.log('open.........');
    };
    ws.onmessage = (e) => {
      const reader = new FileReader();
      reader.readAsText(e.data, 'utf-8');
      reader.onload = () => {
        logs.push(reader.result);
        console.log(logs);
        if (logs.length > 0) {
          editor.setValue(logs.toString());
          editor.clearSelection();
        } else {
          editor.setValue('No Logs.');
        }
        // logs.push(reader.result);
      };
      // if (logs.length > 0) {
      //   editor.setValue(logs.toString());
      // } else {
      //   editor.setValue('No Logs.');
      // }
      editor.clearSelection();
    };
    // ws.onclose = () => {
    //   console.log('Connection instanceInfo Close ...');
    // };
  };

  /**
   * 显示日志
   * @param record 容器record
   */
  showLog =(record) => {
    const { AppState, ContainerStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    ContainerStore.loadPodParam(projectId, record.id)
      .then((data) => {
        this.setState({
          id: record.id,
          status: record.status,
          namespace: record.namespace,
          ip: record.ip,
          ready: record.ready,
          creationDate: record.creationDate,
          podName: data.podName,
          containerName: data.containerName,
          logId: data.logId,
        });
        this.loadLog();
      });
    ContainerStore.changeShow(true);
  };

  /**
   * 关闭日志
   */
  closeSidebar = () => {
    const { ContainerStore } = this.props;
    this.state.ws.close();
    this.state.ws.onclose = () => {
      // eslint-disable-next-line no-console
      console.log('Connection instanceInfo Close ...');
    };
    const editor = this.ace.editor;
    ContainerStore.changeShow(false);
    editor.setValue('No Logs.');
  };

  render() {
    const { ContainerStore, AppState } = this.props;
    const { status, ip, containerName, ready, creationDate } = this.state;
    const serviceData = ContainerStore.getAllData;
    const projectName = AppState.currentMenuType.name;
    const contentDom = ContainerStore.isRefresh ? <LoadingBar display /> : (<React.Fragment>
      <PageHeader title={Choerodon.languageChange('container.title')}>
        <Button
          className="leftBtn"
          onClick={this.handleRefresh}
        >
          <span className="icon-refresh page-head-icon" />
          <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
        </Button>
      </PageHeader>
      <div className="page-content">
        <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的容器管理</h2>
        <p>
          容器管理便于您查看和管理Kubernetes中应用实例生成的容器，
          可以实时查看相关容器的地址、创建时间、状态，确定容器是否正常运行且通过健康检查，并且可以查看容器日志进行错误定位和状态监控。
          <a href="http://choerodon.io/zh/docs/user-guide/deploy/container-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
              了解详情
            </span>
            <span className="icon-open_in_new" />
          </a>
        </p>
        <Table
          scroll={{ y: this.getHeight() }}
          loading={ContainerStore.loading}
          pagination={ContainerStore.pageInfo}
          columns={this.getColumn()}
          dataSource={serviceData}
          rowKey={record => record.id}
          onChange={this.tableChange}
        />
      </div>
    </React.Fragment>);

    let statusDom = null;
    switch (status) {
      case 'Running':
        statusDom = (<div>
          <span className="icon-check_circle c7n-icon-running c7n-podLog-icon-status " />
          <span className="c7n-container-title">{status}</span>
        </div>);
        break;
      case 'Completed':
        statusDom = (<div>
          <span className="icon-check_circle c7n-icon-running c7n-podLog-icon-status " />
          <span className="c7n-container-title">{status}</span>
        </div>);
        break;
      case 'Pending':
        statusDom = (<div>
          <span className="icon-timelapse c7n-icon-pending c7n-podLog-icon-status " />
          <span className="c7n-container-title">{status}</span>
        </div>);
        break;
      case 'Error':
        statusDom = (<div>
          <span className="icon-timelapse c7n-icon-failed c7n-podLog-icon-status " />
          <span className="c7n-container-title">{status}</span>
        </div>);
        break;
      default:
        statusDom = (<div>
          <span className="icon-help c7n-icon-help c7n-podLog-icon-status " />
        </div>);
    }

    return (
      <div className="c7n-region page-container c7n-container-wrapper">
        {contentDom}
        <Sidebar
          visible={ContainerStore.show}
          title="查看容器日志"
          onOk={this.closeSidebar}
          className="c7n-podLog-content c7n-region"
          okText="取消"
          okCancel={false}
        >
          <h2 className="c7n-space-first">查看容器&quot;{containerName}&quot;的日志</h2>
          <p>
            您可在此查看该容器的日志进行错误定位和状态监控。
            <a href="http://choerodon.io/zh/docs/user-guide/deploy/container-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          <header>
            <table className="c7n-podLog-table">
              <thead>
                <tr>
                  <td className="c7n-podLog-column">
                    <span className="icon-restore c7n-podLog-icon" />
                    <span className="c7n-podLog-title">状态</span>
                  </td>
                  <td className="c7n-podLog-column">
                    <span className="icon-room c7n-podLog-icon" />
                    <span className="c7n-podLog-title">容器地址</span>
                  </td>
                  <td className="c7n-podLog-column">
                    <span className="icon-live_help c7n-podLog-icon" />
                    <span className="c7n-podLog-title">是否可用</span>
                  </td>
                  <td className="c7n-podLog-column">
                    <span className="icon-date_range c7n-podLog-icon" />
                    <span className="c7n-podLog-title">创建时间</span>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="c7n-podLog-column">
                    {statusDom}
                  </td>
                  <td className="c7n-podLog-column">
                    <span className="c7n-podLog-text c7n-podLog-text-hasPadding ">{ip}</span>
                  </td>
                  <td className="c7n-podLog-column">
                    <span className="c7n-podLog-text c7n-podLog-text-hasPadding ">{ready ? '可用' : '不可用'}</span>
                  </td>
                  <td className="c7n-podLog-column-text">
                    <TimePopover content={creationDate} className="c7n-podLog-text c7n-podLog-text-hasPadding" />
                  </td>
                </tr>
              </tbody>
            </table>
          </header>
          <section className="c7n-podLog-section">
            <ReactAce
              mode="text"
              theme="terminal"
              setReadOnly
              setShowPrintMargin={false}
              style={{ height: '500px' }}
              ref={(instance) => { this.ace = instance; }}
            />
          </section>
        </Sidebar>

      </div>
    );
  }
}

export default withRouter(ContainerHome);
