import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button } from 'choerodon-ui';
import { Content, Header, Page, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import SingleApp from '../singleApp';
import SingleEnv from '../singleEnv';
import AppInstance from '../appInstance';
import AppStoreStore from '../../../../stores/project/appStore';
import './DeployHome.scss';
import '../AppDeploy.scss';
import '../../../main.scss';

const ButtonGroup = Button.Group;
const { AppState } = stores;

@observer
class DeployHome extends Component {
  componentDidMount() {
    AppStoreStore.setBackPath(false);
    // this.loadEnvCards();
    // this.loadAppName();
  }

  componentWillUnmount() {
    const { AppDeploymentStore } = this.props;
    AppDeploymentStore.setEnvId();
    AppDeploymentStore.setAppId();
    AppDeploymentStore.setVerId([]);
    AppDeploymentStore.setAppVer([]);
    AppDeploymentStore.setSingleAppId();
    AppDeploymentStore.setAppNameByEnv([]);
    AppDeploymentStore.setIstTableFilter(null);
  }

  /**
   * 刷新函数
   */
  reload = () => {
    const { AppDeploymentStore } = this.props;
    const tabName = AppDeploymentStore.getTabActive;
    const { filters, param } = AppDeploymentStore.getIstParams;
    const { current, pageSize } = AppDeploymentStore.getPageInfo;
    const datas = {
      searchParam: filters,
      param: param.toString(),
    };
    this.loadData(tabName, { page: current - 1, size: pageSize, datas });
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
   * 获取应用名称
   */
  loadAppName = () => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadAppNames(projectId);
  };

  /**
   * 获取应用版本
   */
  loadAppVer = (id, Info = {}) => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const envNames = AppDeploymentStore.getEnvcard;
    const envId = AppDeploymentStore.getEnvId;
    const envID = envId || (envNames.length ? envNames[0].id : null);
    const verId = AppDeploymentStore.getVerId;
    if (envID) {
      this.loadInstance(envID, verId, id, Info);
    }
    AppDeploymentStore.loadAppVersion(projectId, id);
  };

  /**
   * 获取实例列表
   * @param envId 环境id
   * @param verId 版本id
   * @param appId 应用id
   * @param Info
   */
  loadInstance = (envId, verId, appId, Info) => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    Info.envId = envId;
    Info.versionId = verId;
    Info.appId = appId;
    AppDeploymentStore.loadInstanceAll(projectId, Info);
  };

  /**
   * 切换子页面
   * @param tabName
   * @param info
   */
  changeTabs = (tabName, info) => {
    const { AppDeploymentStore } = this.props;
    const tabActive = AppDeploymentStore.getTabActive;
    if (tabName === tabActive) {
      return;
    }
    AppDeploymentStore.setTabActive(tabName);
    if (_.isEmpty(info)) {
      AppDeploymentStore.setIstTableFilter(null);
    }
    // if (tabName !== 'instance') {
    //   this.loadEnvCards();
    //   this.loadAppName();
    // }
    AppDeploymentStore.setIstAll([]);
  };

  /**
   * 加载单应用数据
   * @param info
   */
  handleSigApp = (info) => {
    const { AppDeploymentStore } = this.props;
    const appId = AppDeploymentStore.getSingleAppId;
    // this.loadEnvCards();
    // this.loadAppName();
    const appNames = AppDeploymentStore.getAppNames;
    if (appNames.length) {
      this.loadAppVer(appId || appNames[0].id, info);
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
    const { AppDeploymentStore } = this.props;
    const { name } = AppState.currentMenuType;
    const tabActive = AppDeploymentStore.getTabActive;

    return (
      <Page
        className="c7n-region"
        service={[
          'devops-service.application-instance.pageByOptions',
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
        <Header title={<FormattedMessage id="ist.head" />}>
          <Button
            icon="refresh"
            funcType="flat"
            onClick={this.reload}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="ist" value={{ name }} className="page-content">
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
            </ButtonGroup>
          </div>
          {tabActive === 'singleApp' && <SingleApp key="singleApp" store={AppDeploymentStore} />}
          {tabActive === 'singleEnv' && <SingleEnv key="singleEnv" store={AppDeploymentStore} />}
          {tabActive === 'instance' && <AppInstance key="instance" store={AppDeploymentStore} />}
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(DeployHome));
