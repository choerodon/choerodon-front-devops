/* eslint-disable dot-notation */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Button, Modal, Tooltip, Icon } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import CodeMirror from 'react-codemirror';
import _ from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import { hterm, lib } from 'hterm-umdjs';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import LoadingBar from '../../../../components/loadingBar';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import '../../../main.scss';
import './ContainerHome.scss';
import './Term.scss';

const Sidebar = Modal.Sidebar;
const { AppState } = stores;

@commonComponent('ContainerStore')
@observer
class ContainerHome extends Component {
  @observable term = null;

  @observable conn = null;

  @observable io = null;

  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      showSide: false,
      showDebug: false,
    };
    this.timer = null;
  }

  componentDidMount() {
    this.loadAllData(this.state.page);
  }

  componentWillUnmount() {
    if (this.state.ws) {
      this.closeSidebar();
    } else if (this.conn) {
      this.closeTerm();
    }
  }

  /**
   * TerminalReady
   */
  @action
  onTerminalReady() {
    this.io = this.term.io.push();
    this.onTerminalResponseReceived();
  }

  /**
   * Called when .../shell/... resource is fetched
   */
  @action
  onTerminalResponseReceived() {
    const { namespace, envId, logId, podName, containerName } = this.state;
    const authToken = document.cookie.split('=')[1];
    this.conn = new WebSocket(`POD_WEBSOCKET_URL/ws/exec?key=env:${namespace}.envId:${envId}.exec:${logId}&podName=${podName}&containerName=${containerName}&logId=${logId}&token=${authToken}`);
    this.conn.onopen = this.onConnectionOpen.bind(this);
    this.conn.onmessage = this.onConnectionMessage.bind(this);
    this.conn.onclose = this.onConnectionClose.bind(this);
  }

  /**
   * Attached to SockJS.onopen
   */
  @action
  onConnectionOpen() {
    this.io.onVTKeystroke = this.onTerminalVTKeystroke.bind(this);
    this.io.sendString = this.onTerminalSendString.bind(this);
    this.io.onTerminalResize = this.onTerminalResize.bind(this);
  }

  /**
   * Attached to SockJS.onmessage
   * @param evt
   */
  onConnectionMessage(evt) {
    const msg = { Data: evt.data };
    this.io.print(msg['Data']);
  }

  /**
   * Attached to SockJS.onclose
   * @param evt
   */
  onConnectionClose(evt) {
    if (evt && evt.reason !== '' && evt.code < 1000) {
      this.io.showOverlay(evt.reason, null);
    } else {
      this.io.showOverlay('Connection closed', null);
    }
    this.conn.close();
    this.term.uninstallKeyboard();
    this.term.io.flush();
  }

  /**
   * Attached to hterm.io.onVTKeystroke
   * @param str
   */
  onTerminalVTKeystroke(str) {
    // this.conn.send(JSON.stringify({ Op: 'stdin', Data: str }));
    this.conn.send(str);
  }

  /**
   * Attached to hterm.io.sendString
   * @param str
   */
  onTerminalSendString(str) {
    // this.conn.send(JSON.stringify({ Op: 'stdin', Data: str }));
    this.conn.send(str);
  }

  /**
   * Attached to hterm.io.onTerminalResize
   * @param columns
   * @param rows
   */
  onTerminalResize(columns, rows) {
    // this.conn.send(JSON.stringify({ Op: 'resize', Cols: columns, Rows: rows }));
  }

  /**
   * 打开Term
   */
  @action
  openTerminal() {
    const target = document.getElementById('c7n-shell-term');
    hterm.defaultStorage = new lib.Storage.Memory();
    if (!this.term) {
      this.term = new hterm.Terminal();
      this.term.decorate(target);
    }
    target.firstChild.style.position = null;
    this.term.installKeyboard();
    this.term.setCursorVisible(true);
    this.term.onTerminalReady = this.onTerminalReady.bind(this);
  }

  /**
   * 关闭Term
   */
  closeTerm = () => {
    this.term.clear();
    this.setState({
      showDebug: false,
    });
    if (this.conn) {
      this.onConnectionClose();
    }
  };

  /**
   * 获取行
   */
  getColumn = () => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    return [{
      title: <FormattedMessage id="container.status" />,
      dataIndex: 'status',
      key: 'status',
      width: 110,
      sorter: true,
      render: (text, record) => {
        let dom = null;
        switch (record.status) {
          case 'Completed':
            dom = (<div>
              <MouserOverWrapper text={record.status} width={0.073}>
                <i className="icon icon-check_circle c7n-icon-success c7n-container-i" />
                <span className="c7n-container-title">{record.status}</span>
              </MouserOverWrapper>
            </div>);
            break;
          case 'Running':
            dom = (<div>
              <i className="icon icon-check_circle c7n-icon-running c7n-container-i" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Error':
            dom = (<div>
              <i className="icon icon-cancel c7n-icon-failed c7n-container-i" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Pending':
            dom = (<div>
              <i className="icon icon-timelapse c7n-icon-pending c7n-container-i" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          default:
            dom = (<div>
              <MouserOverWrapper text={record.status} width={0.073}>
                <i className="icon icon-help c7n-icon-help c7n-container-i" />
                <span className="c7n-container-title">{record.status}</span>
              </MouserOverWrapper>
            </div>);
        }
        return dom;
      },
    }, {
      title: <FormattedMessage id="container.name" />,
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      filters: [],
      filterMultiple: false,
      render: (test, record) => (<MouserOverWrapper text={record.name} width={0.3}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="container.app" />,
      dataIndex: 'app',
      key: 'app',
      filters: [],
      filterMultiple: false,
      render: (text, record) => (<div>
        <div className="c7n-container-col-inside">
          {record.projectId === projectId ? <Tooltip title={<FormattedMessage id="project" />}><i className="icon icon-project c7n-icon-publish" /></Tooltip> : <Tooltip title={<FormattedMessage id="market" />}><i className="icon icon-apps c7n-icon-publish" /></Tooltip>}
          <span>{record.appName}</span>
        </div>
        <div>
          <MouserOverWrapper text={record.appVersion} width={0.2}>
            <span className="c7n-deploy-text_gray">{record.appVersion}</span>
          </MouserOverWrapper>
        </div>
      </div>),
    }, {
      title: <FormattedMessage id="deploy.env" />,
      key: 'envCode',
      filters: [],
      render: record => (
        <div>
          <div className="c7n-deploy-col-inside">
            {record.connect ? <Tooltip title={<FormattedMessage id="connect" />}><span className="c7n-ist-status_on" /></Tooltip> : <Tooltip title={<FormattedMessage id="disconnect" />}><span className="c7n-ist-status_off" /></Tooltip>}
            <span>{record.envName}</span>
          </div>
          <div>
            <span className="c7n-deploy-text_gray">{record.envCode}</span>
          </div>
        </div>
      ),
    }, {
      title: <FormattedMessage id="container.ip" />,
      dataIndex: 'ip',
      key: 'ip',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      width: 58,
      title: <FormattedMessage id="container.usable" />,
      dataIndex: 'ready',
      key: 'ready',
      filters: [{
        text: this.props.intl.formatMessage({ id: 'container.usable' }),
        value: '1',
      }, {
        text: this.props.intl.formatMessage({ id: 'container.disable' }),
        value: '0',
      }],
      filterMultiple: false,
      render: (text, record) => (<div className="c7n-container-table">
        {record.ready ? <i className="icon icon-done" /> : <i className="icon icon-close" />}
      </div>),
    }, {
      width: 93,
      title: <FormattedMessage id="container.createTime" />,
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }, {
      width: 80,
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.devops-env-pod-container.queryLogByPod']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Tooltip title={<FormattedMessage id="container.log" />}>
              <Button
                size="small"
                shape="circle"
                onClick={this.showLog.bind(this, record)}
              >
                <Icon type="insert_drive_file" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission
            service={['devops-service.devops-env-pod-container.queryLogByPod']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Tooltip title={<FormattedMessage id="container.term" />}>
              <Button
                size="small"
                shape="circle"
                onClick={this.showTerm.bind(this, record)}
              >
                <Icon type="debug" />
              </Button>
            </Tooltip>
          </Permission>
        </div>
      ),
    }];
  };

  /**
   * 加载日志
   */
  loadLog = () => {
    const authToken = document.cookie.split('=')[1];
    const logs = [];
    let oldLogs = [];
    const { namespace, envId, logId, podName, containerName } = this.state;
    const ws = new WebSocket(`POD_WEBSOCKET_URL/ws/log?key=env:${namespace}.envId:${envId}.log:${logId}&podName=${podName}&containerName=${containerName}&logId=${logId}&token=${authToken}`);
    const editor = this.editorLog.getCodeMirror();
    this.setState({ ws });
    editor.setValue('Loading...');
    ws.onmessage = (e) => {
      if (e.data.size) {
        const reader = new FileReader();
        reader.readAsText(e.data, 'utf-8');
        reader.onload = () => {
          if (reader.result !== '') {
            logs.push(reader.result);
          }
        };
      }
    };
    if (logs.length > 0) {
      const logString = _.join(logs, '');
      editor.setValue(logString);
    }
    this.timer = setInterval(() => {
      if (logs.length > 0) {
        if (!_.isEqual(logs, oldLogs)) {
          const logString = _.join(logs, '');
          editor.setValue(logString);
          editor.execCommand('goDocEnd');
          // 如果没有返回数据，则不进行重新赋值给编辑器
          oldLogs = _.cloneDeep(logs);
        }
      } else {
        editor.setValue('Loading...');
      }
    }, 1000);
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
          showSide: true,
        });
        this.loadLog();
      });
  };

  /**
   * 关闭日志
   */
  closeSidebar = () => {
    clearInterval(this.timer);
    this.timer = null;
    const { ws, page } = this.state;
    if (ws) {
      ws.close();
    }
    const editor = this.editorLog.getCodeMirror();
    this.setState({ showSide: false }, () => {
      editor.setValue('');
    });
    this.loadAllData(page);
  };

  /**
   * 显示运行命令窗口
   * @param record 容器record
   */
  showTerm = (record) => {
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
          showDebug: true,
        });
        this.openTerminal();
      });
  };

  render() {
    const { ContainerStore } = this.props;
    const { showSide, podName, containerName, showDebug } = this.state;
    const serviceData = ContainerStore.getAllData.slice();
    const projectName = AppState.currentMenuType.name;
    const contentDom = ContainerStore.isRefresh ? <LoadingBar display /> : (<React.Fragment>
      <Header title={<FormattedMessage id="container.header.title" />}>
        <Button
          onClick={this.handleRefresh}
        >
          <i className="icon-refresh icon" />
          <span>{<FormattedMessage id="refresh" />}</span>
        </Button>
      </Header>
      <Content className="page-content" code="container" values={{ name: projectName }}>
        <Table
          filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
          loading={ContainerStore.loading}
          pagination={ContainerStore.pageInfo}
          columns={this.getColumn()}
          dataSource={serviceData}
          rowKey={record => record.id}
          onChange={this.tableChange}
        />
      </Content>
    </React.Fragment>);

    const options = {
      readOnly: true,
      lineNumbers: true,
      autofocus: true,
      theme: 'base16-dark',
    };

    return (
      <Page
        className="c7n-region"
        service={[
          'devops-service.devops-env-pod.pageByOptions',
          'devops-service.devops-env-pod-container.queryLogByPod',
        ]}
      >
        {contentDom}
        <Sidebar
          visible={showSide}
          title={<FormattedMessage id="container.log.header.title" />}
          onOk={this.closeSidebar}
          className="c7n-podLog-content c7n-region"
          okText={<FormattedMessage id="cancel" />}
          okCancel={false}
          destroyOnClose
        >
          <Content className="sidebar-content" code="container.log" values={{ name: podName }}>
            <section className="c7n-podLog-section">
              <CodeMirror
                ref={(editor) => { this.editorLog = editor; }}
                value="Loading..."
                className="c7n-podLog-editor"
                onChange={code => this.props.ChangeCode(code)}
                options={options}
              />
            </section>
          </Content>
        </Sidebar>
        <Sidebar
          visible={showDebug}
          title={<FormattedMessage id="container.term" />}
          onOk={this.closeTerm.bind(this)}
          className="c7n-podLog-content c7n-region"
          okText={<FormattedMessage id="cancel" />}
          okCancel={false}
          destroyOnClose
        >
          <div className="c7n-content-card-wrap c7n-shell-content-card">
            <div className="c7n-content-card">
              <div className="c7n-content-card-content">
                <div className="c7n-content-card-content-title c7n-md-title c7n-padding">
                  <div className="c7n-shell-title">
                    <FormattedMessage id="container.term.ex" />&nbsp;
                    {containerName}&nbsp;In&nbsp;{podName}
                  </div>
                </div>
                <div className="c7n-content-card-transclude-content">
                  <div className="c7n-content">
                    <div className="c7n-shell-term" id="c7n-shell-term" />
                  </div>
                </div>
                <div className="c7n-content-card-content-footer" />
              </div>
            </div>
          </div>
        </Sidebar>
      </Page>
    );
  }
}

export default withRouter(injectIntl(ContainerHome));
