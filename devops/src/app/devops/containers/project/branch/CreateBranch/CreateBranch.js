import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Modal, Form, Radio, Input, Select, Tooltip } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import '../../../main.scss';
import './CreateBranch.scss';
import '../commom.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

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
        <div style={{ background: color, marginRight: 5 }} className="branch-issue"><i className={`icon icon-${icon}`} /></div>
      </Tooltip>
      <span className="branch-issue-content">
        <span style={{ color: 'rgb(0,0,0,0.65)' }}>{s.issueNum}</span>
        <MouserOverWrapper style={{ display: 'inline-block', lineHeight: '12px' }} width={320} text={`    ${s.summary}`}>{`    ${s.summary}`}</MouserOverWrapper>
      </span>
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
        postData.branchName = type && type !== 'custom' ? `${type}-${data.branchName}` : data.branchName;
        this.setState({ submitting: true });
        store.createBranch(projectId, appId, postData)
          .then(() => {
            store.loadBranchData(projectId, this.props.appId);
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
      type = `${value}`;
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
    const { store } = this.props;
    const issue = store.issue.slice();
    const issueDto = _.filter(issue, i => i.issueId === value)[0];
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
    this.setState({ type, issueDto });
  };
  /**
   * 加载issues
   */
  loadIssue = () => {
    const { store } = this.props;
    store.loadIssue(this.state.projectId, '');
  };
  /**
   * 搜索issue
   * @param input
   * @param options
   */
  searchIssue = (input, options) => {
    const { store } = this.props;
    store.loadIssue(this.state.projectId, input);
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
            <FormItem
              className="branch-formItem"
              {...formItemLayout}
            >
              {getFieldDecorator('issueId')(
                <Select
                  onFilterChange={this.searchIssue}
                  onFocus={this.loadIssue}
                  loading={store.issueLoading}
                  onSelect={this.changeIssue}
                  key="service"
                  allowClear
                  label={<FormattedMessage id={'branch.issueName'} />}
                  filter
                  dropdownMatchSelectWidth
                  size="default"
                  optionFilterProp="children"
                  filterOption={false}
                >
                  {issue.map(s => (
                    <Option value={s.issueId} key={s.typeCode}>
                      {this.getOptionContent(s)}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
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
                      option.props.children[1]
                        .toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <OptGroup label={intl.formatMessage({ id: 'branch.branch' })} key="proGroup">
                    {branches.map(s => (
                      <Option value={s.name} key={s.name}><span className="icon icon-branch c7n-branch-formItem-icon" />{s.name}</Option>
                    ))}
                  </OptGroup>
                  <OptGroup label={intl.formatMessage({ id: 'branch.tag' })} key="pubGroup">
                    {tags.map(s => (
                      <Option value={s.name} key={s.name}><span className="icon icon-local_offer c7n-branch-formItem-icon" />{s.name}</Option>
                    ))}
                  </OptGroup>
                </Select>,
              )}
            </FormItem>
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
                initialValue: this.state.issueDto ? this.state.issueDto.issueNum : '',
              })(
                <Input
                  label={<FormattedMessage id={'branch.name'} />}
                  prefix={`${this.state.type === 'custom' ? '' : `${this.state.type}-`}`}
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
