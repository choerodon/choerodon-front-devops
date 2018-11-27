/**
 * hover 显示时间
 */
import React from 'react';
import { observer } from 'mobx-react';
import { Tooltip } from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils';

const TimePopoverRequiredProps = {
  title: PropTypes.node,
  content: PropTypes.string,
};

function TimePopover({ content, title, style }) {
  const timestamp = content && typeof content === 'string'
    ? Math.min(Date.now(), new Date(content.replace(/-/g, '/')).getTime())
    : false;
  return (<React.Fragment>
    {timestamp ? (<div style={style}>
      <Tooltip
        title={formatDate(timestamp)}
      >
        <TimeAgo
          datetime={timestamp}
          locale={Choerodon.getMessage('zh_CN', 'en')}
        />
      </Tooltip>
    </div>) : <div style={style}>
      <Tooltip
        title={formatDate(content)}
      >
        <TimeAgo
          datetime={content}
          locale={Choerodon.getMessage('zh_CN', 'en')}
        />
      </Tooltip>
    </div>}
  </React.Fragment>);
}

TimePopover.propTypes = TimePopoverRequiredProps;
export default observer(TimePopover);
