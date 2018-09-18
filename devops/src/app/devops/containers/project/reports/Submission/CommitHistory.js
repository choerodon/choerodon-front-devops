import React, { Component, Fragment } from 'react';
import { Avatar, Pagination } from 'choerodon-ui';
import TimePopover from '../../../../components/timePopover';
import './Submission.scss';

export default function CommitHistory(props) {
  const { dataSource } = props;
  const list = dataSource.map((item) => {
    const { commitUrl, commitContent, commitDate, commitUserName, commitsId, commitUserUrl } = item;
    return (
      <div className="c7n-report-history-item" key={commitsId}>
        <Avatar size="small" src={commitUserUrl} />
        <div className="c7n-report-history-info">
          <div className="c7n-report-history-content">
            <a href={commitUrl} rel="nofollow me noopener noreferrer" target="_blank">{commitContent}</a>
          </div>
          <div className="c7n-report-history-date">{commitUserName}<TimePopover style={{ display: 'inline-block' }} content={commitDate} /></div>
        </div>
      </div>
    );
  });
  return (<Fragment>
    <h3 className="c7n-report-history-title">提交历史</h3>
    <div className="c7n-report-history-list">{list}</div>
    <Pagination total={50} showSizeChanger={false} />
  </Fragment>);
}
