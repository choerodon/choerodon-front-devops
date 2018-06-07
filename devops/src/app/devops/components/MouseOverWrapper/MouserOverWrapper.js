/**
 * hover 显示全称
 */

import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui';
import PropTypes from 'prop-types';

export default class MouserOverWrapper extends Component {
  static PropTypes = {
    text: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
  };
  static defaultProps = {
    text: '',
  };
  chineseLength =(str) => {
    let len = 0;
    for (let i = 0; i < str.length; i += 1) {
      if (str.charCodeAt(i) >= 256) {
        len += 1;
      }
    }
    return len;
  };
  numberLength =(str) => {
    let len = 0;
    for (let i = 0; i < str.length; i += 1) {
      if (str.charCodeAt(i) >= 48 && str.charCodeAt(i) <= 57) {
        len += 1;
      }
    }
    return len;
  };
  render() {
    const { text, width, className, style } = this.props;
    const textStyle = {
      maxWidth: width,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    };
    let domWidth = 0;
    let len = 0;
    if (text) {
      if (typeof text === 'number') {
        len = text.toString().length;
      } else if (text === true) {
        len = 4;
      } else if (text === false) {
        len = 5;
      } else {
        len = text.length;
      }
    }
    if (text && len) {
      const chineselen = this.chineseLength(text) * 12;
      const numberlen = this.numberLength(text) * 8;
      const otherLen = (text.length - this.chineseLength(text) - this.numberLength(text)) * 8;
      domWidth = chineselen + numberlen + otherLen;
    }
    Object.assign(textStyle, style);
    if (text && domWidth <= width) {
      return <div style={textStyle} className={className}> {this.props.children}</div>;
    } else {
      return (<Tooltip title={text} placement="bottom" >
        <div style={textStyle} className={className}>
          {this.props.children}
        </div>
      </Tooltip>);
    }
  }
}
