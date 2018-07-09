import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Modal, Form, Radio, Input, Select, Tooltip } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import '../../../main.scss';
import '../CreateBranch/CreateBranch.scss';
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
        <div style={{ background: color, marginRight: 5 }} className="branch-issue"><i className={`icon icon-${icon}`} /></div>
        <span className="branch-issue-content">
          <span style={{ color: 'rgb(0,0,0,0.65)' }}>{s.issueNum}</span>
          <MouserOverWrapper style={{ display: 'inline-block', lineHeight: '12px' }} width={300} text={`   ${s.summary}`}>{`    ${s.summary}`}</MouserOverWrapper>
        </span>
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
    let isModify = false;
    const issueId = this.props.form.getFieldValue('issueId');
    if (!store.branch.issueId && issueId) {
      isModify = true;
    }
    this.props.form.validateFieldsAndScroll((err, data, modify) => {
      if ((!err && modify) || (isModify && !err)) {
        data.branchName = store.branch.branchName;
        this.setState({ submitting: true });
        store.updateBranchByName(projectId, appId, data)
          .then(() => {
            store.loadBranchData(projectId, store.app);
            this.props.onClose();
            this.props.form.resetFields();
            this.setState({ submitting: false });
          })
          .catch((error) => {
            Choerodon.prompt(error.response.data.message);
            this.setState({ submitting: false });
          });
      } else if (!modify) {
        this.props.form.resetFields();
        this.setState({ submitting: false });
        this.props.onClose();
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
  /**
   * 加载issue
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
    const issueInitValue = store.issueInitValue;
    const issue = store.issue.slice();
    const branch = store.branch;
    let issueId = branch && branch.issueId;
    if (branch && !issueId && issueInitValue && issue.length) {
      const issues = _.filter(issue, i => i.issueNum === issueInitValue);
      if (issues.length) {
        issueId = issues[0].issueId;
      }
    }
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
            <FormItem
              className="branch-formItem"
              {...formItemLayout}
            >
              {getFieldDecorator('issueId', {
                initialValue: this.props.store.branch ? issueId : undefined,
              })(
                <Select
                  onFilterChange={this.searchIssue}
                  onFocus={this.loadIssue}
                  loading={store.issueLoading}
                  key="service"
                  allowClear
                  label={<FormattedMessage id={'branch.issueName'} />}
                  filter
                  dropdownMatchSelectWidth
                  onSelect={this.selectTemplate}
                  size="default"
                  optionFilterProp="children"
                  filterOption={false}
                >
                  {issue.map(s => (
                    <Option
                      key={s.issueId}
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
