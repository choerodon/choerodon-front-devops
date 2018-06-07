/**
 * hover 显示时间
 */

import React from 'react';
import { observer } from 'mobx-react';
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
      title={title}
      content={content}
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
