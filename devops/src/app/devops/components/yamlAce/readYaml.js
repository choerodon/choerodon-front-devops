/* eslint-disable */
/**
 * yaml 编辑框的高亮效果
 */
import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import ReactAce from 'react-ace-editor';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './AceForYaml.scss';


const { Range } = window.ace.acequire('ace/range');
/* eslint-disable react/no-string-refs */

class HighlightAce extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    highlightMarkers: PropTypes.array,
  };

  static defaultProps = {
    options: {
      gutter: false,
      readOnly: false,
      mode: 'yaml',
      theme: 'dawn',
      softWrap: false,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      isTriggerChange: false,
    };
  }

  componentDidMount() {
    // 第一次加载没有数据
    this.setOptions();
    const editor = this.ace.editor;
    if (this.props.value) {
      this.handleSetValue();
      editor.clearSelection();
    }
    if (this.props.modifyMarkers) {
      this.handleClearMarkers();
    }
  }

  /**
   * 显示报错行
   */
  onChange =_.debounce((values, options) => {
    const editor = this.ace.editor;
    const { isTriggerChange } = this.state;
    if (isTriggerChange) {
      this.handleModifyHighLight(values, options);
    } else {
      this.setState({ isTriggerChange: true });
    }
  }, 1000);

  /**
   * 设置属性
   */
  setOptions =() => {
    const editor = this.ace.editor;
    editor.setAutoScrollEditorIntoView(true);
    editor.$blockScrolling = Infinity;
    if (this.props.readOnly) {
      this.ace.editor.setReadOnly(true);
    }
    editor.setPrintMarginColumn(0);
    // editor.getSession().setMode('ace/mode/yaml');
    // editor.setTheme('ace/theme/dawn');
  };

  /**
   * 清除更改的高亮
   */
  handleClearMarkers = () => {
    const editor = this.ace.editor;
    const markers = this.props.modifyMarkers;
    Object.values(markers).map((marker) => {
      if (marker.clazz === 'modifyHighlight-text' || marker.clazz === 'modifyHighlight-line') {
        editor.session.addMarker(marker.range, 'modifyHighlight-line', 'fullLine', false);
        editor.session.addMarker(marker.range, 'modifyHighlight-text', 'text', false);
      } else if (marker.clazz === 'clearLineHeight-line' || marker.clazz === 'clearLineHeight-text') {
        editor.session.addMarker(marker.range, 'clearLineHeight-line', 'fullLine', false);
        editor.session.addMarker(marker.range, 'clearLineHeight-text', 'text', false);
      }
      return marker;
    });
  };
  
  /**
   * 设置本次修改的高亮
   */
  handleModifyHighLight =(values, options) => {
    const editor = this.ace.editor;
    const lines = editor.session.getLength();
    const prevLineLength = this.state.lines || lines;
    const { sourceData } = this.state;
    const start = options.start;
    const end = options.end;
    const newValue = editor.session.getLine(start.row);
    const oldValue = sourceData[start.row];
    const value = editor.session.getLine(start.row);
    const range = new Range(start.row, value.split(':')[0].length + 2, end.row, end.column);
    if (newValue !== oldValue) {
      if (options.action === 'insert' || (options.action === 'remove' && end.row === start.row && prevLineLength === lines)) {
        editor.session.addMarker(range, 'modifyHighlight-line', 'fullLine', false);
        editor.session.addMarker(range, 'modifyHighlight-text', 'text', false);
      }
    } else {
      editor.session.addMarker(range, 'clearLineHeight-line', 'fullLine', false);
      editor.session.addMarker(range, 'clearLineHeight-text', 'text', false);
    }
    this.setState({ lines });
    const modifyMarkers = editor.session.getMarkers();
    this.props.onChange(values, modifyMarkers);
  }

  /**
   * 处理yaml格式错误显示
   */
  handleError =() => {
    const error = this.props.errorLines;
    if (error && error.length) {
      const eles = document.getElementsByClassName('ace_gutter-cell');
      if (eles.length) {
        for (let i = 0; i < error.length; i += 1) {
          eles[error[i].lineNumber - 1].className = 'ace_gutter-cell ace_error';
          eles[error[i].lineNumber - 1].title = error[i].errorMsg;
        }
      }
    } else {
      const eless = document.getElementsByClassName('ace_gutter-cell ace_error');
      if (eless.length) {
        const len = eless.length;
        for (let j = 0; j < len; j += 1) {
          eless[0].title = null;
          eless[0].className = 'ace_gutter-cell';
        }
      }
    }
  };

  /**
   * 初始化值和高亮
   */
  handleSetValue =() => {
    const editor = this.ace.editor;
    this.setState({ isTriggerChange: false });
    editor.setValue(this.props.value);
    if (this.props.highlightMarkers && this.props.highlightMarkers.length) {
      this.handleHighLight();
    }
    const sourceData = this.props.value.split('\n');
    this.setState({ sourceData });
  };
  
  /**
   * 设置高亮
   */
  handleHighLight = () => {
    const editor = this.ace.editor;
    const diff = this.props.highlightMarkers;
    diff.map((line) => {
      const range = new Range(line.line, line.startColumn, line.line, line.endColumn);
      editor.session.addMarker(range, 'Highlight-line', 'fullLine', false);
      editor.session.addMarker(range, 'lineHeight-text', 'text', false);
      return diff;
    });
  }

  render() {
    const { value, totalLine, errorLines, isFileError } = this.props;
    const { formatMessage } = this.props.intl;
    this.handleError();
    return (
      <div>
        { !this.props.readOnly && <div className="ace-error">
          <span className="deployApp-config-block deployApp-config-lastModify" /> <span className="deployApp-config-title">{formatMessage({ id: 'yaml.lastModify' })}</span>
          <span className="deployApp-config-block deployApp-config-modify" /> <span className="deployApp-config-title">{formatMessage({ id: 'yaml.modify' })}</span>
          <span className="deployApp-config-error" /><span className="deployApp-config-title">{formatMessage({ id: 'yaml.yaml.error' })}</span>
        </div> }
        <ReactAce
          mode="yaml"
          theme="dawn"
          showGutter
          value={value}
          onChange={this.onChange}
          style={{ height: totalLine ? `${totalLine * 16}px` : '500px' }}
          ref={(instance) => { this.ace = instance; }} // Let's put things into scope
        />
        {isFileError && <div className="ace-error-message">
          <i className="icon icon-error config-icon-error" /> <span className="config-error-mes">{formatMessage({ id: 'yaml.error.tooltip' })}</span>
        </div>}
      </div>
    );
  }
}

export default injectIntl(HighlightAce);
