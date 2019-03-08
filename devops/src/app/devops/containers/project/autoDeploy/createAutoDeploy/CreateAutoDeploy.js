import React, { Component, Fragment } from "react";
import { observer } from "mobx-react";
import { withRouter, Link } from "react-router-dom";
import { injectIntl, FormattedMessage } from "react-intl";
import {
  Button,
  Modal,
  Tooltip,
  Icon,
  Select,
  Form,
  Input,
  Radio,
} from "choerodon-ui";
import {
  Content,
  Permission,
  stores,
} from "choerodon-front-boot";
import _ from "lodash";
import uuidv1 from "uuid/v1";
import '../../../main.scss';
import './CreateAutoDeploy.scss';
import YamlEditor from "../../../../components/yamlEditor/YamlEditor";
import Tips from "../../../../components/Tips/Tips";

const { AppState } = stores;
const { Sidebar } = Modal;
const { Item: FormItem } = Form;
const { Group: RadioGroup } = Radio;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 26 },
  },
};
const VERSIONTYPE = ['master', 'feature', 'bugfix', 'release', 'hotfix'];

@observer
class CreateAutoDeploy extends Component {
  /**
   * 任务名称唯一性校验
   */
  checkName = _.debounce((rule, value, callback) => {
    const p = /^[^ ]+$/;
    const { intl } = this.props;
    const { singleTask: { taskName } } = this.state;
    if (value && value === taskName) {
      callback();
      return;
    }
    if (p.test(value)) {
      const { store } = this.props;
      const { projectId } = AppState.currentMenuType;
      store.checkName(projectId, value)
        .then(data => {
          if (data && data.failed) {
            callback(intl.formatMessage({ id: "task.name.exist" }));
          } else {
            callback();
          }
        });
    } else {
      callback(intl.formatMessage({ id: "task.name.check.failed" }));
    }
  }, 1000);

