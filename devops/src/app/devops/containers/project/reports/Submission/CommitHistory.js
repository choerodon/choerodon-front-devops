import React, { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Avatar, Pagination } from 'choerodon-ui';
import TimePopover from '../../../../components/timePopover';
import './Submission.scss';

export default function CommitHistory(props) {
  const { dataSource: { content, totalElements }, onPageChange } = props;
  let list = [];
  if (content) {
    list = content.map((item) => {
      const { id, userName, ref, commitContent, commitDate, imgUrl, appId } = item;
      return (
        <div className="c7n-report-history-item" key={commitDate}>
          <Avatar size="small" src={imgUrl} />
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
              <span className="c7n-report-history-name">{userName}</span><span>（{appId}）</span>
              <FormattedMessage id="report.commit.by" /> <TimePopover style={{ display: 'inline-block' }} content={commitDate} />
            </div>
          </div>
        </div>
      );
    });
  }
  return (<Fragment>
    <h3 className="c7n-report-history-title"><FormattedMessage id="report.commit.history" /></h3>
    <div className="c7n-report-history-list">{list}</div>
    <div className="c7n-report-history-page">
      {totalElements ? (<Pagination
        total={totalElements || 0}
        defaultCurrent={1}
        pageSize={5}
        tiny={false}
        showTotal={false}
        showSizeChanger={false}
        onChange={onPageChange}
      />) : null}
    </div>
  </Fragment>);
}
