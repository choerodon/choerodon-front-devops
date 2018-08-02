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
const { Option, OptGroup } = Select;
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
    /* **************
     *                        state              this
     * portKeys/targetKeys | 用于radio选择模式 | 生成一组表单项的唯一表示
     *
     ************** */
    this.state = {
      submitting: false,
      targetKeys: 'instance',
      portKeys: 'ip',
    };
    this.portKeys = 1;
    this.targetKeys = 0;
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
   * 环境选择，加载应用
   * 环境下可以部署多个应用
   * @param value
   */
  handleEnvSelect = (value) => {
    if (!value) {
      return;
    }
    const { store } = this.props;
    const { id } = AppState.currentMenuType;
    store.loadApp(id, Number(value));
  };

  /**
   * 目标和网络配置类型选择
   * @param e
   * @param key
   */
  handleTypeChange = (e, key) => {
    const { form } = this.props;
    const keys = form.getFieldValue(key);
    if (key === 'portKeys') {
      // 清除多组port映射
      this.portKeys = 1;
      form.resetFields(['port', 'tport']);
    } else {
      this.targetKeys = 0;
      form.resetFields(['keyword', 'value']);
    }
    if (keys.length > 1) {
      form.setFieldsValue({
        [key]: [0],
      });
    }
    this.setState({ [key]: e.target.value });
  };

  /**
   * 选择应用, 加载实例
   * @param value
   */
  handleAppSelect = (value) => {
    window.console.log(value);
    const { store, form } = this.props;
    const { id } = AppState.currentMenuType;
    const envId = form.getFieldValue('envId');
    store.loadInstance(id, envId, Number(value));
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
    const { submitting, targetKeys: targetType, portKeys: configType } = this.state;
    const { name: menuName, id: projectId } = AppState.currentMenuType;
    const { getFieldDecorator, getFieldValue } = form;
    const env = store.getEnv;
    const localApp = _.filter(store.getApp, item => item.projectId === Number(projectId));
    const storeApp = _.filter(store.getApp, item => item.projectId !== Number(projectId));
    const ist = store.getIst;
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
      {portKeys.length > 1 ? (<Icon className="network-group-icon" type="delete" onClick={() => this.removeGroup(k, 'portKeys')} />) : null}
    </div>));

    // 生成多组 target
    getFieldDecorator('targetKeys', { initialValue: [] });
    const targetKeys = getFieldValue('targetKeys');
    const targetItems = _.map(targetKeys, (k, index) => (<div key={`target-${k}`} className="network-port-wrap">
      <FormItem
        className={`c7n-select_${targetKeys.length > 1 ? 'entry' : '240'} network-panel-form network-port-form`}
        {...formItemLayout}
      >
        {getFieldDecorator(`keyword[${k}]`, {
          rules: [{
            required: true,
            message: intl.formatMessage({ id: 'required' }),
          }],
        })(
          <Input
            type="text"
            disabled={!getFieldValue('envId')}
            label={<FormattedMessage id={'network.config.keyword'} />}
          />,
        )}
      </FormItem>
      {targetKeys.length > 1 ? (<Icon className="network-group-icon" type="drag_handle" />) : null}
      <FormItem
        className={`c7n-select_${targetKeys.length > 1 ? 'entry' : '240'} network-panel-form network-port-form`}
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
            disabled={!getFieldValue('envId')}
            label={<FormattedMessage id={'network.config.value'} />}
          />,
        )}
      </FormItem>
      {targetKeys.length > 1 ? (<Icon className="network-group-icon" type="delete" onClick={() => this.removeGroup(k, 'targetKeys')} />) : null}
    </div>));
    // app 下拉选项
    const appGroup = (node) => {
      const { id, name, code } = node;
      return (<Option value={id} key={code}>
        <Popover
          placement="right"
          content={<Fragment>
            <p>
              <FormattedMessage id="app.name" />:
              <span>{name}</span>
            </p>
            <p>
              <FormattedMessage id="app.code" />:
              <span>{code}</span>
            </p>
          </Fragment>}
        >
          <span className="icon icon-project" />
          <span className="network-app-name">{name}</span>
        </Popover>
      </Option>);
    };
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
                {getFieldDecorator('envId', {
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
                  getPopupContainer={triggerNode => triggerNode.parentNode}
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
                    onChange={e => this.handleTypeChange(e, 'targetKeys')}
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
                    {getFieldDecorator('appId', {
                      rules: [{
                        required: true,
                        message: intl.formatMessage({ id: 'required' }),
                      }],
                    })(<Select
                      filter
                      showSearch
                      showArrow={false}
                      className="c7n-select_480"
                      optionFilterProp="children"
                      disabled={!getFieldValue('envId')}
                      onSelect={this.handleAppSelect}
                      label={<FormattedMessage id="network.form.app" />}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      filterOption={(input, option) =>
                        option.props.children.props.children[1].props.children
                          .toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      <OptGroup label={<FormattedMessage id={'project'} />} key={'project'}>
                        {_.map(localApp, node => appGroup(node))}
                      </OptGroup>
                      <OptGroup label={<FormattedMessage id={'market'} />} key={'markert'}>
                        {_.map(storeApp, node => appGroup(node))}
                      </OptGroup>
                    </Select>)}
                  </FormItem>
                  <FormItem
                    className="c7n-select_480 network-panel-form"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('appInstance', {
                      rules: [{
                        required: true,
                        message: intl.formatMessage({ id: 'required' }),
                      }],
                    })(<Select
                      filter
                      showSearch
                      mode="tags"
                      className="c7n-select_480"
                      optionFilterProp="children"
                      onSelect={this.handleIstSelect}
                      disabled={!getFieldValue('appId')}
                      label={<FormattedMessage id="network.target.instance" />}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {_.map(env, (item) => {
                        const { id, code } = item;
                        return (<Option key={id} value={`${id}`}>
                          {code}
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
                      disabled={!getFieldValue('envId')}
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
                    onChange={e => this.handleTypeChange(e, 'portKeys')}
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
                    disabled={!getFieldValue('appInstance') && !getFieldValue('keyword') && !getFieldValue('value')}
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
