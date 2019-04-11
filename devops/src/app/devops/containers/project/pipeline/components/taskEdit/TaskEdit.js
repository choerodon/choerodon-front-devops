import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Modal, Spin, Tooltip, Form, Input, Select, Radio, Icon } from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import _ from 'lodash';
import PipelineCreateStore from '../../../../../stores/project/pipeline/PipelineCreateStore';
import Tips from '../../../../../components/Tips';
import YamlEditor from '../../../../../components/yamlEditor';
import {
  TASK_TYPE_MANUAL,
  TASK_TYPE_DEPLOY,
  MODE_TYPE_NEW,
  MODE_TYPE_UPDATE,
  VERSION_TYPE,
  AUDIT_MODE_ORSING,
  AUDIT_MODE_SING,
} from '../Constans';

import './TaskEdit.scss';

const { Sidebar } = Modal;
const { Item: FormItem } = Form;
const { Option } = Select;
const { Group: RadioGroup } = Radio;
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

@Form.create({})
@injectIntl
@inject('AppState')
@observer
export default class TaskEdit extends Component {
  state = {
    submitting: false,
    taskType: TASK_TYPE_DEPLOY,
    mode: MODE_TYPE_NEW,
    envId: null,
    appId: null,
    configValue: null,
    configError: false,
  };

  componentDidMount() {
    const { stageName, taskName } = this.props;
    const { getTaskList } = PipelineCreateStore;
    const initData = _.find(getTaskList[stageName], ['name', taskName]) || {};

    initData.type === TASK_TYPE_DEPLOY && this.loadingOptionsData();
  }

  componentWillUnmount() {
    PipelineCreateStore.setAppDate([]);
    PipelineCreateStore.setEnvData([]);
    PipelineCreateStore.setInstances([]);
    PipelineCreateStore.setConfig('');
  }

