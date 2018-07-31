import React, { Component } from 'react';
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
    window.console.log(e.target);
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
  }

  render() {
    const { submitting, targetType, configType } = this.state;
    const { name: menuName } = AppState.currentMenuType;
    const { visible, form, intl, store } = this.props;
    const { getFieldDecorator } = form;
    const env = store.getEnv;
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
              <FormItem
                className="c7n-select_512"
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
              <div className="network-panel">
                {targetType === 'instance' ? (<React.Fragment>
                  <FormItem
                    className="c7n-select_512"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('application', {
                      rules: [{
                        required: true,
                        message: intl.formatMessage({ id: 'required' }),
                      }],
                    })(<Select
                      className="c7n-select_512"
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
                    className="c7n-select_512"
                    {...formItemLayout}
                  >
                    {getFieldDecorator('instance', {
                      rules: [{
                        required: true,
                        message: intl.formatMessage({ id: 'required' }),
                      }],
                    })(<Select
                      className="c7n-select_512"
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
                </React.Fragment>) : null}
              </div>
              <div className="network-panel-title">
                <Icon type="router" />
                <FormattedMessage id={'network.config'} />
              </div>
              <FormItem
                className="c7n-select_512"
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
            </Form>
          </Content>
        </Sidebar>
      </div>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(CreateNetwork)));
