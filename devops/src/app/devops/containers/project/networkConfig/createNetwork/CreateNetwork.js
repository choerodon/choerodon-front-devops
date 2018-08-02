/* eslint-disable no-useless-return */
import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Form, Select, Input, Tooltip, Modal, Popover, Icon, Radio } from 'choerodon-ui';
import { stores, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import '../../../main.scss';
import './CreateNetwork.scss';

const { AppState } = stores;
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

@observer
class CreateNetwork extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      targetType: 'instance',
      configType: 'ip',
    };
    this.portKeys = 1;
    this.targetKeys = 1;
  }

  componentDidMount() {
    const { store } = this.props;
    const { id } = AppState.currentMenuType;
    store.loadEnv(id);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        window.console.log(data);
      }
    });
    // this.handleClose();
  };

  handleClose = () => {
    const { onClose, form, store } = this.props;
    store.setEnv([]);
    onClose();
    form.resetFields();
  };

  /**
   * 环境选择
   * 环境下可以部署多个应用
   * @param value
   */
  handleEnvSelect = (value) => {
    window.console.log(value);
  };

  /**
   * 目标和网络配置类型选择
   * @param e
   * @param key
   */
  handleTypeChange = (e, key) => {
    if (key === 'configType') {
      // 清除多组port映射
      const { form } = this.props;
      this.portKeys = 1;
      const keys = form.getFieldValue('portKeys');
      form.resetFields(['port', 'tport']);
      if (keys.length > 1) {
        form.setFieldsValue({
          portKeys: [0],
        });
      }
    }
    this.setState({ [key]: e.target.value });
  };

  /**
   * 选择应用
   * @param value
   */
  handleAppSelect = (value) => {
    window.console.log(value);
  };

  /**
   * 选择实例
   * @param value
   */
  handleIstSelect = (value) => {
    window.console.log(value);
  };

  /**
   * 移除端口映射
   * @param k
   * @param type
   */
  removeGroup = (k, type) => {
    const { form } = this.props;
    const keys = form.getFieldValue(type);
    if (keys.length === 1) {
      return;
    }
    form.setFieldsValue({
      [type]: _.filter(keys, key => key !== k),
    });
  };

  /**
   * 动态生成一组表单项
   * @param type
   */
  addGroup = (type) => {
    const { form } = this.props;
    const keys = form.getFieldValue(type);
    const uuid = type === 'portKeys' ? this.portKeys : this.targetKeys;
    const nextKeys = _.concat(keys, uuid);
    this[type] = uuid + 1;
    form.setFieldsValue({
      [type]: nextKeys,
    });
  };

  render() {
    const { visible, form, intl, store } = this.props;
    const { submitting, targetType, configType } = this.state;
    const { name: menuName } = AppState.currentMenuType;
    const { getFieldDecorator, getFieldValue } = form;
    const env = store.getEnv;

    // 生成多组 port
    getFieldDecorator('portKeys', { initialValue: [0] });
    const portKeys = getFieldValue('portKeys');
    const portItems = _.map(portKeys, (k, index) => (<div key={`port-${k}`} className="network-port-wrap">
      <FormItem
        className={`c7n-select_${portKeys.length > 1 ? 'port' : '240'} network-panel-form network-port-form`}
        {...formItemLayout}
      >
        {getFieldDecorator(`port[${k}]`, {
          rules: [{
            required: true,
            message: intl.formatMessage({ id: 'required' }),
          }],
        })(
          <Input
            type="text"
            label={<FormattedMessage id={'network.config.port'} />}
          />,
        )}
      </FormItem>
      <FormItem
        className={`c7n-select_${portKeys.length > 1 ? 'port' : '240'} network-panel-form network-port-form`}
        {...formItemLayout}
      >
        {getFieldDecorator(`tport[${k}]`, {
          rules: [{
            required: true,
            message: intl.formatMessage({ id: 'required' }),
          }],
        })(
          <Input
            type="text"
            label={<FormattedMessage id={'network.config.tport'} />}
          />,
        )}
      </FormItem>
      {portKeys.length > 1 ? (<Icon className="network-port-delete" type="delete" onClick={() => this.removeGroup(k, 'portKeys')} />) : null}
    </div>));

    // 生成多组 target
    getFieldDecorator('targetKeys', { initialValue: [0] });
    const targetKeys = getFieldValue('targetKeys');
    const targetItems = _.map(targetKeys, (k, index) => (<div key={`target-${k}`} className="network-port-wrap">
      <FormItem
        className={`c7n-select_${targetKeys.length > 1 ? 'port' : '240'} network-panel-form network-port-form`}
        {...formItemLayout}
      >
        {getFieldDecorator(`keys[${k}]`, {
          rules: [{
            required: true,
            message: intl.formatMessage({ id: 'required' }),
          }],
        })(
          <Input
            type="text"
            label={<FormattedMessage id={'network.config.port'} />}
          />,
        )}
      </FormItem>
      <FormItem
        className={`c7n-select_${targetKeys.length > 1 ? 'port' : '240'} network-panel-form network-port-form`}
        {...formItemLayout}
      >
        {getFieldDecorator(`value[${k}]`, {
          rules: [{
            required: true,
            message: intl.formatMessage({ id: 'required' }),
          }],
        })(
          <Input
            type="text"
            label={<FormattedMessage id={'network.config.tport'} />}
          />,
        )}
      </FormItem>
      {targetKeys.length > 1 ? (<Icon className="network-port-delete" type="delete" onClick={() => this.removeGroup(k, 'targetKeys')} />) : null}
    </div>));

    return (
      <div className="c7n-region">
        <Sidebar
          destroyOnClose
          cancelText={<FormattedMessage id={'cancel'} />}
          okText={<FormattedMessage id={'create'} />}
          title={<FormattedMessage id={'network.header.create'} />}
          visible={visible}
          onOk={this.handleSubmit}
          onCancel={this.handleClose}
          confirmLoading={submitting}
        >
          <Content code={'network.create'} values={{ name: menuName }} className="c7n-network-create sidebar-content">
            <Form layout="vertical">
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator('env', {
                  rules: [{
                    required: true,
                    message: intl.formatMessage({ id: 'required' }),
                  }],
                })(<Select
                  className="c7n-select_512"
                  dropdownClassName="c7n-network-env"
                  label={<FormattedMessage id={'network.env'} />}
                  optionFilterProp="children"
                  onSelect={this.handleEnvSelect}
                  filterOption={(input, option) =>
                    option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  filter
                  showSearch
                >
                  {_.map(env, (item) => {
                    const { id, connect, name } = item;
                    return (<Option key={id} value={id} disabled={!connect}>
                      {connect ? <span className="env-status-success" /> : <span className="env-status-error" />}
                      {name}
                    </Option>);
                  })}
                </Select>)}
              </FormItem>
              <div className="network-panel-title">
                <Icon type="instance_outline" />
                <FormattedMessage id={'network.target'} />
              </div>
              <div className="network-radio-wrap">
                <div className="network-radio-label">
                  <FormattedMessage id={'network.target.type'} />
                </div>
                <FormItem
                  className="c7n-select_512 network-radio-form"
                  label={<FormattedMessage id={'network.target.type'} />}
                  {...formItemLayout}
                >
                  {getFieldDecorator('target', {
                    initialValue: targetType,
                  })(<RadioGroup
                    name="target"
                    onChange={e => this.handleTypeChange(e, 'targetType')}
                  >
                    <Radio value="instance"><FormattedMessage id={'network.target.instance'} /></Radio>
                    <Radio value="param"><FormattedMessage id={'network.target.param'} /></Radio>
                  </RadioGroup>)}
                </FormItem>
              </div>
              <div className="network-panel">
                {targetType === 'instance' ? (<Fragment>
                  <FormItem
                    className="c7n-select_480 network-panel-form"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('application', {
                      rules: [{
                        required: true,
                        message: intl.formatMessage({ id: 'required' }),
                      }],
                    })(<Select
                      className="c7n-select_480"
                      dropdownClassName="c7n-network-env"
                      label={<FormattedMessage id={'network.form.app'} />}
                      optionFilterProp="children"
                      onSelect={this.handleAppSelect}
                      filterOption={(input, option) =>
                        option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      filter
                      showSearch
                    >
                      {_.map(env, (item) => {
                        const { id, connect, name } = item;
                        return (<Option key={id} value={id} disabled={!connect}>
                          {connect ? <span className="env-status-success" /> : <span className="env-status-error" />}
                          {name}
                        </Option>);
                      })}
                    </Select>)}
                  </FormItem>
                  <FormItem
                    className="c7n-select_480 network-panel-form"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('instance', {
                      rules: [{
                        required: true,
                        message: intl.formatMessage({ id: 'required' }),
                      }],
                    })(<Select
                      className="c7n-select_480"
                      dropdownClassName="c7n-network-env"
                      label={<FormattedMessage id={'network.target.instance'} />}
                      optionFilterProp="children"
                      onSelect={this.handleIstSelect}
                      filterOption={(input, option) =>
                        option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      filter
                      showSearch
                    >
                      {_.map(env, (item) => {
                        const { id, connect, name } = item;
                        return (<Option key={id} value={id} disabled={!connect}>
                          {connect ? <span className="env-status-success" /> : <span className="env-status-error" />}
                          {name}
                        </Option>);
                      })}
                    </Select>)}
                  </FormItem>
                </Fragment>) : (<Fragment>
                  {targetItems}
                  <FormItem
                    className="c7n-select_480 network-panel-button"
                    {...formItemLayout}
                  >
                    <Button
                      type="primary"
                      funcType="flat"
                      onClick={() => this.addGroup('targetKeys')}
                      icon="add"
                    ><FormattedMessage id={'network.config.addtarget'} /></Button>
                  </FormItem>
                </Fragment>)}
              </div>
              <div className="network-panel-title">
                <Icon type="router" />
                <FormattedMessage id={'network.config'} />
              </div>
              <div className="network-radio-wrap">
                <div className="network-radio-label">
                  <FormattedMessage id={'network.target.type'} />
                </div>
                <FormItem
                  className="c7n-select_512 network-radio-form"
                  {...formItemLayout}
                >
                  {getFieldDecorator('config', {
                    initialValue: configType,
                  })(<RadioGroup
                    name="config"
                    onChange={e => this.handleTypeChange(e, 'configType')}
                  >
                    <Radio value="ip">ClusterIP</Radio>
                    <Radio value="port">NodePort</Radio>
                  </RadioGroup>)}
                </FormItem>
              </div>
              <div className="network-panel">
                {configType === 'ip' ? (<Fragment>
                  <FormItem
                    className="c7n-select_480 network-panel-form"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('ip')(
                      <Input
                        type="text"
                        label={<FormattedMessage id={'network.config.ip'} />}
                      />,
                    )}
                  </FormItem>
                  {portItems}
                </Fragment>) : portItems}
                <FormItem
                  className="c7n-select_480 network-panel-button"
                  {...formItemLayout}
                >
                  <Button
                    type="primary"
                    funcType="flat"
                    onClick={() => this.addGroup('portKeys')}
                    icon="add"
                  ><FormattedMessage id={'network.config.addport'} /></Button>
                </FormItem>
              </div>
              <FormItem
                className="c7n-select_512 network-form-name"
                {...formItemLayout}
              >
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: intl.formatMessage({ id: 'required' }),
                  }],
                })(
                  <Input
                    maxLength={30}
                    type="text"
                    label={<FormattedMessage id={'network.form.name'} />}
                  />,
                )}
              </FormItem>
            </Form>
          </Content>
        </Sidebar>
      </div>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(CreateNetwork)));
