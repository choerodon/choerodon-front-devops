import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Modal, Form, Radio, Input, Select, Tooltip } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import '../../../main.scss';
import '../CreateBranch/CreateBranch.scss';
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
class EditBranch extends Component {
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

  componentDidMount() {
    const { store } = this.props;
    store.loadIssue();
  }
  /**
   * 获取issue的正文
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
        <span className="branch-issue-content"><span>{s.issueNum}</span>{s.summary}</span>
      </Tooltip>
    </span>);
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
    this.props.form.validateFieldsAndScroll((err, data, modify) => {
      if (!err && modify) {
        data.branchName = store.branch.branchName;
        this.setState({ submitting: true });
        store.updateBranchByName(projectId, appId, data)
          .then(() => {
            this.props.onClose();
            this.props.form.resetFields();
            this.setState({ submitting: false });
          })
          .catch((error) => {
            Choerodon.prompt(error.response.data.message);
            this.setState({ submitting: false });
          });
      } else if (!modify) {
        this.props.onClose();
        this.props.form.resetFields();
        this.setState({ submitting: false });
      }
    });
  };

  /**
   * 关闭弹框
   */
  handleClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };


  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, intl, store } = this.props;
    const issue = store.issue.slice();
    return (
      <Sidebar
        title={<FormattedMessage id="branch.edit" />}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleClose}
        okText={<FormattedMessage id="save" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={this.state.submitting}
      >
        <div className="c7n-region c7n-createBranch">
          <h2 className="c7n-space-first">
            <FormattedMessage
              id="branch.editHead"
              values={{
                name: `${this.props.store.branch && this.props.store.branch.branchName}`,
              }}
            />
          </h2>
          <p>
            <FormattedMessage id="branch.editDes" />
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
              {getFieldDecorator('issueId', {
                initialValue: this.props.store.branch ? this.props.store.branch.issueId : undefined,
              })(
                <Select
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
                    <Option
                      value={s.issueId}
                    >
                      {this.getOptionContent(s)}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          </Form>
        </div>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(injectIntl(EditBranch)));
