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
require('codemirror/theme/base16-light.css');

require('codemirror/addon/fold/foldgutter.css');
require('codemirror/addon/fold/foldcode');
require('codemirror/addon/fold/foldgutter.js');
require('codemirror/addon/fold/brace-fold.js');
require('codemirror/addon/fold/comment-fold.js');
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
      foldGutter: true,
      lineWrapping: true,
      gutters:["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      indicatorFolded:'CodeMirror-foldgutter-folded',
    }
  };
  constructor(props) {
    super(props);
    this.state = {

    }
    ;
  }

  componentDidMount() {
    const editor = this.aceEditor.getCodeMirror();
    editor.setOption('styleSelectedText',false);
    editor.setSize('100%', (editor.getDoc().size * 19) + 8);
    if (this.props.highlightMarkers) {
      this.handleHighLight();
    }
  }

  /**
   * 显示报错行
   */
  onChange =(values, options) => {
    window.console.log(options);
    const editor = this.aceEditor.getCodeMirror();
    const lines = editor.getDoc().size;
    editor.setSize('100%', (lines * 19) + 8);
    const prevLineLength = this.state.lines || lines;
    const start = options.from;
    const end = options.to;
    const newValue = editor.getLine(start.line);
    const from = { line: start.line, ch: newValue.split(':')[0].length + 2 };
    const to = { line: end.line, ch: end.ch + 1 };
    const lineInfo = editor.lineInfo(from.line).bgClass;
    // 新增行
    if (options.origin ==='+input' && options.text.toString() ===",") {
      editor.addLineClass(start.line + 1, 'background', 'newLine-text');
    } else if (lineInfo === 'lastModifyLine-line') {
      editor.addLineClass(start.line, 'background', 'lastModifyLine-line');
      editor.markText(from, to, { className: 'lastModifyLine-text' });
    } else if(lineInfo === 'newLine-text') {
      editor.addLineClass(start.line, 'background', 'newLine-text');
    } else if(options.origin ==='+delete' && options.removed.toString() ===",") {
      return;
    } else {
      editor.addLineClass(start.line, 'background', 'lastModifyLine-line');
      editor.markText(from, to, { className: 'lastModifyLine-text' });
    }
    // let newValue = '';
    // if(options.origin ==='+input' && (options.text.toString() === "" || options.text.toString() === ",") || (options.origin === '+delete' && options.removed.toString() === "")){
    //   newValue = '';
    // } else if(editor.getLine(start.line)!== "  "){
    //   newValue = editor.getLine(start.line);
    // }
    // window.console.log(newValue);
    // const newValue = editor.getLine(start.line);
    // window.console.log(newValue);
    // const oldValue = sourceData[start.line];
    // const from = { line: start.line, ch: newValue.split(':')[0].length + 2 };
    // const to = { line: end.line, ch: end.ch + 1 };
    // const lineInfo = editor.lineInfo(from.line).bgClass;
    // if (newValue) {
    //   if (lineInfo === 'lastModifyLine-line'){
    //     editor.addLineClass(start.line, 'background', 'lastModifyLine-line');
    //     editor.markText(from, to, { className: 'lastModifyLine-text' });
    //   } else if(lineInfo === 'newLine-text') {
    //     editor.addLineClass(start.line, 'background', 'newLine-text');
    //   } else {
    //     if (newValue !== oldValue) {
    //       editor.addLineClass(start.line, 'background', 'lastModifyLine-line');
    //       editor.markText(from, to, { className: 'lastModifyLine-text' });
    //     } else {
    //       editor.addLineClass(start.line, 'background', 'clearLineHeight-line');
    //       editor.markText(from, to, { className: 'clearLineHeight-text' });
    //     }
    // }
    // }
    // if (oldValue && !this.props.newLines.includes(start.line)) {
    //   if (newValue !== oldValue) {
    //     if ((options.origin.includes('input') || options.origin.includes('delete')) && end.line === start.line && prevLineLength === lines) {
    //       editor.addLineClass(start.line, 'background', 'lastModifyLine-line');
    //       editor.markText(from, to, { className: 'lastModifyLine-text' });
    //     }
    //   } else if(!modifyLines.includes(from.line)) {
    //     editor.addLineClass(start.line, 'background', 'clearLineHeight-line');
    //     editor.markText(from, to, { className: 'clearLineHeight-text' });
    //   }
    // } else if(!oldValue || this.props.newLines.includes(start.line)) {
    //   if (newValue && newValue !== oldValue) {
    //     editor.addLineClass(start.line, 'background', 'newLine-text');
    //   } else if(newValue && newValue === oldValue) {
    //     editor.addLineClass(start.line, 'background', 'newLine-text');
    //   } else {
    //     editor.addLineClass(start.line, 'background', 'clearLineHeight-line');
    //   }
    // }
    this.setState({ lines });
    this.handleModifyHighLight(values, options);
  };
  /**
   * 设置本次修改的高亮
   */
  handleModifyHighLight =_.debounce((values, options) => {
    this.props.onChange(values);
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
    this.setState({ sourceData, modifyLines: _.map(this.props.highlightMarkers, 'line'), newLines: this.props.newLines });
    const diff = this.props.highlightMarkers;
    const newLine = this.props.newLines;
    diff.length && diff.map((line) => {
      editor.markText({ line: line.line, ch: line.startColumn }, { line: line.line, ch: line.endColumn }, {
        className: 'lastModifyLine-text',
        title: '上次修改',
      });
      editor.addLineClass(line.line, 'background', 'lastModifyLine-line');
      return diff;
    });
    newLine.length && newLine.map((lines) => {
      editor.addLineClass(lines, 'background', 'newLine-text');
    })
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
