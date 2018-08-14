import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Progress, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, Action, stores } from 'choerodon-front-boot';
import ValueConfig from '../valueConfig';
import UpgradeIst from '../upgrateIst';
import DelIst from '../component/delIst/DelIst';
import '../AppDeploy.scss';
import '../../../main.scss';

const { AppState } = stores;

@observer
class AppInstance extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      id: null,
      idArr: [],
      visible: false,
      visibleUp: false,
      openRemove: false,
      loading: false,
      page: 0,
      name: '',
    };
  }

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
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
    this.linkToChange(`/devops/instance/${id}/${status}/detail?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`);
  };

  /**
   * 查看版本特性
   * @param id 实例ID
   * @param istName 实例名
   */
  linkVersionFeature = (id, istName) => {
    const { store } = this.props;
    store.setAlertType('versionFeature');
    this.setState({
      id,
      instanceName: istName,
    });
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
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    this.setState({
      idArr: [envId, verId, appId],
      name,
    });
    store.setAlertType('valueConfig');
    store.loadValue(projectId, appId, envId, verId)
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
   * 升级配置实例信息
   * @param name 实例名
   * @param id 实例ID
   * @param envId
   * @param verId
   * @param appId
   */
  upgradeIst = (name, id, envId, verId, appId) => {
    const { store, intl } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    store.loadValue(projectId, appId, envId, verId)
      .then((res) => {
        if (res && res.failed) {
          Choerodon.prompt(res.message);
        } else {
          store.loadUpVersion(projectId, verId)
            .then((val) => {
              if (val && val.failed) {
                Choerodon.prompt(val.message);
              } else if (val.length === 0) {
                Choerodon.prompt(intl.formatMessage({ id: 'ist.noUpVer' }));
              } else {
                this.setState({
                  idArr: [envId, verId, appId],
                  id,
                  name,
                  visibleUp: true,
                });
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
    const { store } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    store.changeIstActive(projectId, id, status)
      .then((error) => {
        if (error && error.failed) {
          Choerodon.prompt(error.message);
        } else {
          store.loadInstanceAll(projectId, this.state.page);
        }
      });
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
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const sort = {};
    if (sorter.column) {
      const { field, order } = sorter;
      sort[field] = order;
    }
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: param.toString(),
    };
    this.setState({ page: pagination.current - 1, pageSize: pagination.pageSize });
    store.loadInstanceAll(projectId, pagination.current - 1, pagination.pageSize, sort,
      null, null, null, postData);
    store.setIstTableFilter(param);
  };

  /**
   * 关闭滑块
   * @param res 是否重新部署需要重载数据
   */
  handleCancel = (res) => {
    const { store } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    this.setState({
      visible: false,
    });
    if (res) {
      store.loadInstanceAll(projectId, this.state.page);
    }
  };

  /**
   * 关闭升级滑块
   * @param res 是否重新部署需要重载数据
   */
  handleCancelUp = (res) => {
    const { store } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    this.setState({
      visibleUp: false,
    });
    if (res) {
      store.loadInstanceAll(projectId, this.state.page);
    }
  };

  /**
   * 打开删除数据模态框
   * @param id
   */
  handleOpen(id) {
    this.setState({ openRemove: true, id });
  }

  /**
   * 删除数据
   */
  handleDelete = (id) => {
    const { store } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    this.setState({
      loading: true,
    });
    store.deleteIst(projectId, id)
      .then((res) => {
        if (res && res.failed) {
          Choerodon.prompt(res.message);
        } else {
          this.setState({
            openRemove: false,
            loading: false,
          });
          store.loadInstanceAll(projectId, this.state.page);
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
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    const { intl } = this.props;
    if (record.status === 'operating' || !record.connect) {
      return (<Action
        data={[
          {
            type,
            organizationId,
            projectId,
            service: ['devops-service.devops-pod.getLogs', 'devops-service.application-instance.listResources'],
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
            service: ['devops-service.devops-pod.getLogs', 'devops-service.application-instance.listResources'],
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
        data={[
          {
            type,
            organizationId,
            projectId,
            service: ['devops-service.devops-pod.getLogs', 'devops-service.application-instance.listResources'],
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

  render() {
    const { store, intl } = this.props;
    const ist = store.getIstAll;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const pageInfo = store.getPageInfo;
    const param = store.getIstParams;

    const columns = [{
      title: <FormattedMessage id="deploy.status" />,
      key: 'podCount',
      filters: [],
      render: record => (
        <div className="c7n-deploy-status">
          <svg className={record.podCount === 0 ? 'c7n-deploy-circle-process-ban' : 'c7n-deploy-circle_red'}>
            <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="40%" strokeWidth="16.5%" />
          </svg>
          <svg className={record.podCount === 0 ? 'c7n-deploy-circle-process-ban' : 'c7n-deploy-circle-process'}>
            <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="40%" strokeWidth="16.5%" strokeDashoffset={`${251 * ((record.podCount - record.podRunningCount) / record.podCount)}%`} />
          </svg>
          <span className="c7n-deploy-status-num">{record.podCount}</span>
        </div>
      ),
    }, {
      title: <FormattedMessage id="deploy.istStatus" />,
      key: 'status',
      render: record => (
        <div>
          <div className={`c7n-ist-status c7n-ist-status_${record.status}`}>
            <div>{intl.formatMessage({ id: record.status || 'null' })}</div>
          </div>
        </div>
      ),
    }, {
      title: <FormattedMessage id="deploy.instance" />,
      key: 'code',
      filters: [],
      render: record => (record.commandStatus === 'success' ? <span className="c7n-deploy-istCode">{record.code}</span> : <div>
        {record.commandStatus === 'doing' ? (<div>
          <span className="c7n-deploy-istCode">{record.code}</span>
          <Tooltip title={intl.formatMessage({ id: `ist_${record.commandType}` })}>
            <Progress type="loading" width={15} />
          </Tooltip>
        </div>) :
          (<div>
            <span className="c7n-deploy-istCode">{record.code}</span>
            <Tooltip title={`${record.commandType} ${record.commandStatus}: ${record.error}`}>
              <span className="icon icon-error c7n-deploy-ist-operate" />
            </Tooltip>
          </div>)}
      </div>),
    }, {
      title: <FormattedMessage id="deploy.app" />,
      key: 'appName',
      filters: [],
      render: record => (
        <div>
          <div className="c7n-deploy-col-inside">
            {record.projectId === projectId ? <Tooltip title={<FormattedMessage id="project" />}><span className="icon icon-project c7n-icon-publish" /></Tooltip> : <Tooltip title={<FormattedMessage id="market" />}><span className="icon icon-apps c7n-icon-publish" /></Tooltip>}
            <span>{record.appName}</span>
          </div>
          <div>
            <span className="c7n-deploy-text_gray">{record.appVersion}</span>
          </div>
        </div>
      ),
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
      width: 56,
      className: 'c7n-operate-icon',
      key: 'action',
      render: record => this.columnAction(record),
    }];

    return (
      <div className="c7n-region">
        <Table
          filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
          onChange={this.tableChange}
          loading={store.getIsLoading}
          columns={columns}
          pagination={pageInfo}
          filters={param || []}
          dataSource={ist}
          rowKey={record => record.id}
        />
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
          id={this.state.id}
          idArr={this.state.idArr}
          onClose={this.handleCancelUp}
        /> }
        <DelIst
          open={this.state.openRemove}
          handleCancel={this.handleClose}
          handleConfirm={this.handleDelete.bind(this, this.state.id)}
          confirmLoading={this.state.loading}
        />
      </div>
    );
  }
}

export default (withRouter(injectIntl(AppInstance)));
