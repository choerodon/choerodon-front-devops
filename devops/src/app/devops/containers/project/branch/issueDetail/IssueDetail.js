import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Modal, Form } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import '../../../main.scss';
import '../CreateBranch/CreateBranch.scss';
import '../commom.scss';

const { AppState } = stores;
const Sidebar = Modal.Sidebar;
@observer
class IssueDetail extends Component {
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

  handleClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  render() {
    const { visible, intl, store } = this.props;
    const issue = store.issue;
    return (
      <Sidebar
        title={<FormattedMessage
          id="branch.detailHead"
          values={{
            name: `${this.props.name}`,
          }}
        />}
        visible={visible}
        okText={<FormattedMessage id={'envPl.close'} />}
        okCancel={false}
        onOk={this.handleClose}
      >
        <div className="c7n-region c7n-branch-issue">
          <section className="branch-issue-name">
            <p>{issue.summary}</p>
          </section>
          <section className="branch-issue-status">
            <div className="issue-status"> <span className="icon icon-watch_later" style={{ color: issue.statusColor }} />
              <div>
                <div>{<FormattedMessage id={'network.column.status'} />}</div>
                <div>{issue.statusName}</div>
              </div>
            </div>
            <div className="issue-status"> <span className="icon icon-flag" style={{ color: issue.statusColor }} />
              <div>
                <div>{<FormattedMessage id={'branch.issue.priority'} />}</div>
                <div>{issue.priorityName}</div>
              </div>
            </div>
          </section>
          <section className="branch-issue-detail">
            <div className="issue-detail-head">
              <div>
                <span className="icon icon-error_outline" />{<FormattedMessage id={'detail'} />}</div>
              <div />
            </div>
            <div className="issue-detail-content">
              <div className="issue-detail-tr">
                <div className="issue-detail-td">
                  <span className="td-title">{<FormattedMessage id={'branch.issue.module'} />}</span>
                  <span className="td-text">{issue.statusColor}</span>
                </div>
                <div className="issue-detail-td">
                  <span className="td-title">{<FormattedMessage id={'branch.issue.type'} />}</span>
                  <span className="td-text">{issue.statusColor}</span>
                </div>
              </div>
              <div className="issue-detail-tr">
                <div className="issue-detail-td">
                  <span className="td-title">{<FormattedMessage id={'branch.issue.label'} />}</span>
                  <span className="td-text">{issue.statusColor}</span>
                </div>
                <div className="issue-detail-td">
                  <span className="td-title">{<FormattedMessage id={'branch.issue.creator'} />}</span>
                  <span className="td-text">{issue.reporterName}</span>
                </div>
              </div>
            </div>
          </section>
          <section className="branch-issue-description">
            <div className="issue-description-head">
              <div>
                <span className="icon icon-subject" />{<FormattedMessage id={'branch.issue.summary'} />}</div>
              <div />
            </div>
            <div>
              <span>{issue.description}</span>
            </div>
          </section>
        </div>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(injectIntl(IssueDetail)));
