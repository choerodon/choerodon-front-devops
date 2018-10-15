import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui';
import './StatusTags.scss';

const Color = {
  success: '#00bf96',
  error: '#f44336',
  failed: '#f44336',
};

class StatusTags extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !(nextProps.name === this.props.name
      && nextProps.color === this.props.color);
  }

  render() {
    const { name, color, colorCode, style, ellipsis } = this.props;
    return (
      <div
        className="c7n-status-tags"
        style={{
          background: color || Color[colorCode] || 'rgba(0, 0, 0, 0.28)',
          ...style,
        }}
      >
        <div style={ellipsis || {}}>
          <Tooltip title={ellipsis ? (name || '') : ''}>
            { name || '' }
          </Tooltip>
        </div>
      </div>
    );
  }
}
export default StatusTags;
