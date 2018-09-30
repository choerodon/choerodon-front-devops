/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Form, Collapse, Icon, Input, Tooltip, Modal, Progress, Select } from 'choerodon-ui';
import { Permission, Content, Action, stores } from 'choerodon-front-boot';
import CodeMirror from 'react-codemirror';
import _ from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import ValueConfig from '../../appDeployment/valueConfig';
import UpgradeIst from '../../appDeployment/upgrateIst';
import DelIst from '../../appDeployment/component/delIst/DelIst';
import '../EnvOverview.scss';
import '../../appDeployment/AppDeploy.scss';
import '../../../main.scss';
import ContainerStore from '../../../../stores/project/container';
import AppDeploymentStore from '../../../../stores/project/appDeployment';
import DomainStore from '../../../../stores/project/domain';
import CreateDomain from '../../domain/createDomain';
import CreateNetwork from '../../networkConfig/createNetwork';
import NetworkConfigStore from '../../../../stores/project/networkConfig';
import LoadingBar from '../../../../components/loadingBar';
import '../../container/containerHome/ContainerHome.scss';
import '../../container/containerHome/Term.scss';

const { AppState } = stores;
const Sidebar = Modal.Sidebar;
const Option = Select.Option;
const Panel = Collapse.Panel;

@observer
class AppOverview extends Component {
  @observable pageSize = 10;

  @observable visible = false;

  @observable visibleUp = false;

  @observable openRemove = false;

  @observable page = 0;

  @observable loading = false;

  @observable ist = {};

  @observable idArr = [];

  @observable name = '';

  @observable showSide = false;

  @observable containerName = '';

  @observable containerArr = [];

  @observable podName = '';

  @observable activeKey = [];

  @observable showDomain = false;

  @observable showNetwork = false;

  @observable domainId = null;

  @observable appId = null;

  @observable istId = null;

  @observable appName = '';

  @observable domainType = '';

  @observable domainTitle = '';

  constructor(props, context) {
    super(props, context);
    this.state = {
      ws: false,
      following: true,
      fullscreen: false,
    };
  }

  componentDidMount() {
    const { store } = this.props;
    const refresh = store.getRefresh;
    if (refresh) {
      this.emitEmpty();
    }
  }

  /**
   * 搜索函数
   */
  onSearch = () => {
    this.searchInput.focus();
    const { store, envId } = this.props;
    const projectId = AppState.currentMenuType.id;
    const val = store.getVal;
    const searchParam = {};
    const postData = {
      searchParam,
      param: val.toString(),
    };
    store.loadIstOverview(projectId, envId, postData);
  };

  /**
   * 搜索输入赋值
   * @param e
   */
  @action
  onChangeSearch = (e) => {
    const { store } = this.props;
    store.setVal(e.target.value);
  };

  @action
  onChange = (e) => {
    this.activeKey = e;
  };

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  /**
   * 加载实例总览列表
   */
  loadIstOverview = () => {
    const { store, envId } = this.props;
    const projectId = AppState.currentMenuType.id;
    store.loadIstOverview(projectId, envId);
  };