  /**
   * 实例名称唯一性校验
   */
  checkIstName = _.debounce((rule, value, callback) => {
    const p = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    const { intl } = this.props;
    const { singleTask: { instanceName } } = this.state;
    if (value && value === instanceName) {
      callback();
      return;
    }
    if (p.test(value)) {
      const { store } = this.props;
      const { projectId } = AppState.currentMenuType;
      store.checkIstName(projectId, value)
        .then(data => {
          if (data && data.failed) {
            callback(intl.formatMessage({ id: "task.name.exist" }));
          } else {
            callback();
          }
        });
    } else {
      callback(intl.formatMessage({ id: "network.name.check.failed" }));
    }
  }, 1000);

  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      hasEditorError: false,
      changedValue: null,
      singleTask: {},
      envId: null,
      appId: null,
      instanceId: null,
      isntanceName: null,
      mode: 'new',
      value: null,
    };
  }

  componentDidMount() {
    const {
      id,
      sidebarType,
      store,
    } = this.props;
    const { projectId } = AppState.currentMenuType;
    store.loadEnvData(projectId);
    store.loadAppData(projectId, true);
    if (id && sidebarType === 'edit') {
      store.loadDataById(projectId, id)
        .then(data => {
          if (data) {
            const { envId, appId, instanceId, instanceName, value } = data;
            this.setState({
              singleTask: data,
              envId,
              appId,
              instanceId,
              instanceName,
              mode: instanceId ? 'replace' : 'new',
              value,
            });
            store.loadInstances(projectId, envId, appId);
          }
        });

    }
  }

  componentWillUnmount() {
    const { store } = this.props;
    store.setValue(null);
    store.setSingleTask(null);
    store.setInstanceList([])
  }

  /**
   * 创建编辑自动部署任务
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const {
      form,
      store,
      sidebarType,
      id,
    } = this.props;
    const { projectId } = AppState.currentMenuType;
    const {
      changedValue,
      singleTask: { value, objectVersionNumber },
      instanceId,
      instanceName,
    } = this.state;
    const { getValue } = store;
    this.setState({ submitting: true });
    form.validateFields((err, data) => {
      if (!err) {
        data.value = changedValue || getValue || value;
        data.instanceName = instanceName;
        data.instanceId = instanceId;
        if (sidebarType === 'edit') {
          data.id = id;
          data.objectVersionNumber = objectVersionNumber;
        }
        const promise = store.createData(projectId, data);
        this.handleResponse(promise);
      } else {
        this.setState({ submitting: false });
      }
    })
  };

  /**
   * 处理创建修改任务请求返回的数据
   * @param promise
   */
  handleResponse = promise => {
    if (promise) {
      promise
        .then(data => {
          this.setState({ submitting: false });
          if (data && data.failed) {
            Choerodon.prompt(data.message);
          } else {
            this.handleClose();
          }
        })
        .catch(err => {
          this.setState({ submitting: false });
          Choerodon.handleResponseError(err);
        });
    }
  };

  /**
   * 关闭侧边栏
   */
  handleClose = (flag = true) => {
    const { onClose } = this.props;
    onClose(flag);
  };

  /**
   * 加载实例、配置信息
   */
  loadValue = (type) => {
    const {
      envId,
      appId,
      singleTask: {
        envId: env,
        appId: app,
        instanceName,
        instanceId,
        value,
      },
    } = this.state;
    const { store } = this.props;
    const { projectId } = AppState.currentMenuType;
    if (!appId) {
      return;
    }
    let istName = null;
    let istId = null;
    let newMode = "new";
    let val = null;
    const appData = store.getHasVersionApp;
    const appCode = (_.find(appData, app => app.id === appId)).code;
    istName = `${appCode}-${uuidv1().substring(0, 5)}`;
    (app !== appId || env !== envId) && store.loadValue(projectId, appId);
    if (appId && envId) {
      store.loadInstances(projectId, envId, appId);
      if (env === envId && app === appId) {
        val = value;
        istName = instanceName;
        istId = instanceId;
        newMode = instanceId ? 'replace' : 'new';
      }
    }
    this.setState({
      mode: newMode,
      instanceId: istId,
      instanceName: istName,
      value: val,
    });
  };

  /**
   * 选择环境、应用,修改实例名称
   */
  handleSelect = (value, type) => {
    const { store } = this.props;
    if (type === "envId" || type === "appId") {
      store.setValue(null);
      this.setState({
        [type]: value,
        changedValue: null,
        hasEditorError: false,
        value: null,
      }, () => this.loadValue(type));
    } else {
      this.setState({ [type]: value });
    }
  };

  /**
   * 修改部署模式
   * @param value
   */
  handleChangeMode = value => {
    const { store } = this.props;
    const { appId } = this.state;
    if (value === "new") {
      const appData = store.getHasVersionApp;
      const appCode = (_.find(appData, app => app.id === appId)).code;
      const istName = `${appCode}-${uuidv1().substring(0, 5)}`;
      this.setState({
        instanceName: istName,
        instanceId: null,
        mode: value,
      });
    } else {
      const instances = _.filter(store.getInstanceList, item => item.isEnabled === 1);
      const instance = instances && instances.length ? instances[0] : null;
      this.setState({
        mode: value,
        instanceName: instance ? instance.code : null,
        instanceId: instance ? parseInt(instance.id) : null,
      });
    }
  };

  /**
   * 修改替换实例
   * @param value
   */
  handleChangeIst = value => {
    const { store } = this.props;
    const instanceList = store.getInstanceList;
    const instanceName = (_.find(instanceList, item => parseInt(item.id) === value)).code;
    this.setState({ instanceId: value, instanceName });
  };

  /**
   * 获取配置信息
   */
  getYaml = () => {
    const {
      changedValue,
      singleTask: { value },
      value: val,
    } = this.state;
    const { store: { getValue } } = this.props;
    return (getValue || val ?
      <YamlEditor
        readOnly={false}
        value={changedValue || getValue || value || ""}
        onValueChange={this.handleChangeValue}
        handleEnableNext={this.handleEnableNext}
      /> : null
    )
  };

  /**
   * 配置信息修改的回调函数
   */
  handleChangeValue = (value) => {
    this.setState({ changedValue: value });
  };

  handleEnableNext = flag => {
    this.setState({ hasEditorError: flag });
  };

  render() {
    const {
      name,
    } = AppState.currentMenuType;
    const {
      intl: { formatMessage },
      form,
      store,
      sidebarType,
    } = this.props;
    const {
      submitting,
      singleTask,
      hasEditorError,
      mode,
      instanceId,
      instanceName,
      appId,
      envId,
    } = this.state;
    const {
      getFieldDecorator,
    } =form;
    const {
      taskName,
      triggerVersion,
      instanceId: istId,
      appId: app,
      envId: env,
    } = singleTask;
    const appData = store.getHasVersionApp;
    const envData = store.getEnvData;
    const instanceList = store.getInstanceList;

    return (
      <div className="c7n-region">
        <Sidebar
          title={formatMessage({ id: `autoDeploy.${sidebarType}.header` })}
          visible={sidebarType === 'create' || sidebarType === 'edit'}
          footer={
            [<Button
              key="submit"
              type="primary"
              funcType="raised"
              onClick={this.handleSubmit}
              loading={submitting}
              disabled={hasEditorError}
            >
              {sidebarType === "create"
                ? formatMessage({ id: "create" })
                : formatMessage({ id: "save" })
              }
            </Button>,
            <Button
              key="back"
              funcType="raised"
              onClick={this.handleClose.bind(this, false)}
              disabled={submitting}
              className="c7n-autoDeploy-sidebar-cancel"
            >
              {formatMessage({ id: "cancel" })}
            </Button>]
          }
        >
          <Content
            code={`autoDeploy.${sidebarType}`}
            values={{ name: sidebarType === 'create' ? name : taskName  }}
            className="c7n-autodDeploy-create sidebar-content"
          >
            <Form layout="vertical">
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator("taskName", {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: "required" }),
                      whitespace: true,
                    },
                    {
                      validator: this.checkName,
                    },
                  ],
                  initialValue: taskName || "",
                })(
                  <Input
                    maxLength={30}
                    type="text"
                    label={<FormattedMessage id="autoDeploy.task.name" />}
                  />
                )}
              </FormItem>
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator("appId", {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: "required" }),
                    },
                  ],
                  initialValue: appId,
                })(
                  <Select
                    label={formatMessage({ id: "deploy.appName" })}
                    optionFilterProp="children"
                    onChange={ value => this.handleSelect(value, 'appId')}
                    filter
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {
                      _.map(appData, item => (
                        <Option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
              <div className="c7ncd-sidebar-select autoDeploy-type-tips">
                <FormItem
                  className="c7n-select_512"
                  {...formItemLayout}
                >
                  {getFieldDecorator("triggerVersion", {
                    initialValue: triggerVersion || [],
                  })(
                    <Select
                      mode="tags"
                      label={formatMessage({ id: "autoDeploy.version.type" })}
                      allowClear
                    >
                      {_.map(VERSIONTYPE, item => (
                        <Option key={item}>
                          {item}
                        </Option>
                      ))
                      }
                    </Select>
                  )}
                </FormItem>
                <Tips type="form" data="autoDeploy.create.type.tips" />
              </div>
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator("envId", {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: "required" }),
                    },
                  ],
                  initialValue: envId,
                })(
                  <Select
                    label={formatMessage({ id: "deploy.envName" })}
                    optionFilterProp="children"
                    onChange={ value => this.handleSelect(value, 'envId')}
                    filter
                    filterOption={(input, option) =>
                      option.props.children[1]
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {
                      _.map(envData, item => (
                        <Option
                          key={item.id}
                          value={item.id}
                          disabled={!item.connect || !item.permission}
                        >
                          {item.connect ? (
                            <span className="c7ncd-status c7ncd-status-success" />
                          ) : (
                            <span className="c7ncd-status c7ncd-status-disconnect" />
                          )}
                          {item.name}
                        </Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
              <div>
                <div className="c7n-autoDeploy-config">
                  <Tips type="title" data="autoDeploy.mode" />
                </div>
                <RadioGroup
                  onChange={e => this.handleChangeMode(e.target.value)}
                  value={mode}
                  className="c7n-autoDeploy-radio"
                >
                  <Radio
                    value="new"
                    disabled={instanceId && (appId === app && envId === env && istId)}
                  >
                    <FormattedMessage id="deploy.step.three.mode.new"/>
                  </Radio>
                  <Radio
                    value="replace"
                    disabled={!instanceList || instanceList.length === 0}
                  >
                    <FormattedMessage id="deploy.step.three.mode.replace"/>
                    <Icon
                      className="c7n-autoDeploy-replace-tip-icon"
                      type="error"
                    />
                    <span
                      className="c7n-autoDeploy-replace-tip-text"
                    >
                      {formatMessage({id: "autoDeploy.replace.instance.tips"})}
                    </span>
                  </Radio>
                </RadioGroup>
              </div>
              {mode === "new" && (
                <FormItem
                  className="c7n-select_512"
                  {...formItemLayout}
                >
                  {getFieldDecorator("instanceName", {
                    rules: [
                      {
                        required: true,
                        message: formatMessage({id: "required"}),
                      },
                      {
                        validator: this.checkIstName,
                      },
                    ],
                    initialValue: instanceName,
                  })(
                    <Input
                      onChange={e => this.handleSelect(e.target.value, 'instanceName')}
                      disabled={mode !== "new"}
                      maxLength={30}
                      label={formatMessage({id: "deploy.instance"})}
                    />
                  )}
                </FormItem>
              )}
              {mode === "replace" && (
                <FormItem
                  className="c7n-select_512"
                  {...formItemLayout}
                >
                  {getFieldDecorator("instanceId", {
                    rules: [
                      {
                        required: true,
                        message: formatMessage({ id: "required" }),
                      },
                    ],
                    initialValue: instanceId,
                  })(
                    <Select
                      filter
                      optionFilterProp="children"
                      onSelect={value => this.handleChangeIst(value)}
                      label={formatMessage({ id: "deploy.step.three.mode.replace.label" })}
                      filterOption={(input, option) =>
                        option.props.children.props.children.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {_.map(instanceList, item => (
                        <Option
                          value={parseInt(item.id)}
                          key={parseInt(item.id)}
                          disabled={item.isEnabled === 0 && parseInt(item.id) !== istId}
                        >
                          <Tooltip
                            title={
                              item.isEnabled === 0 && parseInt(item.id) !== istId ?
                                formatMessage({ id: "autoDeploy-instance-tooltip" }) : ''
                            }
                            placement="right"
                          >
                            <span>{item.code}</span>
                          </Tooltip>
                        </Option>))
                      }
                    </Select>)
                  }
                </FormItem>)
              }
              <div className="c7n-autoDeploy-config">
                <FormattedMessage id="deploy.step.two.config" />
              </div>
              {this.getYaml()}
            </Form>
          </Content>
        </Sidebar>
      </div>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(CreateAutoDeploy)));
