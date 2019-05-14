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
  Button,
  Form,
  Select,
  Input,
  Modal,
  Icon,
  Radio,
} from 'choerodon-ui';
import Tips from '../../../../components/Tips/Tips';
import InterceptMask from '../../../../components/interceptMask/InterceptMask';

import '../../../main.scss';

const { Sidebar } = Modal;
const { Item: FormItem } = Form;
const { Option } = Select;
const { Group: RadioGroup } = Radio;
const { TextArea } = Input;
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
  };

  componentDidMount() {

  }

  handleSubmit = e => {
    e.preventDefault();
    // const { form, store } = this.props;
    // this.setState({ submitting: true });
    // form.validateFieldsAndScroll((err, data) => {
    //
    // });
  };

  /**
   * 关闭弹框
   */
  handleClose = (reload) => {
    const { onClose } = this.props;
    onClose(reload);
  };

  render() {
    const {
      visible,
      type,
      form: { getFieldDecorator },
      intl: { formatMessage },
    } = this.props;
    const { submitting } = this.state;

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
            // values={{ name: menuName }}
            className="sidebar-content"
          >
            <Form layout="vertical" className="c7n-sidebar-form">
              <FormItem className="c7n-select_512" {...formItemLayout}>
                {getFieldDecorator('envId', {
                  // initialValue: env.length ? envId : undefined,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                  ],
                })(
                  <Select
                    label="Select"
                    placeholder="Please Select"
                    allowClear
                    style={{ width: 200 }}
                  >
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                    <Option value="disabled" disabled>Disabled</Option>
                  </Select>,
                )}
              </FormItem>
            </Form>
            <InterceptMask visible={submitting} />
          </Content>
        </Sidebar>
      </div>
    );
  }
}


