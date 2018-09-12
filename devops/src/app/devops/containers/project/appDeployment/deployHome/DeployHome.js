import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button } from 'choerodon-ui';
import { Content, Header, Page, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import SingleApp from '../singleApp';
import SingleEnv from '../singleEnv';
import AppInstance from '../appInstance';
import MutiDeployment from '../mutiDeployment';
import './DeployHome.scss';
import '../AppDeploy.scss';
import '../../../main.scss';
import AppStoreStore from '../../../../stores/project/appStore';

const ButtonGroup = Button.Group;
const { AppState } = stores;
const height = window.screen.height;

@observer
class DeployHome extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pageSize: height <= 900 ? 10 : 15,
    };
  }

  componentDidMount() {
    const { AppDeploymentStore } = this.props;
    AppStoreStore.setBackPath(false);
    const tabActive = AppDeploymentStore.getTabActive;
    this.loadEnvCards();
    this.loadAppName();
    if (tabActive) {
      this.changeTabs(tabActive);
    } else {
      this.loadIstAlls();
    }
  }

  /**
   * 刷新函数
   */
  reload = () => {
    const { AppDeploymentStore } = this.props;
    const tabName = AppDeploymentStore.getTabActive;
    const { filters, param } = AppDeploymentStore.getIstParams;
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: param.toString(),
    };
    const pageInfo = AppDeploymentStore.getPageInfo;
    this.changeTabs(tabName, { page: pageInfo.current - 1, size: pageInfo.pageSize, datas: postData });
  };

  /**
   * 获取可用环境
   */
  loadEnvCards = () => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadActiveEnv(projectId);
  };

  /**
   * 加载部署实例
   */
  loadIstAlls = (pages = 0, Info = {}) => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadInstanceAll(projectId, Info);
  };

  /**
   * 获取应用名称
   */
  loadAppName = () => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadAppNames(projectId);
  };

  /**
   * 查询多应用部署数据
   */
  loadMuti = () => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadMutiData(projectId);
  };

  /**
   * 查询应用标签及实例列表
   * @param envId
   */
  loadSingleEnv = (envId, Info = {}) => {
    const { AppDeploymentStore } = this.props;
    const { pageSize } = this.state;
    const menu = JSON.parse(sessionStorage.selectData);
    const projectId = menu.id;
    const appPageSize = Math.floor((window.innerWidth - 350) / 200) * 3;
    Info.envId = envId;
    AppDeploymentStore.setAppPageSize(appPageSize);
    AppDeploymentStore.loadInstanceAll(projectId, Info);
    AppDeploymentStore.loadAppNameByEnv(projectId, envId, 0, appPageSize);
  };

  /**
   * 获取应用版本
   */
  loadAppVer = (id, Info = {}) => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const envNames = AppDeploymentStore.getEnvcard;
    const envID = envNames.length ? envNames[0].id : null;
    const verID = AppDeploymentStore.getVerId;
    if (envID) {
      this.loadInstance(envID, verID, id, Info);
    }
    AppDeploymentStore.loadAppVersion(projectId, id);
  };

  /**
   * 获取实例列表
   * @param envId 环境id
   * @param verId 版本id
   * @param appId 应用id
   */
  loadInstance = (envId, verId, appId, Info) => {
    const { AppDeploymentStore } = this.props;
    const { pageSize } = this.state;
    const projectId = AppState.currentMenuType.id;
    Info.envId = envId;
    Info.verId = verId;
    Info.appId = appId;
    AppDeploymentStore.loadInstanceAll(projectId, Info);
  };

  /**
   * 切换子页面
   * @param tabName
   * @param Info
   */
  changeTabs = (tabName, Info) => {
    const { AppDeploymentStore } = this.props;
    AppDeploymentStore.setTabActive(tabName);
    // 设定只要切换tab页就清空筛选条件
    if (_.isEmpty(Info)) {
      AppDeploymentStore.setIstTableFilter(null);
    }
    if (tabName === 'singleApp') {
      this.loadEnvCards();
      this.loadAppName();
      const appNames = AppDeploymentStore.getAppNames;
      AppDeploymentStore.setAppId(false);
      if (appNames.length) {
        this.loadAppVer(AppDeploymentStore.appId || appNames[0].id, Info);
      }
    } else if (tabName === 'multiApp') {
      this.loadEnvCards();
      this.loadMuti();
    } else if (tabName === 'instance') {
      this.loadIstAlls(0, Info);
    } else if (tabName === 'singleEnv') {
      const envNames = AppDeploymentStore.getEnvcard;
      AppDeploymentStore.setAppId(false);
      if (envNames.length) {
        this.loadSingleEnv(AppDeploymentStore.envId || envNames[0].id, Info);
      }
    }
  };

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  render() {
    const { AppDeploymentStore, intl } = this.props;
    const menu = AppState.currentMenuType;
    const tabActive = AppDeploymentStore.getTabActive;

    return (
      <Page
        className="c7n-region"
        service={[
          'devops-service.application-instance.pageByOptions',
          'devops-service.application.listAll',
          'devops-service.application.pageByEnvIdAndStatus',
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.application-version.queryByAppId',
          'devops-service.application-instance.listByAppId',
          'devops-service.application-instance.queryValues',
          'devops-service.application-instance.formatValue',
          'devops-service.application-instance.stop',
          'devops-service.application-instance.start',
          'devops-service.application-instance.deploy',
          'devops-service.application-instance.delete',
        ]}
      >
        <Header title={<FormattedMessage id="ist.title" />}>
          <Button
            funcType="flat"
            onClick={this.reload}
          >
            <i className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content className="page-content">
          <h2 className="c7n-space-first">
            <FormattedMessage
              id="ist.head"
              values={{
                name: `${menu.name}`,
              }}
            />
          </h2>
          <p>
            <FormattedMessage id="ist.description" />
            <a href={intl.formatMessage({ id: 'ist.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                <FormattedMessage id="learnmore" />
              </span>
              <i className="icon icon-open_in_new" />
            </a>
          </p>
          <div className="c7n-deploy-tab">
            <FormattedMessage id="ist.view" />
            <ButtonGroup>
              <Button
                funcType="flat"
                className={tabActive === 'instance' ? 'c7n-tab-active' : ''}
                onClick={this.changeTabs.bind(this, 'instance', {})}
              >
                <FormattedMessage id="ist.instance" />
              </Button>
              <Button
                funcType="flat"
                className={tabActive === 'singleEnv' ? 'c7n-tab-active' : ''}
                onClick={this.changeTabs.bind(this, 'singleEnv', {})}
              >
                <FormattedMessage id="ist.singleEnv" />
              </Button>
              <Button
                funcType="flat"
                className={tabActive === 'singleApp' ? 'c7n-tab-active' : ''}
                onClick={this.changeTabs.bind(this, 'singleApp', {})}
              >
                <FormattedMessage id="ist.singleApp" />
              </Button>
              <Button
                funcType="flat"
                className={tabActive === 'multiApp' ? 'c7n-tab-active' : ''}
                onClick={this.changeTabs.bind(this, 'multiApp', {})}
              >
                <FormattedMessage id="ist.multiApp" />
              </Button>
            </ButtonGroup>
          </div>
          {tabActive === 'multiApp' && <MutiDeployment key="multiApp" store={AppDeploymentStore} />}
          {tabActive === 'singleApp' && <SingleApp key="singleApp" store={AppDeploymentStore} />}
          {tabActive === 'singleEnv' && <SingleEnv key="singleEnv" store={AppDeploymentStore} />}
          {tabActive === 'instance' && <AppInstance key="instance" store={AppDeploymentStore} />}
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(DeployHome));
