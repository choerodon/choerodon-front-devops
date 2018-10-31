/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Form, Collapse, Icon, Input, Tooltip, Modal, Progress, Select } from 'choerodon-ui';
import { Permission, Content, Action, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import ValueConfig from '../../instances/ValueConfig';
import UpgradeIst from '../../instances/UpgradeIst';
import DelIst from '../../instances/components/DelIst';
import '../EnvOverview.scss';
import '../../instances/Instances.scss';
import '../../../main.scss';
import InstancesStore from '../../../../stores/project/instances/index';
import DomainStore from '../../../../stores/project/domain';
import CreateDomain from '../../domain/createDomain';
import CreateNetwork from '../../networkConfig/createNetwork';
import NetworkConfigStore from '../../../../stores/project/networkConfig';
import LoadingBar from '../../../../components/loadingBar';
import ExpandRow from '../../instances/components/ExpandRow';

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

  @observable istName = '';

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
   */
  linkDeployDetail = (record) => {
    const { id, status, appName } = record;
    const { history } = this.props;
    const {
      id: projectId,
      name: projectName,
      type,
      organizationId,
    } = AppState.currentMenuType;
    history.push({
      pathname: `/devops/instance/${id}/${status}/detail`,
      search: `?type=${type}&id=${projectId}&name=${encodeURIComponent(projectName)}&organizationId=${organizationId}&overview`,
      state: { appName },
    });
  };

  /**
   * 重新部署
   * @param id
   */
  reStart = (id) => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    InstancesStore.reStarts(projectId, id)
      .then((error) => {
        if (error && error.failed) {
          Choerodon.prompt(error.message);
        } else {
          InstancesStore.loadInstanceAll(projectId);
        }
      });
  };

  /**
   * 修改配置实例信息
   */
  @action
  updateConfig = (record) => {
    const { code, id, envId, appVersionId, appId } = record;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    InstancesStore.loadValue(projectId, id, appVersionId)
      .then((res) => {
        if (res && res.failed) {
          Choerodon.prompt(res.message);
        } else {
          this.visible = true;
          this.id = id;
          this.name = code;
          this.idArr = [envId, appVersionId, appId];
        }
      });
  };

  /**
   * 升级配置实例信息
   */
  @action
  upgradeIst = (record) => {
    const { intl } = this.props;
    const { code, id, envId, appVersionId, appId } = record;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    InstancesStore.loadUpVersion(projectId, appVersionId)
      .then((val) => {
        if (val && val.failed) {
          Choerodon.prompt(val.message);
        } else if (val.length === 0) {
          Choerodon.prompt(intl.formatMessage({ id: 'ist.noUpVer' }));
        } else {
          this.id = id;
          this.name = code;
          this.idArr = [envId, val[0].id, appId];
          InstancesStore.loadValue(projectId, id, val[0].id)
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
    InstancesStore.changeIstActive(projectId, id, status)
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
   */
  @action
  handleOpen(record) {
    const { id, code } = record;
    this.openRemove = true;
    this.id = id;
    this.istName = code;
  }

  /**
   * 删除数据
   */
  @action
  handleDelete = (id) => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    this.loading = true;
    InstancesStore.deleteIst(projectId, id)
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
                          <Tooltip title={`${c.status}${c.error ? `：${c.error}` : ''}`}>
                            <i className="icon icon-error c7n-deploy-ist-operate" />
                          </Tooltip>
                        </div>)}
                    </div>}
                  </div>
                  <span className="c7n-envow-ist-version">
                    <FormattedMessage id="app.appVersion" />:&nbsp;&nbsp;
                    {c.appVersion}
                  </span>
                  <div className="c7n-envow-ist-action">
                    {this.columnAction(c)}
                  </div>
                </div>)}
                key={c.id}
              >
                <div>
                  <ExpandRow record={c} />
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
    const {
      id: projectId,
      type,
      organizationId,
    } = AppState.currentMenuType;
    const { intl: { formatMessage } } = this.props;
    const { id, status, connect } = record;
    const actionType = {
      detail: {
        service: ['devops-service.application-instance.listResources'],
        text: formatMessage({ id: 'ist.detail' }),
        action: this.linkDeployDetail.bind(this, record),
      },
      change: {
        service: ['devops-service.application-instance.queryValues'],
        text: formatMessage({ id: 'ist.values' }),
        action: this.updateConfig.bind(this, record),
      },
      restart: {
        service: ['devops-service.application-instance.restart'],
        text: formatMessage({ id: 'ist.reDeploy' }),
        action: this.reStart.bind(this, id),
      },
      update: {
        service: ['devops-service.application-version.getUpgradeAppVersion'],
        text: formatMessage({ id: 'ist.upgrade' }),
        action: this.upgradeIst.bind(this, record),
      },
      stop: {
        service: ['devops-service.application-instance.start', 'devops-service.application-instance.stop'],
        text: status !== 'stopped' ? formatMessage({ id: 'ist.stop' }) : formatMessage({ id: 'ist.run' }),
        action: status !== 'stopped' ? this.activeIst.bind(this, id, 'stop') : this.activeIst.bind(this, id, 'start'),
      },
      delete: {
        service: ['devops-service.application-instance.delete'],
        text: formatMessage({ id: 'ist.del' }),
        action: this.handleOpen.bind(this, record),
      },
    };
    let actionItem = [];
    switch (status) {
      case 'operating' || !connect:
        actionItem = ['detail'];
        break;
      case 'stopped':
        actionItem = ['detail', 'change', 'stop', 'delete'];
        break;
      case 'failed':
      case 'running':
        actionItem = ['detail', 'change', 'restart', 'update', 'stop', 'delete'];
        break;
      default:
        actionItem = ['detail'];
    }
    const actionData = _.map(actionItem, item => ({
      projectId,
      type,
      organizationId,
      ...actionType[item],
    }));
    return (<Action
      onClick={this.handlerAction}
      data={actionData}
    />);
  };

  render() {
    const { intl, store } = this.props;
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
          store={InstancesStore}
          visible={this.visible}
          name={this.name}
          id={this.id}
          idArr={this.idArr}
          onClose={this.handleCancel}
        /> }
        {this.visibleUp && <UpgradeIst
          store={InstancesStore}
          visible={this.visibleUp}
          name={this.name}
          appInstanceId={this.id}
          idArr={this.idArr}
          onClose={this.handleCancelUp}
        /> }
        <DelIst
          open={this.openRemove}
          handleCancel={this.handleCancelUp}
          handleConfirm={this.handleDelete.bind(this, this.id)}
          confirmLoading={this.loading}
          name={this.istName}
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
