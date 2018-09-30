/* eslint-disable dot-notation */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Button, Modal, Tooltip, Icon, Select, Popover } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import CodeMirror from 'react-codemirror';
import _ from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import { hterm, lib } from 'hterm-umdjs';
import TimePopover from '../../../../components/timePopover';
import LoadingBar from '../../../../components/loadingBar';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import StatusTags from '../../../../components/StatusTags';
import '../../../main.scss';
import './ContainerHome.scss';
import './Term.scss';

const Sidebar = Modal.Sidebar;
const { Option, OptGroup } = Select;
const { AppState } = stores;

@observer
class ContainerHome extends Component {
  @observable term = null;

  @observable conn = null;

  @observable io = null;

  constructor(props) {
    super(props);
    this.state = {
      showSide: false,
      showDebug: false,
      following: true,
      fullscreen: false,
      containerArr: [],
      selectPubPage: 0,
      selectProPage: 0,
      appPubLength: 0,
      appProLength: 0,
      appPubDom: [],
      appProDom: [],
    };
    this.timer = null;
  }

  componentDidMount() {
    const { ContainerStore } = this.props;
    const { selectProPage, selectPubPage } = this.state;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    ContainerStore.loadActiveEnv(projectId);
    ContainerStore.loadAppData(projectId);
    ContainerStore.loadData(false, projectId);
    this.loadSelectData([selectProPage, selectPubPage], '');
  }

  componentWillUnmount() {
    const { ContainerStore } = this.props;
    if (this.state.ws) {
      this.closeSidebar();
    } else if (this.conn) {
      this.closeTerm();
    }
    ContainerStore.setEnvCard([]);
    ContainerStore.setAllData([]);
    ContainerStore.setAppId();
    ContainerStore.setEnvId();
  }

  /**
   * 处理刷新函数
   */
  handleRefresh = () => {
    const { ContainerStore } = this.props;
    const { filters, sort, paras } = ContainerStore.getInfo;
    const pagination = ContainerStore.getPageInfo;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    ContainerStore.loadActiveEnv(projectId);
    ContainerStore.loadAppData(projectId);
    this.tableChange(pagination, filters, sort, paras);
  };

  /**
   * table 操作
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange =(pagination, filters, sorter, paras) => {
    const { ContainerStore } = this.props;
    const { id } = AppState.currentMenuType;
    ContainerStore.setInfo({ filters, sort: sorter, paras });
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
    const envId = ContainerStore.getEnvId;
    const appId = ContainerStore.getappId;
    ContainerStore.loadData(false, id, envId, appId, page, pagination.pageSize, sort, postData);
  };

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
      });
      setTimeout(() => {
        this.loadLog();
      }, 1000);
    }
  };

  /**
   * 切换container shell
   * @param value
   */
  termChange = (value) => {
    const { logId } = this.state;
    if (logId !== value.split('+')[0]) {
      if (this.conn) {
        this.onConnectionClose();
      }
      this.setState({
        containerName: value.split('+')[1],
        logId: value.split('+')[0],
      });
      setTimeout(() => {
        this.onTerminalReady();
      }, 1000);
    }
  };

  /**
   * TerminalReady
   */
  @action
  onTerminalReady() {
    this.term.installKeyboard();
    this.io = this.term.io.push();
    this.onTerminalResponseReceived();
    this.io.showOverlay(`${this.term.screenSize.width}x${this.term.screenSize.height}`);
  }

  /**
   * Called when .../shell/... resource is fetched
   */
  @action
  onTerminalResponseReceived() {
    const { namespace, envId, logId, podName, containerName } = this.state;
    const authToken = document.cookie.split('=')[1];
    try {
      this.conn = new WebSocket(`POD_WEBSOCKET_URL/ws/exec?key=env:${namespace}.envId:${envId}.exec:${logId}&podName=${podName}&containerName=${containerName}&logId=${logId}&token=${authToken}`);
      this.conn.onopen = this.onConnectionOpen.bind(this);
      this.conn.onmessage = this.onConnectionMessage.bind(this);
      this.conn.onclose = this.onConnectionClose.bind(this);
    } catch (e) {
      // e
    }
  }

  /**
   * Attached to SockJS.onopen
   */
  @action
  onConnectionOpen() {
    this.io.onVTKeystroke = this.onTerminalVTKeystroke.bind(this);
    this.io.sendString = this.onTerminalSendString.bind(this);
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
   */
  @action
  onConnectionClose(evt) {
    if (evt && evt.reason !== '' && evt.code < 1000) {
      this.io.showOverlay(evt.reason, null);
    } else {
      this.io.showOverlay('Connection closed', null);
    }
    this.conn.close();
    this.term.uninstallKeyboard();
    this.term.io.flush();
    this.term.reset();
  }

  /**
   * Attached to hterm.io.onVTKeystroke
   * @param str
   */
  onTerminalVTKeystroke(str) {
    this.conn.send(str);
  }

  /**
   * Attached to hterm.io.sendString
   * @param str
   */
  onTerminalSendString(str) {
    this.conn.send(str);
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
      this.term.onTerminalReady = this.onTerminalReady.bind(this);
    } else {
      this.onTerminalReady();
    }
  }

