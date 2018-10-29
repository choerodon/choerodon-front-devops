import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Icon, Select, Progress, Tooltip, Pagination } from 'choerodon-ui';
import _ from 'lodash';
import { Action, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import ValueConfig from '../valueConfig';
import UpgradeIst from '../upgrateIst';
import DelIst from '../component/delIst/DelIst';
import ExpandRow from '../component/ExpandRow';
import '../AppDeploy.scss';
import '../../../main.scss';

const Option = Select.Option;

const {
  AppState: {
    currentMenuType: {
      id: projectId,
      name: projectName,
      type,
      organizationId,
    },
  },
} = stores;

@observer
class SingleEnvironment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleUp: false,
      envId: null,
      appId: null,
    };
  }

  componentDidMount() {
    this.loadInitData();
  }

  /**
   * 页码改变的回调
   * @param appPage 改变后的页码
   * @param appPageSize 每页条数
   */
  onPageChange = (appPage, appPageSize) => {
    const { store } = this.props;
    const { envId } = this.state;
    store.setAppPage(appPage);
    store.setAppPageSize(appPageSize);
    this.loadSingleEnv(envId);
  };

  /**
   * 选择应用后获取实例列表
   * @param envId
   * @param appId
   */
  loadDetail = (envId, appId) => {
    const { store } = this.props;
    const { appId: currentApp } = this.state;
    let nextApp = false;
    if (appId === currentApp) {
      nextApp = false;
      this.loadInstance(envId);
    } else {
      nextApp = appId;
      this.loadInstance(envId, appId);
    }
    this.setState({ appId: nextApp });
    store.setAppId(nextApp);
    store.setIstTableFilter(null);
  };

  /**
   * 查看部署详情
   * @param id 实例ID
   * @param status 实例状态
   */
  linkDeployDetail = (id, status) => {
    const { history } = this.props;
    history.push(`/devops/instance/${id}/${status}/detail?type=${type}&id=${projectId}&name=${encodeURIComponent(projectName)}&organizationId=${organizationId}`);
  };

  /**
   * 查询应用标签及实例列表
   * @param id 环境id
   */
  loadSingleEnv = (id) => {
    const { store } = this.props;
    const { appId } = this.state;
    store.setEnvId(id);
    this.setState({ envId: id });
    store.loadAppNameByEnv(projectId, id, store.appPage - 1, store.appPageSize).then((data) => {
      if (data) {
        const appIds = data.map(item => item.id);
        if (appId && !appIds.includes(appId)) {
          store.loadInstanceAll(projectId, { envId: id, appId: false });
        } else {
          store.loadInstanceAll(projectId, { envId: id, appId });
        }
      }
    });
    store.setIstTableFilter(null);
  };

  /**
   * 获取实例列表
   * @param envId 环境id
   * @param appId 应用id
   */
  loadInstance = (envId, appId) => {
    const { store } = this.props;
    store.loadInstanceAll(projectId, { envId, appId });
  };

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   * @param param 搜索
   */
  tableChange =(pagination, filters, sorter, param) => {
    const { store } = this.props;
    const { envId, appId } = this.state;
    const { current, pageSize } = pagination;
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const datas = {
      searchParam,
      param: param.toString(),
    };
    store.loadInstanceAll(projectId, { page: current - 1, size: pageSize, envId, appId, datas });
    store.setIstTableFilter({ filters, param });
  };

  /**
   * 修改配置实例信息
   * @param name 实例名
   * @param id 实例ID
   * @param envId
   * @param verId
   * @param appId
   */
  updateConfig = (name, id, envId, verId, appId) => {
    const { store } = this.props;
    this.setState({
      idArr: [envId, verId, appId],
      name,
    });
    store.setAlertType('valueConfig');
    store.loadValue(projectId, id, verId)
      .then((res) => {
        if (res && res.failed) {
          Choerodon.prompt(res.message);
        } else {
          this.setState({
            visible: true,
            id,
          });
        }
      });
  };

  /**
   * 重新部署
   * @param id
   */
  reStart = (id) => {
    const { store } = this.props;
    store.reStarts(projectId, id)
      .then((error) => {
        if (error && error.failed) {
          Choerodon.prompt(error.message);
        } else {
          store.loadInstanceAll(projectId);
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
  upgradeIst = (name, id, envId, verId, appId) => {
    const { store, intl } = this.props;
    store.loadUpVersion(projectId, verId)
      .then((val) => {
        if (val && val.failed) {
          Choerodon.prompt(val.message);
        } else if (val.length === 0) {
          Choerodon.prompt(intl.formatMessage({ id: 'ist.noUpVer' }));
        } else {
          this.setState({
            idArr: [envId, val[0].id, appId],
            id,
            name,
          });
          store.loadValue(projectId, id, val[0].id)
            .then((res) => {
              if (res && res.failed) {
                Choerodon.prompt(res.message);
              } else {
                this.setState({
                  visibleUp: true,
                });
              }
            });
        }
      });
  };

  /**
   * 关闭滑块
   * @param res 是否重新部署需要重载数据
   */
  handleCancel =(res) => {
    const { store } = this.props;
    const { appId, envId } = this.state;
    this.setState({
      visible: false,
    });
    if (res) {
      store.loadInstanceAll(projectId, { envId, appId });
      store.setIstTableFilter(null);
    }
  };

  /**
   * 关闭升级滑块
   * @param res 是否重新部署需要重载数据
   */
  handleCancelUp = (res) => {
    const { store } = this.props;
    this.setState({
      visibleUp: false,
    });
    if (res) {
      store.loadInstanceAll(projectId);
      store.setIstTableFilter(null);
    }
  };

  /**
   * 删除数据
   */
  handleDelete = (id) => {
    const { store } = this.props;
    const { appId, envId } = this.state;
    this.setState({
      loading: true,
    });
    store.deleteIst(projectId, id)
      .then((error) => {
        if (error && error.failed) {
          this.setState({
            openRemove: false,
            loading: false,
          });
          Choerodon.prompt(error.message);
        } else {
          this.setState({
            openRemove: false,
            loading: false,
          });
          store.loadInstanceAll(projectId, { envId, appId });
        }
      });
    store.setIstTableFilter(null);
  };


  /**
   * 启停用实例
   * @param id 实例ID
   * @param status 状态
   */
  activeIst = (id, status) => {
    const { store } = this.props;
    const { envId, appId } = this.state;
    store.changeIstActive(projectId, id, status)
      .then((error) => {
        if (error && error.failed) {
          Choerodon.prompt(error.message);
        } else {
          store.loadInstanceAll(projectId, { envId, appId });
        }
      });
  };

  /**
   * 关闭删除数据的模态框
   */
  handleClose = () => {
    this.setState({ openRemove: false });
  };

  /**
   * action 权限控制
   * @param record 行数据
   * @returns {*}
   */
  columnAction = (record) => {
    const { intl } = this.props;
    if (record.status === 'operating' || !record.connect) {
      return (<Action
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
            service: ['devops-service.application-instance.restart'],
            text: intl.formatMessage({ id: 'ist.reDeploy' }),
            action: this.reStart.bind(this, record.id),
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
            service: ['devops-service.application-instance.delete'],
            text: intl.formatMessage({ id: 'ist.del' }),
            action: this.handleOpen.bind(this, record.id, record.code),
          },
        ]}
      />);
    } else {
      return (<Action
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
            service: ['devops-service.application-instance.restart'],
            text: intl.formatMessage({ id: 'ist.reDeploy' }),
            action: this.reStart.bind(this, record.id),
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
            action: this.handleOpen.bind(this, record.id, record.code),
          },
        ]}
      />);
    }
  };

  loadInitData = () => {
    const { store } = this.props;
    const { getEnvId, getAppId } = store;
    store.loadActiveEnv(projectId).then((env) => {
      if (env && env.length) {
        const envId = getEnvId || env[0].id;
        const appPageSize = Math.floor((window.innerWidth - 350) / 200) * 3;
        store.setAppPageSize(appPageSize);
        this.setState({ appId: getAppId, envId });
        store.loadAppNameByEnv(projectId, envId, 0, appPageSize).then((data) => {
          if (data) {
            const appIds = data.map(item => item.id);
            if (appIds.includes(getAppId)) {
              store.loadInstanceAll(projectId, { envId, appId: getAppId });
            } else {
              store.loadInstanceAll(projectId, { envId, appId: false });
            }
          }
        });
      }
    });
  }

  /**
   * 打开删除数据模态框
   * @param id
   * @param name
   */
  handleOpen(id, name) {
    this.setState({ openRemove: true, id, name });
  }

  render() {
    const { store, intl } = this.props;
    const { name, envId, appId } = this.state;
    const ist = store.getIstAll;
    const envNames = store.getEnvcard;
    const appNames = store.getAppNameByEnv;
    const appPageInfo = store.getAppPageInfo;
    const { filters, param } = store.getIstParams;

    const envNameDom = envNames.length ? _.map(envNames, d => (<Option key={d.id} value={d.id}>
      {d.connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
      {d.name}</Option>)) : [];

    const appNameDom = appNames.length ? _.map(appNames, d => (<div
      role="none"
      className={Number(appId) === d.id ? 'c7n-deploy-single_card c7n-deploy-single_card-active' : 'c7n-deploy-single_card'}
      onClick={this.loadDetail.bind(this, envId, d.id, d.projectId)}
      key={`${d.id}-${d.projectId}`}
    >
      {d.projectId === projectId ? <i className="icon icon-project c7n-icon-publish" /> : <i className="icon icon-apps c7n-icon-publish" />}
      <div className="c7n-text-ellipsis"><Tooltip title={d.name || ''}>{d.name}</Tooltip></div>
    </div>)) : (<div className="c7n-deploy-single_card">
      <div className="c7n-deploy-square"><div>App</div></div>
      <FormattedMessage id="ist.noApp" />
    </div>);

    const columns = [{
      title: <FormattedMessage id="deploy.instance" />,
      key: 'code',
      filters: [],
      filteredValue: filters.code || [],
      render: record => ((record.status === 'running' || record.status === 'stopped') ? <span className="c7n-deploy-istCode">{record.code}</span> : <div>
        {record.status === 'operating' ? (<div>
          <span className="c7n-deploy-istCode">{record.code}</span>
          <Tooltip title={intl.formatMessage({ id: `ist_${record.status}` })}>
            <Progress type="loading" width={15} />
          </Tooltip>
        </div>)
          : (<div>
            <span className="c7n-deploy-istCode">{record.code}</span>
            <Tooltip title={`${record.status}: ${record.error}`}>
              <i className="icon icon-error c7n-deploy-ist-operate" />
            </Tooltip>
          </div>)}
      </div>),
    }, {
      title: <FormattedMessage id="deploy.ver" />,
      key: 'appVersion',
      filters: [],
      filteredValue: filters.appVersion || [],
      render: record => (
        <div>
          <span>{record.appVersion}</span>
        </div>
      ),
    }, {
      width: 56,
      className: 'c7n-operate-icon',
      key: 'action',
      render: record => this.columnAction(record),
    }];

    const detailDom = (<Fragment>
      <div className="c7n-deploy-env-title">
        <FormattedMessage id="deploy.app" />
      </div>
      <div>
        {appNameDom}
      </div>
      <div className="c7n-store-pagination">
        <Pagination
          total={appPageInfo.total}
          current={appPageInfo.current}
          pageSize={appPageInfo.pageSize}
          showSizeChanger
          onChange={this.onPageChange}
          onShowSizeChange={this.onPageChange}
        />
      </div>
      <div className="c7n-deploy-env-title c7n-deploy-env-ist">
        <FormattedMessage id="ist.head" />
      </div>
      <Table
        className="c7n-devops-instance-table"
        filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
        onChange={this.tableChange}
        loading={store.getIsLoading}
        pagination={store.pageInfo}
        filters={param.slice() || []}
        columns={columns}
        dataSource={ist}
        rowKey={record => record.id}
        expandedRowRender={record => <ExpandRow record={record} />}
      />
    </Fragment>);

    return (
      <div className="c7n-region">
        <Select
          value={envId}
          label={intl.formatMessage({ id: 'deploy.envName' })}
          className="c7n-app-select"
          onChange={this.loadSingleEnv}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filter
          showSearch
        >
          {envNameDom}
        </Select>
        {detailDom}
        {this.state.visible && <ValueConfig
          store={this.props.store}
          visible={this.state.visible}
          name={this.state.name}
          id={this.state.id}
          idArr={this.state.idArr}
          onClose={this.handleCancel}
        /> }
        {this.state.visibleUp && <UpgradeIst
          store={this.props.store}
          visible={this.state.visibleUp}
          name={this.state.name}
          appInstanceId={this.state.id}
          idArr={this.state.idArr}
          onClose={this.handleCancelUp}
        /> }
        <DelIst
          open={this.state.openRemove}
          handleCancel={this.handleClose}
          handleConfirm={this.handleDelete.bind(this, this.state.id)}
          confirmLoading={this.state.loading}
          name={name}
        />
      </div>
    );
  }
}

export default withRouter(injectIntl(SingleEnvironment));
