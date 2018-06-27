import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Form, Radio, Input } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import '../../../../main.scss';
import './CreateBranch.scss';

const { AppState } = stores;
const Sidebar = Modal.Sidebar;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
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

class CreateBranch extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      name: 'feature',
      value: '',
      projectId: menu.id,
      submitting: false,
      initValue: null,
    };
  }

  /**
   * 单选框值发生变化
   * @param e
   */
  onChange = (e) => {
    const { store, appId } = this.props;
    const projectId = this.state.projectId;
    this.props.form.resetFields();
    this.setState({
      name: e.target.value,
    });
    if (e.target.value === 'hotfix') {
      this.setState({
        name: e.target.value,
        initValue: null,
      });
    } else if (e.target.value === 'release') {
      this.setState({
        initValue: store.releaseLatestVersion,
      });
    } else {
      this.setState({
        initValue: null,
      });
    }
  };

  /**
   * 提交分支数据
   * @param e
   */
  handleOk = (e) => {
    e.preventDefault();
    const { store, appId } = this.props;
    const { projectId, name } = this.state;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const postData = `${name}-${data.name}`;
        this.setState({ submitting: true });
        store.createBranch(projectId, appId, postData)
          .then(() => {
            this.props.onClose();
            this.props.form.resetFields();
            this.setState({ submitting: false, initValue: null });
          })
          .catch((error) => {
            Choerodon.prompt(error.response.data.message);
            this.setState({ submitting: false });
          });
      }
    });
  };
  /**
   * 验证分支名的正则
   * @param rule
   * @param value
   * @param callback
   */
  checkName =(rule, value, callback) => {
    // eslint-disable-next-line no-useless-escape
    const endWith = /(\/|\.|\.lock)$/;
    const contain = /(\s|~|\^|:|\?|\*|\[|\\|\.\.|@\{|\/{2,}){1}/;
    const single = /^@+$/;
    const p = /^(\d{1,3}\.\d{1,3}\.\d{1,3})$/;
    if (this.state.name === 'release') {
      const { intl } = this.props;
      if (p.test(value)) {
        callback();
      } else {
        callback(intl.formatMessage({ id: 'branch.checkName' }));
      }
    } else {
      const { intl } = this.props;
      if (endWith.test(value)) {
        callback(intl.formatMessage({ id: 'branch.checkNameEnd' }));
      } else if (contain.test(value) || single.test(value)) {
        callback(intl.formatMessage({ id: 'branch.check' }));
      } else {
        callback();
      }
    }
  };

  handleClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, intl } = this.props;
    const menu = AppState.currentMenuType;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '20px',
      color: '#000',
    };
    return (
      <Sidebar
        title={<FormattedMessage id="branch.create" />}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleClose}
        okText={<FormattedMessage id="create" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={this.state.submitting}
      >
        <div className="c7n-region c7n-createBranch">
          <h2 className="c7n-space-first">
            <FormattedMessage
              id="branch.createHead"
              values={{
                name: `${this.props.name}`,
              }}
            />
          </h2>
          <p>
            <FormattedMessage id="branch.createDes" />
            <a href={intl.formatMessage({ id: 'branch.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                <FormattedMessage id="learnmore" />
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          <span className="c7n-title"><FormattedMessage id="branch.branchType" /></span>
          <RadioGroup onChange={this.onChange} value={this.state.name}>
            <Radio style={radioStyle} value={'feature'}>{intl.formatMessage({ id: 'create' })}{intl.formatMessage({ id: 'branch.feature' })}</Radio>
            <Radio style={radioStyle} value={'release'}>{intl.formatMessage({ id: 'create' })}{intl.formatMessage({ id: 'branch.release' })}</Radio>
            <Radio style={radioStyle} value={'hotfix'}>{intl.formatMessage({ id: 'create' })}{intl.formatMessage({ id: 'branch.hotfix' })}</Radio>
          </RadioGroup>
          <Form layout="vertical" onSubmit={this.handleOk} className="c7n-sidebar-form">
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage({ id: 'required' }),
                }, {
                  validator: this.checkName,
                }],
                initialValue: this.state.initValue,
              })(
                <Input
                  autoFocus
                  prefix={`${this.state.name}-`}
                  maxLength={30}
                />,
              )}
            </FormItem>
          </Form>
        </div>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(injectIntl(CreateBranch)));
