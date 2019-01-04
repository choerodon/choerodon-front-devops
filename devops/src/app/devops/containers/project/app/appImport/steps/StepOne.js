import React, { Component, Fragment } from 'react';
import _ from "lodash";
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Radio, Form, Input } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import '../AppImport.scss';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { AppState } = stores;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

@observer
class StepOne extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      platformType: this.props.values.platformType || 'github',
      accessToken: undefined,
      repositoryUrl: undefined,
    }
  }

  /**
   * 检查编码是否合法
   * @param rule
   * @param value
   * @param callback
   */
  checkUrl = _.debounce((rule, value, callback) => {
    const { store, intl: { formatMessage }, values } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { platformType, accessToken } = this.state;
    const reg = /^(https?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/;
    if (value && reg.test(value) && value.indexOf('.git') !== -1) {
      const token = platformType === 'gitlab' ? accessToken || values.accessToken : null;
      store.checkUrl(projectId, platformType, value, token)
        .then((error) => {
          if (error === false) {
            callback(formatMessage({ id: 'app.import.url.err1' }));
          } else if (error === null) {
            callback(formatMessage({ id: 'app.import.url.null' }));
          } else {
            callback();
          }
        });
    } else if (value && (!reg.test(value) || value.indexOf('.git') === -1)) {
      callback(formatMessage({ id: 'app.import.url.err' }));
    } else {
      callback();
    }
  }, 600);

  handleSubmit = (e) => {
    e.preventDefault();
    const { onNext } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.key = 'step0';
        values.platformType = this.state.platformType;
        onNext(values);
      }
    });
  };

  fromItem() {
    const { platformType } = this.state;
    const { form: { getFieldDecorator }, intl: { formatMessage }, values } = this.props;
    if (platformType === 'github') {
      return (<Fragment>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('repositoryUrl', {
            rules: [
              { required: true, message: formatMessage({ id: "app.import.repo.required" }), whitespace: true },
              { validator: this.checkUrl },
              ],
            initialValue: values.repositoryUrl || '',
          })(
            <Input
              label={<FormattedMessage id="app.import.github" />}
            />
          )}
        </FormItem>
      </Fragment>);
    } else if (platformType === 'gitlab') {
      return (<Fragment>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('repositoryUrl', {
            rules: [
              { required: true, message: formatMessage({ id: "app.import.repo.required" }), whitespace: true },
              { validator: this.checkUrl },
            ],
            initialValue: values.repositoryUrl || '',
          })(
            <Input
              onChange={this.onUrlChange}
              label={<FormattedMessage id="app.import.gitlab" />}
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          validateStatus="success"
        >
          {getFieldDecorator('accessToken', {
            rules: [
              { message: formatMessage({ id: "app.import.token.required" }), whitespace: true },
            ],
            initialValue: values.accessToken || '',
          })(
            <Input
              onChange={this.onTokenChange.bind(this)}
              label={<FormattedMessage id="app.import.token" />}
            />
          )}
        </FormItem>
      </Fragment>);
    }
  }

  onChange = (e) => {
    this.props.form.resetFields();
    this.setState({
      platformType: e.target.value,
      accessToken: undefined,
      repositoryUrl: undefined,
    });
  };

  onUrlChange = (e) => {
    this.setState({
      repositoryUrl: e.target.value,
    });
  };

  onTokenChange = (e) => {
    const { values } = this.props;
    this.setState({
      accessToken: e.target.value,
    });
    this.props.form.setFieldsValue({
      repositoryUrl: values.repositoryUrl || this.state.repositoryUrl,
    });
  };

  hasErrors(fieldsError) { return Object.keys(fieldsError).some(field => fieldsError[field]) }

  hasValues(fieldsValue) { return fieldsValue.repositoryUrl === '' }

  render() {
    const { onCancel } = this.props;
    const { platformType } = this.state;
    const { getFieldsError, getFieldsValue } = this.props.form;

    return (
      <Fragment>
        <div className="steps-content-des">
          <FormattedMessage id="app.import.step1.des" />
        </div>
        <div className="steps-content-section">
          <RadioGroup label={<FormattedMessage id="template.type" />} onChange={this.onChange.bind(this)} value={platformType}>
            <Radio value="github">GitHub</Radio>
            <Radio value="gitlab">GitLab</Radio>
          </RadioGroup>
        </div>
        <div className="steps-content-section">
          <Form onSubmit={this.handleSubmit}>
            {this.fromItem()}
            <FormItem>
              <Button
                type="primary"
                funcType="raised"
                htmlType="submit"
                disabled={this.hasErrors(getFieldsError()) || this.hasValues(getFieldsValue())}
              >
                <FormattedMessage id="next" />
              </Button>
              <Button
                onClick={onCancel}
                funcType="raised"
                className="ant-btn-cancel"
              >
                <FormattedMessage id="cancel" />
              </Button>
            </FormItem>
          </Form>
        </div>
      </Fragment>
    )
  }
}

export default Form.create({})(injectIntl(StepOne));