  handleSubmit = e => {
    e.preventDefault();
    const {
      form: { validateFieldsAndScroll },
      onClose,
      name: stageName,
    } = this.props;

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { type, name, applicationId, triggerVersion, envId, instanceName, valueId, instanceId } = values;
        const { configValue } = this.state;
        const data = {
          type,
          name,
          stageName,
          appDeployDTOS: {
            applicationId,
            triggerVersion,
            envId,
            instanceId,
            instanceName,
            value: configValue,
            valueId,
          },
        };
        PipelineCreateStore.setTaskList(stageName || 'stage1', data);
        onClose();
      }
    });
  };

  changeTaskType = (value) => {
    if (value === TASK_TYPE_DEPLOY) {
      this.loadingOptionsData();
    }

    this.setState({
      taskType: value,
    });
  };

  handleChangeMode = e => {
    this.setState({
      mode: e.target.value,
    });
  };

  handleChangeEnv = (value) => {
    const { appId } = this.state;
    this.setState({ envId: value });
    appId && this.loadInstanceData(value, appId);
  };

  handleChangeApp = (value) => {
    const {
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;
    const { envId } = this.state;
    PipelineCreateStore.loadValue(id, value);
    this.setState({ appId: value });
    envId && this.loadInstanceData(envId, value);
  };

  /**
   * 配置信息
   * @param value
   */
  handleChangeValue = (value) => {
    this.setState({ configValue: value });
  };

  /**
   * 配置信息格式校验结果
   * @param flag
   */
  handleEnableNext = (flag) => {
    this.setState({ configError: flag });
  };

  /**
   * 获取配置信息
   */
  getYaml = () => {
    const { stageName, taskName } = this.props;
    const { getTaskList } = PipelineCreateStore;
    const initData = _.find(getTaskList[stageName], ['name', taskName]) || {};
    const deployData = initData.appDeployDTOS || {};
    const value = deployData.value || PipelineCreateStore.getConfig || '';

    return value && <YamlEditor
      readOnly={false}
      value={value}
      originValue={value}
      onValueChange={this.handleChangeValue}
      handleEnableNext={this.handleEnableNext}
    />;
  };

  loadingOptionsData() {
    const {
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;
    PipelineCreateStore.loadEnvData(id);
    PipelineCreateStore.loadAppData(id);
  };

  loadInstanceData(envId, appId) {
    const {
      AppState: {
        currentMenuType: { id },
      },
    } = this.props;
    PipelineCreateStore.loadInstances(id, envId, appId);
  }

  render() {
    const {
      visible,
      onClose,
      name,
      form: { getFieldDecorator },
      intl: { formatMessage },
      stageName,
      taskName,
    } = this.props;
    const {
      getEnvData,
      getAppData,
      getLoading,
      getInstance,
    } = PipelineCreateStore;
    const { submitting, taskType, mode } = this.state;
    const { getTaskList } = PipelineCreateStore;
    const initData = _.find(getTaskList[stageName], ['name', taskName]) || {};
    const deployData = initData.appDeployDTOS || {};
    // const manualData = initData.

    return (<Sidebar
      destroyOnClose
      title={<FormattedMessage id="pipeline.task.create.head" />}
      visible={visible}
      footer={
        [<Button
          key="submit"
          type="primary"
          funcType="raised"
          onClick={this.handleSubmit}
          loading={submitting}
        >
          <FormattedMessage id="add" />
        </Button>, <Button
          key="cancel"
          funcType="raised"
          onClick={onClose}
          disabled={submitting}
        >
          <FormattedMessage id="cancel" />
        </Button>]
      }
    >
      <Content
        code="pipeline.task.create"
        values={{ name }}
        className="sidebar-content c7n-pipeline-task-create"
      >
        <Form layout="vertical">
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('type', {
              initialValue: initData.type,
            })(
              <Select
                label={formatMessage({ id: 'pipeline.task.type' })}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                onChange={this.changeTaskType}
              >
                <Option value={TASK_TYPE_DEPLOY}>
                  <FormattedMessage id="pipeline.mode.auto" />
                </Option>
                <Option value={TASK_TYPE_MANUAL}>
                  <FormattedMessage id="pipeline.mode.manual" />
                </Option>
              </Select>,
            )}
          </FormItem>
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: formatMessage({ id: 'required' }),
                  whitespace: true,
                },
                {
                  // validator: this.checkName,
                },
              ],
              initialValue: initData.name,
            })(
              <Input
                maxLength={30}
                type="text"
                label={<FormattedMessage id="pipeline.task.name" />}
              />,
            )}
          </FormItem>
          {taskType === TASK_TYPE_DEPLOY && <Fragment>
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('applicationId', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'required' }),
                  },
                ],
                initialValue: deployData.applicationId,
              })(
                <Select
                  label={formatMessage({ id: 'app' })}
                  optionFilterProp="children"
                  onChange={this.handleChangeApp}
                  loading={getLoading.app}
                  filter
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {_.map(getAppData, item => (<Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <div className="c7ncd-sidebar-select pipeline-type-tips">
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator('triggerVersion', {
                  initialValue: deployData.triggerVersion,
                })(
                  <Select
                    mode="tags"
                    label={formatMessage({ id: 'pipeline.task.version' })}
                    allowClear
                  >
                    {_.map(VERSION_TYPE, item => (
                      <Option key={item} value={item}>{item}</Option>
                    ))}
                  </Select>,
                )}
              </FormItem>
              <Tips type="form" data="pipeline.task.version.tips" />
            </div>
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('envId', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'required' }),
                  },
                ],
                initialValue: deployData.envId,
              })(
                <Select
                  label={formatMessage({ id: 'envName' })}
                  optionFilterProp="children"
                  onChange={this.handleChangeEnv}
                  loading={getLoading.env}
                  filter
                  filterOption={(input, option) =>
                    option.props.children[1]
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {_.map(getEnvData, item => (<Option
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
                  </Option>))}
                </Select>,
              )}
            </FormItem>
            <Fragment>
              <div className="c7n-pipeline-config">
                <Tips type="title" data="pipeline.deploy.mode" />
              </div>
              <RadioGroup
                onChange={this.handleChangeMode}
                value={mode}
                className="c7n-pipeline-radio"
              >
                <Radio
                  value={MODE_TYPE_NEW}
                >
                  <FormattedMessage id="pipeline.task.instance.create" />
                </Radio>
                <Radio
                  value={MODE_TYPE_UPDATE}
                  disabled={!(getInstance && getInstance.length)}
                >
                  <FormattedMessage id="pipeline.task.instance.update" />
                  <Icon
                    className="c7n-pipeline-replace-tip-icon"
                    type="error"
                  />
                  <span
                    className="c7n-pipeline-replace-tip-text"
                  >
                    {formatMessage({ id: 'pipeline.task.instance.tips' })}
                  </span>
                </Radio>
              </RadioGroup>
            </Fragment>
            {mode === MODE_TYPE_NEW && (
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator('instanceName', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                    {
                      // validator: this.checkIstName,
                    },
                  ],
                  initialValue: deployData.instanceName,
                })(
                  <Input
                    disabled={mode !== MODE_TYPE_NEW}
                    maxLength={30}
                    label={formatMessage({ id: 'pipeline.task.instance' })}
                  />,
                )}
              </FormItem>
            )}
            {mode === MODE_TYPE_UPDATE && (
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator('instanceId', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                  ],
                  initialValue: deployData.instanceId,
                })(
                  <Select
                    filter
                    optionFilterProp="children"
                    label={formatMessage({ id: 'pipeline.task.instance.replace' })}
                    filterOption={(input, option) =>
                      option.props.children.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {_.map(getInstance, item => (
                      <Option
                        value={item.id}
                        key={item.id}
                        disabled={item.isEnabled === 0}
                      >
                        <Tooltip
                          title={
                            item.isEnabled === 0 ? formatMessage({ id: 'autoDeploy.instance.tooltip' }) : ''
                          }
                          placement="right"
                        >
                          {item.code}
                        </Tooltip>
                      </Option>))
                    }
                  </Select>)
                }
              </FormItem>)
            }
            <div className="c7n-pipeline-config">
              <FormattedMessage id="deploy.step.two.config" />
            </div>
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('valueId', {
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'required' }),
                  },
                ],
                initialValue: deployData.valueId,
              })(
                <Select
                  label={formatMessage({ id: 'pipeline.task.config' })}
                  optionFilterProp="children"
                  // onChange={this.handleChangeEnv}
                  loading={getLoading.env}
                  filter
                  filterOption={(input, option) =>
                    option.props.children[1]
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                </Select>,
              )}
            </FormItem>
            {getLoading.config ? <Spin /> : this.getYaml()}
          </Fragment>}
          {taskType === TASK_TYPE_MANUAL && <Fragment>
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('auditor', {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'required' }),
                }],
              })(
                <Select
                  className="c7n-select_512"
                  label={<FormattedMessage id="pipeline.task.auditor" />}
                  mode="tags"
                  allowClear
                >
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                  <Option value="disabled" disabled>Disabled</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('auditMode', {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'required' }),
                }],
                initialValue: AUDIT_MODE_SING,
              })(
                <Select
                  className="c7n-select_512"
                  label={<FormattedMessage id="pipeline.task.auditMode" />}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  <Option value={AUDIT_MODE_SING}>
                    <FormattedMessage id="pipeline.audit.sign" />
                  </Option>
                  <Option value={AUDIT_MODE_ORSING}>
                    <FormattedMessage id="pipeline.audit.orSign" />
                  </Option>
                </Select>,
              )}
            </FormItem>
          </Fragment>}
        </Form>
      </Content>
    </Sidebar>);
  }
}
