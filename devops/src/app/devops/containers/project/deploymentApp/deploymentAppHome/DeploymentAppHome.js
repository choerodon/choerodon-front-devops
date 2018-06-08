import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Select, Button, Radio, Steps } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import '../../../main.scss';
import './DeployApp.scss';
import AceForYaml from '../../../../components/yamlAce';
import SelectApp from '../selectApp';


const RadioGroup = Radio.Group;
const Step = Steps.Step;
const { AppState } = stores;

@observer
class DeploymentAppHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: props.match.params.appId || undefined,
      versionId: props.match.params.verId || undefined,
      current: props.match.params.appId ? 2 : 1,
      envId: undefined,
      storeId: props.match.params.storeId,
      mode: 'new',
      markers: null,
    };
  }

  componentDidMount() {
    const { DeploymentAppStore } = this.props;
    DeploymentAppStore.setValue(null);
    if (this.state.appId) {
      DeploymentAppStore.loadApps(this.state.appId)
        .then((data) => {
          this.setState({ app: data });
        });
      DeploymentAppStore.loadVersion(this.state.appId);
    }
    DeploymentAppStore.loadEnv();
    const card = document.getElementsByClassName('deployApp-card')[0];
    card.style.minHeight = `${window.innerHeight - 277}px`;
  }

  /**
   * 获取步骤条状态
   * @param index
   * @returns {string}
   */
  getStatus = (index) => {
    const { current } = this.state;
    let status = 'process';
    if (index === current) {
      status = 'process';
    } else if (index > current) {
      status = 'wait';
    } else {
      status = 'finish';
    }
    return status;
  };

  /**
   * 改变步骤条
   * @param index
   */
  changeStep = (index) => {
    const { DeploymentAppStore } = this.props;
    const { appId, versionId, envId, mode } = this.state;
    this.setState({ current: index });
    if (index === 2 && appId && versionId && envId) {
      DeploymentAppStore.setValue(null);
      DeploymentAppStore.loadValue(appId, versionId, envId);
    }
  };

  /**
   * 展开选择应用的弹框
   */
  showSideBar = () => {
    this.setState({ show: true, versionId: undefined, versionDto: null });
  };

  /**
   * 关闭弹框
   */
  handleCancel = () => {
    this.setState({ show: false });
  };

  /**
   * 弹框确定
   * @param app 选择的数据
   * @param key 标明是项目应用还是应用市场应用
   */
  handleOk = (app, key) => {
    const { DeploymentAppStore } = this.props;
    if (app) {
      if (key === '1') {
        DeploymentAppStore.loadVersion(app.id);
        this.setState({ app, appId: app.id, show: false });
      } else {
        DeploymentAppStore.loadVersion(app.appId);
        this.setState({ app, appId: app.appId, show: false });
      }
    } else {
      this.setState({ show: false });
    }
  };

  /**
   * 选择环境
   * @param value
   */
  handleSelectEnv = (value) => {
    const { DeploymentAppStore } = this.props;
    const envs = DeploymentAppStore.envs;
    const envDto = _.filter(envs, v => v.id === value)[0];
    this.setState({ envId: value, envDto, value: null });
    const { appId, versionId } = this.state;
    DeploymentAppStore.setValue(null);
    DeploymentAppStore.loadValue(appId, versionId, value);
    DeploymentAppStore.loadInstances(this.state.appId, value);
  };

  /**
   * 选择版本
   * @param value
   */
  handleSelectVersion = (value) => {
    const { DeploymentAppStore } = this.props;
    this.setState({ versionId: value });
    const versions = DeploymentAppStore.versions;
    const versionDto = _.filter(versions, v => v.id === value)[0];
    this.setState({ versionDto });
  };

  /**
   * 选择实例
   * @param value
   */
  handleSelectInstance = (value) => {
    const { DeploymentAppStore } = this.props;
    const instance = DeploymentAppStore.currentInstance;
    const instanceDto = _.filter(instance, v => v.id === value)[0];
    this.setState({ instanceId: value, instanceDto });
  };

  /**
   * 获取values
   * @param value
   * @param markers
   */
  handleChangeValue = (value, markers) => {
    this.setState({ value, markers });
  };

  /**
   * 修改实例模式
   * @param value
   */
  handleChangeMode = (value) => {
    this.setState({ mode: value.target.value });
  };

  /**
   * 返回到上一级
   */
  openAppDeployment() {
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const type = AppState.currentMenuType.type;
    this.props.history.push(
      `/devops/instance?type=${type}&id=${projectId}&name=${projectName}&organizationId=${AppState.currentMenuType.organizationId}`,
    );
  }

  /**
   * 取消第一步
   */
  clearStepOne = () => {
    const { DeploymentAppStore } = this.props;
    DeploymentAppStore.setVersions([]);
    this.setState({
      appId: undefined,
      app: null,
      versionId: undefined,
      versionDto: null,
    });
  };

  /**
   * 部署应用
   */
  handleDeploy = () => {
    const { DeploymentAppStore } = this.props;
    const value = this.state.value || DeploymentAppStore.value.yaml;
    const applicationDeployDTO = {
      appId: this.state.appId,
      appVerisonId: this.state.versionId,
      environmentId: this.state.envId,
      values: value,
      type: this.state.mode === 'new' ? 'create' : 'update',
      appInstanceId: this.state.mode === 'new' ?
        null : this.state.instanceId,
    };
    DeploymentAppStore.deploymentApp(applicationDeployDTO)
      .then((datas) => {
        if (datas) {
          this.openAppDeployment();
        }
      })
      .catch((error) => {
        Choerodon.prompt(error.response.data.message);
      });
  };
  /**
   * 渲染第一步
   */
  handleRenderApp = () => {
    const { DeploymentAppStore } = this.props;
    const versions = DeploymentAppStore.versions;
    return (
      <div className="deployApp-app">
        <p>
          您可以点击“打开应用列表”，选择本项目的应用或来自应用市场的应用，再在此界面选择需要部署的版本。
        </p>
        <section className="deployApp-section">
          <div className="deploy-title">
            <span className="icon icon-widgets section-title-icon" />
            <span className="section-title">选择应用</span>
          </div>
          <div className="deploy-text">
            {this.state.app && <div className="section-text-margin">
              {this.state.app.publishLevel ? <span className="icon icon-apps section-text-icon" /> : <span className="icon icon-project section-text-icon" />}
              <span className="section-text">{this.state.app.name}({this.state.app.code})</span>
            </div>}
            <Permission service={['devops-service.application.pageByOptions', 'devops-service.application-market.listAllApp']}>
              <a
                role="none"
                className={`${this.state.app ? '' : 'section-text-margin'}`}
                onClick={this.showSideBar}
              >
                打开应用列表
                <span className="icon icon-open_in_new" />
              </a>
            </Permission>
          </div>
        </section>
        <section className="deployApp-section">
          <div className="deploy-title">
            <span className="icon icon-version section-title-icon " />
            <span className="section-title">选择版本</span>
          </div>
          <Select
            notFoundContent={'该应用下还未生成版本'}
            value={this.state.versionId ? parseInt(this.state.versionId, 10) : undefined}
            label="应用版本"
            className="section-text-margin"
            onSelect={this.handleSelectVersion}
            style={{ width: 482 }}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {versions.map(v => <option value={v.id}>{v.version}</option>)}
          </Select>
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            disabled={!(this.state.appId && this.state.versionId)}
            onClick={this.changeStep.bind(this, 2)}
          >
            下一步
          </Button>
          <Button funcType="raised" onClick={this.clearStepOne}>取消</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第二步
   */
  handleRenderEnv = () => {
    const { DeploymentAppStore } = this.props;
    const envs = DeploymentAppStore.envs;
    const data = DeploymentAppStore.value;
    return (
      <div className="deployApp-env">
        <p>
          请在此选择需要部署的环境并修改相关配置信息，平台默认会引用该应用上次在该环境部署的信息。
        </p>
        <section className="deployApp-section">
          <div className="deploy-title">
            <span className="icon icon-donut_large section-title-icon " />
            <span className="section-title">选择环境</span>
          </div>
          <Select
            value={this.state.envId}
            label={<span className="deploy-text">环境</span>}
            className="section-text-margin"
            onSelect={this.handleSelectEnv}
            style={{ width: 482 }}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children[1]
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {envs.map(v => (<option value={v.id} disabled={!v.connect}>
              {v.connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
              {v.name}
            </option>))}
          </Select>
        </section>
        <section className="deployApp-section">
          <div className="deploy-title">
            <span className="icon icon-description section-title-icon " />
            <span className="section-title">配置信息</span>
          </div>
          {data && (<AceForYaml
            totalLine={data.totalLine}
            modifyMarkers={this.state.markers}
            value={this.state.value || data.yaml}
            highlightMarkers={data.highlightMarkers}
            onChange={this.handleChangeValue}
          />)}
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.changeStep.bind(this, 3)}
            disabled={!(this.state.envId && (this.state.value || (data && data.yaml)))}
          >
            下一步
          </Button>
          <Button onClick={this.changeStep.bind(this, 1)} funcType="raised">上一步</Button>
        </section>
      </div>
    );
  };
  /**
   * 渲染第三步
   * @returns {*}
   */
  handleRenderMode = () => {
    const { DeploymentAppStore } = this.props;
    const instances = DeploymentAppStore.currentInstance;
    return (
      <div className="deployApp-deploy">
        <p>
          平台支持两种部署模式：新建实例和替换实例。新建实例是部署生成新的实例；替换实例是等待新部署生成的副本集通过健康检查后再删除原副本集，但实例不变，只替换其相关参数。
        </p>
        <section className="deployApp-section">
          <div className="deploy-title">
            <span className="icon icon-jsfiddle section-title-icon " />
            <span className="section-title">选择部署模式</span>
          </div>
          <div className="section-text-margin">
            <RadioGroup
              onChange={this.handleChangeMode}
              value={this.state.mode}
              label={<span className="deploy-text">部署模式</span>}
            >
              <Radio className="deploy-radio" value={'new'}>新建实例</Radio>
              <Radio className="deploy-radio" value={'replace'} disabled={instances.length === 0}>替换实例
                <span className="icon icon-error section-instance-icon" />
                <span className="deploy-tip-text">替换实例会更新该实例的镜像及配置信息，请确认要替换的实例选择无误。</span>
              </Radio>
            </RadioGroup>
            {this.state.mode === 'replace' && <Select
              onSelect={this.handleSelectInstance}
              value={this.state.instanceId}
              label="选择要替换的实例"
              className="deploy-select"
              placeholder="Select a person"
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children
                .toLowerCase().indexOf(input.toLowerCase()) >= 0}
              filter
            >
              {instances.map(v => (<option value={v.id}>
                {v.code}
              </option>))}
            </Select>}
          </div>
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.changeStep.bind(this, 4)}
            disabled={!(this.state.mode === 'new' || (this.state.mode === 'replace' && this.state.instanceId))}
          >
            下一步
          </Button>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 2)}>上一步</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第四步
   * @returns {*}
   */
  handleRenderReview = () => {
    const { DeploymentAppStore } = this.props;
    const data = DeploymentAppStore.value;
    const { app, versionId, envId, instanceId, mode } = this.state;
    return (
      <section className="deployApp-review">
        <section>
          <div>
            <div className="deployApp-title"><span className="icon icon-widgets" />应用名称：</div>
            <div className="deployApp-text">{this.state.app && this.state.app.name}
              <span className="deployApp-value">({this.state.app && this.state.app.code})</span>
            </div>
          </div>
          <div>
            <div className="deployApp-title"><span className="icon icon-version" />应用版本：</div>
            <div className="deployApp-text">{this.state.versionDto && this.state.versionDto.version}</div>
          </div>
          <div>
            <div className="deployApp-title"><span className="icon icon-donut_large" />选择环境：</div>
            <div className="deployApp-text">{this.state.envDto && this.state.envDto.name}
              <span className="deployApp-value">({this.state.envDto && this.state.envDto.code})</span>
            </div>
          </div>
          <div>
            <div className="deployApp-title"><span className="icon icon-jsfiddle" />部署模式：</div>
            <div className="deployApp-text">{this.state.mode === 'new' ? '新建实例' : '替换实例'} {this.state.mode === 'replace' &&
            <span className="deployApp-value">({this.state.instanceDto.code})</span>}</div>
          </div>
          <div>
            <div className="deployApp-title"><span className="icon icon-description" />配置信息：</div>
          </div>
          {data && <div>
            {<AceForYaml
              totalLine={data.totalLine + 1}
              modifyMarkers={this.state.markers}
              readOnly={this.state.current === 4}
              value={this.state.value || data.yaml}
              highlightMarkers={data.highlightMarkers}
            />}
          </div>}
        </section>
        <section className="deployApp-section">
          <Permission service={['devops-service.application-instance.deploy']}>
            <Button type="primary" funcType="raised" disabled={!(app && versionId && envId && mode)} onClick={this.handleDeploy}>部署</Button>
          </Permission>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 3)}>上一步</Button>
        </section>
      </section>
    );
  };

  render() {
    const { DeploymentAppStore } = this.props;
    const data = DeploymentAppStore.value;
    const projectName = AppState.currentMenuType.name;
    const { appId, versionId, envId, instanceId, mode, value, current } = this.state;
    return (
      <Page className="c7n-region c7n-deployApp">
        <Header title={Choerodon.languageChange('deploymentApp.title')} />
        <Content className="c7n-deployApp-wrapper">
          <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的部署应用</h2>
          <p>
            应用部署是一个将某版本的应用部署至某环境的操作。您可以在此按指引分步骤完成应用部署。
            <a
              href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/application-deployment/"
              className="c7n-external-link"
              rel="nofollow me noopener noreferrer"
              target="_blank"
            >
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          <div className="deployApp-card">
            <Steps current={this.state.current}>
              <Step
                title={<span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>选择应用及版本</span>}
                onClick={this.changeStep.bind(this, 1)}
                status={this.getStatus(1)}
              />
              <Step
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>选择环境及修改配置信息</span>}
                onClick={(appId && versionId) ? this.changeStep.bind(this, 2) : ''}
                status={this.getStatus(2)}
              />
              <Step
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>选择部署模式</span>}
                onClick={(envId && (value || (data && data.yaml))) ? this.changeStep.bind(this, 3) : ''}
                status={this.getStatus(3)}
              />
              <Step
                title={<span style={{ color: current === 4 ? '#3F51B5' : '', fontSize: 14 }}>确认信息及部署</span>}
                onClick={((mode === 'new' || (mode === 'replace' && instanceId)) && this.state.envId) ? this.changeStep.bind(this, 4) : ''}
                status={this.getStatus(4)}
              />
            </Steps>
            <div className="deployApp-card-content">
              {this.state.current === 1 && this.handleRenderApp()}

              {this.state.current === 2 && this.handleRenderEnv()}

              {this.state.current === 3 && this.handleRenderMode()}

              {this.state.current === 4 && this.handleRenderReview()}
            </div>
          </div>
          {this.state.show && <SelectApp
            app={this.state.app}
            show={this.state.show}
            handleCancel={this.handleCancel}
            handleOk={this.handleOk}
          />}
        </Content>
      </Page>
    );
  }
}

export default withRouter(DeploymentAppHome);
