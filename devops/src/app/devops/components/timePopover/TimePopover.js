/**
 * hover 显示时间
 */

import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Popover } from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import PropTypes from 'prop-types';

const TimePopoverRequiredProps = {
  title: PropTypes.node,
  content: PropTypes.string,
};

function TimePopover({ content, title }) {
  return (<div>
    <Popover
      // rowKey={content}
      title={title}
      content={content}
      // getPopupContainer={triggerNode => triggerNode.parentNode}
      placement="bottom"
    >
      <TimeAgo
        datetime={content}
        locale={Choerodon.getMessage('zh_CN', 'en')}
      />
    </Popover>
  </div>);
}

TimePopover.propTypes = TimePopoverRequiredProps;
export default observer(TimePopover);
