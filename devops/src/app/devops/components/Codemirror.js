/*eslint-disable*/
/**
 * Created by jaywoods on 2017/7/3.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import codemirror from 'codemirror';
import { debounce, isEqual } from 'lodash';
import className from 'classnames';

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, '\n');
}

class CodeMirror extends Component {
  static defaultProps = {
    preserveScrollPosition: false,
  };

  constructor(props) {
    super(props);
    this.codemirrorValueChanged = this.codemirrorValueChanged.bind(this);
    this.scrollChanged = this.scrollChanged.bind(this);
    this.cursorActivity = this.cursorActivity.bind(this);
    this.focusChanged = this.focusChanged.bind(this);
    this.state = {
      isFocused: false,
    };
  }

  componentDidMount() {
    this.componentWillReceiveProps = debounce(this.componentWillReceiveProps, 0);
    // if (this.props.path) {
    //   console.error('Warning: react-codemirror: the `path` prop has been changed to `name`');
    // }
  }

  componentDidMount() {
    const codeMirrorInstance = this.getCodeMirrorInstance();
    this.codeMirror = codeMirrorInstance.fromTextArea(this.textareaNode, this.props.options);
    this.codeMirror.on('change', this.codemirrorValueChanged);
    this.codeMirror.on('cursorActivity', this.cursorActivity);
    this.codeMirror.on('focus', this.focusChanged.bind(this, true));
    this.codeMirror.on('blur', this.focusChanged.bind(this, false));
    this.codeMirror.on('scroll', this.scrollChanged);
    this.codeMirror.setValue(this.props.defaultValue || this.props.value || '');
  }

  componentWillReceiveProps(nextProps) {
    if (this.codeMirror && nextProps.value !==
      undefined && normalizeLineEndings(this.codeMirror.getValue()) !==
      normalizeLineEndings(nextProps.value)) {
      if (this.props.preserveScrollPosition) {
        const prevScrollPosition = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(nextProps.value);
        this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else {
        this.codeMirror.setValue(nextProps.value);
      }
    }
    if (typeof nextProps.options === 'object') {
      const optionName = nextProps.options;
      for (let i = 0; i < optionName.length; i += 1) {
        if (optionName.hasOwnProperty.call(optionName, optionName[i])) {
          this.setOptionIfChanged(optionName[i], optionName[optionName[i]]);
        }
      }
    }
  }


  componentWillUnmount() {
    // is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  getCodeMirrorInstance() {
    return this.props.codeMirrorInstance || codemirror;
  }

  setOptionIfChanged(optionName, newValue) {
    const oldValue = this.codeMirror.getOption(optionName);
    if (!isEqual(oldValue, newValue)) {
      this.codeMirror.setOption(optionName, newValue);
    }
  }

  getCodeMirror() {
    return this.codeMirror;
  }

  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  }

  focusChanged(focused) {
    this.setState({
      isFocused: focused,
    });
    if (this.props.onFocusChange) {
      this.props.onFocusChange(focused);
    }
  }

  cursorActivity(cm) {
    if (this.props.onCursorActivity) {
      this.props.onCursorActivity(cm);
    }
  }

  scrollChanged(cm) {
    if (this.props.onScroll) {
      this.props.onScroll(cm.getScrollInfo());
    }
  }

  codemirrorValueChanged(doc, change) {
    if (this.props.onChange && change.origin !== 'setValue') {
      this.props.onChange(doc.getValue(), change);
    }
  }

  render() {
    const editorClassName = className(
      'ReactCodeMirror',
      this.state.isFocused ? 'ReactCodeMirror--focused' : null,
      this.props.className,
    );

    return (
      <div className={editorClassName}>
        <textarea
          ref={(ref) => { this.textareaNode = ref; }}
          name={this.props.name || this.props.path}
          value={this.props.value}
          autoComplete="off"
          autoFocus={this.props.autoFocus}
        />
      </div>
    );
  }
}

CodeMirror.propTypes = {
  autoFocus: PropTypes.bool,
  className: PropTypes.func,
  codeMirrorInstance: PropTypes.func,
  defaultValue: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  onCursorActivity: PropTypes.func,
  onFocusChange: PropTypes.func,
  onScroll: PropTypes.func,
  path: PropTypes.string,
  value: PropTypes.string,
  preserveScrollPosition: PropTypes.bool,
};

export default CodeMirror;
