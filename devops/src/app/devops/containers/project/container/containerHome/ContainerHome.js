import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Button, Modal, Tooltip, Select } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import CodeMirror from 'react-codemirror';
import _ from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import LoadingBar from '../../../../components/loadingBar';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import '../../../main.scss';
import './ContainerHome.scss';

const Sidebar = Modal.Sidebar;
const Option = Select.Option;
const { AppState } = stores;

@commonComponent('ContainerStore')
@observer
class ContainerHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      containerArr: [],
      showSide: false,
      fullscreen: false,
      following: true,
    };
    this.timer = null;
  }

  componentDidMount() {
    this.loadAllData(this.state.page);
  }

  componentWillUnmount() {
    if (this.state.ws) {
      this.closeSidebar();
    }
  }

  /**
   * 切换container日志
   * @param value
   */
  containerChange = (value) => {
    const { ws, logId } = this.state;
    if (logId !== value.split('+')[0]) {
      if (ws) {
        ws.close();
      }
      this.setState({
        containerName: value.split('+')[1],
        logId: value.split('+')[0],
      }, () => {
        this.loadLog();
      });
    }
  };

  /**
   * 获取行
   *
   */
  getColumn = () => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    return [{
      title: <FormattedMessage id={'container.status'} />,
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
      title: <FormattedMessage id={'container.name'} />,
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      filters: [],
      filterMultiple: false,
      render: (test, record) => (<MouserOverWrapper text={record.name} width={0.3}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id={'container.app'} />,
      dataIndex: 'app',
      key: 'app',
      filters: [],
      filterMultiple: false,
      render: (text, record) => (<div>
        <div className="c7n-container-col-inside">
          {record.projectId === projectId ? <Tooltip title={<FormattedMessage id={'project'} />}><i className="icon icon-project c7n-icon-publish" /></Tooltip> : <Tooltip title={<FormattedMessage id={'market'} />}><i className="icon icon-apps c7n-icon-publish" /></Tooltip>}
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
      title: <FormattedMessage id={'container.ip'} />,
      dataIndex: 'ip',
      key: 'ip',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      width: 58,
      title: <FormattedMessage id={'container.usable'} />,
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
      title: <FormattedMessage id={'container.createTime'} />,
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }, {
      width: 56,
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.devops-env-pod-container.queryLogByPod']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Tooltip title={<FormattedMessage id={'container.log'} />}>
              <Button
                size="small"
                shape="circle"
                onClick={this.showLog.bind(this, record)}
              >
                <i className="icon icon-insert_drive_file" />
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
  loadLog = (followingOK) => {
    const authToken = document.cookie.split('=')[1];
    const logs = [];
    let oldLogs = [];
    const { namespace, envId, logId, podName, containerName } = this.state;
    const ws = new WebSocket(`POD_WEBSOCKET_URL/ws/log?key=env:${namespace}.envId:${envId}.log:${logId}&podName=${podName}&containerName=${containerName}&logId=${logId}&token=${authToken}`);
    const editor = this.editorLog.getCodeMirror();
    this.setState({ ws, following: true });
    if (!followingOK) {
      editor.setValue('Loading...');
    }
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
   * 日志go top
   */
  goTop = () => {
    const editor = this.editorLog.getCodeMirror();
    editor.execCommand('goDocStart');
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
        if (data.length) {
          this.setState({
            envId: record.envId,
            namespace: record.namespace,
            containerArr: data,
            podName: data[0].podName,
            containerName: data[0].containerName,
            logId: data[0].logId,
            showSide: true,
          });
        }
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
   * top log following
   */
  stopFollowing = () => {
    const { ws } = this.state;
    if (ws) {
      ws.close();
    }
    this.setState({
      following: false,
    });
  };

  /**
   *  全屏查看日志
   */
  setFullscreen = () => {
    const cm = this.editorLog.getCodeMirror();
    const wrap = cm.getWrapperElement();
    cm.state.fullScreenRestore = {
      scrollTop: window.pageYOffset,
      scrollLeft: window.pageXOffset,
      width: wrap.style.width,
      height: wrap.style.height,
    };
    wrap.style.width = '';
    wrap.style.height = 'auto';
    wrap.className += ' CodeMirror-fullscreen';
    this.setState({ fullscreen: true });
    document.documentElement.style.overflow = 'hidden';
    cm.refresh();
    window.addEventListener('keypress', (e) => {
      this.setNormal(e.which);
    });
  };

  /**
   * 任意键退出全屏查看
   */
  setNormal = () => {
    const cm = this.editorLog.getCodeMirror();
    const wrap = cm.getWrapperElement();
    wrap.className = wrap.className.replace(/\s*CodeMirror-fullscreen\b/, '');
    this.setState({ fullscreen: false });
    document.documentElement.style.overflow = '';
    const info = cm.state.fullScreenRestore;
    wrap.style.width = info.width; wrap.style.height = info.height;
    window.scrollTo(info.scrollLeft, info.scrollTop);
    cm.refresh();
    window.removeEventListener('keypress', (e) => {
      this.setNormal(e.which);
    });
  };

  render() {
    const { ContainerStore } = this.props;
    const { podName, containerArr, showSide, fullscreen, following, containerName } = this.state;
    const serviceData = ContainerStore.getAllData.slice();
    const projectName = AppState.currentMenuType.name;
    const contentDom = ContainerStore.isRefresh ? <LoadingBar display /> : (<React.Fragment>
      <Header title={<FormattedMessage id={'container.header.title'} />}>
        <Button
          onClick={this.handleRefresh}
        >
          <i className="icon-refresh icon" />
          <span>{<FormattedMessage id={'refresh'} />}</span>
        </Button>
      </Header>
      <Content className="page-content" code={'container'} values={{ name: projectName }}>
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

    const containerDom = containerArr.length && (_.map(containerArr, c => <Option key={c.logId} value={`${c.logId}+${c.containerName}`}>{c.containerName}</Option>));

    const options = {
      readOnly: true,
      lineNumbers: true,
      lineWrapping: true,
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
          title={<FormattedMessage id={'container.log.header.title'} />}
          onOk={this.closeSidebar}
          className="c7n-podLog-content c7n-region"
          okText={<FormattedMessage id={'cancel'} />}
          okCancel={false}
          destroyOnClose
        >
          <Content className="sidebar-content" code={'container.log'} values={{ name: podName }}>
            <section className="c7n-podLog-section">
              <div className="c7n-podLog-hei-wrap">
                <div className="c7n-podShell-title">
                  <FormattedMessage id="container.term.log" />&nbsp;
                  <Select value={containerName} onChange={this.containerChange}>
                    {containerDom}
                  </Select>
                  <Button type="primary" funcType="flat" shape="circle" icon="fullscreen" onClick={this.setFullscreen} />
                </div>
                {following ? <div className={`c7n-podLog-action log-following ${fullscreen ? 'f-top' : ''}`} onClick={this.stopFollowing}>Stop Following</div>
                  : <div className={`c7n-podLog-action log-following ${fullscreen ? 'f-top' : ''}`} onClick={this.loadLog.bind(this, true)}>Start Following</div>}
                <CodeMirror
                  ref={(editor) => { this.editorLog = editor; }}
                  value="Loading..."
                  className="c7n-podLog-editor"
                  onChange={code => this.props.ChangeCode(code)}
                  options={options}
                />
                <div className={`c7n-podLog-action log-goTop ${fullscreen ? 'g-top' : ''}`} onClick={this.goTop}>Go Top</div>
              </div>
            </section>
          </Content>
        </Sidebar>
      </Page>
    );
  }
}

export default withRouter(injectIntl(ContainerHome));
