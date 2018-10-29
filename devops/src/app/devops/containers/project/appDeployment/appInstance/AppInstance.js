import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Progress, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, Action, stores } from 'choerodon-front-boot';
import ValueConfig from '../valueConfig';
import UpgradeIst from '../upgrateIst';
import DelIst from '../component/delIst/DelIst';
import ExpandRow from '../component/ExpandRow';
import '../AppDeploy.scss';
import '../../../main.scss';

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
      name: '',
    };
  }

  componentDidMount() {
    const { store } = this.props;
    store.loadInstanceAll(projectId, {});
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
    this.linkToChange(`/devops/instance/${id}/${status}/detail?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`);
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
   * 启停用实例
   * @param id 实例ID
   * @param status 状态
   */
  activeIst = (id, status) => {
    const { store } = this.props;
    store.changeIstActive(projectId, id, status)
      .then((error) => {
        if (error && error.failed) {
          Choerodon.prompt(error.message);
        } else {
          store.loadInstanceAll(projectId);
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
    const postData = {
      searchParam: filters,
      param: param.toString(),
    };
    store.loadInstanceAll(projectId, { page: pagination.current - 1, size: pagination.pageSize, datas: postData });
    store.setIstTableFilter({ filters, param });
  };

  /**
   * 关闭滑块
   * @param res 是否重新部署需要重载数据
   */
  handleCancel = (res) => {
    const { store } = this.props;
    this.setState({
      visible: false,
    });
    if (res) {
      store.loadInstanceAll(projectId);
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
          store.loadInstanceAll(projectId);
        }
      });
    store.setIstTableFilter(null);
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

  /**
   * 打开删除数据模态框
   * @param id
   * @param name
   */
  handleOpen(id, name) {
    this.setState({ openRemove: true, id, name });
  }

  render() {
    const {
      store: {
        getIstAll,
        getPageInfo,
        getIsLoading,
        getIstParams: { filters, param },
      },
      intl,
    } = this.props;
    const { name } = this.state;
    const ist = getIstAll;
    const pageInfo = getPageInfo;
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
      title: <FormattedMessage id="deploy.app" />,
      key: 'appName',
      filters: [],
      filteredValue: filters.appName || [],
      render: record => (
        <div>
          <div className="c7n-deploy-col-inside">
            {record.projectId === projectId ? <Tooltip title={<FormattedMessage id="project" />}><i className="icon icon-project c7n-icon-publish" /></Tooltip> : <Tooltip title={<FormattedMessage id="market" />}><i className="icon icon-apps c7n-icon-publish" /></Tooltip>}
            <span>{record.appName}</span>
          </div>
          <div>
            <span className="c7n-deploy-text_gray">{record.appVersion}</span>
          </div>
        </div>
      ),
    }, {
      title: <FormattedMessage id="deploy.env" />,
      key: 'envName',
      filters: [],
      filteredValue: filters.envName || [],
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
          className="c7n-devops-instance-table"
          filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
          onChange={this.tableChange}
          loading={getIsLoading}
          columns={columns}
          pagination={pageInfo}
          filters={param.slice() || []}
          dataSource={ist}
          rowKey={record => record.id}
          expandedRowRender={record => <ExpandRow record={record} />}
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

export default (withRouter(injectIntl(AppInstance)));
