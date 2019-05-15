/**
 * @author ale0720@163.com
 * @date 2019-05-13 16:47
 */
import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content } from 'choerodon-front-boot';
import _ from 'lodash';
import {
  Form,
  Select,
  Modal,
  Radio,
  Checkbox,
} from 'choerodon-ui';
import InterceptMask from '../../../../components/interceptMask/InterceptMask';

import '../../../main.scss';

const { Sidebar } = Modal;
const { Item: FormItem } = Form;
const { Option } = Select;
const { Group: RadioGroup } = Radio;
const { Group: CheckboxGroup } = Checkbox;
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
export default class NotificationSidebar extends Component {
  state = {
    submitting: false,
    target: null,
  };

  componentDidMount() {
    const {
      store,
      AppState: {
        currentMenuType: { projectId },
      },
      type,
      id,
    } = this.props;
    store.loadEnvData(projectId);
    if (type === "edit" && id) {
      store.loadSingleData(projectId, id);
      store.loadUsers(projectId)
        .then(data => {
          if (data && !data.failed) {
            this.setState({
              target: data.notifyObject,
            });
          }
        })
    }
  }

  componentWillUnmount() {
    const { store } = this.props;
    store.setSingleData({});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {
      form,
      store,
      type,
      AppState: { currentMenuType: { projectId } },
    } = this.props;
    this.setState({ submitting: true });
    form.validateFields((err, data) => {
      if (!err) {
        let promise = null;
        if (type === 'edit') {
          const { getSingleData: { id, objectVersionNumber } } = store;
          data.id = id;
          data.objectVersionNumber = objectVersionNumber;
          promise = store.updateData(projectId, data);
        } else {
          promise = store.createData(projectId, data);
        }
        this.handleResponse(promise);
      } else {
        this.setState({ submitting: false });
      }
    })
  };

  /**
   * 处理创建修改请求返回的数据
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
   * 关闭弹框
   */
  handleClose = (reload) => {
    const { onClose } = this.props;
    onClose(reload);
  };

  /**
   * 修改通知对象
   */
  changeTarget = (e) => {
    const value = e.target.value;
    const {
      store,
      AppState: {
        currentMenuType: { projectId },
      },
    } = this.props;
    if(value === "specifier") {
      store.loadUsers(projectId);
    }
    this.setState({ target: value });
  };

  render() {
    const {
      visible,
      type,
      form: { getFieldDecorator },
      intl: { formatMessage },
      store,
    } = this.props;
    const {
      submitting,
      target,
    } = this.state;
    const {
      getEnvData,
      getUsers,
      getSingleData: {
        envId,
        notifyTriggerEvent,
        notifyType,
        notifyObject,
        userRelIds,
      },
    } = store;
    const EVENT = ["instance","ingress","service","certification", "configMap", "secret"];
    const METHOD_OPTIONS = ["sms", "email", "pm"];
    const TARGET_OPTIONS = ["handler", "owner", "specifier"];

    return (
      <div className="c7n-region">
        <Sidebar
          destroyOnClose
          cancelText={<FormattedMessage id="cancel" />}
          okText={<FormattedMessage id={type} />}
          title={<FormattedMessage id={`notification.sidebar.${type}`} />}
          visible={visible}
          onOk={this.handleSubmit}
          onCancel={this.handleClose}
          confirmLoading={submitting}
        >
          <Content
            code={`notification.${type}`}
            className="sidebar-content"
          >
            <Form layout="vertical" className="c7n-sidebar-form">
              <FormItem className="c7n-select_512" {...formItemLayout}>
                {getFieldDecorator('envId', {
                  initialValue: getEnvData.length ? envId : undefined,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                  ],
                })(
                  <Select
                    label={formatMessage({ id: "environment" })}
                    optionFilterProp="children"
                    allowClear
                    filter
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {
                      _.map(getEnvData, ({ id, name }) => (
                        <Option
                          key={id}
                          value={id}
                        >
                          {name}
                        </Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem className="c7n-select_512" {...formItemLayout}>
                {getFieldDecorator('notifyTriggerEvent', {
                  initialValue: notifyTriggerEvent || undefined,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                  ],
                })(
                  <Select
                    mode="tags"
                    label={formatMessage({ id: "notification.event" })}
                    allowClear
                  >
                    {
                      _.map(EVENT, item => (
                        <Option
                          key={item}
                          value={item}
                        >
                          {formatMessage({ id: `notification.event.${item}`})}
                        </Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>
              <FormItem className="c7n-select_512" {...formItemLayout}>
                {getFieldDecorator('notifyType', {
                  initialValue: notifyType || undefined,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                  ],
                })(
                  <CheckboxGroup
                    label={formatMessage({ id: "notification.method" })}
                  >
                    {
                      _.map(METHOD_OPTIONS, item => (
                        <Checkbox
                          key={item}
                          value={item}
                        >
                          {formatMessage({ id: `notification.method.${item}` })}
                        </Checkbox>
                      ))
                    }
                  </CheckboxGroup>
                )}
              </FormItem>
              <FormItem className="c7n-select_512" {...formItemLayout}>
                {getFieldDecorator('notifyObject', {
                  initialValue: notifyObject || undefined,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                  ],
                })(
                  <RadioGroup
                    label={formatMessage({ id: "notification.target" })}
                    onChange={this.changeTarget}
                  >
                    {
                      _.map(TARGET_OPTIONS, item => (
                        <Radio
                          key={item}
                          value={item}
                        >
                          {formatMessage({ id: `notification.target.${item}` })}
                        </Radio>
                      ))
                    }
                  </RadioGroup>
                )}
              </FormItem>
              {target === "specifier" && <FormItem className="c7n-select_512" {...formItemLayout}>
                {getFieldDecorator('userRelIds', {
                  initialValue: userRelIds || undefined,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                  ],
                })(
                  <Select
                    mode="multiple"
                    label={formatMessage({ id: "notification.target.specifier" })}
                    optionFilterProp="children"
                    allowClear
                    filter
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {
                      _.map(getUsers, ({id, loginName, realName}) => (
                        <Option
                          key={id}
                          value={id}
                        >
                          {`${loginName} ${realName}`}
                        </Option>
                      ))
                    }
                  </Select>
                )}
              </FormItem>}
            </Form>
            <InterceptMask visible={submitting} />
          </Content>
        </Sidebar>
      </div>
    );
  }
}


