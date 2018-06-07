import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Form, Input, Popover } from 'choerodon-ui';
import { is, fromJS } from 'immutable';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};
@observer
export default class HideCharacter extends Component {
  static defaultProps = {
    initialValue: '******',
    required: true,
  };

  static propTypes = {
    name: React.PropTypes.string.isRequired, // 拼接的name
    /*eslint-disable*/
    form: React.PropTypes.object.isRequired, // form对象
    /* eslint-enable */
    initialValue: React.PropTypes.string,
    label: React.PropTypes.node,
    required: React.PropTypes.bool,
    code: React.PropTypes.string.isRequired,

  };
  constructor(props) {
    super(props);
    this.state = {
      addEvent: false,
    };
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (this.props.form.isFieldsTouched()) {
      return true;
    }
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    const nextPropss = fromJS(nextProps || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    // 传了props时才调用
    if (is(thisProps, nextPropss)) {
      return false;
    }

    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  }

  componentWillUpdate() {
    this.addEvent();
  }

  /**
   * 避免重复绑定事件
   * @param flag
   */
  changeAddEvent = (flag) => {
    this.setState({ addEvent: flag });
  }
  /**
   * 添加绑定事件
   */
  addEvent =() => {
    const { code } = this.props;
    const element = document.getElementById(code);
    const { addEvent } = this.state;
    if (element && !addEvent) {
      this.changeAddEvent(true);
      if (element.attachEvent) {
        element.attachEvent('onMouseDown', this.showEditPassword.bind(this, code));
        element.attachEvent('onMouseUp', this.showEditPassword.bind(this, ''));
      } else {
        element.addEventListener('mousedown', this.showEditPassword.bind(this, code));
        element.addEventListener('mouseup', this.showEditPassword.bind(this, ''));
      }
    }
  };

  /**
   * 切换状态
   * @param text 切换的组件
   */
  showEditPassword =(text) => {
    this.setState({ showChar: text });
  };

  /**
   * 清除输入框数据
   * @param code 要清除的输入框
   */
  clearInput =(code) => {
    this.setState({ clearChar: code });
  };

  render() {
    const { form, name, initialValue, label, required, code } = this.props;
    const getFieldDecorator = form.getFieldDecorator;
    const value = form.getFieldValue(name) || initialValue;
    const showChar = this.state.showChar;
    let icon = '';
    if (showChar === code) {
      icon = 'icon-visibility_off rightTab-input';
    }
    if (value) {
      icon = 'icon-visibility rightTab-input';
    }
    return (
      <FormItem
        {...formItemLayout}
        label={label}
      >
        {getFieldDecorator(name, {
          rules: [{
            required,
            message: Choerodon.getMessage('该字段是必输的', 'The field is required'),
          }],
          initialValue: this.state.clearChar ? '' : initialValue,
        })(
          <Input
            onFocus={this.clearInput.bind(this, code)}
            className="form-value"
            type={showChar === code ? 'text' : 'password'}
            size="default"
            suffix={<span
              id={code}
              role="none"
              className={icon}
            />}
          />,
        )}
      </FormItem>
    );
  }
}

