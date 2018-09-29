/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action, configure } from 'mobx';
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
import CertTable from '../../certificate/certTable';
import CreateDomain from '../../domain/createDomain';
import CreateNetwork from '../../networkConfig/createNetwork';
import CreateCert from '../../certificate/createCert';
import DomainStore from '../../../../stores/project/domain';
import NetworkConfigStore from '../../../../stores/project/networkConfig';
import CertificateStore from '../../../../stores/project/certificate';

const { AppState } = stores;
const { TabPane } = Tabs;
const { Option } = Select;

configure({ enforceActions: 'never' });

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
      createDisplay: false,
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
    const projectId = AppState.currentMenuType.id;
    const key = this.tabKey;
    const tpEnvId = this.envId || EnvOverviewStore.getTpEnvId;
    const { filters, sort, paras } = EnvOverviewStore.getInfo;
    const sorter = { field: '', order: 'desc' };
    if (sort.column) {
      sorter.field = sort.field || sort.columnKey;
      if (sort.order === 'ascend') {
        sorter.order = 'asc';
      } else if (sort.order === 'descend') {
        sorter.order = 'desc';
      }
    }
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    if (this.env.length) {
      this.loadModuleDate(key, tpEnvId || this.env[0].id, sorter, postData);
    }
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
    const sort = { field: 'id', order: 'desc' };
    const post = {
      searchParam: {},
      param: '',
    };
    if (this.env.length) {
      this.loadModuleDate(key, tpEnvId || this.env[0].id, sort, post);
    }
    EnvOverviewStore.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
  };

  loadModuleDate = (key, env, sort, post) => {
    this.loadSync(env);
    switch (key) {
      case 'domain':
        this.loadDomainOrNet('domain', env, sort, post);
        break;
      case 'network':
        this.loadDomainOrNet('net', env, sort, post);
        break;
      case 'log':
        this.loadLog(env);
        break;
      case 'cert':
        this.loadCertData(env);
        break;
      default:
        this.loadIstOverview(env);
        break;
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
    this.loadDomainOrNet('domain', value);
    this.loadDomainOrNet('net', value);
    this.loadLog(value);
    this.loadSync(value);
    this.loadCertData(value);
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
          const envId = flag ? tpEnvId : envSort[0].id;
          this.loadIstOverview(envId);
          this.loadDomainOrNet('domain', envId);
          this.loadDomainOrNet('net', envId);
          this.loadLog(envId);
          this.loadSync(envId);
          this.loadCertData(envId);
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
   */
  loadDomainOrNet = (type, envId, sort = { field: 'id', order: 'desc' }, datas = {
    searchParam: {},
    param: '',
  }) => {
    const { EnvOverviewStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const pagination = EnvOverviewStore.getPageInfo;
    if (type === 'domain') {
      EnvOverviewStore.loadDomain(projectId, envId, pagination.current - 1, pagination.pageSize, sort, datas);
    } else if (type === 'net') {
      EnvOverviewStore.loadNetwork(projectId, envId, pagination.current - 1, pagination.pageSize, sort, datas);
    }
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
   * 加载证书
   * @param envId
   */
  loadCertData = (envId) => {
    const { page, pageSize, sorter, postData } = CertificateStore.getTableFilter;
    const { id: projectId } = AppState.currentMenuType;
    CertificateStore.loadCertData(projectId, page, pageSize, { field: 'id', order: 'descend' }, { searchParam: {}, param: '' }, envId);
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
  closeDomain = (isload) => {
    const { EnvOverviewStore } = this.props;
    this.props.form.resetFields();
    this.showDomain = false;
    this.domainId = null;
    if (isload) {
      const envId = this.envId || this.env[0].id;
      this.loadDomainOrNet('domain', envId);
      this.loadIstOverview(envId);
      EnvOverviewStore.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
    }
  };

  /**
   * 关闭网络侧边栏
   */
  @action
  closeNetwork = (isload) => {
    const { EnvOverviewStore } = this.props;
    this.props.form.resetFields();
    this.showNetwork = false;
    if (isload) {
      const envId = this.envId || this.env[0].id;
      this.loadDomainOrNet('net', envId);
      this.loadIstOverview(envId);
      EnvOverviewStore.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
    }
  };

  /**
   * 创建证书侧边栏
   */
  openCreateModal = () => {
    CertificateStore.setEnvData([]);
    this.setState({ createDisplay: true });
  };

  /**
   * 关闭证书侧边栏
   */
  closeCreateModal = () => this.setState({ createDisplay: false });

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
    const { id: projectId, name: projectName, organizationId, type } = AppState.currentMenuType;
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
    const stateArr = ist
      ? _.map(ist.devopsEnvPreviewAppDTOS, i => _.filter(i.applicationInstanceDTOS, a => a.status === state)) : [];
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
    const { intl, EnvOverviewStore } = this.props;
    const tpEnvId = this.envId || EnvOverviewStore.getTpEnvId;
    let envName = '';
    if (this.env.length) {
      if (tpEnvId) {
        envName = tpEnvId;
      } else {
        envName = this.env[0].id;
      }
    } else {
      envName = intl.formatMessage({ id: 'envoverview.noEnv' });
    }
    return envName;
  };

  render() {
    const { intl, EnvOverviewStore } = this.props;
    const { createDisplay } = this.state;
    const tpEnvId = this.envId || EnvOverviewStore.getTpEnvId;
    const sync = EnvOverviewStore.getSync;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;

    const envNameDom = this.env.length ? _.map(this.env, d => (<Option key={d.id} value={d.id}>
      {d.connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
      {d.name}</Option>)) : [];

    const envState = this.env.length
      ? this.env.filter(d => d.id === Number(tpEnvId || this.env[0].id))[0] : true;

    const tabEnvId = this.envId || (this.env.length ? this.env[0].id : null);
    // tab页选项
    const tabOption = [{
      key: 'app',
      component: <AppOverview
        store={EnvOverviewStore}
        tabkey={this.tabKey}
        envState={envState.connect}
        envId={tabEnvId}
      />,
      msg: 'network.column.app',
    }, {
      key: 'network',
      component: <NetworkOverview
        store={EnvOverviewStore}
        tabkey={this.tabKey}
        envId={tabEnvId}
      />,
      msg: 'network.header.title',
    }, {
      key: 'domain',
      component: <DomainOverview
        store={EnvOverviewStore}
        tabkey={this.tabKey}
        envId={tabEnvId}
      />,
      msg: 'domain.header.title',
    }, {
      key: 'cert',
      component: <CertTable
        store={CertificateStore}
        envId={tabEnvId}
      />,
      msg: 'ctf.head',
    }, {
      key: 'log',
      component: <LogOverview
        store={EnvOverviewStore}
        tabkey={this.tabKey}
        envId={tabEnvId}
      />,
      msg: 'envoverview.logs',
    }];

    const istStatusType = ['running', 'operating', 'stopped', 'failed'];

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
          'devops-service.certification.listByOptions',
          'devops-service.certification.create',
          'devops-service.certification.delete',
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
            <Tooltip title={!envState.connect ? <FormattedMessage id="envoverview.envinfo" /> : null}>
              <Button
                disabled={!envState.connect}
                onClick={this.deployApp.bind(this, this.envId)}
                icon="jsfiddle"
              >
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
            <Tooltip title={!envState.connect ? <FormattedMessage id="envoverview.envinfo" /> : null}>
              <Button
                funcType="flat"
                disabled={!envState.connect}
                onClick={this.createNetwork}
                icon="playlist_add"
              >
                <FormattedMessage id="network.header.create" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission
            service={['devops-service.devops-ingress.create']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Tooltip title={!envState.connect ? <FormattedMessage id="envoverview.envinfo" /> : null}>
              <Button
                funcType="flat"
                disabled={!envState.connect}
                onClick={this.createDomain.bind(this, 'create', '')}
                icon="playlist_add"
              >
                <FormattedMessage id="domain.header.create" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission
            type={type}
            projectId={projectId}
            organizationId={orgId}
            service={['devops-service.certification.create']}
          >
            <Tooltip title={!envState.connect ? <FormattedMessage id="envoverview.envinfo" /> : null}>
              <Button
                funcType="flat"
                disabled={!envState.connect}
                onClick={this.openCreateModal}
                icon="playlist_add"
              >
                <FormattedMessage id="ctf.create" />
              </Button>
            </Tooltip>
          </Permission>
          <Tooltip title={sync && sync.commitUrl
            ? sync.commitUrl.substr(0, sync.commitUrl.length - 7) : null}
          >
            <a
              href={sync && sync.commitUrl
                ? sync.commitUrl.substr(0, sync.commitUrl.length - 7) : null}
              target="_blank"
              rel="nofollow me noopener noreferrer"
            >
              <Button
                funcType="flat"
                icon="account_balance"
              >
                <FormattedMessage id="envoverview.gitlab" />
              </Button>
            </a>
          </Tooltip>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
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
                  <i className="icon icon-open_in_new c7ncd-link-icon" />
                </a>
              </p>
            </div>
            <div className="c7n-envow-status-content">
              {(sync && sync.devopsSyncCommit === sync.gitCommit
              && sync.gitCommit === sync.agentSyncCommit) || !envState.connect
                ? null
                : <div className="c7n-envow-sync-wrap">
                  <div className="c7n-envow-status-text"><FormattedMessage id="envoverview.sync" /></div>
                  <div><Icon type="autorenew" /></div>
                </div>}
              <div>
                <div className="c7n-envow-status-text"><FormattedMessage id="envoverview.istov" /></div>
                <div className="c7n-envow-status-wrap">
                  {_.map(istStatusType, item => (<div key={item} className={`c7n-envow-status-num c7n-envow-status-${item}`}>
                    <div>{this.getIstCount(item)}</div>
                    <div><FormattedMessage id={item} /></div>
                  </div>))}
                </div>
              </div>
            </div>
          </div>
          <Tabs className="c7n-envoverview-tabs" activeKey={this.tabKey} animated={false} onChange={this.tabChange}>
            {_.map(tabOption, (item) => {
              const { key, component, msg } = item;
              return (<TabPane tab={intl.formatMessage({ id: msg })} key={key}>
                {this.tabKey === key ? component : null}
              </TabPane>);
            })}
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
        {createDisplay ? <CreateCert
          visible={createDisplay}
          envId={this.envId || this.env[0].id}
          store={CertificateStore}
          onClose={this.closeCreateModal}
        /> : null}
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(EnvOverviewHome)));
