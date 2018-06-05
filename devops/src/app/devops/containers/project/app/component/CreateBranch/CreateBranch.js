import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Modal, Form, DatePicker, Button, Select, Radio, Input } from 'choerodon-ui';
import '../../../../main.scss';
import './CreateBranch.scss';

const Sidebar = Modal.Sidebar;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;
const PLACEHOLDER = {
  feature: '输入Issue号',
  release: '',
  hotfix: '输入Hotfix号',
};
const FormItem = Form.Item;
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
@inject('AppState')
class CreateBranch extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
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
    const p = /^([1-9]{1,3}\.\d{1,3}\.\d{1,3})$/;
    if (endWith.test(value)) {
      callback('不能以"/"、"."、".lock"结尾');
    } else if (contain.test(value) || single.test(value)) {
      callback("只能包含字母、数字、'——'、'_'");
    } else if (this.state.name === 'release') {
      if (p.test(value)) {
        callback();
      } else {
        callback('名称只能包含数字和".",并且以数字开头和结尾');
      }
    } else {
      callback();
    }
  };

  handleClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, onClose, onOk } = this.props;
    const menu = this.props.AppState.currentMenuType;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '20px',
      color: '#000',
    };
    return (
      <Sidebar
        title={'创建分支'}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleClose}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.submitting}
      >
        <div className="c7n-region c7n-createBranch">
          <h2 className="c7n-space-first">在应用&quot;{this.props.name}&quot;中创建分支</h2>
          <p>
            采用Gitflow工作流模式，请在下面选择分支类型，并填写issue号或版本号，即可创建分支。
            <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/branch-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
              了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          <span className="c7n-title">分支类型</span>
          <RadioGroup onChange={this.onChange} value={this.state.name}>
            <Radio style={radioStyle} value={'feature'}>创建feature分支</Radio>
            <Radio style={radioStyle} value={'release'}>创建release分支</Radio>
            <Radio style={radioStyle} value={'hotfix'}>创建hotfix分支</Radio>
          </RadioGroup>
          <Form layout="vertical" onSubmit={this.handleOk} className="c7n-sidebar-form">
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                }, {
                  validator: this.checkName,
                }],
                initialValue: this.state.initValue,
              })(
                <Input
                  autoFocus
                  prefix={`${this.state.name}-`}
                  // readOnly={this.state.name === 'release' && !this.state.initValue}
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
export default Form.create({})(withRouter(CreateBranch));
