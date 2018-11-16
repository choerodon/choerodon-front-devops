import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Select, Button, Radio, Steps, Icon, Tooltip } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import YAML from 'yamljs';
import '../../../main.scss';
import './DeployApp.scss';
import AceForYaml from '../../../../components/yamlAce';
import SelectApp from '../selectApp';
import EnvOverviewStore from '../../../../stores/project/envOverview';
import DepPipelineEmpty from "../../../../components/DepPipelineEmpty/DepPipelineEmpty";

const RadioGroup = Radio.Group;
const Step = Steps.Step;
const { AppState } = stores;
const Option = Select.Option;

@observer
class DeploymentAppHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_project: !props.match.params.appId && (props.location.search.indexOf('isProject') === -1),
      appId: props.location.search.split('appId=')[1] ? Number(props.location.search.split('appId=')[1].split('&')[0]) : props.match.params.appId,
      versionId: props.location.search.split('verId=')[1] ? Number(props.location.search.split('verId=')[1]) : props.match.params.verId,
      current: props.match.params.appId || (props.location.search.indexOf('isProject') === -1 && props.location.search.split('appId=')[1]) ? 2 : 1,
      envId: props.location.search.split('envId=')[1] ? Number(props.location.search.split('envId=')[1]) : undefined,
      mode: 'new',
      markers: null,
      projectId: AppState.currentMenuType.id,
      loading: false,
      changeYaml: false,
      disabled: false,
    };
  }

  componentDidMount() {
    const { DeploymentAppStore } = this.props;
    const { projectId, current, appId, versionId, envId: id } = this.state;
    DeploymentAppStore.setValue(null);
    if (this.state.appId) {
      DeploymentAppStore.loadApps(this.state.appId)
        .then((data) => {
          this.setState({ app: data });
        });
      const versionId = parseInt(this.state.versionId, 10);
      if (this.state.is_project) {
        DeploymentAppStore.loadVersion(this.state.appId, this.state.projectId, '')
          .then((data) => {
            this.setState({ versionDto: _.filter(data, v => v.id === versionId)[0] });
          });
      } else if (this.props.location.search.split('verId=')[1]) {
        DeploymentAppStore.loadVersion(this.state.appId, this.state.projectId, true)
          .then((data) => {
            this.setState({ versionDto: _.filter(data, v => v.id === versionId)[0] });
          });
        this.setState({ versionId: undefined });
      } else {
        DeploymentAppStore.loadVersion(this.state.appId, this.state.projectId, true)
          .then((data) => {
            this.setState({ versionDto: _.filter(data, v => v.id === versionId)[0] });
          });
      }
    } else {
      DeploymentAppStore.setVersions([]);
    }
    if (current === 2) {
      const envs = EnvOverviewStore.getEnvcard;
      const envID = EnvOverviewStore.getTpEnvId;
      const env = _.filter(envs, { 'connect': true, 'id': envID });
      const envId = env && env.length ? env[0].id : id;
      this.setState({ envId, envDto: env[0] });
      DeploymentAppStore.setValue(null);
      DeploymentAppStore.loadValue(appId, versionId, envId)
        .then((data) => {
          this.setState({ errorLine: data.errorLines });
        });
      DeploymentAppStore.loadInstances(appId, envId);
    }
    EnvOverviewStore.loadActiveEnv(projectId);
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
    const { appId, versionId, envId: id, mode } = this.state;
    const envs = EnvOverviewStore.getEnvcard;
    const envID = EnvOverviewStore.getTpEnvId;
    const env = _.filter(envs, { 'connect': true, 'id': envID });
    const envId = env && env.length ? env[0].id : id;
    this.setState({ current: index, disabled: false });
    this.loadReview();
    if (index === 2 && appId && versionId && envId) {
      this.setState({ envId, envDto: env[0] });
      DeploymentAppStore.setValue(null);
      DeploymentAppStore.loadValue(appId, versionId, envId)
        .then((data) => {
          this.setState({ errorLine: data.errorLines });
        });
      DeploymentAppStore.loadInstances(appId, envId);
    }
    if (index === 3 || index === 4) {
      this.setState({ disabled: true });
    }
    document.getElementsByClassName('page-content')[0].scrollTop = 0;
  };

  /**
   * 展开选择应用的弹框
   */
  showSideBar = () => {
    if (this.props.match.params.appId) {
      this.setState({ show: true });
    } else {
      this.setState({ show: true, versionId: undefined, versionDto: null });
    }
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
        DeploymentAppStore.loadVersion(app.id, this.state.projectId, '');
        this.setState({
          app,
          appId: app.id,
          show: false,
          is_project: true,
          versionId: undefined,
          versionDto: null,
        });
      } else {
        DeploymentAppStore.loadVersion(app.appId, this.state.projectId, true);
        this.setState({
          app,
          appId: app.appId,
          show: false,
          is_project: false,
          versionId: undefined,
          versionDto: null,
        });
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
    const envs = EnvOverviewStore.getEnvcard;
    EnvOverviewStore.setTpEnvId(value);
    const envDto = _.filter(envs, v => v.id === value)[0];
    this.setState({ envId: value, envDto, value: null, yaml: null, changeYaml: false, mode: 'new' });
    const { appId, versionId } = this.state;
    DeploymentAppStore.setValue(null);
    this.setState({ value: null, markers: [] });
    DeploymentAppStore.loadValue(appId, versionId, value)
      .then((data) => {
        this.setState({ errorLine: data.errorLines });
      });
    DeploymentAppStore.loadInstances(this.state.appId, value);
  };

  /**
   * 选择版本
   * @param value
   */
  handleSelectVersion = (value) => {
    const { DeploymentAppStore } = this.props;
    const versions = DeploymentAppStore.versions;
    const versionDto = _.filter(versions, v => v.id === value)[0];
    DeploymentAppStore.setValue(null);
    this.setState({ versionId: value, versionDto, value: null, markers: [] }, () => {
      if (this.state.envId) {
        this.handleSelectEnv(this.state.envId);
      }
    });
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
   */
  handleChangeValue = (value) => {
    const { DeploymentAppStore } = this.props;
    this.setState({ value });
    DeploymentAppStore.checkYaml(value)
      .then((data) => {
        this.setState({ errorLine: data });
        const oldYaml = DeploymentAppStore.getValue ? DeploymentAppStore.getValue.yaml : '';
        const oldvalue = YAML.parse(oldYaml);
        const newvalue = YAML.parse(value);
        if (JSON.stringify(oldvalue) === JSON.stringify(newvalue)) {
          this.setState({
            changeYaml: false,
          });
        } else {
          this.setState({
            changeYaml: true,
          });
        }
      });
  };


  /**
   * 修改实例模式
   * @param value
   */
  handleChangeMode = (value) => {
    this.setState({ mode: value.target.value });
  };

  /**
   * 取消第一步
   */
  clearStepOne = () => {
    const { DeploymentAppStore } = this.props;
    DeploymentAppStore.setVersions([]);
    DeploymentAppStore.setValue(null);
    this.setState({
      current: 1,
      appId: undefined,
      app: null,
      versionId: undefined,
      versionDto: null,
      envId: undefined,
      envDto: null,
      value: null,
      yaml: null,
      markers: [],
      mode: 'new',
      instanceId: undefined,
      changeYaml: false,
    });
  };

  /**
   * 取消第一步
   */
  clearStepOneBack = () => {
    const { DeploymentAppStore, location } = this.props;
    DeploymentAppStore.setVersions([]);
    DeploymentAppStore.setValue(null);
    this.setState({
      current: 1,
      appId: undefined,
      app: null,
      versionId: undefined,
      versionDto: null,
      envId: undefined,
      envDto: null,
      value: null,
      yaml: null,
      markers: [],
      mode: 'new',
      instanceId: undefined,
      changeYaml: false,
    });
    if (location.search.indexOf('envId') !== -1 || location.search.indexOf('appId') !== -1) {
      const { history } = this.props;
      history.go(-1);
    }
  };

  /**
   * 部署应用
   */
  handleDeploy = (isNotChange) => {
    this.setState({
      loading: true,
    });
    const { DeploymentAppStore } = this.props;
    const instances = DeploymentAppStore.currentInstance;
    const value = this.state.value || DeploymentAppStore.value.yaml;
    const applicationDeployDTO = {
      isNotChange,
      appId: this.state.appId,
      appVerisonId: this.state.versionId,
      environmentId: this.state.envId,
      values: value,
      type: this.state.mode === 'new' ? 'create' : 'update',
      appInstanceId: this.state.mode === 'new'
        ? null : this.state.instanceId || (instances && instances.length === 1 && instances[0].id),
    };
    DeploymentAppStore.deploymentApp(applicationDeployDTO)
      .then((datas) => {
        if (datas) {
          this.openAppDeployment();
        }
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        Choerodon.prompt(error.response.data.message);
        this.setState({
          loading: false,
        });
      });
  };


  loadReview = async () => {
    const { value, versionId, projectId } = this.state;
    if (value) {
      const yaml = await axios.post(`/devops/v1/projects/${projectId}/app_instances/previewValue?appVersionId=${versionId}`, { yaml: value })
        .then(data => data);
      this.setState({ yaml });
    }
  };

  /**
   * 渲染第一步
   */
  handleRenderApp = () => {
    const { DeploymentAppStore, intl } = this.props;
    const { formatMessage } = intl;
    const versions = DeploymentAppStore.versions;
    return (
      <div className="deployApp-app">
        <p>
          {formatMessage({ id: 'deploy.step.one.description' })}
        </p>
        <section className="deployApp-section">
          <div className="deploy-title">
            <i className="icon icon-widgets section-title-icon" />
            <span className="section-title">{formatMessage({ id: 'deploy.step.one.app' })}</span>
          </div>
          <div className="deploy-text">
            {this.state.app && <div className="section-text-margin">
              <Tooltip title={<FormattedMessage id={this.state.is_project ? 'project' : 'market'} />}><span className={`icon ${this.state.is_project ? 'icon-project' : 'icon-apps'} section-text-icon`} /></Tooltip>
              <span className="section-text">{this.state.app.name}({this.state.app.code})</span>
            </div>}
            <Permission service={['devops-service.application.pageByOptions', 'devops-service.application-market.listAllApp']}>
              <a
                role="none"
                className={`${this.state.app ? '' : 'section-text-margin'}`}
                onClick={this.showSideBar}
              >
                {formatMessage({ id: 'deploy.app.add' })}
                <i className="icon icon-open_in_new icon-small" />
              </a>
            </Permission>
          </div>
        </section>
        <section className="deployApp-section">
          <div className="deploy-title">
            <i className="icon icon-version section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'deploy.step.one.version.title' })}</span>
          </div>
          <Select
            notFoundContent={formatMessage({ id: 'network.form.version.disable' })}
            value={this.state.versionId ? parseInt(this.state.versionId, 10) : undefined}
            label={<FormattedMessage id="deploy.step.one.version" />}
            className="section-text-margin"
            onSelect={this.handleSelectVersion}
            style={{ width: 482 }}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {versions.map(v => <Option key={v.id} value={v.id}>{v.version}</Option>)}
          </Select>
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            disabled={!(this.state.appId && this.state.versionId)}
            onClick={this.changeStep.bind(this, 2)}
          >
            {formatMessage({ id: 'next' })}
          </Button>
          <Button funcType="raised" className="c7n-deploy-clear" onClick={this.clearStepOneBack}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第二步
   */
  handleRenderEnv = () => {
    const { DeploymentAppStore, intl } = this.props;
    const { formatMessage } = intl;
    const envs = EnvOverviewStore.getEnvcard;
    const envId = EnvOverviewStore.getTpEnvId;
    const env = _.filter(envs, { 'connect': true, 'id': envId });
    const data = this.state.yaml || DeploymentAppStore.value;
    return (
      <div className="deployApp-env">
        <p>
          {formatMessage({ id: 'deploy.step.two.description' })}
        </p>
        <section className="deployApp-section">
          <div className="deploy-title">
            <i className="icon icon-donut_large section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'deploy.step.two.env.title' })}</span>
          </div>
          <Select
            value={env && env.length ? env[0].id : this.state.envId}
            label={<span className="deploy-text">{formatMessage({ id: 'deploy.step.two.env' })}</span>}
            className="section-text-margin"
            onSelect={this.handleSelectEnv}
            style={{ width: 482 }}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children[1]
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {envs.map(v => (<Option value={v.id} key={v.id} disabled={!v.connect || !v.permission}>
              {v.connect ? <span className="c7n-ist-status_on" /> : <span className="c7n-ist-status_off" />}
              {v.name}
            </Option>))}
          </Select>
        </section>
        <section className="deployApp-section">
          <div className="deploy-title">
            <i className="icon icon-description section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'deploy.step.two.config' })}</span>
            <i className="icon icon-error c7n-deploy-ist-operate section-instance-icon" />
            <span className="deploy-tip-text">
              {formatMessage({ id: 'deploy.step.two.description_1' })}
            </span>
          </div>
          {data && (<AceForYaml
            newLines={data.newLines}
            isFileError={!!data.errorLines}
            totalLine={data.totalLine}
            errorLines={this.state.errorLine}
            errMessage={data.errorMsg}
            modifyMarkers={this.state.markers}
            value={this.state.value || data.yaml}
            highlightMarkers={data.highlightMarkers}
            onChange={this.handleChangeValue}
            change
          />)}
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.changeStep.bind(this, 3)}
            disabled={!(this.state.envId && (this.state.value || (data && data.yaml))
              && (this.state.errorLine
                ? this.state.errorLine.length === 0 : (data && data.errorLines === null)))}
          >
            {formatMessage({ id: 'next' })}
          </Button>
          <Button onClick={this.changeStep.bind(this, 1)} funcType="raised">{formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" className="c7n-deploy-clear" onClick={this.clearStepOne}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第三步
   * @returns {*}
   */
  handleRenderMode = () => {
    const { DeploymentAppStore, intl } = this.props;
    const { formatMessage } = intl;
    const instances = DeploymentAppStore.currentInstance;
    return (
      <div className="deployApp-deploy">
        <p>
          {formatMessage({ id: 'deploy.step.three.description' })}
        </p>
        <section className="deployApp-section">
          <div className="deploy-title">
            <i className="icon icon-jsfiddle section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'deploy.step.three.mode.title' })}</span>
          </div>
          <div className="section-text-margin">
            <RadioGroup
              onChange={this.handleChangeMode}
              value={this.state.mode}
              label={<span className="deploy-text">{formatMessage({ id: 'deploy.step.three.mode' })}</span>}
            >
              <Radio className="deploy-radio" value="new">{formatMessage({ id: 'deploy.step.three.mode.new' })}</Radio>
              <Radio className="deploy-radio" value="replace" disabled={instances.length === 0}>{formatMessage({ id: 'deploy.step.three.mode.replace' })}
                <i className="icon icon-error section-instance-icon" />
                <span className="deploy-tip-text">{formatMessage({ id: 'deploy.step.three.mode.help' })}</span>
              </Radio>
            </RadioGroup>
            {this.state.mode === 'replace' && <Select
              onSelect={this.handleSelectInstance}
              value={this.state.instanceId
                || (instances && instances.length === 1 && instances[0].id)}
              label={<FormattedMessage id="deploy.step.three.mode.replace.label" />}
              className="deploy-select"
              placeholder="Select a person"
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children
                .toLowerCase().indexOf(input.toLowerCase()) >= 0}
              filter
            >
              {instances.map(v => (<Option value={v.id} key={v.id}>
                {v.code}
              </Option>))}
            </Select>}
          </div>
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.changeStep.bind(this, 4)}
            disabled={!(this.state.mode === 'new' || (this.state.mode === 'replace' && (this.state.instanceId || (instances && instances.length === 1))))}
          >
            {formatMessage({ id: 'next' })}
          </Button>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 2)}>{formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" className="c7n-deploy-clear" onClick={this.clearStepOne}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第四步预览
   * @returns {*}
   */
  handleRenderReview = () => {
    const { DeploymentAppStore } = this.props;
    const instances = DeploymentAppStore.currentInstance;
    const { intl } = this.props;
    const { formatMessage } = intl;
    const data = this.state.yaml || DeploymentAppStore.value;
    const { app, versionId, envId, versionDto, mode, instanceDto, instanceId } = this.state;
    const instanceID = instanceId || (instances && instances.length === 1 && instances[0].id);
    const instance = instanceDto || _.filter(instances, v => v.id === instanceID)[0];
    const options = {
      theme: 'neat',
      mode: 'yaml',
      readOnly: true,
      lineNumbers: true,
    };
    const isNotChange = (this.state.changeYaml || mode === 'new') ? false : versionDto.version === instance.appVersion;
    return (
      <section className="deployApp-review">
        <section>
          <div>
            <div className="deployApp-title"><Icon type="widgets" /><span className="deployApp-title-text">{formatMessage({ id: 'deploy.step.four.app' })}：</span></div>
            <div className="deployApp-text">{this.state.app && this.state.app.name}
              <span className="deployApp-value">({this.state.app && this.state.app.code})</span>
            </div>
          </div>
          <div>
            <div className="deployApp-title"><Icon type="version" /><span className="deployApp-title-text">{formatMessage({ id: 'deploy.step.four.version' })}：</span></div>
            <div className="deployApp-text">{this.state.versionDto && this.state.versionDto.version}</div>
          </div>
          <div>
            <div className="deployApp-title"><Icon type="donut_large" /><span className="deployApp-title-text">{formatMessage({ id: 'deploy.step.two.env.title' })}：</span></div>
            <div className="deployApp-text">{this.state.envDto && this.state.envDto.name}
              <span className="deployApp-value">({this.state.envDto && this.state.envDto.code})</span>
            </div>
          </div>
          <div>
            <div className="deployApp-title"><Icon type="jsfiddle" /><span className="deployApp-title-text">{formatMessage({ id: 'deploy.step.three.mode' })}：</span></div>
            <div className="deployApp-text">{this.state.mode === 'new' ? formatMessage({ id: 'deploy.step.three.mode.new' }) : formatMessage({ id: 'deploy.step.three.mode.replace' })} {this.state.mode === 'replace'
            && <span className="deployApp-value">({ this.state.instanceId ? this.state.instanceDto.code : (instances && instances.length === 1 && instances[0].code)})</span>}</div>
          </div>
          <div>
            <div className="deployApp-title"><Icon type="description" /><span className="deployApp-title-text">{formatMessage({ id: 'deploy.step.two.config' })}：</span></div>
          </div>
          {data && <div>
            {<AceForYaml
              options={options}
              newLines={data.newLines}
              readOnly={this.state.current === 4}
              value={data.yaml}
              highlightMarkers={data.highlightMarkers}
            />}
          </div>}
        </section>
        <section className="deployApp-section">
          <Permission service={['devops-service.application-instance.deploy']}>
            <Button type="primary" funcType="raised" disabled={!(app && versionId && envId && mode)} onClick={this.handleDeploy.bind(this, isNotChange)} loading={this.state.loading}>{formatMessage({ id: 'deploy.btn.deploy' })}</Button>
          </Permission>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 3)}>{formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" className="c7n-deploy-clear" onClick={this.clearStepOne}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </section>
    );
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
   * 环境选择请求函数
   * @param value
   */
  handleEnvSelect = (value) => {
    EnvOverviewStore.setTpEnvId(value);
  };

  render() {
    const { DeploymentAppStore, intl } = this.props;
    const { formatMessage } = intl;
    const data = DeploymentAppStore.value;
    const projectName = AppState.currentMenuType.name;
    const { appId, versionId, envId, instanceId, mode, value, current, disabled } = this.state;
    const envData = EnvOverviewStore.getEnvcard;
    const { getTpEnvId } = EnvOverviewStore;
    return (
      <Page
        service={[
          'devops-service.application.queryByAppId',
          'devops-service.application-version.queryByAppId',
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.application-instance.queryValues',
          'devops-service.application-instance.formatValue',
          'devops-service.application-instance.listByAppIdAndEnvId',
          'devops-service.application-instance.deploy',
          'devops-service.application.pageByOptions',
          'devops-service.application-market.listAllApp',
          'devops-service.application-instance.previewValues',
        ]}
        className="c7n-region c7n-deployApp"
      >
        {envData && envData.length && getTpEnvId  ? <Fragment><Header title={<FormattedMessage id="deploy.header.title" />}>
          <Select
            className={`${getTpEnvId? 'c7n-header-select' : 'c7n-header-select c7n-select_min100'}`}
            dropdownClassName="c7n-header-env_drop"
            placeholder={formatMessage({ id: 'envoverview.noEnv' })}
            value={envData && envData.length ? getTpEnvId : undefined}
            disabled={ disabled || (envData && envData.length === 0)}
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
        </Header>
        <Content className="c7n-deployApp-wrapper" code="deploy" values={{ name: projectName }}>
          <div className="deployApp-card">
            <Steps current={this.state.current}>
              <Step
                title={<span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'deploy.step.one.title' })}</span>}
                onClick={this.changeStep.bind(this, 1)}
                status={this.getStatus(1)}
              />
              <Step
                className={!(appId && versionId) ? 'step-disabled' : ''}
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'deploy.step.two.title' })}</span>}
                onClick={this.changeStep.bind(this, 2)}
                status={this.getStatus(2)}
              />
              <Step
                className={!(envId && data && data.errorLines === null && (this.state.errorLine === '' || this.state.errorLine === null) && (value || (data && data.yaml))) ? 'step-disabled' : ''}
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'deploy.step.three.title' })}</span>}
                onClick={this.changeStep.bind(this, 3)}
                status={this.getStatus(3)}
              />
              <Step
                className={!((mode === 'new' || (mode === 'replace' && instanceId)) && this.state.envId) ? 'step-disabled' : ''}
                title={<span style={{ color: current === 4 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'deploy.step.four.title' })}</span>}
                onClick={this.changeStep.bind(this, 4)}
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
            isMarket={!this.state.is_project}
            app={this.state.app}
            show={this.state.show}
            handleCancel={this.handleCancel}
            handleOk={this.handleOk}
          />}
        </Content></Fragment> : <DepPipelineEmpty title={<FormattedMessage id="deploy.header.title" />} type="env" />}
      </Page>
    );
  }
}

export default withRouter(injectIntl(DeploymentAppHome));
