/* eslint-disable react/sort-comp */
import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { observable, action, configure } from 'mobx';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Tooltip, Form, Select, Collapse } from 'choerodon-ui';
import { Permission, Header, Page, Action, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import '../EnvOverview.scss';
import '../../../main.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const { AppState } = stores;

@observer
class LogOverview extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  /**
   * table 操作
   * @param pagination
   */
  tableChange =(pagination) => {
    const { store, envId } = this.props;
    const { id } = AppState.currentMenuType;
    const page = pagination.current - 1;
    store.loadLog(id, envId, page, pagination.pageSize);
  };


  render() {
    const { store } = this.props;
    const log = store.getLog;
    const sync = store.getSync;

    const columns = [{
      title: <FormattedMessage id={'envoverview.logs.info'} />,
      key: 'message',
      render: record => (<MouserOverWrapper text={record.message || ''} width={0.7}>
        {record.name}</MouserOverWrapper>),
    }, {
      title: <FormattedMessage id={'envoverview.logs.file'} />,
      key: 'filePath',
      dataIndex: 'filePath',
    }, {
      title: <FormattedMessage id={'version.commit'} />,
      key: 'envName',
      render: record => (
        <Fragment>
          <span className="icon icon-point branch-column-icon" />
          <a href={record.commitUrl} target="_blank" rel="nofollow me noopener noreferrer">
            <span>{record.commitSha && record.commitSha.slice(0, 8) }</span>
          </a>
        </Fragment>
      ),
    }];


    return (<div>
      <div className="c7n-envow-sync-wrap">
        <div className="c7n-envow-sync-title">
          <FormattedMessage id={'envoverview.commit.sync'} />
        </div>
        <div className="c7n-envow-sync-line">
          <div className="c7n-envow-sync-card">
            <div className="c7n-envow-sync-step">GitLab</div>
            <div className="c7n-envow-sync-commit">
              <a href={sync && `${sync.commitUrl}${sync.gitCommit}`} target="_blank" rel="nofollow me noopener noreferrer">
                {sync && (sync.gitCommit ? sync.gitCommit.slice(0, 8) : null)}
              </a>
            </div>
          </div>
          <div className="c7n-envow-sync-arrow">
            <div>→</div>
          </div>
          <div className="c7n-envow-sync-card">
            <div className="c7n-envow-sync-step"><FormattedMessage id={'envoverview.analysis'} /></div>
            <div className="c7n-envow-sync-commit">
              <a href={sync && `${sync.commitUrl}${sync.devopsSyncCommit}`} target="_blank" rel="nofollow me noopener noreferrer">
                {sync && (sync.devopsSyncCommit ? sync.devopsSyncCommit.slice(0, 8) : null)}
              </a>
            </div>
          </div>
          <div className="c7n-envow-sync-arrow">
            <div>→</div>
          </div>
          <div className="c7n-envow-sync-card">
            <div className="c7n-envow-sync-step">Agent</div>
            <div className="c7n-envow-sync-commit">
              <a href={sync && `${sync.commitUrl}${sync.agentSyncCommit}`} target="_blank" rel="nofollow me noopener noreferrer">
                {sync && (sync.agentSyncCommit ? sync.agentSyncCommit.slice(0, 8) : null)}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="c7n-envow-sync-title">
        <FormattedMessage id={'envoverview.logs.err'} />
      </div>
      <Table
        filterBar={false}
        loading={store.loading}
        pagination={store.getPageInfo}
        columns={columns}
        onChange={this.tableChange}
        dataSource={log}
        rowKey={record => record.id}
      />
    </div>);
  }
}

export default Form.create({})(withRouter(injectIntl(LogOverview)));
