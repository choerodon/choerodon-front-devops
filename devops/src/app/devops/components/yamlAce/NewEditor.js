/**
 * yaml 编辑框的高亮效果
 */
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import CodeMirror from 'react-codemirror';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './yamlCodeMirror.scss';

require('codemirror/lib/codemirror.css');
require('codemirror/mode/yaml/yaml');
require('codemirror/mode/textile/textile');
require('codemirror/theme/base16-light.css');
/* eslint-disable */
class NewEditor extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    options: PropTypes.object,
    errorLines: PropTypes.array,
    highlightMarkers: PropTypes.array,
    isFileError: PropTypes.bool,
    // highlightMarkers: PropTypes.array,
  };
  static defaultProps = {
    options: {
      theme: 'base16-light',
      mode: 'yaml',
      readOnly: false,
      lineNumbers: true,
    },
  };
  constructor(props) {
    super(props);
    this.state = {
      isTriggerChange: false,
    };
  }

  componentDidMount() {
    const editor = this.aceEditor.getCodeMirror();
    editor.setSize('100%', (editor.getDoc().size * 19) + 8);
    if (this.props.highlightMarkers) {
      this.handleHighLight();
    }
  }

  /**
   *
   * 清除更改的高亮
   */
  handleClearMarkers = () => {
    const editor = this.ace.editor;
    const markers = this.props.modifyMarkers;
    Object.values(markers).map((marker) => {
      if (marker.clazz === 'modifyLine-text' || marker.clazz === 'modifyLine-line') {
        editor.session.addMarker(marker.range, 'modifyLine-line', 'fullLine', false);
        editor.session.addMarker(marker.range, 'modifyLine-text', 'text', false);
      } else if (marker.clazz === 'clearLineHeight-line' || marker.clazz === 'clearLineHeight-text') {
        editor.session.addMarker(marker.range, 'clearLineHeight-line', 'fullLine', false);
        editor.session.addMarker(marker.range, 'clearLineHeight-text', 'text', false);
      }
      return marker;
    });
  };
  /**
   * 显示报错行
   */
  onChange =(values, options) => {
    const editor = this.aceEditor.getCodeMirror();
    const lines = editor.getDoc().size;
    editor.setSize('100%', (lines * 19) + 8);
    const prevLineLength = this.state.lines || lines;
    const { sourceData } = this.state;
    const start = options.from;
    const end = options.to;
    const newValue = editor.getLine(start.line);
    const oldValue = sourceData[start.line];
    const value = editor.getLine(start.line);
    const lineFrom = { line: start.line, ch: 0 };
    const from = { line: start.line, ch: value.split(':')[0].length + 2 };
    const to = { line: end.line, ch: end.ch + 1 };
    if (oldValue) {
      if (newValue !== oldValue) {
        if (options.origin.includes('input') || (options.origin.includes('delete') && end.line === start.line && prevLineLength === lines)) {
          editor.markText(lineFrom, to, { className: 'modifyLine-line' });
          editor.markText(from, to, { className: 'modifyLine-text' });
        }
      } else {
        editor.markText(lineFrom, to, { className: 'clearLineHeight-line' });
        editor.markText(from, to, { className: 'clearLineHeight-tex' });
      }
    } else {
      editor.markText(lineFrom, to, { className: 'newLine-text' });
    }
    this.setState({ lines });
    this.handleModifyHighLight(values, options);
  };
  /**
   * 设置本次修改的高亮
   */
  handleModifyHighLight =_.debounce((values, options) => {
    const editor = this.aceEditor.getCodeMirror();
    const modifyMarkers = editor.getAllMarks();
    this.props.onChange(values, modifyMarkers);
  }, 1000);
  /**
   * 处理yaml格式错误显示
   */
  handleError =() => {
    const error = this.props.errorLines;
    if (error && error.length) {
      const eles = document.getElementsByClassName('CodeMirror-linenumber CodeMirror-gutter-elt');
      if (eles.length) {
        for (let i = 0; i < error.length; i += 1) {
          eles[error[i].lineNumber - 1].className = 'CodeMirror-linenumber CodeMirror-gutter-elt line_error';
          eles[error[i].lineNumber - 1].title = error[i].errorMsg;
        }
      }
    } else {
      const eless = document.getElementsByClassName('CodeMirror-linenumber CodeMirror-gutter-elt line_error');
      if (eless.length) {
        const len = eless.length;
        for (let j = 0; j < len; j += 1) {
          eless[0].title = null;
          eless[0].className = 'CodeMirror-linenumber CodeMirror-gutter-elt';
        }
      }
    }
  };

  /**
   * 设置高亮
   */
  handleHighLight = () => {
    const editor = this.aceEditor.getCodeMirror();
    editor.setSize('100%', (editor.getDoc().size * 19) + 8);
    const sourceData = this.props.value.split('\n');
    this.setState({ sourceData });
    const diff = this.props.highlightMarkers;
    diff.map((line) => {
      editor.markText({ line: line.line, ch: line.startColumn }, { line: line.line, ch: line.endColumn }, {
        className: 'lastModifyLine-text',
        title: '上次修改',
      });
      editor.markText({ line: line.line, ch: 0 }, { line: line.line, ch: line.endColumn }, {
        className: 'lastModifyLine-line',
      });
      return diff;
    });
  };

  render() {
    const { value, totalLine, errorLines, isFileError } = this.props;
    const { formatMessage } = this.props.intl;
    this.handleError();
    return (
      <div>
        { !this.props.readOnly && <div className="ace-error">
          <span className="deployApp-config-block deployApp-config-new" /> <span className="deployApp-config-title">{formatMessage({ id: 'yaml.new' })}</span>
          <span className="deployApp-config-block deployApp-config-lastModify" /> <span className="deployApp-config-title">{formatMessage({ id: 'yaml.lastModify' })}</span>
          <span className="deployApp-config-block deployApp-config-modify" /> <span className="deployApp-config-title">{formatMessage({ id: 'yaml.modify' })}</span>
          <span className="deployApp-config-error" /><span className="deployApp-config-title">{formatMessage({ id: 'yaml.yaml.error' })}</span>
        </div> }
        <CodeMirror
          options={this.props.options}
          value={value}
          onChange={this.onChange}
          style={{ height: totalLine ? `${totalLine * 16}px` : '500px' }}
          ref={(instance) => { this.aceEditor = instance; }} // Let's put things into scope
        />
        {isFileError && <div className="ace-error-message">
          <span className="icon icon-error config-icon-error" /> <span className="config-error-mes">{formatMessage({ id: 'yaml.error.tooltip' })}</span>
        </div>}
      </div>
    );
  }
}

export default injectIntl(NewEditor);
