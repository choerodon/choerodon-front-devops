import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { stores, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Form, Select, Input, Modal, Popover, Icon, Radio, Tooltip } from 'choerodon-ui';
import '../../../main.scss';
import './CreateCert.scss';

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
class CreateCert extends Component {
  /**
   * 与域名相同的校验
   */
  checkName =_.debounce((rule, value, callback) => {
    const p = /^([a-z0-9]([-a-z0-9]?[a-z0-9])*)$/;
    const { intl } = this.props;
    if (p.test(value)) {
      const { store, form } = this.props;
      const { id: projectId } = AppState.currentMenuType;
      const envId = form.getFieldValue('envId');
      if (envId) {
        callback();
        store.checkCertName(projectId, value, envId)
          .then((data) => {
            if (data) {
              callback();
            } else {
              callback(intl.formatMessage({ id: 'ctf.name.check.exist' }));
            }
          })
          .catch(() => callback());
      } else {
        callback(intl.formatMessage({ id: 'ctf.form.app.disable' }));
      }
    } else {
      callback(intl.formatMessage({ id: 'ctf.names.check.failed' }));
    }
  }, 1000);

  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      type: 'apply',
    };
    this.domainCount = 1;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { form, store } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    this.setState({ submitting: true });
    form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        window.console.log(data);
        this.setState({ submitting: false });
      } else {
        this.setState({ submitting: false });
      }
    });
  };

  /**
   * 域名格式检查
   * @param rule
   * @param value
   * @param callback
   */
  checkDomain = (rule, value, callback) => {
    const { intl, form } = this.props;
    const { getFieldValue } = form;
    const p = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)+)$/;
    const keyCount = _.countBy(getFieldValue('domain'));
    if (p.test(value)) {
      if (keyCount[value] < 2) {
        callback();
      } else {
        callback(intl.formatMessage({ id: 'ctf.domain.check.repeat' }));
      }
    } else {
      callback(intl.formatMessage({ id: 'domain.name.check.failed' }));
    }
  };

  /**
   * 添加域名
   */
  addDomain = () => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const keys = getFieldValue('domains');
    const uuid = this.domainCount;
    const nextKeys = _.concat(keys, uuid);
    this.domainCount = uuid + 1;
    setFieldsValue({
      domains: nextKeys,
    });
  };

  /**
   * 删除一个域名
   * @param k
   */
  removeGroup = (k) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const keys = getFieldValue('domains');
    if (keys.length === 1) {
      return;
    }
    setFieldsValue({
      domains: _.filter(keys, key => key !== k),
    });
  };

  /**
   * 获取环境选择器的元素节点
   * @param node
   */
  envSelectRef = (node) => {
    if (node) {
      this.envSelect = node.rcSelect;
    }
  };

  /**
   * 切换参数类型
   * @param e
   */
  handleTypeChange = e => this.setState({ type: e.target.value });

  render() {
    const { visible, form, intl, store, handleClose } = this.props;
    const { submitting, type } = this.state;
    const { name: menuName, id: projectId } = AppState.currentMenuType;
    const { getFieldDecorator, getFieldValue } = form;
    getFieldDecorator('domains', { initialValue: [0] });
    // 设置环境选择器自动聚焦
    // if (this.envSelect && !getFieldValue('envId')) {
    //   this.envSelect.focus();
    // }
    const domains = getFieldValue('domains');
    const domainItems = _.map(domains, (k, index) => (<div key={`domain-${k}`} className="creation-panel-group">
      <FormItem
        className={`c7n-select_${domains.length > 1 ? 454 : 480} creation-group-form`}
        {...formItemLayout}
      >
        {getFieldDecorator(`domain[${k}]`, {
          rules: [{
            required: true,
            message: intl.formatMessage({ id: 'required' }),
          }, {
            validator: this.checkDomain,
          }],
        })(
          <Input
            type="text"
            maxLength={100}
            label={<FormattedMessage id="ctf.config.domain" />}
          />,
        )}
      </FormItem>
      {domains.length > 1 ? (<Icon className="creation-panel-icon" type="delete" onClick={() => this.removeGroup(k)} />) : null}
    </div>));
    const env = store.getEnvData;
    return (<div className="c7n-region">
      <Sidebar
        destroyOnClose
        cancelText={<FormattedMessage id="cancel" />}
        okText={<FormattedMessage id="create" />}
        title={<FormattedMessage id="ctf.sidebar.create" />}
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={handleClose}
        confirmLoading={submitting}
      >
        <Content code="ctf.create" values={{ name: menuName }} className="c7n-ctf-create sidebar-content">
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
                ref={this.envSelectRef}
                className="c7n-select_512"
                label={<FormattedMessage id="ctf.envName" />}
                placeholder={intl.formatMessage({ id: 'ctf.env.placeholder' })}
                optionFilterProp="children"
                onSelect={this.handleEnvSelect}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                filterOption={(input, option) => option.props.children[1]
                  .toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: 'required' }),
                }, {
                  validator: this.checkName,
                }],
              })(
                <Input
                  maxLength={40}
                  type="text"
                  label={<FormattedMessage id="ctf.name" />}
                />,
              )}
            </FormItem>
            <div className="c7n-creation-title">
              <Icon type="settings" />
              <FormattedMessage id="ctf.config" />
            </div>
            <div className="c7n-creation-radio">
              <div className="creation-radio-label">
                <FormattedMessage id="network.target.type" />
              </div>
              <FormItem
                className="c7n-select_512 creation-radio-form"
                label={<FormattedMessage id="network.target.type" />}
                {...formItemLayout}
              >
                {getFieldDecorator('type', {
                  initialValue: 'apply',
                })(<RadioGroup
                  name="type"
                  onChange={this.handleTypeChange}
                >
                  <Radio value="apply"><FormattedMessage id="ctf.apply" /></Radio>
                  <Radio value="upload"><FormattedMessage id="ctf.upload" /></Radio>
                </RadioGroup>)}
              </FormItem>
            </div>
            <div className="c7n-creation-panel">
              {domainItems}
              <FormItem
                className="c7n-select_480 creation-panel-button"
                {...formItemLayout}
              >
                <Button
                  type="primary"
                  funcType="flat"
                  onClick={this.addDomain}
                  icon="add"
                ><FormattedMessage id="ctf.config.add" /></Button>
              </FormItem>
              {type === 'upload' ? (<div className="c7n-ctf-upload">
                <p>
                  <FormattedMessage id="ctf.add.cert" />

                </p>
                <p><FormattedMessage id="ctf.add.describe" /></p>
              </div>) : null}
            </div>
          </Form>
        </Content>
      </Sidebar>
    </div>);
  }
}

export default Form.create({})(injectIntl(CreateCert));