  /**
   * 关闭Term
   */
  closeTerm = () => {
    this.term.reset();
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
    const { ContainerStore, intl } = this.props;
    const { filters, sort: { columnKey, order } } = ContainerStore.getInfo;
    return [{
      title: <FormattedMessage id="container.status" />,
      dataIndex: 'status',
      key: 'status',
      width: 110,
      sorter: true,
      render: this.getActive,
    }, {
      title: <FormattedMessage id="container.name" />,
      key: 'name',
      width: '20%',
      dataIndex: 'name',
      sorter: true,
      filters: [],
      filterMultiple: false,
      filteredValue: filters.name || [],
      render: (test, record) => (<MouserOverWrapper text={record.name} width={0.2}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="container.app" />,
      dataIndex: 'app',
      key: 'app',
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
      filteredValue: filters.ip || [],
    }, {
      width: 68,
      title: <FormattedMessage id="container.usable" />,
      dataIndex: 'ready',
      key: 'ready',
      filters: [{
        text: intl.formatMessage({ id: 'container.usable' }),
        value: '1',
      }, {
        text: intl.formatMessage({ id: 'container.disable' }),
        value: '0',
      }],
      filterMultiple: false,
      filteredValue: filters.ready || [],
      render: (text, record) => (<div className="c7n-container-table">
        {record.ready ? <i className="icon icon-done" /> : <i className="icon icon-close" />}
      </div>),
    }, {
      width: 103,
      title: <FormattedMessage id="container.createTime" />,
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      sortOrder: columnKey === 'creationDate' && order,
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
            service={['devops-service.devops-env-pod-container.handleShellByPod']}
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
   * 获取状态
   * @param text
   * @param record
   * @returns {*}
   */
  getActive = (text, record) => {
    const { status } = record;
    let dom = null;
    let el = null;
    switch (status) {
      case 'Completed':
        dom = {
          wrap: true,
          color: '#00bf96',
        };
        break;
      case 'Running':
        dom = {
          wrap: false,
          color: '#00bf96',
        };
        break;
      case 'Error':
        dom = {
          wrap: false,
          color: '#f44336',
        };
        break;
      case 'Pending':
        dom = {
          wrap: false,
          color: '#ff9915',
        };
        break;
      default:
        dom = {
          wrap: true,
          color: 'rgba(0, 0, 0, 0.36)',
        };
    }
    if (dom && dom.wrap) {
      el = (<MouserOverWrapper text={status} width={0.073}>
        <StatusTags color={dom.color} name={status} />
      </MouserOverWrapper>);
    } else {
      el = (<StatusTags color={dom.color} name={status} />);
    }
    return el;
  };

  /**
   * 加载日志
   */
  @action
  loadLog = (followingOK) => {
    const { namespace, envId, logId, podName, containerName, following } = this.state;
    const authToken = document.cookie.split('=')[1];
    const logs = [];
    let oldLogs = [];
    let editor = null;
    if (this.editorLog) {
      editor = this.editorLog.getCodeMirror();
      try {
        const ws = new WebSocket(`POD_WEBSOCKET_URL/ws/log?key=env:${namespace}.envId:${envId}.log:${logId}&podName=${podName}&containerName=${containerName}&logId=${logId}&token=${authToken}`);
        this.setState({ ws, following: true });
        if (!followingOK) {
          editor.setValue('Loading...');
        }
        ws.onopen = () => {
          editor.setValue('Loading...');
        };
        ws.onerror = (e) => {
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          logs.push('连接出错，请重新打开');
          editor.setValue(_.join(logs, ''));
          editor.execCommand('goDocEnd');
        };
        ws.onclose = (e) => {
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          if (following) {
            logs.push('连接已断开');
            editor.setValue(_.join(logs, ''));
          }
          editor.execCommand('goDocEnd');
        };
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
          if (!logs.length) {
            const logString = _.join(logs, '');
            editor.setValue(logString);
          }
        };

        this.timer = setInterval(() => {
          if (logs.length > 0) {
            if (!_.isEqual(logs, oldLogs)) {
              const logString = _.join(logs, '');
              editor.setValue(logString);
              editor.execCommand('goDocEnd');
              // 如果没有返回数据，则不进行重新赋值给编辑器
              oldLogs = _.cloneDeep(logs);
            }
          } else if (!followingOK) {
            editor.setValue('Loading...');
          }
        });
      } catch (e) {
        editor.setValue('连接失败');
      }
    }
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
  showLog = (record) => {
    const { ContainerStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    ContainerStore.loadPodParam(projectId, record.id)
      .then((data) => {
        if (data && data.length) {
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
    const editor = this.editorLog.getCodeMirror();
    const { ws } = this.state;
    clearInterval(this.timer);
    this.timer = null;
    if (ws) {
      ws.close();
    }
    this.setState({
      showSide: false,
      containerArr: [],
    }, () => {
      editor.setValue('');
    });
  };

  /**
   * top log following
   */
  stopFollowing = () => {
    const { ws } = this.state;
    if (ws) {
      ws.close();
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setState({
      following: false,
    });
  };

  /**
   * 显示运行命令窗口
   * @param record 容器record
   */
  showTerm = (record) => {
    const { ContainerStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    ContainerStore.loadPodParam(projectId, record.id, 'shell')
      .then((data) => {
        this.setState({
          envId: record.envId,
          namespace: record.namespace,
          containerArr: data,
          podName: data[0].podName,
          containerName: data[0].containerName,
          logId: data[0].logId,
          showDebug: true,
        });
        this.openTerminal();
      });
  };

  /**
   * 环境选择
   * @param value
   */
  handleEnvSelect = (value) => {
    const { ContainerStore } = this.props;
    ContainerStore.setEnvId(value);
    ContainerStore.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
    const appId = ContainerStore.getappId;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    if (!value) {
      ContainerStore.loadAppData(projectId);
      ContainerStore.loadData(false, projectId, value, appId);
    } else {
      ContainerStore.loadAppDataByEnv(projectId, value)
        .then((data) => {
          const appData = ContainerStore.getAppData;
          if (!_.find(appData, app => app.id === appId)) {
            ContainerStore.setAppId(null);
            ContainerStore.loadData(false, projectId, value, null);
          } else {
            ContainerStore.loadData(false, projectId, value, appId);
          }
        });
    }
  };

  /**
   * 应用选择
   * @param value
   */
  handleAppSelect = (value) => {
    const { ContainerStore } = this.props;
    ContainerStore.setAppId(value);
    ContainerStore.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
    const envId = ContainerStore.getEnvId;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    ContainerStore.loadData(false, projectId, envId, value);
  };

  /**
   * 展开更多
   * @param type
   */
  appDomMore = (type, e) => {
    e.stopPropagation();
    const { ContainerStore } = this.props;
    const { selectProPage, selectPubPage } = this.state;
    const filterValue = ContainerStore.getFilterValue;
    if (type === 'pro') {
      const temp = selectProPage + 1;
      this.setState({
        selectProPage: temp,
      });
      this.loadSelectData([temp, selectPubPage], filterValue);
    } else {
      const temp = selectPubPage + 1;
      this.setState({
        selectPubPage: temp,
      });
      this.loadSelectData([selectProPage, temp], filterValue);
    }
  };

  /**
   * 加载应用
   * @param pageArr
   * @param filterValue
   */
  loadSelectData = (pageArr, filterValue) => {
    const { ContainerStore } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    let allItems = ContainerStore.getAppData;
    const appPubDom = [];
    const appProDom = [];
    let pubLength = 0;
    let proLength = 0;
    const proPageSize = (10 * pageArr[0]) + 3;
    const pubPageSize = (10 * pageArr[1]) + 3;
    if (filterValue) {
      allItems = allItems.filter(item => item.name.toLowerCase().indexOf(filterValue.toLowerCase()) >= 0);
    }
    if (allItems.length) {
      _.map(allItems, (d) => {
        if (d.projectId !== projectId) {
          pubLength += 1;
        } else {
          proLength += 1;
        }
        if (d.projectId !== projectId && appPubDom.length < pubPageSize) {
          appPubDom.push(<Option key={d.id}>
            <Popover
              placement="right"
              content={<div>
                <p>
                  <FormattedMessage id="ist.name" />
                  <span>{d.name}</span>
                </p>
                <p>
                  <FormattedMessage id="ist.ctr" />
                  <span>{d.contributor}</span>
                </p>
                <p>
                  <FormattedMessage id="ist.des" />
                  <span>{d.description}</span>
                </p>
              </div>}
            >
              <div className="c7n-container-option-popover">
                <i className="icon icon-apps c7n-icon-publish" />
                {d.name}
              </div>
            </Popover>
          </Option>);
        } else if (appProDom.length < proPageSize) {
          appProDom.push(<Option key={d.id}>
            <Popover
              placement="right"
              content={<div>
                <p>
                  <FormattedMessage id="ist.name" />
                  <span>{d.name}</span>
                </p>
                <p>
                  <FormattedMessage id="ist.code" />
                  <span>{d.code}</span>
                </p>
              </div>}
            >
              <div className="c7n-container-option-popover">
                <i className="icon icon-project c7n-icon-publish" />
                {d.name}
              </div>
            </Popover>
          </Option>);
        }
      });
    }
    this.setState({
      appPubDom,
      appProDom,
      appPubLength: pubLength,
      appProLength: proLength,
    });
  };

  /**
   * 搜索选择应用
   * @param value
   */
  handleFilter = (value) => {
    const { ContainerStore } = this.props;
    ContainerStore.setFilterValue(value);
    this.setState({
      selectPubPage: 0,
      selectProPage: 0,
    });
    this.loadSelectData([0, 0], value);
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
    window.addEventListener('keydown', (e) => {
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
    window.removeEventListener('keydown', (e) => {
      this.setNormal(e.which);
    });
  };

  render() {
    const { ContainerStore, intl } = this.props;
    const { showSide, following, fullscreen, containerName, podName, containerArr, showDebug, selectProPage, selectPubPage, appProDom, appPubDom, appProLength, appPubLength } = this.state;
    const envNames = ContainerStore.getEnvCard;
    const appId = ContainerStore.getappId;
    const { paras } = ContainerStore.getInfo;
    const proPageSize = (10 * selectProPage) + 3;
    const pubPageSize = (10 * selectPubPage) + 3;
    const serviceData = ContainerStore.getAllData && ContainerStore.getAllData.slice();
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
        <Select
          label={intl.formatMessage({ id: 'container.chooseEnv' })}
          className="c7n-app-select_247"
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filter
          onChange={this.handleEnvSelect}
          allowClear
        >
          {
            _.map(envNames, d => (<Option key={d.id}>
              {d.connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
              {d.name}</Option>))
          }
        </Select>
        <Select
          className="c7n-app-select_247"
          label={intl.formatMessage({ id: 'chooseApp' })}
          value={appId}
          optionFilterProp="children"
          onChange={this.handleAppSelect}
          filterOption={false}
          onFilterChange={this.handleFilter}
          filter
          allowClear
        >
          <OptGroup label={intl.formatMessage({ id: 'project' })} key="proGroup">
            {appProDom}
            { proPageSize < appProLength && (<Option key="more">
              <div role="none" onClick={this.appDomMore.bind(this, 'pro')} className="c7n-container-option-popover c7n-dom-more">
                {intl.formatMessage({ id: 'ist.more' })}
              </div>
            </Option>)}
          </OptGroup>
          <OptGroup label={intl.formatMessage({ id: 'market' })} key="pubGroup">
            {appPubDom}
            { pubPageSize < appPubLength && (<Option key="pubMore">
              <div role="none" onClick={this.appDomMore.bind(this, 'pub')} className="c7n-container-option-popover c7n-dom-more">
                {intl.formatMessage({ id: 'ist.more' })}
              </div>
            </Option>)}
          </OptGroup>
        </Select>
        <Table
          filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
          loading={ContainerStore.loading}
          pagination={ContainerStore.pageInfo}
          columns={this.getColumn()}
          dataSource={serviceData}
          rowKey={record => record.id}
          onChange={this.tableChange}
          filters={paras.slice()}
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
          'devops-service.devops-env-pod-container.handleShellByPod',
        ]}
      >
        {contentDom}
        <Sidebar
          visible={showSide}
          title={<FormattedMessage id="container.log.header.title" />}
          onOk={this.closeSidebar}
          className="c7n-podLog-content c7n-region"
          okText={<FormattedMessage id="close" />}
          okCancel={false}
        >
          <Content className="sidebar-content" code="container.log" values={{ name: podName }}>
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
        <Sidebar
          visible={showDebug}
          title={<FormattedMessage id="container.term" />}
          onOk={this.closeTerm.bind(this)}
          className="c7n-podLog-content c7n-region"
          okText={<FormattedMessage id="close" />}
          okCancel={false}
        >
          <Content className="sidebar-content" code="container.term" values={{ name: podName }}>
            <div className="c7n-content-card-wrap c7n-shell-content-card">
              <div className="c7n-content-card">
                <div className="c7n-content-card-content">
                  <div className="c7n-content-card-content-title c7n-md-title c7n-padding">
                    <div className="c7n-shell-title">
                      <FormattedMessage id="container.term.ex" />&nbsp;
                      <Select value={containerName} onChange={this.termChange}>
                        {containerDom}
                      </Select>
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
          </Content>
        </Sidebar>
      </Page>
    );
  }
}

export default withRouter(injectIntl(ContainerHome));
