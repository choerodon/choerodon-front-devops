import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Select, Form, Progress, Tooltip, Popover } from 'choerodon-ui';
import { stores, Action } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import classNames from 'classnames';
import ValueConfig from '../valueConfig';
import UpgradeIst from '../upgrateIst';
import '../AppDeploy.scss';
import './SingleApp.scss';
import '../../../main.scss';
import DelIst from '../component/delIst/DelIst';
import { scrollTo } from '../../../../utils';

let scrollLeft = 0;
const { Option, OptGroup } = Select;

const { AppState } = stores;
const height = window.screen.height;
@observer
class SingleApp extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      visibleUp: false,
      page: 0,
      pageSize: height <= 900 ? 10 : 15,
      openRemove: false,
      loading: false,
      selectPubPage: 0,
      selectProPage: 0,
      appPubLength: 0,
      appProLength: 0,
      appPubDom: [],
      appProDom: [],
    };
  }

  componentDidMount() {
    this.loadSelectData([this.state.selectProPage, this.state.selectPubPage], '');
    scrollLeft = 0;
  }

  /**
   * 获取应用版本
   */
  loadAppVer = (ids) => {
    const { store } = this.props;
    if (ids && ids !== 'more') {
      const idArr = ids.split('-');
      const projectId = AppState.currentMenuType.id;
      const envId = store.getEnvId;
      const envNames = store.getEnvcard;
      const envID = envId || (envNames.length ? envNames[0].id : null);
      store.setAppId(idArr[0]);
      store.setVerId(false);
      if (envID) {
        this.loadInstance(envID, null, idArr[0]);
      }
      if (idArr[0]) {
        if (idArr[1] === projectId) {
          store.loadAppVersion(projectId, idArr[0]);
        } else {
          store.loadAppVersion(idArr[1], idArr[0]);
        }
      } else {
        store.setAppVer([]);
      }
    } else {
      store.setVerId(false);
      store.setAppVer([]);
    }
    store.setIstTableFilter(null);
  };

  /**
   * 设置版本Id
   */
  loadVerId = (id) => {
    const { store } = this.props;
    const envNames = store.getEnvcard;
    const appNames = store.getAppNames;
    const envId = store.getEnvId;
    const appId = store.getAppId;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    const appID = appId || (appNames.length ? appNames[0].id : null);
    store.setVerId(id);
    if (envID) {
      this.loadInstance(envID, id, appID);
    }
    store.setIstTableFilter(null);
  };

  /**
   * 设置环境Id
   * @param envId
   */
  loadDetail = (envId) => {
    const { store } = this.props;
    const envNames = store.getEnvcard;
    const appNames = store.getAppNames;
    store.setEnvId(envId);
    const appId = store.getAppId;
    const verId = store.getVerId;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    const appID = appId || (appNames.length ? appNames[0].id : null);
    this.loadInstance(envID, verId, appID);
    store.setIstTableFilter(null);
  };

  /**
   * 获取实例列表
   * @param envId 环境id
   * @param verId 版本id
   * @param appId 应用id
   */
  loadInstance = (envId, verId, appId) => {
    const { store } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    store.loadInstanceAll(projectId, { envId, versionId: verId, appId });
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
   * 查看部署详情
   * @param id 实例ID
   * @param status 实例状态
   */
  linkDeployDetail = (id, status) => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const projectName = AppState.currentMenuType.name;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/instance/${id}/${status}/detail?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`);
  };

  /**
   * 查看版本特性
   * @param id 实例id
   * @param istName 实例名
   */
  linkVersionFeature = (id, istName) => {
    const { store } = this.props;
    store.setAlertType('versionFeature');
    this.setState({ id });
    store.changeShow(true);
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
    const envNames = store.getEnvcard;
    const appNames = store.getAppNames;
    const envId = store.getEnvId;
    const appId = store.getAppId;
    const verId = store.getVerId;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    const appID = appId || (appNames.length ? appNames[0].id : null);
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
    this.setState({ page: pagination.current - 1 });
    store.loadInstanceAll(projectId, { page: pagination.current - 1, size: pagination.pageSize, envId: envID, versionId: verId, appId: appID, datas: postData });
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
    const projectId = parseInt(AppState.currentMenuType.id, 10);
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
  handleCancel = (res) => {
    const { store } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const appNames = store.getAppNames;
    const envNames = store.getEnvcard;
    const envId = store.getEnvId;
    const appId = store.getAppId;
    const verId = store.getVerId;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    const appID = appId || (appNames.length ? appNames[0].id : null);
    this.setState({
      visible: false,
    });
    if (res) {
      store.loadInstanceAll(projectId, { envId: envID, versionId: verId, appId: appID });
      store.setIstTableFilter(null);
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
      store.loadInstanceAll(projectId);
      store.setIstTableFilter(null);
    }
  };

  /**
   * 删除数据
   */
  handleDelete = (id) => {
    const { store } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const appNames = store.getAppNames;
    const envNames = store.getEnvcard;
    const envId = store.getEnvId;
    const appId = store.getAppId;
    const verId = store.getVerId;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    const appID = appId || (appNames.length ? appNames[0].id : null);
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
          store.loadInstanceAll(projectId, { envId: envID, versionId: verId, appId: appID });
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
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const { page, pageSize } = this.state;
    const appNames = store.getAppNames;
    const envNames = store.getEnvcard;
    const envId = store.getEnvId;
    const appId = store.getAppId;
    const verId = store.getVerId;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    const appID = appId || (appNames.length ? appNames[0].id : null);
    store.changeIstActive(projectId, id, status)
      .then((error) => {
        if (error && error.failed) {
          Choerodon.prompt(error.message);
        } else {
          store.loadInstanceAll(projectId, { page, pageSize, envId: envID, versionId: verId, appId: appID });
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
   * 点击右滑动
   */
  pushScrollRight = () => {
    const { moveRight } = this.state;
    scrollLeft -= 250;
    if (scrollLeft < 0) {
      scrollLeft = 0;
    }
    this.setState({
      moveBan: false,
      moveRight: moveRight - 250,
    });
    scrollTo(document.getElementsByClassName('c7n-single-env-inner')[0], -250);
  };

  /**
   * 点击左滑动
   */
  pushScrollLeft = (length) => {
    const domPosition = document.getElementsByClassName('c7n-single-env-inner')[0].scrollLeft;
    this.setState({
      moveRight: domPosition,
    });
    if (length * 274 - window.innerWidth + 208 <= domPosition + 250) {
      this.setState({
        moveBan: true,
      });
      scrollLeft = domPosition;
    } else {
      this.setState({
        moveBan: false,
      });
    }
    scrollLeft += 250;
    scrollTo(document.getElementsByClassName('c7n-single-env-inner')[0], 250);
  };

  /**
   * action 权限控制
   * @param record 行数据
   * @returns {*}
   */
  columnAction = (record) => {
    const { intl } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
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

  appDomMore = (type, e) => {
    e.stopPropagation();
    const { store } = this.props;
    const { selectProPage, selectPubPage } = this.state;
    const filterValue = store.getFilterValue;
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

  loadSelectData = (pageArr, filterValue) => {
    const { store } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    let allItems = store.getAppNames;
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
          appPubDom.push(<Option key={`${d.id}-${d.projectId}`} value={`${d.id}-${d.projectId}`}>
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
              <div className="c7n-option-popover">
                <i className="icon icon-apps c7n-icon-publish" />
                {d.name}
              </div>
            </Popover>
          </Option>);
        } else if (appProDom.length < proPageSize) {
          appProDom.push(<Option key={`${d.id}-${d.projectId}`} value={`${d.id}-${d.projectId}`}>
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
              <div className="c7n-option-popover">
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

  handleFilter = (value) => {
    const { store } = this.props;
    store.setFilterValue(value);
    this.setState({
      selectPubPage: 0,
      selectProPage: 0,
    });
    this.loadSelectData([0, 0], value);
  };

  /**
   * 打开删除数据模态框
   * @param id
   */
  handleOpen(id) {
    this.setState({ openRemove: true, id });
  }

  render() {
    const { store, intl } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const appNames = store.getAppNames;
    const appVer = store.getAppVer;
    const envCard = store.getEnvcard;
    const ist = store.getIstAll;
    const envId = store.getEnvId;
    const appId = store.getAppId;
    const verId = store.getVerId;
    const pId = store.getPId;
    const envID = envId || (envCard.length ? envCard[0].id : null);
    const appID = appId || (appNames.length ? appNames[0].id : null);

    const appName = appID ? `${appID}-${pId || projectId}` : null;

    const appVersion = appVer.length
      ? _.map(appVer, d => d.version && <Option key={d.id}>{d.version}</Option>) : undefined;

    const leftDom = scrollLeft !== 0
      ? <div role="none" className="c7n-env-push-left icon icon-navigate_before" onClick={this.pushScrollRight} />
      : null;

    const rightStyle = classNames({
      'c7n-env-push-right icon icon-navigate_next': ((window.innerWidth >= 1680 && window.innerWidth < 1920) && envCard.length >= 6) || (window.innerWidth >= 1920 && envCard.length >= 7) || (window.innerWidth < 1680 && envCard.length >= 5),
      'c7n-push-none': envCard.length <= 4,
    });

    const rightDom = this.state.moveBan ? null : <div role="none" className={rightStyle} onClick={this.pushScrollLeft.bind(this, envCard.length)} />;
    const envCardDom = envCard.length ? _.map(envCard, d => (<div className="c7n-app-square" key={d.id}>
      <div role="none" className={Number(envID) === d.id ? 'c7n-app-card c7n-app-card-active' : 'c7n-app-card'} key={d.id} onClick={this.loadDetail.bind(this, d.id)}>
        <div className={d.connect ? 'c7n-app-state' : 'c7n-app-state-pending'}>
          {d.connect ? <FormattedMessage id="running" /> : <FormattedMessage id="disconnect" />}
        </div>
        <div className="c7n-app-name"><Tooltip title={d.name || ''}>{d.name}</Tooltip></div>
      </div>
      <span className="c7n-app-arrow">→</span>
    </div>))
      : (<div className="c7n-app-square">
        <div className="c7n-app-card" key="noEnv">
          <div className="c7n-app-state-ban">
            <FormattedMessage id="ist.noAdd" />
          </div>
          <FormattedMessage id="ist.noAddEnv" />
        </div>
      </div>);

    const { filters, param } = store.getIstParams;

    const columnApp = [{
      title: <FormattedMessage id="deploy.status" />,
      key: 'podCount',
      filters: [],
      filteredValue: filters.podCount || [],
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

    const detailDom = (
      <div>
        {(() => {
          if (appID && envID) {
            return (<div className="c7n-deploy-wrap_gray">
              <div className="c7n-deploy-single-wrap">
                <div className="c7n-deploy-singleApp-ist">
                  <FormattedMessage id="ist.head" />
                </div>
                <Table
                  filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
                  onChange={this.tableChange}
                  loading={store.getIsLoading}
                  pagination={store.pageInfo}
                  columns={columnApp}
                  filters={param || []}
                  filterBar={false}
                  dataSource={ist}
                  rowKey={record => record.id}
                />
              </div>
            </div>);
          } else {
            return <span className="c7n-none-des">{intl.formatMessage({ id: 'ist.noChoose' })}</span>;
          }
        })()}
      </div>
    );

    const proPageSize = (10 * this.state.selectProPage) + 3;
    const pubPageSize = (10 * this.state.selectPubPage) + 3;

    return (
      <div className="c7n-region">
        <Select
          value={appName}
          label={intl.formatMessage({ id: 'deploy.appName' })}
          className="c7n-app-select_220"
          onChange={this.loadAppVer}
          optionFilterProp="children"
          filterOption={false}
          onFilterChange={this.handleFilter}
          filter
        >
          <OptGroup label={intl.formatMessage({ id: 'project' })} key="proGroup">
            {this.state.appProDom}
            { proPageSize < this.state.appProLength && (<Option key="more">
              <div role="none" onClick={this.appDomMore.bind(this, 'pro')} className="c7n-option-popover c7n-dom-more">
                {intl.formatMessage({ id: 'ist.more' })}
              </div>
            </Option>)}
          </OptGroup>
          <OptGroup label={intl.formatMessage({ id: 'market' })} key="pubGroup">
            {this.state.appPubDom}
            { pubPageSize < this.state.appPubLength && (<Option key="pubMore">
              <div role="none" onClick={this.appDomMore.bind(this, 'pub')} className="c7n-option-popover c7n-dom-more">
                {intl.formatMessage({ id: 'ist.more' })}
              </div>
            </Option>)}
          </OptGroup>
        </Select>
        <Select
          notFoundContent={intl.formatMessage({ id: 'network.form.version.disable' })}
          label={intl.formatMessage({ id: 'app.version' })}
          value={verId}
          className="c7n-app-select_312"
          onChange={this.loadVerId}
          optionFilterProp="children"
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filter
          allowClear
          showSearch
        >
          {appVersion}
        </Select>
        <div className="c7n-single-env-outer">
          {leftDom}
          <div className="c7n-single-env-inner">
            <div className="c7n-deploy-env-line">
              {envCardDom}
            </div>
          </div>
          {rightDom}
        </div>
        {detailDom}
        {this.state.visible && <ValueConfig
          store={this.props.store}
          visible={this.state.visible}
          name={this.state.name}
          id={this.state.id}
          idArr={this.state.idArr}
          onClose={this.handleCancel}
        />}
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
        />
      </div>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(SingleApp)));
