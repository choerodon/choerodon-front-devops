import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { Content, stores } from 'choerodon-front-boot';
import { Button, Form, Select, Input, Modal, Tooltip, Icon } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import Password from '../components/Password';
import InterceptMask from '../../../../components/interceptMask';
import '../../../main.scss';
import './ElementsCreate.scss';

const REPO_TYPE = ['harbor', 'chart'];

const { AppState } = stores;
const { Sidebar } = Modal;
const { Item: FormItem } = Form;
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

@injectIntl
@observer
class ElementsCreate extends Component {
  checkName = _.debounce(value => {
    console.log(value);
  }, 500);

  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      type: undefined,
    };
  }

  checkUrl = value => {
    console.log(value);
  };

  handleTypeChange = type => {
    this.setState({ type });
  };

  handleSubmit = () => {
  };

  handleClose = () => {
    this.props.onClose();
  };

  render() {
    const { name } = AppState.currentMenuType;
    const { form, visible, isEditMode, intl: { formatMessage } } = this.props;
    const { getFieldDecorator } = form;
    const { submitting, type } = this.state;

    const typeOption = _.map(REPO_TYPE, item => (
      <Option key={item}><FormattedMessage id={`elements.type.${item}`} /></Option>));

    return (
      <Sidebar
        destroyOnClose
        cancelText={<FormattedMessage id="cancel" />}
        okText={<FormattedMessage id={isEditMode ? 'testAndSave' : 'testAndCreate'} />}
        title={<FormattedMessage id={`elements.header.${isEditMode ? 'edit' : 'create'}`} />}
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleClose}
        confirmLoading={submitting}
      >
        <Content
          code="elements.create"
          values={{ name }}
          className="sidebar-content"
        >
          <Form layout="vertical">
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('type', {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'required' }),
                }],
              })(
                <Select
                  className="c7n-select_512"
                  label={<FormattedMessage id="elements.type.form" />}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  disabled={isEditMode}
                  onChange={this.handleTypeChange}
                >
                  {typeOption}
                </Select>,
              )}
            </FormItem>
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                // initialValue: initName,
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'required' }),
                  },
                  {
                    validator: this.checkName,
                  },
                ],
              })(
                <Input
                  type="text"
                  maxLength={30}
                  label={<FormattedMessage id="elements.name" />}
                />,
              )}
            </FormItem>
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('url', {
                // initialValue: initName,
                rules: [
                  {
                    required: true,
                    message: formatMessage({ id: 'required' }),
                  },
                  {
                    validator: this.checkUrl,
                  },
                ],
              })(
                <Input
                  type="text"
                  label={<FormattedMessage id="elements.url" />}
                />,
              )}
            </FormItem>
            {type === 'harbor' && <Fragment>
              <FormItem
                className="c7n-select_512"
                {...formItemLayout}
              >
                {getFieldDecorator('user', {
                  // initialValue: initName,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                    {
                      // validator: this.checkUrl,
                    },
                  ],
                })(
                  <Input
                    type="text"
                    label={<FormattedMessage id="elements.user" />}
                  />,
                )}
              </FormItem>
              <FormItem
                className="c7n-select_512 c7ncd-elements-password"
                {...formItemLayout}
              >
                {getFieldDecorator('password', {
                  // initialValue: initName,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'required' }),
                    },
                    {
                      // validator: this.checkUrl,
                    },
                  ],
                })(
                  <Password
                    type="password"
                    label={<FormattedMessage id="elements.password" />}
                  />,
                )}
              </FormItem>
            </Fragment>}
          </Form>
          <div className="c7ncd-elements-test">
            <Button>
              <FormattedMessage id="elements.test" />
            </Button>
          </div>
        </Content>
        <InterceptMask visible={submitting} />
      </Sidebar>
    );
  }
}

export default Form.create({})(ElementsCreate);
