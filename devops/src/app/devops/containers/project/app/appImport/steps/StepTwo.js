import React, { Component, Fragment } from 'react';
import _ from "lodash";
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Form, Input, Select, Tooltip } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import '../AppImport.scss';

const FormItem = Form.Item;
const Option = Select.Option;
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
class StepTwo extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      template: '',
    }
  }

  componentDidMount() {
    const { store } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    store.loadSelectData(projectId);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { onNext } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.key = 'step1';
        values.template = this.state.template;
        onNext(values);
      }
    });
  };

  /**
   * 校验应用编码规则
   * @param rule
   * @param value
   * @param callback
   */
  checkCode = _.debounce((rule, value, callback) => {
    const { store, intl: { formatMessage } } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      store.checkCode(projectId, value)
        .then(data => {
          if (data && data.failed) {
            callback(formatMessage({ id: "template.checkCode" }));
          } else {
            callback();
          }
        });
    } else {
      callback(formatMessage({ id: "template.checkCodeReg" }));
    }
  }, 600);


  /**
   * 校验应用名称规则
   * @param rule
   * @param value
   * @param callback
   */
  checkName = _.debounce((rule, value, callback) => {
    const { store, intl: { formatMessage } } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const pa = /^\S+$/;
    if (value && pa.test(value)) {
      store.checkName(projectId, value)
        .then(data => {
          if (data && data.failed) {
            callback(formatMessage({ id: "template.checkName" }));
          } else {
            callback();
          }
        });
    } else {
      callback(formatMessage({ id: "template.checkName" }));
    }
  }, 600);

  onChange = (id) => {
    const { store: { selectData } } = this.props;
    const template = selectData.filter((e) => e.id === parseInt(id))[0].name;
    this.setState({ template })
  };

  hasErrors(fieldsError) { return Object.keys(fieldsError).some(field => fieldsError[field]);}

  hasValues(fieldsValue) { return Object.values(fieldsValue).some(field => field === ''); }

  render() {
    const { onPrevious, onCancel, form: { getFieldDecorator }, intl: { formatMessage }, values, store: { selectData } } = this.props;
    const { getFieldsError, getFieldsValue } = this.props.form;

    return (
      <Fragment>
        <div className="steps-content-des">
          <FormattedMessage id="app.import.step2.des" />
        </div>
        <div className="steps-content-section">
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('code', {
                rules: [
                  { required: true, message: formatMessage({ id: "app.import.code.required" }),  whitespace: true },
                  { validator: this.checkCode },
                ],
                initialValue: values.code || '',
              })(
                <Input
                  label={<FormattedMessage id="ciPipeline.appCode" />}
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: formatMessage({ id: "app.import.name.required" }),  whitespace: true },
                  { validator: this.checkName },
                ],
                initialValue: values.name || '',
              })(
                <Input
                  label={<FormattedMessage id="ciPipeline.appName" />}
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('applicationTemplateId', {
                rules: [{ required: true, message: formatMessage({ id: "app.import.template.required" }) }],
                initialValue: values.applicationTemplateId || '',
              })(
                <Select
                  filter
                  onChange={this.onChange}
                  label={<FormattedMessage id="app.chooseTem" />}
                  filterOption={(input, option) =>
                    option.props.children.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {selectData.map(s => (
                    <Option key={s.id}>
                      <Tooltip placement="right" title={s.description}>
                        {s.name}
                      </Tooltip>
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
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
                onClick={onPrevious}
                funcType="raised"
                className="ant-btn-cancel"
              >
                <FormattedMessage id="previous" />
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

export default Form.create({})(injectIntl(StepTwo));
