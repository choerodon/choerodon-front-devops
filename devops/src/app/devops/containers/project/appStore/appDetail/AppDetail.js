import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Icon, Card, Select } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import MDReactComponent from 'markdown-react-js';
import Permission from 'PerComponent';
import _ from 'lodash';
import LoadingBar from '../../../../components/loadingBar';
import './AppDetail.scss';
import '../../../main.scss';

const Option = Select.Option;

@inject('AppState')
@observer
class AppDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verId: '',
      id: props.match.params.id,
    };
  }

  componentDidMount() {
    const { AppStoreStore } = this.props;
    AppStoreStore.setBackPath(false);
    this.loadAppData();
  }

  /**
   * 刷新函数
   */
  reload = () => {
    this.loadAppData();
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
   * 选择版本
   * @param verId
   */
  handleChange = (verId) => {
    this.setState({
      verId,
    });
    this.loadReadmes(verId);
  };

  /**
   * 条件部署应用
   * @param id 应用市场ID
   * @param appId 应用ID
   */
  deployApp = (id, appId) => {
    const { AppState, AppStoreStore } = this.props;
    const app = AppStoreStore.getApp;
    AppStoreStore.setBackPath(true);
    const { verId } = this.state;
    const verID = verId || app.appVersions[0].id;
    const projectId = AppState.currentMenuType.id;
    const projectName = AppState.currentMenuType.name;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/deployment-app?storeId=${id}&verId=${verID}&appId=${appId}&type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`);
  };

  /**
   * 加载单应用数据
   */
  loadAppData = () => {
    const { AppStoreStore, AppState } = this.props;
    const { id, verId } = this.state;
    const projectId = AppState.currentMenuType.id;
    AppStoreStore.loadAppStore(projectId, id).then((app) => {
      this.loadReadmes(verId || app.appVersions[0].id);
    });
  };

  /**
   * 加载对应版本readme
   * @param verId
   */
  loadReadmes = (verId) => {
    const { AppStoreStore, AppState } = this.props;
    const { id } = this.state;
    const projectId = AppState.currentMenuType.id;
    AppStoreStore.loadReadme(projectId, id, verId);
  };

  render() {
    const { AppStoreStore, AppState } = this.props;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    const app = AppStoreStore.getApp;
    const readme = AppStoreStore.getReadme || '## 暂无';

    const appVersion = app.appVersions ?
      _.map(app.appVersions, d => <Option key={d.id}>{d.version}</Option>) : [];
    const imgDom = app.imgUrl ? <div className="c7n-store-img" style={{ backgroundImage: `url(${app.imgUrl}` }} /> : <div className="c7n-store-img" />;
    return (
      <div className="c7n-region page-container">
        <PageHeader title={app.name} backPath={`/devops/appstore?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`}>
          <Button
            funcType="flat"
            className="leftBtn"
            onClick={this.reload}
          >
            <span className="icon-refresh page-head-icon" />
            <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
          </Button>
        </PageHeader>
        {AppStoreStore.isLoading ? <LoadingBar display /> :
          (<div className="c7n-store-app-content">
            <div className="c7n-store-detail-head">
              <div className="c7n-store-detail-left">
                <div className="c7n-store-img-wrap">
                  {imgDom}
                </div>
              </div>
              <div className="c7n-store-detail-right">
                <div className="c7n-store-name">{app.name}</div>
                <div className="c7n-store-contributor">贡献者：{app.contributor}</div>
                <div className="c7n-store-des">{app.description}</div>
                <div>
                  <span className="c7n-store-circle">V</span>
                  <Select
                    size="large"
                    defaultValue={app.appVersions ? app.appVersions[0].version : ''}
                    className="c7n-store-select"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    onChange={this.handleChange}
                    filter
                    showSearch
                  >
                    {appVersion}
                  </Select>
                  <Permission
                    service={['devops-service.application-instance.deploy']}
                    organizationId={organizationId}
                    projectId={projectId}
                    type={type}
                  >
                    <Button
                      className="c7n-store-deploy"
                      type="primary"
                      funcType="raised"
                      onClick={this.deployApp.bind(this, app.id, app.appId)}
                    >
                      部署
                    </Button>
                  </Permission>
                </div>
              </div>
            </div>
            <div className="c7n-store-detail">
              <div className="c7n-store-detail-left">
                <div className="c7n-store-key">分类</div>
                <div className="c7n-store-type">{app.category}</div>
                <div className="c7n-store-key">上次更新日期</div>
                <div className="c7n-store-time">{app.appVersions ? app.appVersions[0].creationDate : 'xx-xx-xx'}</div>
              </div>
              <div className="c7n-store-detail-right">
                <div className="c7n-store-detail-overview">
                  <h1>Readme</h1>
                  <div>
                    <MDReactComponent text={readme} />
                  </div>
                </div>
                <h1>教程和文档</h1>
                <a href="http://choerodon.io/zh/docs/user-guide/deploy/application-deployment/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                  <span className="c7n-external-link-content">
                    了解详情
                  </span>
                  <span className="icon-open_in_new" />
                </a>
              </div>
            </div>
          </div>)}
      </div>
    );
  }
}

export default withRouter(AppDetail);
