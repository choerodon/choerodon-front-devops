import React, { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Avatar, Pagination } from 'choerodon-ui';
import TimePopover from '../../../../components/timePopover';
import './Submission.scss';

export default function CommitHistory(props) {
  const { dataSource: { content } } = props;
  const list = content.map((item) => {
    const { id, userId, ref, commitContent, commitDate, commitUserUrl, commitSha } = item;
    return (
      <div className="c7n-report-history-item" key={id}>
        <Avatar size="small" src={commitUserUrl} />
        <div className="c7n-report-history-info">
          <div className="c7n-report-history-content">
            <a
              className="c7n-report-history-link"
              href={ref}
              rel="nofollow me noopener noreferrer"
              target="_blank"
            >{commitContent}</a>
          </div>
          <div className="c7n-report-history-date">
            <span className="c7n-report-history-name">{userId}</span>
            <FormattedMessage id="report.commit.by" /> <TimePopover style={{ display: 'inline-block' }} content={commitDate} />
          </div>
        </div>
      </div>
    );
  });
  return (<Fragment>
    <h3 className="c7n-report-history-title"><FormattedMessage id="report.commit.history" /></h3>
    <div className="c7n-report-history-list">{list}</div>
    <div className="c7n-report-history-page"><Pagination total={50} showSizeChanger={false} /></div>
  </Fragment>);
}
