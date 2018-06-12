/* eslint-disable no-console */
import React, { Component } from 'react';
import { Table, Button, Modal, Tooltip, Popover } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { fromJS, is } from 'immutable';
import ReactAce from 'react-ace-editor';
import _ from 'lodash';
import 'brace/mode/text';
import 'brace/theme/terminal';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import LoadingBar from '../../../../components/loadingBar';
import './ContainerHome.scss';
import '../../../main.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const Sidebar = Modal.Sidebar;
const { AppState } = stores;

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
    const projectId = parseInt(AppState.currentMenuType.id);
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    return [{
      title: Choerodon.languageChange('container.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      sorter: true,
      render: (text, record) => {
        let dom = null;
        switch (record.status) {
          case 'Completed':
            dom = (<div>
              <MouserOverWrapper text={record.status} width={78}>
                <span className="icon icon-check_circle c7n-icon-success" />
                <span className="c7n-container-title">{record.status}</span>
              </MouserOverWrapper>
            </div>);
            break;
          case 'Running':
            dom = (<div>
              <span className="icon icon-check_circle c7n-icon-running" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Error':
            dom = (<div>
              <span className="icon icon-cancel c7n-icon-failed" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Pending':
            dom = (<div>
              <span className="icon icon-timelapse c7n-icon-pending" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          default:
            dom = (<div>
              <MouserOverWrapper text={record.status} width={78}>
                <span className="icon icon-help c7n-icon-help" />
                <span className="c7n-container-title">{record.status}</span>
              </MouserOverWrapper>
            </div>);
        }
        return dom;
      },
    }, {
      title: Choerodon.languageChange('container.name'),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      filters: [],
      filterMultiple: false,
      render: (test, record) => (<MouserOverWrapper text={record.name} width={300}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: Choerodon.languageChange('container.app'),
      dataIndex: 'app',
      key: 'app',
      filters: [],
      filterMultiple: false,
      render: (text, record) => (<div>
        <div className="c7n-container-col-inside">
          {record.projectId === projectId ? <Tooltip title="本项目"><span className="icon icon-project c7n-icon-publish" /></Tooltip> : <Tooltip title="应用市场"><span className="icon icon-apps c7n-icon-publish" /></Tooltip>}
          <span>{record.appName}</span>
        </div>
        <div>
          <MouserOverWrapper text={record.appVersion} width={200}>
            <span className="c7n-deploy-text_gray">{record.appVersion}</span>
          </MouserOverWrapper>
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
      width: 58,
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
        {record.ready ? <span className="icon icon-done" /> : <span className="icon icon-close" />}
      </div>),
    }, {
      width: 93,
      title: Choerodon.languageChange('container.createTime'),
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }, {
      width: 64,
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
                <span className="icon icon-insert_drive_file" />
              </Button>
            </Popover>
          </Permission>
        </div>
      ),
    }];
  };

  loadLog = () => {
    const authToken = document.cookie.split('=')[1];
    const logs = [];
    const ws = new WebSocket(`ws://POD_WEBSOCKET_URL/ws/log?key=env:${this.state.namespace}.envId:${this.state.envId}.log:${this.state.logId}&podName=${this.state.podName}&containerName=${this.state.containerName}&logId=${this.state.logId}&token=${authToken}`);
    const editor = this.ace.editor;
    this.setState({
      ws,
    });
    editor.setValue('No Logs.');
    editor.$blockScrolling = Infinity;
    ws.onopen = () => {
      console.log('open.........');
    };
    ws.onmessage = (e) => {
      const reader = new FileReader();
      reader.readAsText(e.data, 'utf-8');
      reader.onload = () => {
        logs.push(reader.result);
        if (logs.length > 0) {
          const logString = _.join(logs, '');
          editor.setValue(logString);
          editor.renderer.scrollCursorIntoView();
          editor.getAnimatedScroll();
          editor.clearSelection();
        } else {
          editor.setValue('No Logs.');
        }
      };
    };
    editor.clearSelection();
  };

  /**
   * 显示日志
   * @param record 容器record
   */
  showLog =(record) => {
    const { ContainerStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    ContainerStore.loadPodParam(projectId, record.id)
      .then((data) => {
        this.setState({
          envId: record.envId,
          namespace: record.namespace,
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
      console.log('Connection instanceInfo Close ...');
    };
    const editor = this.ace.editor;
    this.loadAllData(this.state.page);
    ContainerStore.changeShow(false);
    editor.setValue('No Logs.');
  };

  render() {
    const { ContainerStore } = this.props;
    const { containerName } = this.state;
    const serviceData = ContainerStore.getAllData.slice();
    const projectName = AppState.currentMenuType.name;
    const contentDom = ContainerStore.isRefresh ? <LoadingBar display /> : (<React.Fragment>
      <Header title={Choerodon.languageChange('container.title')}>
        <Button
          onClick={this.handleRefresh}
        >
          <span className="icon-refresh icon" />
          <span>{Choerodon.languageChange('refresh')}</span>
        </Button>
      </Header>
      <Content className="page-content">
        <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的容器管理</h2>
        <p>
          容器管理便于您查看和管理Kubernetes中应用实例生成的容器，
          可以实时查看相关容器的地址、创建时间、状态，确定容器是否正常运行且通过健康检查，并且可以查看容器日志进行错误定位和状态监控。
          <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/container/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
              了解详情
            </span>
            <span className="icon icon-open_in_new" />
          </a>
        </p>
        <Table
          filterBarPlaceholder="过滤表"
          loading={ContainerStore.loading}
          pagination={ContainerStore.pageInfo}
          columns={this.getColumn()}
          dataSource={serviceData}
          rowKey={record => record.id}
          onChange={this.tableChange}
        />
      </Content>
    </React.Fragment>);

    return (
      <Page className="c7n-region page-container c7n-container-wrapper">
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
            <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/container/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
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

      </Page>
    );
  }
}

export default withRouter(ContainerHome);
