import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Select, Button, Spin, Radio } from 'choerodon-ui';
import ReactLoading from 'react-loading';
import axios from 'Axios';
import _ from 'lodash';
import CodeMirror from 'react-codemirror';
import PageHeader from 'PageHeader';
import yaml from 'js-yaml';
import '../../../main.scss';
import './DeploymentAppHome.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import DeploymentAppStore from '../../../../stores/project/deploymentApp';
import AceForYaml from '../../../../components/yamlAce';
import AppStoreStore from '../../../../stores/project/appStore';

const beautify = require('json-beautify');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');

const RadioGroup = Radio.Group;
const Option = Select.Option;
@inject('AppState')
@observer
class DeploymentAppHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: undefined,
      verId: undefined,
      envId: undefined,
      storeId: props.match.params.storeId,
    };
  }

  componentDidMount() {
    // 初始化页面，获取应用信息
    this.getInit();
    // DeploymentAppStore.loadInitData(this.state.appId, this.state.verId, this.state.envId);
  }

  /**
   * 渲染第一块，应用选择界面
   */
  get selectApp() {
    return (
      <div className="c7n-section">
        <div className="c7n-header-section">
          {
            DeploymentAppStore.getCurrentStage > 1 ? (
              <div className="c7n-circle-ok">
                <i className="icon-check" />
              </div>) : <div className="c7n-circle">1</div>
          }
          <p className="c7n-title-section">选择应用</p>
        </div>
        {
          DeploymentAppStore.apps.length > 0 && (
            <div className={`c7n-body-section ${DeploymentAppStore.getCurrentStage > 1 ? 'c7n-border-done' : 'c7n-border-doing'}`}>
              {
                DeploymentAppStore.apps.map(app => (
                  <span
                    className={`c7n-block ${app.id === this.state.appId || app.id === DeploymentAppStore.currentApp.id ? 'c7n-block-active' : ''}`}
                    role="none"
                    onClick={() => this.handleChangeApp(app)}
                  >
                    {
                      (app.id === DeploymentAppStore.currentApp.id
                        || app.id === this.state.appId) && (
                        <span className="c7n-icon-active">
                          <i className="icon-finished" />
                        </span>
                      )
                    }
                    <p className={`c7n-name-block ${app.id === this.state.appId || app.id === DeploymentAppStore.currentApp.id ? 'c7n-p-active' : ''}`}><MouserOverWrapper text={app.name || ''} width={120}>{app.name}</MouserOverWrapper></p>
                    <p className={`c7n-des-block ${app.id === this.state.appId || app.id === DeploymentAppStore.currentApp.id ? 'c7n-p-active' : ''}`}><MouserOverWrapper text={app.code || ''} width={120}>{app.code}</MouserOverWrapper></p>
                  </span>
                ))
              }
            </div>
          )
        }
      </div>
    );
  }

  /**
   * 渲染第二块，版本选择
   */
  get selectVersion() {
    return (
      <div className="c7n-section">
        <div className="c7n-header-section">
          {
            this.circleTemplate(
              DeploymentAppStore.loadingArr[1],
              DeploymentAppStore.getCurrentStage,
              2)
          }
          <p className="c7n-title-section">选择版本</p>
        </div>
        <div className={`c7n-body-section ${DeploymentAppStore.getCurrentStage > 2 ? 'c7n-border-done' : 'c7n-border-doing'}`}>
          {
            !DeploymentAppStore.loadingArr[1] && (
              <div>
                <Select
                  value={this.state.verId || DeploymentAppStore.currentVersion.id}
                  className="c7n-select-version"
                  label="应用版本 *"
                  onChange={this.handleChangeVersion}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  filter
                >
                  {
                    DeploymentAppStore.versions.map(version => (
                      <Option key={version.id} value={version.id}>{version.version}</Option>
                    ))
                  }
                </Select>
                {/* <div className="inline mt14">
                  <span className="c7n-p-versionButton mr32">
                    <i className="icon-find_in_page" />
                    查看提交列表
                  </span>
                   <span className="c7n-p-versionButton">
                    <i className="icon-get_app" />
                    下载chart
                  </span>
                </div> */}
              </div>
            )
          }
        </div>
      </div>
    );
  }

  /**
   * 渲染第三块，环境选择
   */
  get selectEnv() {
    return (
      <div className="c7n-section">
        <div className="c7n-header-section">
          {
            this.circleTemplate(
              DeploymentAppStore.loadingArr[2],
              DeploymentAppStore.getCurrentStage,
              3)
          }
          <p className="c7n-title-section">选择环境</p>
        </div>
        <div className={`c7n-body-section ${DeploymentAppStore.getCurrentStage > 3 ? 'c7n-border-done' : 'c7n-border-doing'}`}>
          {
            !DeploymentAppStore.loadingArr[2] && (
              <Select
                value={this.state.envId || DeploymentAppStore.currentEnv.id}
                className="c7n-select-version"
                label="环境 *"
                onChange={this.handleChangeEnv}
              >
                {
                  DeploymentAppStore.envs.map(env => (
                    <Option key={env.id} value={env.id}>
                      {env.connect ? null : <span className="icon-portable_wifi_off c7n-ist-status_off" />}
                      {env.name}
                    </Option>
                  ))
                }
              </Select>
            )
          }
        </div>
      </div>
    );
  }

  /**
   * 渲染第四块，参数配置
   */
  get changeValue() {
    const options = {
      lineNumbers: true,
      mode: {
        name: 'javascript',
        json: true,
      },
    };
    const data = DeploymentAppStore.value;
    return (
      <div className="c7n-section">
        <div className="c7n-header-section">
          {
            this.circleTemplate(
              DeploymentAppStore.loadingArr[3],
              DeploymentAppStore.getCurrentStage,
              4)
          }
          <p className="c7n-title-section">配置信息</p>
        </div>
        <div className={`c7n-body-section ${DeploymentAppStore.getCurrentStage > 4 ? 'c7n-border-done' : 'c7n-border-doing'}`}>
          {
            !DeploymentAppStore.loadingArr[3] && data && (
              <div className="">
                <AceForYaml
                  value={data.yaml}
                  highlightMarkers={data.highlightMarkers}
                  onChange={this.handleChangeValue}
                />
              </div>
            )
          }
        </div>
      </div>
    );
  }

  /**
   * 渲染第五块，部署模式选择
   */
  get selectMode() {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '20px',
      color: '#000',
    };
    return (
      <div className="c7n-section">
        <div className="c7n-header-section">
          {
            this.circleTemplate(
              DeploymentAppStore.loadingArr[4],
              DeploymentAppStore.getCurrentStage,
              5)
          }
          <p className="c7n-title-section">部署模式</p>
        </div>
        <div className={`c7n-body-section ${DeploymentAppStore.getCurrentStage > 5 ? 'c7n-border-done' : 'c7n-border-doing'}`}>
          {
            !DeploymentAppStore.loadingArr[4] && (
              <section>
                <RadioGroup onChange={this.handleChangeMode} value={DeploymentAppStore.currentMode}>
                  <Radio style={radioStyle} value={'new'}>新建实例</Radio>
                  <Radio style={radioStyle} value={'replace'}>替换实例</Radio>
                </RadioGroup>
                {
                  DeploymentAppStore.currentMode === 'replace' && (
                    <div>
                      <Select
                        value={DeploymentAppStore.currentInstance.id}
                        className="c7n-select-version"
                        label="选择要替换的实例 *"
                        onChange={this.handleChangeInstance}
                      >
                        {
                          DeploymentAppStore.instances.map(instance => (
                            <Option key={instance.id} value={instance.id}>
                              {instance.code}
                            </Option>
                          ))
                        }
                      </Select>
                    </div>
                  )
                }
              </section>
            )
          }
        </div>
      </div>
    );
  }

  /**
   * 渲染第六块完成和部署按钮
   */
  get getOk() {
    return (
      <div className="c7n-section">
        <div className="c7n-header-section">
          <div className="c7n-circle-ok">
            <i className="icon-check" />
          </div>
          <p className="c7n-title-section">完成</p>
        </div>
        <div className="mt50">
          <Button type="primary" funcType="raised" onClick={this.handleDeploy}>部署</Button>
        </div>
      </div>
    );
  }

  getInit() {
    this.resetStore();
    const Request = this.GetRequest(this.props.location.search);
    // window.console.log(Request);
    if (JSON.stringify(Request) !== '{}') {
      this.setState({
        appId: Request.appId === 'null' || !Request.appId ? undefined : Request.appId * 1,
        verId: Request.verId === 'null' || !Request.verId ? undefined : Request.verId * 1,
        envId: Request.envId === 'null' || !Request.envId ? undefined : Request.envId * 1,
        storeId: Request.storeId === 'null' || !Request.storeId ? undefined : Request.storeId * 1,
      }, () => {
        DeploymentAppStore.loadInitData(this.state.appId, this.state.verId, this.state.envId);
      });
    } else {
      DeploymentAppStore.loadInitData();
    }
  }

  GetRequest(url) {
    const theRequest = {};
    if (url.indexOf('?') !== -1) {
      const str = url.split('?')[1];
      const strs = str.split('&');
      for (let i = 0; i < strs.length; i += 1) {
        theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
      }
    }
    return theRequest;
  }

  resetStore() {
    DeploymentAppStore.setCurrentApp({});
    DeploymentAppStore.setCurrentVersion({});
    DeploymentAppStore.setCurrentEnv({});
  }

  /**
   * 渲染标题前圆圈组件，分为loading（转圈），数字（表示正在进行的块），finish（以完成）
   * @param {*} loading bool，表示是否正在请求数据
   * @param {*} current 当前最新的值
   * @param {*} finish 确定的某个值，表示调用该方法时的序号
   */
  circleTemplate(loading, current, finish) {
    if (loading) {
      return (<ReactLoading
        type={'spin'}
        color="#3f51b5"
        height={30}
        width={30}
        delay={0}
        className="mr28"
      />);
    } else if (current > finish) {
      return (<div className="c7n-circle-ok">
        <i className="icon-check" />
      </div>);
    } else {
      return <div className="c7n-circle">{finish}</div>;
    }
  }

  /**
   * 事件处理，选择一个app后，获取版本信息
   */
    // handleChangeAppOld = (app) => {
    //   const { appId, verId, envId } = this.state;
    //   if (!appId) {
    //     DeploymentAppStore.setCurrentEnv({});
    //     DeploymentAppStore.setCurrentVersion({});
    //     DeploymentAppStore.setValue('');
    //     DeploymentAppStore.setCurrentMode('new');
    //     if (DeploymentAppStore.currentApp.id === app.id) {
    //       DeploymentAppStore.setCurrentApp({});
    //       DeploymentAppStore.setShowArr([true, false, false, false, false, false]);
    //     } else {
    //       DeploymentAppStore.setCurrentApp(app);
    //       DeploymentAppStore.setLoadingArr([false, true, false, false, false, false]);
    //       DeploymentAppStore.setShowArr([true, true, false, false, false, false]);
    //       DeploymentAppStore.loadVersion(DeploymentAppStore.currentApp.id).then((res) => {
    //         DeploymentAppStore.setVersions(res);
    //         DeploymentAppStore.setLoadingArr([false, false, false, false, false, false]);
    //       });
    //     }
    //   } else if (appId && verId && envId) {
    //     if (app.id === appId) {
    //       this.setState({
    //         appId: undefined,
    //         verId: undefined,
    //       });
    //       DeploymentAppStore.setShowArr(Array.from({ length: 5 }, () => false));
    //     } else {
    //       this.setState({
    //         appId: undefined,
    //         verId: undefined,
    //       });
    //       DeploymentAppStore.setCurrentApp(app);
    //       DeploymentAppStore.setLoadingArr([false, true, false, false, false]);
    //       DeploymentAppStore.setShowArr([false, true, false, false, false, false]);
    //       DeploymentAppStore.loadVersion(DeploymentAppStore.currentApp.id).then((res) => {
    //         DeploymentAppStore.setVersions(res);
    //         DeploymentAppStore.setLoadingArr([false, false, false, false, false]);
    //       });
    //     }
    //   } else if (appId && envId && !verId) {
    //     if (app.id === appId) {
    //       this.setState({
    //         appId: undefined,
    //       });
    //       DeploymentAppStore.setShowArr(Array.from({ length: 5 }, () => false));
    //     } else {
    //       this.setState({
    //         appId: undefined,
    //       });
    //       DeploymentAppStore.setCurrentApp(app);
    //       DeploymentAppStore.setLoadingArr([false, true, false, false, false]);
    //       DeploymentAppStore.setShowArr([false, true, false, false, false]);
    //       DeploymentAppStore.loadVersion(DeploymentAppStore.currentApp.id).then((res) => {
    //         DeploymentAppStore.setVersions(res);
    //         DeploymentAppStore.setLoadingArr([false, false, false, false, false]);
    //       });
    //     }
    //   }
    // }

  handleChangeApp = (app) => {
    const { appId, verId, envId } = this.state;
    this.setState({
      appId: undefined,
      verId: undefined,
    });
    DeploymentAppStore.setCurrentVersion({});
    DeploymentAppStore.setCurrentEnv({});
    DeploymentAppStore.setValue([]);
    DeploymentAppStore.setCurrentMode('new');
    if (app.id === appId || app.id === DeploymentAppStore.currentApp.id) {
      // 执行取消选中操作
      DeploymentAppStore.setCurrentApp({});
      DeploymentAppStore.setShowArr([true, false, false, false, false, false]);
    } else {
      // 执行选中操作
      DeploymentAppStore.setCurrentApp(app);
      DeploymentAppStore.setShowArr([true, true, false, false, false, false]);
      DeploymentAppStore.setLoadingArr([false, true, false, false, false, false]);
      DeploymentAppStore.loadVersion(DeploymentAppStore.currentApp.id)
        .then((res) => {
          if (res) {
            DeploymentAppStore.setVersions(res);
            DeploymentAppStore.setLoadingArr([false, false, false, false, false, false]);
          }
        })
        .catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
    }
  };

  /**
   * 事件处理，选择一个版本后，获取环境信息
   */
    // handleChangeVersionOld = (versionId) => {
    //   // this.setState({
    //   //   verId: undefined,
    //   // });
    //   const { appId, verId, envId } = this.state;
    //   if (!verId && !envId) {
    //     DeploymentAppStore.setCurrentEnv({});
    //     DeploymentAppStore.setValue('');
    //     DeploymentAppStore.setCurrentMode('new');
    //     const currentVersion = DeploymentAppStore.versions.
    //       find(version => version.id === versionId);
    //     DeploymentAppStore.setCurrentVersion(currentVersion);
    //     DeploymentAppStore.setShowArr([false, true, true, false, false]);
    //     DeploymentAppStore.setLoadingArr([false, false, true, false, false]);
    //     DeploymentAppStore.loadEnv().then((res) => {
    //       DeploymentAppStore.setEnvs(res);
    //       DeploymentAppStore.setLoadingArr([false, false, false, false, false]);
    //     });
    //   } else if (verId && envId) {
    //     this.setState({
    //       verId: undefined,
    //     });
    //     const currentVersion = DeploymentAppStore.versions
    //       .find(version => version.id === versionId);
    //     DeploymentAppStore.setCurrentVersion(currentVersion);
    //   } else if (envId && !verId) {
    //     const currentVersion = DeploymentAppStore.versions
    //       .find(version => version.id === versionId);
    //     DeploymentAppStore.setCurrentVersion(currentVersion);
    //     DeploymentAppStore.setShowArr([false, true, true, true, false]);
    //     DeploymentAppStore.setLoadingArr([false, false, true, true, false]);
    //     axios
    //       .all([
    //         DeploymentAppStore.loadEnv(),
    //         DeploymentAppStore.loadValue(
    //           this.state.appId || DeploymentAppStore.currentApp.id,
    //           this.state.envId || DeploymentAppStore.currentEnv.id,
    //         ),
    //       ])
    //       .then(
    //         axios.spread((envs, value) => {
    //           DeploymentAppStore.setEnvs(envs);
    //           DeploymentAppStore.setValue(beautify(value, null, 2, 100));
    //           DeploymentAppStore.setShowArr([true, true, true, true, true, true]);
    //           DeploymentAppStore.setLoadingArr([false, false, false, false, false]);
    //         }),
    //       );
    //   }
    // }

  handleChangeVersion = (versionId) => {
    const { verId, envId } = this.state;
    // this.setState({
    //   verId: undefined,
    // });
    DeploymentAppStore.setCurrentEnv({});
    DeploymentAppStore.setValue([]);
    DeploymentAppStore.setCurrentMode('new');
    const currentVersion = DeploymentAppStore.versions.find(version => version.id === versionId);
    DeploymentAppStore.setCurrentVersion(currentVersion);
    if (verId) {
      this.setState({
        verId: undefined,
      });
    }
    if (envId) {
      DeploymentAppStore.setShowArr([true, true, true, true, true, false]);
      DeploymentAppStore.setLoadingArr([false, false, true, true, true, false]);
      axios
        .all([
          DeploymentAppStore.loadEnv(),
          DeploymentAppStore.loadValue(
            this.state.appId || DeploymentAppStore.currentApp.id,
            versionId,
            envId,
          ),
        ])
        .then(
          axios.spread((envs, value) => {
            if (!(envs.failed && value.failed)) {
              DeploymentAppStore.setEnvs(envs);
              DeploymentAppStore.setValue(value);
              DeploymentAppStore.setShowArr([true, true, true, true, true, true]);
              DeploymentAppStore.setLoadingArr([false, false, false, false, false, false]);
            }
          }),
        )
        .catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
    } else {
      DeploymentAppStore.setShowArr([true, true, true, false, false, false]);
      DeploymentAppStore.setLoadingArr([false, false, true, false, false, false]);
      DeploymentAppStore.loadEnv()
        .then((res) => {
          if (res) {
            DeploymentAppStore.setEnvs(res);
            DeploymentAppStore.setLoadingArr([false, false, false, false, false, false]);
          }
        })
        .catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
    }
  };

  /**
   * 事件处理，选择一个环境后，获取value值
   */
    // handleChangeEnvOld = (enveId) => {
    //   const { appId, verId, envId } = this.state;
    //   if (!envId) {
    //     DeploymentAppStore.setValue('');
    //     DeploymentAppStore.setCurrentMode('new');
    //     const currentEnv = DeploymentAppStore.envs.find(env => env.id === enveId);
    //     DeploymentAppStore.setCurrentEnv(currentEnv);
    //     DeploymentAppStore.setShowArr([false, true, true, true, false]);
    //     DeploymentAppStore.setLoadingArr([false, false, false, true, false]);
    //     DeploymentAppStore.loadValue(
    //       this.state.appId || DeploymentAppStore.currentApp.id,
    //       this.state.envId || DeploymentAppStore.currentEnv.id,
    //     )
    //       .then((res) => {
    //         // 格式化json
    //         DeploymentAppStore.setValue(beautify(res, null, 2, 100));
    //         DeploymentAppStore.setLoadingArr([false, false, false, false, false]);
    //         DeploymentAppStore.setShowArr([false, true, true, true, true, true]);
    //       });
    //   } else if (envId) {
    //     this.setState({
    //       envId: undefined,
    //     });
    //     const currentEnv = DeploymentAppStore.envs.find(env => env.id === enveId);
    //     DeploymentAppStore.setCurrentEnv(currentEnv);
    //     DeploymentAppStore.setShowArr([false, true, true, true, false]);
    //     DeploymentAppStore.setLoadingArr([false, false, false, true, false]);
    //     DeploymentAppStore.loadValue(
    //       this.state.appId || DeploymentAppStore.currentApp.id,
    //       DeploymentAppStore.currentEnv.id,
    //     )
    //       .then((res) => {
    //         // 格式化json
    //         DeploymentAppStore.setValue(beautify(res, null, 2, 100));
    //         DeploymentAppStore.setLoadingArr([false, false, false, false, false]);
    //         DeploymentAppStore.setShowArr([false, true, true, true, true, true]);
    //       });
    //   }
    // }

  handleChangeEnv = (enveId) => {
    const { appId, verId, envId } = this.state;
    if (envId) {
      this.setState({
        envId: undefined,
      });
    }
    DeploymentAppStore.setValue([]);
    DeploymentAppStore.setCurrentMode('new');
    const currentEnv = DeploymentAppStore.envs.find(env => env.id === enveId);
    if (!currentEnv.connect) {
      Choerodon.prompt('未连接的环境无法部署应用');
    }
    DeploymentAppStore.setCurrentEnv(currentEnv);
    DeploymentAppStore.setShowArr([true, true, true, true, true, false]);
    DeploymentAppStore.setLoadingArr([false, false, false, true, true, false]);
    DeploymentAppStore.loadValue(
      this.state.appId || DeploymentAppStore.currentApp.id,
      this.state.verId || DeploymentAppStore.currentVersion.id,
      enveId,
    )
      .then((res) => {
        // 格式化json
        if (res) {
          DeploymentAppStore.setValue(res);
          DeploymentAppStore.setLoadingArr([false, false, false, false, false, false]);
          DeploymentAppStore.setShowArr([true, true, true, true, true, true]);
        }
      })
      .catch((error) => {
        Choerodon.prompt(error.response.data.message);
      });
  };

  /**
   * 事件处理，修改value值后写入store
   * @param {*} value 修改后的value值
   */
  handleChangeValue =(value) => {
    this.setState({ value });
    // DeploymentAppStore.setValue(value);
  };

  handleChangeMode = (e) => {
    const mode = e.target.value;
    if (mode === 'replace') {
      DeploymentAppStore.setShowArr([true, true, true, true, true, false]);
      DeploymentAppStore.loadInstances(
        this.state.appId || DeploymentAppStore.currentApp.id,
        this.state.envId || DeploymentAppStore.currentEnv.id,
      ).then((res) => {
        if (res) {
          DeploymentAppStore.setCurrentInstance({});
          DeploymentAppStore.setInstances(res);
          DeploymentAppStore.setCurrentMode(mode);
          DeploymentAppStore.setShowArr([true, true, true, true, true, false]);
        }
      })
        .catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
    } else {
      DeploymentAppStore.setShowArr([true, true, true, true, true, true]);
      DeploymentAppStore.setCurrentInstance({});
      DeploymentAppStore.setCurrentMode(mode);
    }
  };

  handleChangeInstance(instanceId) {
    const currentInstance = DeploymentAppStore.instances.find(
      instance => instance.id === instanceId);
    DeploymentAppStore.setCurrentInstance(currentInstance);
    DeploymentAppStore.setShowArr([true, true, true, true, true, true]);
  }

  // 事件处理，刷新
  handleRefresh =() => {
    DeploymentAppStore.loadInitData()
      .catch((error) => {
        Choerodon.prompt(error.response.data.message);
      });
  };

  openAppDeployment() {
    const { AppState } = this.props;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const type = AppState.currentMenuType.type;
    this.props.history.push(
      `/devops/app-deployment?type=${type}&id=${projectId}&name=${projectName}`,
    );
  }

  /**
   * 事件处理，部署应用
   */
  handleDeploy = () => {
    const value = this.state.value || DeploymentAppStore.value.yaml;
    // if (this.state.value) {
    //   try {
    //     value = this.state.value;
    //   } catch (err) {
    //     Choerodon.prompt('yaml文件格式出错');
    //     return;
    //   }
    // } else {
    //   value = DeploymentAppStore.value.yaml;
    // }
    const applicationDeployDTO = {
      appId: this.state.appId || DeploymentAppStore.currentApp.id,
      appVerisonId: this.state.verId || DeploymentAppStore.currentVersion.id,
      environmentId: this.state.envId || DeploymentAppStore.currentEnv.id,
      values: value,
      type: DeploymentAppStore.currentMode === 'new' ? 'create' : 'update',
      appInstanceId: DeploymentAppStore.currentMode === 'new' ?
        null : DeploymentAppStore.currentInstance.id,
    };
    DeploymentAppStore.deploymentApp(applicationDeployDTO)
      .then((datas) => {
        if (datas) {
          // Choerodon.prompt('创建成功');
          this.openAppDeployment();
        }
      })
      .catch((error) => {
        Choerodon.prompt(error.response.data.message);
      });
  };

  render() {
    const { AppState } = this.props;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    const backPath = AppStoreStore.backPath ? `/devops/appstore/${this.state.storeId}/app?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}` : `/devops/app-deployment?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`;
    // eslint-disable-next-line no-console
    console.log(backPath);
    return (
      <div className="c7n-region c7n-deploymentApp page-container">
        <PageHeader title={Choerodon.languageChange('deploymentApp.title')} backPath={backPath}>
          <Button
            funcType="flat"
            className="leftBtn"
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh page-head-icon" />
            <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
          </Button>
        </PageHeader>

        <div className="page-content" style={{ paddingBottom: '16px' }}>
          <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的部署应用</h2>
          <p>
            部署应用是一个将指定版本的应用部署至指定环境的操作。
            <a href="http://choerodon.io/zh/docs/user-guide/deploy/application-deployment/" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          {this.selectApp}
          {DeploymentAppStore.showArr[1] && this.selectVersion}
          {DeploymentAppStore.showArr[2] && this.selectEnv}
          {DeploymentAppStore.showArr[3] && this.changeValue}
          {DeploymentAppStore.showArr[4] && this.selectMode}
          {DeploymentAppStore.showArr[5] && (
            DeploymentAppStore.currentEnv.connect ||
            (
              this.state.envId &&
              _.find(DeploymentAppStore.envs, { id: this.state.envId }) &&
              _.find(DeploymentAppStore.envs, { id: this.state.envId }).connect
            )
          )
          && this.getOk}
        </div>
      </div>
    );
  }
}

export default withRouter(DeploymentAppHome);
