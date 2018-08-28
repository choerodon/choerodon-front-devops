/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Tabs, Form, Select, Icon, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import '../EnvOverview.scss';
import '../../../main.scss';
import AppOverview from '../appOverview';
import LogOverview from '../logOverview';
import DomainOverview from '../domainOverview';
import NetworkOverview from '../networkOverview';
import CreateDomain from '../../domain/createDomain';
import CreateNetwork from '../../networkConfig/createNetwork';
import DomainStore from '../../../../stores/project/domain';
import NetworkConfigStore from '../../../../stores/project/networkConfig';

const { AppState } = stores;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@observer
class EnvOverviewHome extends Component {
  @observable tabKey = 'app';
  @observable env = [];
  @observable envId = null;
  @observable showDomain = false;
  @observable showNetwork = false;
  @observable domainId = null;
  @observable domainType = '';
  @observable domainTitle = '';
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  componentWillMount() {
    this.loadEnvCards();
  }

  componentWillUnmount() {
    const { EnvOverviewStore } = this.props;
    EnvOverviewStore.setIst(null);
  }

  /**
   * 刷新函数重调用tabchange
   */
  handleRefresh = () => {
    const { EnvOverviewStore } = this.props;
    EnvOverviewStore.setVal('');
    this.tabChange(this.tabKey);
    this.loadEnvCards();
  };

  /**
   * tab 切换函数
   * @param key
   */
  @action
  tabChange = (key) => {
    this.tabKey = key;
    const { EnvOverviewStore } = this.props;
    const tpEnvId = this.envId || EnvOverviewStore.getTpEnvId;
    if (key === 'app' && this.env.length) {
      this.loadIstOverview(tpEnvId || this.env[0].id);
    } else if (key === 'domain' && this.env.length) {
      this.loadDomain(tpEnvId || this.env[0].id);
    } else if (key === 'network' && this.env.length) {
      this.loadNetwork(tpEnvId || this.env[0].id);
    } else if (key === 'log' && this.env.length) {
      this.loadLog(tpEnvId || this.env[0].id);
    }
    if (this.env.length) {
      this.loadSync(tpEnvId || this.env[0].id);
    }
  };

  /**
   * 环境选择请求函数
   * @param value
   */
  @action
  selectEnv = (value) => {
    const { EnvOverviewStore } = this.props;
    EnvOverviewStore.setTpEnvId(value);
    this.envId = value || this.env[0].id;
    this.loadIstOverview(value);
    this.loadDomain(value);
    this.loadNetwork(value);
    this.loadLog(value);
    this.loadSync(value);
  };

