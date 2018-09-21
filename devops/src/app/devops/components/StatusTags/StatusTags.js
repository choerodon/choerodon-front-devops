import React, { Component } from 'react';
import './StatusTags.scss';

const Color = {
  success: '#00bf96',
  error: '#f44336',
};

class StatusTags extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !(nextProps.name === this.props.name
      && nextProps.color === this.props.color);
  }

  render() {
    const { name, color, colorCode } = this.props;
    return (
      <div
        className="c7n-status-tags"
        style={{
          background: color || Color[colorCode] || 'rgba(0, 0, 0, 0.28)',
          ...this.props.style,
        }}
      >
        <div>{ name || '' }</div>
      </div>
    );
  }
}
export default StatusTags;