  /**
   * 查看部署详情
   * @param id 实例ID
   * @param status 实例状态
   */
  linkDeployDetail = (id, status) => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const projectName = AppState.currentMenuType.name;
    const type = AppState.currentMenuType.type;
    const organizationId = AppState.currentMenuType.organizationId;
    this.linkToChange(`/devops/instance/${id}/${status}/detail?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}&overview`);
  };

  /**
   * 修改配置实例信息
   * @param name 实例名
   * @param id 实例ID
   * @param envId
   * @param verId
   * @param appId
   */
  @action
  updateConfig = (name, id, envId, verId, appId) => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    AppDeploymentStore.loadValue(projectId, id, verId)
      .then((res) => {
        if (res && res.failed) {
          Choerodon.prompt(res.message);
        } else {
          this.visible = true;
          this.id = id;
          this.name = name;
          this.idArr = [envId, verId, appId];
        }
      });
  };

  /**
   * 升级配置实例信息
   * @param name 实例名
   * @param id 实例ID
   * @param envId
   * @param verId
   * @param appId
   */
  @action
  upgradeIst = (name, id, envId, verId, appId) => {
    const { intl } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    AppDeploymentStore.loadUpVersion(projectId, verId)
      .then((val) => {
        if (val && val.failed) {
          Choerodon.prompt(val.message);
        } else if (val.length === 0) {
          Choerodon.prompt(intl.formatMessage({ id: 'ist.noUpVer' }));
        } else {
          this.id = id;
          this.name = name;
          this.idArr = [envId, val[0].id, appId];
          AppDeploymentStore.loadValue(projectId, id, val[0].id)
            .then((res) => {
              if (res && res.failed) {
                Choerodon.prompt(res.message);
              } else {
                this.visibleUp = true;
              }
            });
        }
      });
  };

  /**
   * 启停用实例
   * @param id 实例ID
   * @param status 状态
   */
  activeIst = (id, status) => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    AppDeploymentStore.changeIstActive(projectId, id, status)
      .then((error) => {
        if (error && error.failed) {
          Choerodon.prompt(error.message);
        } else {
          this.loadIstOverview();
        }
      });
  };

  /**
   * 关闭网络侧边栏
   */
  @action
  closeNetwork = () => {
    this.props.form.resetFields();
    this.showNetwork = false;
    this.loadIstOverview();
  };


  /**
   * 关闭域名侧边栏
   */
  @action
  closeDomain = () => {
    this.props.form.resetFields();
    this.showDomain = false;
    this.domainId = null;
    this.loadIstOverview();
  };


  /**
   * 关闭滑块
   * @param res 是否重新部署需要重载数据
   */
  @action
  handleCancel = (res) => {
    this.visible = false;
    if (res) {
      this.loadIstOverview();
    }
  };

  /**
   * 关闭升级滑块
   * @param res 是否重新部署需要重载数据
   */
  @action
  handleCancelUp = (res) => {
    this.visibleUp = false;
    this.openRemove = false;
    if (res) {
      this.loadIstOverview();
    }
  };

  /**
   * 打开删除数据模态框
   * @param id
   */
  @action
  handleOpen(id) {
    this.openRemove = true;
    this.id = id;
  }

  /**
   * 删除数据
   */
  @action
  handleDelete = (id) => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    this.loading = true;
    AppDeploymentStore.deleteIst(projectId, id)
      .then((res) => {
        if (res && res.failed) {
          Choerodon.prompt(res.message);
        } else {
          this.openRemove = false;
          this.loading = false;
          this.loadIstOverview();
        }
      });
  };

  /**
   * 显示日志
   * @param record 容器record
   */
  @action
  showLog =(record) => {
    const projectId = AppState.currentMenuType.id;
    ContainerStore.loadPodParam(projectId, record.id)
      .then((data) => {
        this.namespace = record.namespace;
        this.podName = data[0].podName;
        this.containerName = data[0].containerName;
        this.logId = data[0].logId;
        this.showSide = true;
        this.containerArr = data;
        this.loadLog();
      });
  };

  /**
   * 切换container日志
   * @param value
   */
  @action
  containerChange = (value) => {
    const { ws } = this.state;
    if (this.logId !== value.split('+')[0]) {
      if (ws) {
        ws.close();
      }
      this.containerName = value.split('+')[1];
      this.logId = value.split('+')[0];
      this.loadLog();
    }
  };

  /**
   * 加载容器日志
   */
  @action
  loadLog = (followingOK) => {
    const { following } = this.state;
    const authToken = document.cookie.split('=')[1];
    const logs = [];
    let oldLogs = [];
    let editor = null;
    if (this.editorLog) {
      editor = this.editorLog.getCodeMirror();
      try {
        const ws = new WebSocket(`POD_WEBSOCKET_URL/ws/log?key=env:${this.namespace}.envId:${this.props.envId}.log:${this.logId}&podName=${this.podName}&containerName=${this.containerName}&logId=${this.logId}&token=${authToken}`);
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
   * 关闭日志
   */
  @action
  closeSidebar = () => {
    clearInterval(this.timer);
    this.timer = null;
    const { ws } = this.state;
    if (ws) {
      ws.close();
    }
    const editor = this.editorLog.getCodeMirror();
    this.showSide = false;
    editor.setValue('');
  };


  /**
   *打开域名创建弹框
   */
  @action
  createDomain = (type, id = '') => {
    this.props.form.resetFields();
    if (type === 'create') {
      this.domainTitle = this.props.intl.formatMessage({ id: 'domain.header.create' });
      this.domainType = type;
      this.domainId = id;
    } else {
      this.domainTitle = this.props.intl.formatMessage({ id: 'domain.header.update' });
      this.domainType = type;
      this.domainId = id;
    }
    this.showDomain = true;
  };

  /**
   * 打开创建网络
   */
  @action
  createNetwork = (appId = null, istId = null, appCode = '') => {
    this.appId = appId;
    this.istId = istId;
    this.appCode = appCode;
    this.showNetwork = true;
  };

  /**
   * 删除搜索
   */
  @action
  emitEmpty = () => {
    const { store } = this.props;
    store.setVal('');
    this.onSearch();
  };

  /**
   * 处理返回panel Dom
   * @returns {*}
   */
  panelDom = () => {
    const { intl, store, envState } = this.props;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const ist = store.getIst;
    if (ist) {
      if (ist.devopsEnvPreviewAppDTOS.length) {
        return _.map(ist.devopsEnvPreviewAppDTOS, i => (<div className="c7n-envow-app-wrap" key={i.appName}>
          <div className="c7n-envow-app-name">
            {i.applicationInstanceDTOS[0].projectId === parseInt(projectId, 10) ? <i className="icon icon-project" /> : <i className="icon icon-apps" />}
            {i.appName}
          </div>
          <Collapse
            accordion
            key={`${i.appName}-collapse`}
            onChange={this.onChange}
          >
            {_.map(i.applicationInstanceDTOS, c => (
              <Panel
                forceRender
                showArrow={false}
                header={(<div className="c7n-envow-ist-header-wrap">
                  <Icon type="navigate_next" />
                  <div className="c7n-envow-ist-name">
                    {(c.status === 'running' || c.status === 'stopped') ? <span className="c7n-deploy-istCode">{c.code}</span> : <div className="c7n-envow-ist-fail">
                      {c.status === 'operating' ? (<div>
                        <span className="c7n-deploy-istCode">{c.code}</span>
                        <Tooltip title={intl.formatMessage({ id: `ist_${c.status}` })}>
                          <Progress type="loading" width={15} />
                        </Tooltip>

                      </div>)
                        : (<div>
                          <span className="c7n-deploy-istCode">{c.code}</span>
                          <Tooltip title={`${c.status}: ${c.error}`}>
                            <i className="icon icon-error c7n-deploy-ist-operate" />
                          </Tooltip>
                        </div>)}
                    </div>}
                  </div>
                  <span className="c7n-envow-ist-version">
                    <FormattedMessage id="app.appVersion" />:&nbsp;&nbsp;
                    {c.appVersion}
                  </span>
                  <div className="c7n-deploy-status">
                    <svg className={c.podCount === 0 ? 'c7n-deploy-circle-process-ban' : 'c7n-deploy-circle_red'}>
                      <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="40%" strokeWidth="16.5%" />
                    </svg>
                    <svg className={c.podCount === 0 ? 'c7n-deploy-circle-process-ban' : 'c7n-deploy-circle-process'}>
                      <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="40%" strokeWidth="16.5%" strokeDashoffset={`${251 * ((c.podCount - c.podRunningCount) / c.podCount)}%`} />
                    </svg>
                    <span className="c7n-deploy-status-num">{c.podCount}</span>
                  </div>
                  <div className="c7n-envow-ist-action">
                    {this.columnAction(c)}
                  </div>
                </div>)}
                key={c.id}
              >
                <div>
                  <div>
                    <div className="c7n-envow-contaners-title c7n-envow-width_50">
                      PODS
                    </div>
                    <div className="c7n-envow-contaners-wrap">
                      <div className="c7n-envow-width_50">
                        {c.devopsEnvPodDTOS.length ? _.map(c.devopsEnvPodDTOS, p => (<div className="c7n-envow-contaners-left" key={p.id}>
                          <div className="c7n-envow-ls-wrap">
                            <div className="c7n-envow-ls">
                              <Tooltip title={<FormattedMessage id="container.name" />}>
                                <Icon type="kubernetes" />
                              </Tooltip>
                              {p.name}
                              <Permission
                                service={['devops-service.devops-env-pod-container.queryLogByPod']}
                                organizationId={orgId}
                                projectId={projectId}
                                type={type}
                              >
                                <Tooltip title={<FormattedMessage id="container.log" />}>
                                  <Button
                                    size="small"
                                    shape="circle"
                                    onClick={this.showLog.bind(this, p)}
                                  >
                                    <i className="icon icon-insert_drive_file" />
                                  </Button>
                                </Tooltip>
                              </Permission>
                            </div>
                            {p.ip ? (<div className="c7n-envow-ls">
                              <Tooltip title={<FormattedMessage id="container.ip" />}>
                                <Icon type="room" />
                              </Tooltip>
                              {p.ip}
                            </div>) : (<div className="c7n-envow-ls c7n-envow-hidden">
                              <Tooltip title={<FormattedMessage id="container.ip" />}>
                                <Icon type="room" />
                              </Tooltip>
                              {p.ip}
                            </div>)}
                          </div>
                        </div>)) : null}
                      </div>
                      <div className="c7n-envow-contaners-right">
                        <div className="c7n-envow-pod">
                          {c.podCount !== 0 ? (<div className="c7n-deploy-status">
                            <svg className={c.podCount === 0 ? 'c7n-deploy-circle-process-ban' : 'c7n-deploy-circle_red'}>
                              <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="45%" strokeWidth="5%" />
                            </svg>
                            <svg className={c.podCount === 0 ? 'c7n-deploy-circle-process-ban' : 'c7n-deploy-circle-process'}>
                              <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="45%" strokeWidth="5%" strokeDashoffset={`${283 * ((c.podCount - c.podRunningCount) / c.podCount)}%`} />
                            </svg>
                            <span className="c7n-deploy-status-num">{c.podCount}</span>
                          </div>) : null}
                          <div className="c7n-envow-pod-action">
                            <Icon type="navigate_next" />
                            <Icon type="navigate_next" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="c7n-envow-contaners-title">
                      NETWORKING
                    </div>
                    <div className="c7n-envow-contaners-wrap">
                      <div className="c7n-envow-contaners-left">
                        <div className="c7n-envow-network-title">
                          <FormattedMessage id="network.header.title" />
                        </div>
                        {c.serviceDTOS.length ? _.map(c.serviceDTOS, s => (<div className="c7n-envow-ls-wrap" key={s.name}>
                          <div className="c7n-envow-ls">
                            <Tooltip title={<FormattedMessage id="network.form.name" />}>
                              <Icon type="router" />
                            </Tooltip>
                            {s.name}
                          </div>
                          <div className="c7n-envow-ls">
                            <Tooltip title={<FormattedMessage id="network.form.ip" />}>
                              <Icon type="IP_out" />
                            </Tooltip>
                            {s.clusterIp}
                          </div>
                          <div className="c7n-envow-ls">
                            <div className="c7n-envow-ls-arrow-wrap">
                              <span>
                                <Tooltip title={<FormattedMessage id="network.form.port" />}>
                                  <Icon type="port" />
                                </Tooltip>
                                {s.port}
                              </span>
                              <span className="c7n-envow-ls-arrow">
                                →
                              </span>
                              <span>
                                <Tooltip title={<FormattedMessage id="network.form.targetPort" />}>
                                  <Icon type="aim_port" />
                                </Tooltip>
                                {s.targetPort}
                              </span>
                            </div>
                          </div>
                        </div>)) : null}
                        <Permission
                          service={['devops-service.devops-service.create']}
                          type={type}
                          projectId={projectId}
                          organizationId={orgId}
                        >
                          <Tooltip title={!envState ? <FormattedMessage id="envoverview.envinfo" /> : null}>
                            <Button
                              className="c7n-envow-create-btn"
                              funcType="flat"
                              disabled={!envState}
                              onClick={this.createNetwork.bind(this, c.appId, c.id, i.appCode)}
                            >
                              <i className="icon-playlist_add icon" />
                              <span><FormattedMessage id="network.header.create" /></span>
                            </Button>
                          </Tooltip>
                        </Permission>
                      </div>
                      <div className="c7n-envow-contaners-right">
                        <div className="c7n-envow-network-title">
                          <FormattedMessage id="domain.header.title" />
                        </div>
                        {c.ingressDTOS.length ? _.map(c.ingressDTOS, d => (<div className="c7n-envow-ls-wrap" key={d.hosts}>
                          <div className="c7n-envow-ls"><Icon type="language" />{d.hosts}</div>
                        </div>)) : null}
                        <Permission
                          service={['devops-service.devops-ingress.create']}
                          type={type}
                          projectId={projectId}
                          organizationId={orgId}
                        >
                          <Tooltip title={!envState ? <FormattedMessage id="envoverview.envinfo" /> : null}>
                            <Button
                              funcType="flat"
                              disabled={!envState}
                              className="c7n-envow-create-btn"
                              onClick={this.createDomain.bind(this, 'create', '')}
                            >
                              <i className="icon icon-playlist_add icon" />
                              <FormattedMessage id="domain.header.create" />
                            </Button>
                          </Tooltip>
                        </Permission>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
            {/* 处理Safari浏览器下，折叠面板渲染最后一个节点panel卡顿问题 */}
            <Panel
              className="c7n-envow-none"
              forceRender
              key={`${i.appName}-none`}
            >
              none
            </Panel>
          </Collapse>
        </div>));
      }
      return <span className="c7n-none-des"><FormattedMessage id="envoverview.unlist" /></span>;
    }
    return null;
  };

  /**
   * 阻止Action组件冒泡弹出折叠面板
   * @param e
   */
  handlerAction = (e) => {
    e.stopPropagation();
  };

  /**
   * action 权限控制
   * @param record 行数据
   * @returns {*}
   */
  columnAction = (record) => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    const { intl } = this.props;
    if (record.status === 'operating' || !record.connect) {
      return (<Action
        onClick={this.handlerAction}
        data={[
          {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-instance.listResources'],
            text: intl.formatMessage({ id: 'ist.detail' }),
            action: this.linkDeployDetail.bind(this, record.id, record.status),
          }]}
      />);
    } else if (record.status === 'failed') {
      return (<Action
        onClick={this.handlerAction}
        data={[
          {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-instance.listResources'],
            text: intl.formatMessage({ id: 'ist.detail' }),
            action: this.linkDeployDetail.bind(this, record.id, record.status),
          }, {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-instance.queryValues'],
            text: intl.formatMessage({ id: 'ist.values' }),
            action: this.updateConfig.bind(this, record.code, record.id,
              record.envId, record.appVersionId, record.appId),
          }, {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-instance.delete'],
            text: intl.formatMessage({ id: 'ist.del' }),
            action: this.handleOpen.bind(this, record.id),
          },
        ]}
      />);
    } else {
      return (<Action
        onClick={this.handlerAction}
        data={[
          {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-instance.listResources'],
            text: intl.formatMessage({ id: 'ist.detail' }),
            action: this.linkDeployDetail.bind(this, record.id, record.status),
          }, {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-instance.queryValues'],
            text: intl.formatMessage({ id: 'ist.values' }),
            action: this.updateConfig.bind(this, record.code, record.id,
              record.envId, record.appVersionId, record.appId),
          }, {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-version.getUpgradeAppVersion'],
            text: intl.formatMessage({ id: 'ist.upgrade' }),
            action: this.upgradeIst.bind(this, record.code, record.id,
              record.envId, record.appVersionId, record.appId),
          }, {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-instance.start', 'devops-service.application-instance.stop'],
            text: record.status !== 'stopped' ? intl.formatMessage({ id: 'ist.stop' }) : intl.formatMessage({ id: 'ist.run' }),
            action: record.status !== 'stopped' ? this.activeIst.bind(this, record.id, 'stop') : this.activeIst.bind(this, record.id, 'start'),
          }, {
            type,
            organizationId,
            projectId,
            service: ['devops-service.application-instance.delete'],
            text: intl.formatMessage({ id: 'ist.del' }),
            action: this.handleOpen.bind(this, record.id),
          },
        ]}
      />);
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
    const { intl, store } = this.props;
    const { fullscreen, following } = this.state;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const val = store.getVal;
    const prefix = <Icon type="search" onClick={this.onSearch} />;
    const suffix = val ? <Icon type="close" onClick={this.emitEmpty} /> : null;

    const containerDom = this.containerArr.length && (_.map(this.containerArr, c => <Option key={c.logId} value={`${c.logId}+${c.containerName}`}>{c.containerName}</Option>));

    const options = {
      readOnly: true,
      lineNumbers: true,
      autofocus: true,
      lineWrapping: true,
      theme: 'base16-dark',
    };

    return (<div>
      { store.isLoading ? <LoadingBar display /> : <React.Fragment>
        <div className="c7n-envow-search">
          <Input
            placeholder={intl.formatMessage({ id: 'envoverview.search' })}
            value={val}
            prefix={prefix}
            suffix={suffix}
            onChange={this.onChangeSearch}
            onPressEnter={this.onSearch}
            // eslint-disable-next-line no-return-assign
            ref={node => this.searchInput = node}
          />
        </div>
        {this.panelDom()}
        {this.visible && <ValueConfig
          store={AppDeploymentStore}
          visible={this.visible}
          name={this.name}
          id={this.id}
          idArr={this.idArr}
          onClose={this.handleCancel}
        /> }
        {this.visibleUp && <UpgradeIst
          store={AppDeploymentStore}
          visible={this.visibleUp}
          name={this.name}
          appInstanceId={this.id}
          idArr={this.idArr}
          onClose={this.handleCancelUp}
        /> }
        {this.showSide && <Sidebar
          visible={this.showSide}
          title={<FormattedMessage id="container.log.header.title" />}
          onOk={this.closeSidebar}
          className="c7n-podLog-content c7n-region"
          okText={<FormattedMessage id="close" />}
          okCancel={false}
          destroyOnClose
        >
          <Content className="sidebar-content" code={'container.log'} values={{ name: this.podName }}>
            <section className="c7n-podLog-section">
              <div className="c7n-podLog-hei-wrap">
                <div className="c7n-podShell-title">
                  <FormattedMessage id="container.term.log" />&nbsp;
                  <Select value={this.containerName} onChange={this.containerChange}>
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
        </Sidebar>}
        <DelIst
          open={this.openRemove}
          handleCancel={this.handleCancelUp}
          handleConfirm={this.handleDelete.bind(this, this.id)}
          confirmLoading={this.loading}
        />
        {this.showDomain && <CreateDomain
          id={this.domainId}
          envId={this.props.envId}
          title={this.domainTitle}
          visible={this.showDomain}
          type={this.domainType}
          store={DomainStore}
          onClose={this.closeDomain}
        />}
        {this.showNetwork && <CreateNetwork
          visible={this.showNetwork}
          envId={this.props.envId}
          appId={this.appId}
          appCode={this.appCode}
          istId={this.istId}
          store={NetworkConfigStore}
          onClose={this.closeNetwork}
        />}
      </React.Fragment>}
    </div>);
  }
}

export default Form.create({})(withRouter(injectIntl(AppOverview)));