  /**
   * 获取可用环境
   */
  @action
  loadEnvCards = () => {
    const { EnvOverviewStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvOverviewStore.loadActiveEnv(projectId)
      .then((env) => {
        if (env.length) {
          const envSort = _.concat(_.filter(env, ['connect', true]), _.filter(env, ['connect', false]));
          const tpEnvId = this.envId || EnvOverviewStore.getTpEnvId;
          this.env = envSort;
          const flag = _.filter(env, { id: tpEnvId }).length;
          this.loadIstOverview(flag ? tpEnvId : envSort[0].id);
          this.loadDomain(flag ? tpEnvId : envSort[0].id);
          this.loadNetwork(flag ? tpEnvId : envSort[0].id);
          this.loadLog(flag ? tpEnvId : envSort[0].id);
          this.loadSync(flag ? tpEnvId : envSort[0].id);
        }
      });
  };

  /**
   * 加载应用实例列表
   * @param envId
   */
  loadIstOverview = (envId) => {
    const { EnvOverviewStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvOverviewStore.loadIstOverview(projectId, envId);
  };

  /**
   * 按环境加载域名
   * @param envId
   */
  loadDomain = (envId) => {
    const { EnvOverviewStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvOverviewStore.loadDomain(projectId, envId);
  };

  /**
   * 按环境加载网络
   * @param envId
   */
  loadNetwork = (envId) => {
    const { EnvOverviewStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvOverviewStore.loadNetwork(projectId, envId);
  };

  /**
   * 按环境加载错误日志
   * @param envId
   */
  loadLog = (envId) => {
    const { EnvOverviewStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvOverviewStore.loadLog(projectId, envId);
  };

  /**
   * 按环境加载同步状态
   * @param envId
   */
  loadSync = (envId) => {
    const { EnvOverviewStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvOverviewStore.loadSync(projectId, envId);
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
   * 打开创建域名
   */
  @action
  createNetwork = () => {
    this.showNetwork = true;
  };

  /**
   * 关闭域名侧边栏
   */
  @action
  closeDomain = () => {
    this.props.form.resetFields();
    this.showDomain = false;
    this.domainId = null;
    this.loadDomain(this.envId || this.env[0].id);
    this.loadIstOverview(this.envId || this.env[0].id);
  };

  /**
   * 关闭网络侧边栏
   */
  @action
  closeNetwork = () => {
    this.props.form.resetFields();
    this.showNetwork = false;
    this.loadNetwork(this.envId || this.env[0].id);
    this.loadIstOverview(this.envId || this.env[0].id);
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
   * 条件部署应用
   * @param envId
   */
  deployApp = (envId) => {
    const envID = envId || this.env[0].id;
    const projectId = AppState.currentMenuType.id;
    const projectName = AppState.currentMenuType.name;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/deployment-app?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}&envId=${envID}`);
  };

  /**
   * 遍历计算实例运行状态总览数据
   * @param state
   * @returns {number}
   */
  getIstCount = (state) => {
    const { EnvOverviewStore } = this.props;
    const ist = EnvOverviewStore.getIst;
    const stateArr = ist ?
      _.map(ist.devopsEnvPreviewAppDTOS, i =>
        _.filter(i.applicationInstanceDTOS, a => a.status === state)) : [];
    let length = 0;
    _.map(stateArr, (l) => {
      length += l.length;
    });
    return length;
  };

  /**
   * 处理环境默认值DOM
   * @returns {*}
   */
  envNameDom = () => {
    const { EnvOverviewStore } = this.props;
    let envName = null;
    const tpEnvId = this.envId || EnvOverviewStore.getTpEnvId;
    if (this.env.length && tpEnvId) {
      _.map(this.env, (d) => {
        if (d.id === Number(tpEnvId)) {
          envName = (<React.Fragment>
            {d.connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
            {d.name}
          </React.Fragment>);
        }
      });
    } else {
      envName = this.env.length ? (<React.Fragment>
        {this.env[0].connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
        {this.env[0].name}
      </React.Fragment>) : <FormattedMessage id="envoverview.noEnv" />;
    }
    return envName;
  };

  render() {
    const { intl, EnvOverviewStore } = this.props;
    const sync = EnvOverviewStore.getSync;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;

    const envNameDom = this.env.length ? _.map(this.env, d => (<Option key={d.id} value={d.id}>
      {d.connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
      {d.name}</Option>)) : [];

    const envState = this.env.length ?
      this.env.filter(d => d.id === Number(this.envId ? this.envId : this.env[0].id))[0] : true;

    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.application-instance.listByAppId',
          'devops-service.application-instance.listByAppInstanceId',
          'devops-service.application-instance.queryValue',
          'devops-service.application-instance.deploy',
          'devops-service.application-instance.pageInstances',
          'devops-service.application-instance.pageByOptions',
          'devops-service.application-instance.listByAppVersionId',
          'devops-service.application-instance.queryValues',
          'devops-service.application-instance.listResources',
          'devops-service.application-instance.listStages',
          'devops-service.application-instance.delete',
          'devops-service.application-instance.start',
          'devops-service.application-instance.stop',
          'devops-service.application-instance.listByEnv',
          'devops-service.devops-env-file-error.page',
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.application.listByEnvIdAndStatus',
          'devops-service.devops-service.create',
          'devops-service.devops-service.checkName',
          'devops-service.devops-service.pageByOptions',
          'devops-service.devops-service.query',
          'devops-service.devops-service.update',
          'devops-service.devops-service.delete',
          'devops-service.devops-service.listByEnv',
          'devops-service.devops-ingress.pageByOptions',
          'devops-service.devops-ingress.queryDomainId',
          'devops-service.devops-ingress.delete',
          'devops-service.devops-ingress.listByEnv',
        ]}
      >
        <Header title={<FormattedMessage id="envoverview.head" />}>
          <Select
            value={this.envNameDom()}
            dropdownClassName="c7n-envow-select-dropdown"
            onChange={this.selectEnv}
            className="c7n-envow-select"
            notFoundContent={intl.formatMessage({ id: 'envoverview.noEnv' })}
          >
            {envNameDom}
          </Select>
          <Permission
            service={[
              'devops-service.application-instance.deploy',
            ]}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Tooltip title={!envState.connect ? <FormattedMessage id={'envoverview.envinfo'} /> : null}>
              <Button
                disabled={!envState.connect}
                onClick={this.deployApp.bind(this, this.envId)}
              >
                <i className="icon-jsfiddle icon" />
                <FormattedMessage id="deploy.header.title" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission
            service={['devops-service.devops-service.create']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Tooltip title={!envState.connect ? <FormattedMessage id={'envoverview.envinfo'} /> : null}>
              <Button
                funcType="flat"
                disabled={!envState.connect}
                onClick={this.createNetwork}
              >
                <i className="icon-playlist_add icon" />
                <span><FormattedMessage id={'network.header.create'} /></span>
              </Button>
            </Tooltip>
          </Permission>
          <Permission
            service={['devops-service.devops-ingress.create']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Tooltip title={!envState.connect ? <FormattedMessage id={'envoverview.envinfo'} /> : null}>
              <Button
                funcType="flat"
                disabled={!envState.connect}
                onClick={this.createDomain.bind(this, 'create', '')}
              >
                <i className="icon icon-playlist_add icon" />
                <FormattedMessage id={'domain.header.create'} />
              </Button>
            </Tooltip>
          </Permission>
          <Tooltip title={sync && sync.commitUrl ?
            sync.commitUrl.substr(0, sync.commitUrl.length - 7) : null}
          >
            <a
              href={sync && sync.commitUrl ?
                sync.commitUrl.substr(0, sync.commitUrl.length - 7) : null}
              target="_blank"
              rel="nofollow me noopener noreferrer"
            >
              <Button
                funcType="flat"
              >
                <Icon type="account_balance" />
                <FormattedMessage id={'envoverview.gitlab'} />
              </Button>
            </a>
          </Tooltip>
          <Button
            onClick={this.handleRefresh}
          >
            <i className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          <div className="c7n-envow-status-wrap">
            <div>
              <h2 className="c7n-space-first">
                <FormattedMessage
                  id="envoverview.title"
                  values={{
                    name: `${name}`,
                  }}
                />
              </h2>
              <p>
                <FormattedMessage
                  id="envoverview.description"
                />
                <a href={this.props.intl.formatMessage({ id: 'envoverview.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                  <span className="c7n-external-link-content">
                    <FormattedMessage id="learnmore" />
                  </span>
                  <i className="icon icon-open_in_new" />
                </a>
              </p>
            </div>
            <div className="c7n-envow-status-content">
              {(sync && sync.devopsSyncCommit === sync.gitCommit
              && sync.gitCommit === sync.agentSyncCommit) || !envState.connect ?
                null :
                <div className="c7n-envow-sync-wrap">
                  <div className="c7n-envow-status-text"><FormattedMessage id="envoverview.sync" /></div>
                  <div><Icon type="autorenew" /></div>
                </div>}
              <div>
                <div className="c7n-envow-status-text"><FormattedMessage id="envoverview.istov" /></div>
                <div className="c7n-envow-status-wrap">
                  <div className="c7n-envow-status-num c7n-envow-status-running">
                    <div>{this.getIstCount('running')}</div>
                    <div><FormattedMessage id="running" /></div>
                  </div>
                  <div className="c7n-envow-status-num c7n-envow-status-operating">
                    <div>{this.getIstCount('operating')}</div>
                    <div><FormattedMessage id="operating" /></div>
                  </div>
                  <div className="c7n-envow-status-num c7n-envow-status-stopped">
                    <div>{this.getIstCount('stopped')}</div>
                    <div><FormattedMessage id="stopped" /></div>
                  </div>
                  <div className="c7n-envow-status-num c7n-envow-status-fail">
                    <div>{this.getIstCount('failed')}</div>
                    <div><FormattedMessage id="failedd" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Tabs className="c7n-envoverview-tabs" activeKey={this.tabKey} animated={false} onChange={this.tabChange}>
            <TabPane tab={`${intl.formatMessage({ id: 'network.column.app' })}`} key="app">
              {this.tabKey === 'app' ? <AppOverview store={EnvOverviewStore} tabkey={this.tabKey} envState={envState.connect} envId={this.envId || (this.env.length ? this.env[0].id : null)} /> : null}
            </TabPane>
            <TabPane tab={`${intl.formatMessage({ id: 'network.header.title' })}`} key="network">
              {this.tabKey === 'network' ? <NetworkOverview store={EnvOverviewStore} tabkey={this.tabKey} envId={this.envId || (this.env.length ? this.env[0].id : null)} /> : null}
            </TabPane>
            <TabPane tab={`${intl.formatMessage({ id: 'domain.header.title' })}`} key="domain">
              {this.tabKey === 'domain' ? <DomainOverview store={EnvOverviewStore} tabkey={this.tabKey} envId={this.envId || (this.env.length ? this.env[0].id : null)} /> : null}
            </TabPane>
            <TabPane tab={`${intl.formatMessage({ id: 'envoverview.logs' })}`} key="log">
              {this.tabKey === 'log' ? <LogOverview store={EnvOverviewStore} tabkey={this.tabKey} envId={this.envId || (this.env.length ? this.env[0].id : null)} /> : null}
            </TabPane>
          </Tabs>
        </Content>
        {this.showNetwork && <CreateNetwork
          visible={this.showNetwork}
          store={NetworkConfigStore}
          envId={this.envId || this.env[0].id}
          onClose={this.closeNetwork}
        />}
        {this.showDomain && <CreateDomain
          id={this.domainId}
          envId={this.envId || this.env[0].id}
          title={this.domainTitle}
          visible={this.showDomain}
          type={this.domainType}
          store={DomainStore}
          onClose={this.closeDomain}
        />}
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(EnvOverviewHome)));
