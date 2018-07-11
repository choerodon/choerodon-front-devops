/**
 * hover 显示时间
 */

import React from 'react';
import { observer } from 'mobx-react';
import { Tooltip } from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import PropTypes from 'prop-types';

const TimePopoverRequiredProps = {
  title: PropTypes.node,
  content: PropTypes.string,
};

function TimePopover({ content, title, style }) {
  return (<div style={style}>
    <Tooltip
      title={content}
    >
      <TimeAgo
        datetime={content}
        locale={Choerodon.getMessage('zh_CN', 'en')}
      />
    </Tooltip>
  </div>);
}

TimePopover.propTypes = TimePopoverRequiredProps;
export default observer(TimePopover);
