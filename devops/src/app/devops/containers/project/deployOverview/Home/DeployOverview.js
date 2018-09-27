import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Button, Popover, Tooltip, Table } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import '../../appDeployment/AppDeploy.scss';
import '../../../main.scss';

const { AppState } = stores;

@observer
class DeployOverview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  componentDidMount() {
    this.loadEnvCards();
  }

  componentWillUnmount() {
    const { AppDeploymentStore } = this.props;
    AppDeploymentStore.setMutiData([]);
  }

  /**
   * 刷新函数
   */
  reload = () => {
    this.loadEnvCards();
  };

  /**
   * 获取可用环境
   */
  loadEnvCards = () => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadActiveEnv(projectId);
    this.loadMulti();
  };

  /**
   * 查询多应用部署数据
   */
  loadMulti = () => {
    const { AppDeploymentStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppDeploymentStore.loadMultiData(projectId);
  };

  /**
   * 快速部署
   * @param appId
   * @param verId
   * @param proId
   */
  quickDeploy = (appId, verId, proId) => {
    const { id: projectId, name: projectName, organizationId, type } = AppState.currentMenuType;
    const isProject = proId === Number(projectId);
    if (isProject) {
      this.linkToChange(`/devops/deployment-app?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}&appId=${appId}&verId=${verId}`);
    } else {
      this.linkToChange(`/devops/deployment-app?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}&isProject&appId=${appId}&verId=${verId}`);
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

  /**
   * 表格渲染
   * @returns {*}
   */
  renderTable() {
    const { AppDeploymentStore, intl: { formatMessage } } = this.props;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const appList = AppDeploymentStore.getMutiData;
    const envNames = AppDeploymentStore.getEnvcard;
    const { type, organizationId: orgId } = AppState.currentMenuType;

    const columns = [
      {
        title: formatMessage({ id: 'deploy.app' }),
        width: 150,
        key: 'apps',
        fixed: 'left',
        render: record => (<React.Fragment>
          {record.projectId === projectId ? <Tooltip title={<FormattedMessage id="project" />}><i className="icon icon-project c7n-icon-publish" /></Tooltip> : <Tooltip title={<FormattedMessage id="market" />}><i className="icon icon-apps c7n-icon-publish" /></Tooltip>}
          <MouserOverWrapper text={record.applicationName} width="108px">
            {record.applicationName}
          </MouserOverWrapper>
        </React.Fragment>),
      },
      {
        title: formatMessage({ id: 'ist.lastVer' }),
        width: 227,
        key: 'latestVersion',
        fixed: 'left',
        render: record => (<div className="c7n-deploy-last">
          <div className="c7n-deploy-muti_card last_177">
            <MouserOverWrapper text={record.latestVersion} width="161px">
              {record.latestVersion}
            </MouserOverWrapper>
          </div>
          <Permission
            service={[
              'devops-service.application-instance.deploy',
            ]}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Tooltip title={<FormattedMessage id="dpOverview.deploy" />}>
              <Button
                shape="circle"
                icon="keyboard_arrow_right"
                onClick={this.quickDeploy.bind(this, record.applicationId, record.latestVersionId, record.projectId)}
              />
            </Tooltip>
          </Permission>
        </div>),
      },
    ];

    _.map(envNames, (e, index) => {
      columns.push({
        title: <div>{e.connect ? <Tooltip title={<FormattedMessage id="connect" />}><span className="c7n-ist-status_on" /></Tooltip> : <Tooltip title={<FormattedMessage id="disconnect" />}><span className="c7n-ist-status_off" /></Tooltip>}{e.name}</div>,
        width: 230,
        key: `${e.name}${index}`,
        render: record => (<span>{this.renderEc(e.id, record)}</span>),
      });
    });
    /**
     * 处理环境列变换时fixed列自适应宽度问题
     */
    columns.push({
      key: 'blank',
    });

    return <Table
      className={`${!appList.length && 'no-value'} c7n-multi-table`}
      pagination={false}
      filterBar={false}
      loading={AppDeploymentStore.getIsLoading}
      columns={columns}
      dataSource={appList}
      rowKey={record => record.applicationId}
      scroll={{ x: 377 + envNames.length * 230 }}
    />;
  }

  /**
   * 处理返回环境列渲染
   * @param id
   * @param record
   * @returns {any[]}
   */
  renderEc = (id, record) => {
    const { intl } = this.props;
    let dom = [];
    _.map(record.envInstances, (i) => {
      if (id === i.envId) {
        dom = i.envVersions;
      }
    });
    return dom.map(version => (<div className="c7n-deploy-muti-row" key={version.versionId}>
      <div className="c7n-deploy-muti_card">
        <Popover
          placement="bottom"
          title={<FormattedMessage id="ist.head" />}
          content={version.instances.length ? version.instances.map(ist => (
            <div key={ist.instanceId}>
              <div className={`c7n-ist-status c7n-ist-status_${ist.instanceStatus}`}>
                <div>{intl.formatMessage({ id: ist.instanceStatus || 'null' })}</div>
              </div>
              <span>{ist.instanceName}</span>
            </div>
          )) : <FormattedMessage id="ist.noIst" />}
          trigger="hover"
        >
          <Button
            className="c7n-multi-ist"
            funcType="flat"
            shape="circle"
          >
            <div>
              {version.instances.length}
            </div>
          </Button>
        </Popover>
        <MouserOverWrapper text={version.version} width="161px">
          {version.version}
        </MouserOverWrapper>
        {version.latest ? null : <Tooltip title={<FormattedMessage id="dpOverview.update" />}><span className="c7n-ist-status_update" /></Tooltip>}
      </div>
    </div>));
  };

  render() {
    const { name } = AppState.currentMenuType;

    return (
      <Page
        className="c7n-region"
        service={[
          'devops-service.application.listAll',
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.application-instance.deploy',
        ]}
      >
        <Header title={<FormattedMessage id="dpOverview.head" />}>
          <Button
            funcType="flat"
            onClick={this.reload}
          >
            <i className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="dpOverview" value={{ name }} className="page-content">
          <div className="c7n-multi-wrap">
            {this.renderTable()}
          </div>
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(DeployOverview));
