import React from 'react';
import classNames from 'classnames';
import { Input, Icon } from 'choerodon-ui';

const ACTION_MAP = {
  click: 'onClick',
  hover: 'onMouseOver',
  // press: 'onMouseDown',
};

export default class Password extends React.Component {
  static defaultProps = {
    inputPrefixCls: 'ant-input',
    prefixCls: 'ant-input-password',
    action: 'click',
    visibilityToggle: true,
  };

  state = {
    visible: false,
  };

  onChange = (e) => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  getIcon() {
    const { prefixCls, action } = this.props;
    const iconTrigger = ACTION_MAP[action] || '';
    const iconProps = {
      [iconTrigger]: this.onChange,
      className: `${prefixCls}-icon`,
      type: this.state.visible ? 'visibility_off' : 'visibility',
      onMouseDown: e => {
        e.preventDefault();
      },
    };
    return <Icon {...iconProps} />;
  }

  render() {
    const { className, prefixCls, inputPrefixCls, size, suffix, visibilityToggle, ...restProps } = this.props;
    const suffixIcon = visibilityToggle && this.getIcon();
    const inputClassName = classNames(prefixCls, className, {
      [`${prefixCls}-${size}`]: !!size,
    });
    return (
      <Input
        {...restProps}
        type={this.state.visible ? 'text' : 'password'}
        size={size}
        className={inputClassName}
        prefixCls={inputPrefixCls}
        suffix={suffixIcon}
      />
    );
  }
}
