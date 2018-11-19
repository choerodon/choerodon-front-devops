import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Select, Tooltip, Pagination, Button, Icon } from 'choerodon-ui';
import { Action, stores, Content, Header, Page } from 'choerodon-front-boot';
import _ from 'lodash';
import { handleProptError } from '../../../utils';
import ValueConfig from './ValueConfig';
import UpgradeIst from './UpgradeIst';
import DelIst from './components/DelIst';
import ExpandRow from './components/ExpandRow';
import StatusIcon from '../../../components/StatusIcon';
import UploadIcon from './components/UploadIcon';
import './Instances.scss';
import '../../main.scss';
import EnvOverviewStore from '../../../stores/project/envOverview';
import DepPipelineEmpty from "../../../components/DepPipelineEmpty/DepPipelineEmpty";
import { getTableTitle } from '../../../utils';
import InstancesStore from "../../../stores/project/instances";

const Option = Select.Option;
const { AppState } = stores;

@observer
class Instances extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleUp: false,
      deleteIst: {},
    };
    this.columnAction = this.columnAction.bind(this);
    this.renderVersion = this.renderVersion.bind(this);
  }

  componentDidMount() {
    const { id: projectId } = AppState.currentMenuType;
    EnvOverviewStore.loadActiveEnv(projectId, 'instance');
  }

  componentWillUnmount() {
    const { InstancesStore } = this.props;
    if (!InstancesStore.getIsCache) {
      InstancesStore.setAppId(null);
      InstancesStore.setAppNameByEnv([]);
      InstancesStore.setIstAll([]);
    }
  }

  /**
   * 页码改变的回调
   * @param page
   * @param size
   */
  onPageChange = (page, size) => {
    const { InstancesStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const envId = EnvOverviewStore.getTpEnvId;
    InstancesStore.setAppPage(page);
    InstancesStore.setAppPageSize(size);
    InstancesStore.loadAppNameByEnv(projectId, envId, page-1, size);
  };

  /**
   * 选择应用后获取实例列表
   * @param envId
   * @param appId
   */
  loadDetail = (envId, appId) => {
    const { InstancesStore } = this.props;
    const currentApp = InstancesStore.getAppId;
    const nextApp = (appId !== currentApp) && appId;
    InstancesStore.setAppId(nextApp);
    this.reloadData();
  };

  /**
   * 查看部署详情
   */
  linkDeployDetail = (record) => {
    const { id, status, appName } = record;
    const { InstancesStore } = this.props;
    InstancesStore.setIsCache(true);
    const { history } = this.props;
    const {
      id: projectId,
      name: projectName,
      type,
      organizationId,
    } = AppState.currentMenuType;
    history.push({
      pathname: `/devops/instance/${id}/${status}/detail`,
      search: `?type=${type}&id=${projectId}&name=${encodeURIComponent(projectName)}&organizationId=${organizationId}`,
      state: { appName },
    });
  };

  /**
   * 查询应用标签及实例列表
   * @param id 环境id
   */
  handleEnvSelect = (id) => {
    const {
      id: projectId,
    } = AppState.currentMenuType;
    const { InstancesStore } = this.props;
    const { loadAppNameByEnv, getAppPage, getAppPageSize } = InstancesStore;
    EnvOverviewStore.setTpEnvId(id);
    InstancesStore.setAppId(false);
    loadAppNameByEnv(projectId, id, getAppPage - 1, getAppPageSize);
    InstancesStore.setIstTableFilter(null);
    this.reloadData();
  };

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   * @param param 搜索
   */
  tableChange =(pagination, filters, sorter, param) => {
    const {
      id: projectId,
    } = AppState.currentMenuType;
    const { InstancesStore } = this.props;
    const { current, pageSize } = pagination;
    const appId = InstancesStore.getAppId;
    const envId = EnvOverviewStore.getTpEnvId;
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const datas = {
      searchParam,
      param: param.toString(),
    };
    InstancesStore.loadInstanceAll(projectId, { page: current - 1, size: pageSize, envId, appId, datas }).catch((err) => {
      InstancesStore.changeLoading(false);
      Choerodon.handleResponseError(err);
    });
    InstancesStore.setIstTableFilter({ filters, param });
  };

  /**
   * 修改配置实例信息
   */
  updateConfig = (record) => {
    const { code, id, envId, commandVersionId, appId } = record;
    const {
      id: projectId,
    } = AppState.currentMenuType;
    const { InstancesStore } = this.props;
    this.setState({
      idArr: [envId, commandVersionId, appId],
      name: code,
    });
    InstancesStore.setAlertType('valueConfig');
    InstancesStore.loadValue(projectId, id, commandVersionId)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
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
    const {
      id: projectId,
    } = AppState.currentMenuType;
    const envId = EnvOverviewStore.getTpEnvId;
    const {
      InstancesStore: {
        reStarts,
        loadInstanceAll,
      },
    } = this.props;
    reStarts(projectId, id)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          loadInstanceAll(projectId, { envId }).catch((err) => {
            InstancesStore.changeLoading(false);
            Choerodon.handleResponseError(err);
          });
        }
      }).catch((err) => {
      InstancesStore.changeLoading(false);
      Choerodon.handleResponseError(err);
    });
  };

  /**
   * 升级配置实例信息
   */
  upgradeIst = (record) => {
    const { code, id, envId, appVersionId, commandVersionId, appId } = record;
    const {
      id: projectId,
    } = AppState.currentMenuType;
    const {
      InstancesStore: {
        loadUpVersion,
        loadValue,
      },
      intl,
    } = this.props;
    loadUpVersion(projectId, appVersionId || commandVersionId)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          if (res.length === 0) {
            Choerodon.prompt(intl.formatMessage({ id: 'ist.noUpVer' }));
          } else {
            this.setState({
              idArr: [envId, res[0].id, appId],
              id,
              name: code,
            });
            loadValue(projectId, id, res[0].id)
              .then((value) => {
                const val = handleProptError(value);
                if (val) {
                  this.setState({
                    visibleUp: true,
                  });
                }
              });
          }
        }
      }).catch((err) => {
      InstancesStore.changeLoading(false);
      Choerodon.handleResponseError(err);
    });
  };

  /**
   * 关闭滑块
   * @param res 是否重新部署需要重载数据
   */
  handleCancel =(res) => {
    const { InstancesStore } = this.props;
    this.setState({
      visible: false,
    });
    res && this.reloadData();
  };

  /**
   * 关闭升级滑块
   * @param res 是否重新部署需要重载数据
   */
  handleCancelUp = (res) => {
    this.setState({
      visibleUp: false,
    });
    res && this.reloadData();
  };

  /**
   * 页面数据重载
   * @param envId
   * @param appId
   */
  reloadData = () => {
    const { id: projectId } = AppState.currentMenuType;
    const { InstancesStore } = this.props;
    const appId = InstancesStore.getAppId;
    const envId = EnvOverviewStore.getTpEnvId;
    const { current, pageSize } = InstancesStore.getPageInfo;
    const { filters, param } = InstancesStore.getIstParams;
    const info = {
      envId,
      appId,
      page: current - 1,
      size: pageSize,
      datas: {
        param,
        searchParam: filters,
      },
    };
    InstancesStore.loadInstanceAll(projectId, info)
      .catch((err) => {
        InstancesStore.changeLoading(false);
        Choerodon.handleResponseError(err);
      });
    // InstancesStore.setIstTableFilter(null);
  };

  /**
   * 刷新按钮
   */
  reload = () => {
    const { id: projectId } = AppState.currentMenuType;
    const {
      InstancesStore: {
        getAppPageSize,
        loadAppNameByEnv,
        getAppPage,
        getAppId,
      },
    } = this.props;
    const envId = EnvOverviewStore.getTpEnvId;
    loadAppNameByEnv(projectId, envId, getAppPage - 1, getAppPageSize);
    this.reloadData();
  };

  /**
   * 删除数据
   */
  handleDelete = (id) => {
    const { id: projectId } = AppState.currentMenuType;
    const { InstancesStore } = this.props;
    const {
      loadInstanceAll,
      deleteInstance,
      getAppId,
    } = InstancesStore;
    const envId = EnvOverviewStore.getTpEnvId;
    const { deleteIst } = this.state;
    deleteIst[id] = true;
    this.setState({
      loading: true,
      deleteIst,
    });
    deleteInstance(projectId, id)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          loadInstanceAll(projectId, { envId, getAppId }).catch((err) => {
            InstancesStore.changeLoading(false);
            Choerodon.handleResponseError(err);
          });
        }
        this.state.deleteIst[id] = false;
        this.setState({
          openRemove: false,
          loading: false,
          deleteIst: this.state.deleteIst,
        });
      }).catch((error) => {
      this.state.deleteIst[id] = false;
      this.setState({
        loading: false,
        deleteIst: this.state.deleteIst,
      });
      Choerodon.handleResponseError(err);
    });
    InstancesStore.setIstTableFilter(null);
  };

  /**
   * 关闭删除数据的模态框
   */
  handleClose(id) {
    this.state.deleteIst[id] = false;
    this.setState({
      openRemove: false,
      deleteIst: this.state.deleteIst,
    });
  };

  /**
   * 启停用实例
   * @param id 实例ID
   * @param status 状态
   */
  activeIst = (id, status) => {
    const {
      id: projectId,
    } = AppState.currentMenuType;
    const {
      InstancesStore: {
        changeIstActive,
        loadInstanceAll,
        getAppId,
      },
    } = this.props;
    const envId = EnvOverviewStore.getTpEnvId;
    changeIstActive(projectId, id, status)
      .then((data) => {
        const res = handleProptError(data);
        if (res) {
          loadInstanceAll(projectId, { envId, getAppId }).catch((err) => {
            InstancesStore.changeLoading(false);
            Choerodon.handleResponseError(err);
          });
        }
      });
  };

  /**
   * action 权限控制
   * @param record 行数据
   * @returns {*}
   */
  columnAction(record) {
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
        actionItem = ['detail', 'stop', 'delete'];
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
    return (<Action data={actionData} />);
  };

  renderStatus(record) {
    const { code, status, error } = record;
    return (<StatusIcon
      name={code}
      status={status || ''}
      error={error || ''}
    />);
  }

  renderVersion(record) {
    const { intl: { formatMessage } } = this.props;
    const { id, appVersion, commandVersion, status } = record;
    const { deleteIst } = this.state;
    let uploadIcon = null;
    if (appVersion !== commandVersion) {
      if (status !== 'failed') {
        uploadIcon = 'upload';
      } else {
        uploadIcon = 'failed';
      }
    } else {
      uploadIcon = 'text'
    }
    return(<UploadIcon
      istId={id}
      isDelete={deleteIst}
      status={uploadIcon}
      text={appVersion}
      prevText={commandVersion}
    />);
  }

  /**
   * 打开删除数据模态框
   */
  handleOpen(record) {
    const { id, code } = record;
    this.setState({ openRemove: true, id, name: code });
  }

  render() {
    const {
      id: projectId,
      name: projectName,
    } = AppState.currentMenuType;
    const {
      InstancesStore,
      intl: { formatMessage },
    } = this.props;
    const {
      getIstAll,
      getPageInfo,
      getAppNameByEnv,
      getAppPageInfo: { current, total, pageSize },
      getIsLoading,
      getIstParams: { filters, param },
      getAppId,
    } = InstancesStore;
    const {
      name,
      visible,
      visibleUp,
      idArr,
      openRemove,
      id,
      loading,
    } = this.state;

    const envData = EnvOverviewStore.getEnvcard;
    const envId = EnvOverviewStore.getTpEnvId;

    const title = _.find(envData, ['id', envId]);

    const appNameDom = getAppNameByEnv.length ? _.map(getAppNameByEnv, d => (<div
      role="none"
      className={`c7n-deploy-single_card ${Number(getAppId) === d.id ? 'c7n-deploy-single_card-active' : ''}`}
      onClick={this.loadDetail.bind(this, envId, d.id)}
      key={`${d.id}-${d.projectId}`}
    >
      <i className={`icon icon-${d.projectId === Number(projectId) ? 'project' : 'apps'} c7n-icon-publish`} />
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
      render: this.renderStatus,
    }, {
      title: getTableTitle('deploy.ver'),
      key: 'version',
      filters: [],
      filteredValue: filters.version || [],
      render: this.renderVersion,
    }, {
      width: 56,
      className: 'c7n-operate-icon',
      key: 'action',
      render: this.columnAction,
    }];

    const detailDom = (<Fragment>
      <div className="c7n-deploy-env-title">
        <FormattedMessage id="deploy.app" />
      </div>
      <div>
        {appNameDom}
      </div>
      {getAppNameByEnv.length && (total >= pageSize) ? <div className="c7n-store-pagination">
        <Pagination
          tiny={false}
          showSizeChanger
          showSizeChangerLabel={false}
          total={total || 0}
          current={current || 0}
          pageSize={pageSize || 0}
          onChange={this.onPageChange}
          onShowSizeChange={this.onPageChange}
        />
      </div> : null}
      <div className="c7n-deploy-env-title c7n-deploy-env-ist">
        <FormattedMessage id="ist.head" />
      </div>
      <Table
        className="c7n-devops-instance-table"
        filterBarPlaceholder={formatMessage({ id: 'filter' })}
        onChange={this.tableChange}
        dataSource={getIstAll}
        loading={getIsLoading}
        pagination={getPageInfo}
        filters={param.slice() || []}
        columns={columns}
        rowKey={record => record.id}
        expandedRowRender={record => <ExpandRow record={record} />}
      />
    </Fragment>);

    return (
      <Page
        className="c7n-region"
        service={[
          'devops-service.application-instance.pageByOptions',
          'devops-service.application.pageByEnvIdAndStatus',
          'devops-service.application-instance.listResources',
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.application-version.getUpgradeAppVersion',
          'devops-service.application-instance.listByAppId',
          'devops-service.application-instance.queryValues',
          'devops-service.application-instance.formatValue',
          'devops-service.application-instance.stop',
          'devops-service.application-instance.start',
          'devops-service.application-instance.deploy',
          'devops-service.application-instance.delete',
          'devops-service.application-instance.restart',
        ]}
      >
        {envData && envData.length && envId  ? <Fragment><Header title={<FormattedMessage id="ist.head" />}>
          <Select
            className={`${envId? 'c7n-header-select' : 'c7n-header-select c7n-select_min100'}`}
            dropdownClassName="c7n-header-env_drop"
            placeholder={formatMessage({ id: 'envoverview.noEnv' })}
            value={envData && envData.length ? envId : undefined}
            disabled={envData && envData.length === 0}
            onChange={this.handleEnvSelect}
          >
            {_.map(envData,  e => (
              <Option key={e.id} value={e.id} disabled={!e.permission} title={e.name}>
                <Tooltip placement="right" title={e.name}>
                  <span className="c7n-ib-width_100">
                    {e.connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
                    {e.name}
                  </span>
                </Tooltip>
              </Option>))}
          </Select>
          <Button
            icon="refresh"
            funcType="flat"
            onClick={(e) => {
              e.persist();
              this.reload();
            }}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content className="page-content">
          <div className="c7n-instance-header">
            <div className="c7n-instance-title">{formatMessage({ id: 'ist.title.env' }, { name: title ? title.name : projectName })}</div>
            <div className="c7n-instance-describe">{formatMessage({ id: 'ist.description' })}
              <a href={formatMessage({ id: 'ist.link' })}>{formatMessage({ id: 'learnmore' })}<Icon type="open_in_new" /></a>
            </div>
          </div>
          {detailDom}
          {visible && <ValueConfig
            store={InstancesStore}
            visible={visible}
            name={name}
            id={id}
            idArr={idArr}
            onClose={this.handleCancel}
          />}
          {visibleUp && <UpgradeIst
            store={InstancesStore}
            visible={visibleUp}
            name={name}
            appInstanceId={id}
            idArr={idArr}
            onClose={this.handleCancelUp}
          /> }
          <DelIst
            open={openRemove}
            handleCancel={this.handleClose.bind(this, id)}
            handleConfirm={this.handleDelete.bind(this, id)}
            confirmLoading={loading}
            name={name}
          />
        </Content></Fragment> : <DepPipelineEmpty title={<FormattedMessage id="ist.head" />} type="env" />}
      </Page>
    );
  }
}

export default withRouter(injectIntl(Instances));
