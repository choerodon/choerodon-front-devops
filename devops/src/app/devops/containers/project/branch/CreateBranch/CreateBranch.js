import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Modal, Form, Radio, Input, Select, Tooltip } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import '../../../main.scss';
import './CreateBranch.scss';
import '../commom.scss';

const { AppState } = stores;
const Sidebar = Modal.Sidebar;
const { Option, OptGroup } = Select;
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
@observer
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
      type: 'custom',
    };
  }

  componentDidMount() {
    const { store } = this.props;
    store.loadIssue();
  }

  /**
   * 获取issue正文
   * @param s
   * @returns {*}
   */
  getOptionContent =(s) => {
    const { formatMessage } = this.props.intl;
    let mes = '';
    let icon = '';
    let color = '';
    switch (s.typeCode) {
      case 'story':
        mes = formatMessage({ id: 'branch.issue.story' });
        icon = 'turned_in';
        color = '#00bfa5';
        break;
      case 'bug':
        mes = formatMessage({ id: 'branch.issue.bug' });
        icon = 'bug_report';
        color = '#f44336';
        break;
      case 'issue_epic':
        mes = formatMessage({ id: 'branch.issue.epic' });
        icon = 'priority';
        color = '#743be7';
        break;
      case 'sub_task':
        mes = formatMessage({ id: 'branch.issue.subtask' });
        icon = 'relation';
        color = '#4d90fe';
        break;
      default:
        mes = formatMessage({ id: 'branch.issue.task' });
        icon = 'assignment';
        color = '#4d90fe';
    }
    return (<span>
      <Tooltip title={mes}>
        <div style={{ background: color }} className="branch-issue"><i className={`icon icon-${icon}`} /></div>
      </Tooltip>
      <span className="branch-issue-content">{`${s.issueNum}    ${s.summary}`}</span>
    </span>);
  };
  /**
   * 获取列表的icon
   * @param type 分支类型
   * @returns {*}
   */
  getIcon =(name) => {
    let icon;
    let type;
    if (name) {
      type = name.split('-')[0];
    }
    switch (type) {
      case 'feature':
        icon = <span className="c7n-branch-icon icon-feature">F</span>;
        break;
      case 'bugfix':
        icon = <span className="c7n-branch-icon icon-develop">B</span>;
        break;
      case 'hotfix':
        icon = <span className="c7n-branch-icon icon-hotfix">H</span>;
        break;
      case 'master':
        icon = <span className="c7n-branch-icon icon-master">M</span>;
        break;
      case 'release':
        icon = <span className="c7n-branch-icon icon-release">R</span>;
        break;
      default:
        icon = <span className="c7n-branch-icon icon-custom">C</span>;
    }
    return icon;
  };
  /**
   * 提交分支数据
   * @param e
   */
  handleOk = (e) => {
    e.preventDefault();
    const { store } = this.props;
    const appId = store.app;
    const { projectId, type } = this.state;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const postData = data;
        postData.branchName = type ? `${type}-${data.branchName}` : data.branchName;
        this.setState({ submitting: true });
        store.createBranch(projectId, appId, postData)
          .then(() => {
            this.props.onClose();
            this.props.form.resetFields();
            this.setState({ submitting: false });
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
    const { intl } = this.props;
    if (endWith.test(value)) {
      callback(intl.formatMessage({ id: 'branch.checkNameEnd' }));
    } else if (contain.test(value) || single.test(value)) {
      callback(intl.formatMessage({ id: 'branch.check' }));
    } else {
      callback();
    }
  };
  /**
   * 关闭弹框
   */
  handleClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };
  /**
   * 切换分支类型
   * @param value
   */
  changeType =(value) => {
    let type = '';
    if (value !== 'custom') {
      type = `${value}-`;
    }
    this.setState({ type });
  };
  /**
   * 切换issue
   * @param value
   * @param options
   */
  changeIssue =(value, options) => {
    const key = options.key;
    let type = '';
    switch (key) {
      case 'story':
        type = 'feature';
        break;
      case 'bug':
        type = 'bugfix';
        break;
      case 'issue_epic':
        type = 'custom';
        break;
      case 'sub_task':
        type = 'custom';
        break;
      default:
        type = 'custom';
    }
    this.setState({ type });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, intl, store } = this.props;
    const issue = store.issue.slice();
    const branches = store.branchData.slice();
    const tags = store.tagData.slice();
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
          <Form layout="vertical" onSubmit={this.handleOk} className="c7n-sidebar-form">
            <div className="branch-formItem-icon">
              <span className="icon icon-assignment" />
            </div>
            <FormItem
              className="branch-formItem"
              {...formItemLayout}
            >
              {getFieldDecorator('issueId')(
                <Select
                  onChange={this.changeIssue}
                  key="service"
                  allowClear
                  label={<FormattedMessage id={'branch.issueName'} />}
                  filter
                  dropdownMatchSelectWidth
                  onSelect={this.selectTemplate}
                  size="default"
                  optionFilterProp="children"
                  filterOption={
                    (input, option) =>
                      option.props.children.props.children[1].props.children
                        .toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {issue.map(s => (
                    <Option value={s.issueId} key={s.typeCode}>
                      {this.getOptionContent(s)}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <div className="branch-formItem-icon">
              <span className="icon icon-wrap_text" />
            </div>
            <FormItem
              className="branch-formItem"
              {...formItemLayout}
            >
              {getFieldDecorator('originBranch', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage({ id: 'required' }),
                }],
                initialValue: this.state.initValue,
              })(
                <Select
                  key="service"
                  allowClear
                  label={<FormattedMessage id={'branch.source'} />}
                  filter
                  dropdownMatchSelectWidth
                  onSelect={this.selectTemplate}
                  size="default"
                  optionFilterProp="children"
                  filterOption={
                    (input, option) =>
                      option.props.children
                        .toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <OptGroup label={intl.formatMessage({ id: 'branch.branch' })} key="proGroup">
                    {branches.map(s => (
                      <Option value={s.name}>{s.name}</Option>
                    ))}
                  </OptGroup>
                  <OptGroup label={intl.formatMessage({ id: 'branch.tag' })} key="pubGroup">
                    {tags.map(s => (
                      <Option value={s.name}>{s.name}</Option>
                    ))}
                  </OptGroup>
                </Select>,
              )}
            </FormItem>
            <div className="branch-formItem-icon">
              <span className="icon icon-branch" />
            </div>
            <FormItem
              className={'c7n-formItem_180'}
              {...formItemLayout}
            >
              {getFieldDecorator('type', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: intl.formatMessage({ id: 'required' }),
                }],
                initialValue: this.state.type,
              })(
                <Select
                  onChange={this.changeType}
                  key="service"
                  allowClear
                  label={<FormattedMessage id={'branch.type'} />}
                  filter
                  dropdownMatchSelectWidth
                  onSelect={this.selectTemplate}
                  size="default"
                  optionFilterProp="children"
                  filterOption={false}
                >
                  {['feature', 'bugfix', 'release', 'hotfix', 'custom'].map(s => (
                    <Option value={s} key={s}>{this.getIcon(s)}<span>{s}</span></Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem
              className="c7n-formItem_281"
              {...formItemLayout}
            >
              {getFieldDecorator('branchName', {
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
                  label={<FormattedMessage id={'branch.name'} />}
                  autoFocus
                  prefix={`${this.state.type === 'custom' ? '' : `${this.state.type}-`}`}
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
