/* eslint-disable react/no-typos */
/**
 * yaml 编辑框的高亮效果
 */
import React, { Component } from 'react';
import ReactAce from 'react-ace-editor';
import ace from 'brace';
import PropTypes from 'prop-types';
import { fromJS, getIn, toJS } from 'immutable';
import './AceForYaml.scss';

const yaml = require('js-yaml');

const observableDiff = require('deep-diff').observableDiff;

const { Range } = ace.acequire('ace/range');

const jsdiff = require('diff');
/* eslint-disable react/no-string-refs */

class AceForYaml extends Component {
  static PropTypes = {
    sourceData: PropTypes.object,
    value: PropTypes.object.isRequired,
    options: PropTypes.object.isRequired,
    showDiff: PropTypes.bool,
  };

  static defaultProps = {
    showDiff: true,
    options: {
      gutter: false,
      readOnly: false,
      mode: 'yaml',
      theme: 'eclipse',
      softWrap: false,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      number: 0,
      diffLen: 0,
    };
  }

  componentDidMount() {
    // 第一次加载没有数据
    this.setOptions();
    if (this.props.showDiff) {
      this.handleDataDiff();
    } else if (typeof this.props.sourceData !== 'string') {
      try {
        this.ace.editor.setValue(yaml.safeDump(this.props.sourceData, { lineWidth: 400 }));
      } catch (err) {
        Choerodon.prompt('数据格式错误');
        return;
      }
      this.ace.editor.clearSelection();
      this.ace.editor.setReadOnly(true);
    }
  }

  onChange =(values) => {
    const number = this.state.number;
    const diffLen = this.state.diffLen;
    if (number === diffLen && this.props.onChange) {
      this.props.onChange(values);
    }
  };

  setOptions =() => {
    const editor = this.ace.editor;
    // eslint-disable-next-line
    require('brace/mode/yaml');

    editor.setPrintMarginColumn(0);
    editor.setHighlightGutterLine(false);
    editor.setWrapBehavioursEnabled(false);
    editor.getSession().setMode('ace/mode/yaml');
  };

  getRangeObj =range => new Range(range.start.row, range.start.column, range.end.row, range.end.column + 2);

  // 比较数据函数
  handleDataDiff =() => {
    const { sourceData, value } = this.props;
    try {
      const oldData = yaml.safeLoad(sourceData);
      const newData = yaml.safeLoad(value);
      const diffArr = observableDiff(oldData, newData);
      this.setState({ diffLen: diffArr.length });
      if (diffArr.length && value) {
        this.handleDiff(diffArr);
      } else {
        this.setState({ diffLen: 0 });
        this.ace.editor.setValue(yaml.safeDump(yaml.safeLoad(sourceData), { lineWidth: 400 }));
        this.ace.editor.clearSelection();
      }
    } catch (err) {
      Choerodon.prompt('数据格式错误');
    }
  };

  handleDiff = (diffArr) => {
    const that = this;
    const len = diffArr.length;
    const editor = this.ace.editor;
    const { sourceData } = this.props;
    let oldData = '';
    try {
      oldData = yaml.safeLoad(sourceData);
    } catch (err) {
      Choerodon.prompt('数据格式错误');
      return;
    }
    const showData = fromJS(oldData);
    oldData = fromJS(oldData);
    diffArr.map((data, index) => {
      that.setState({ number: index + 1 }, () => {
        if (data.kind === 'E') {
          const pathLen = data.path.length;
          let strLen = 0;
          if (typeof data.lhs === 'number') {
            strLen = data.lhs.toString().length;
          } else if (data.lhs === true) {
            strLen = 4;
          } else if (data.lhs === false) {
            strLen = 5;
          } else {
            strLen = data.lhs.length;
          }
          const randomStr = this.randomString(strLen);
          if (data.path[pathLen - 1] === 'tag' && data.path[0] === 'image') {
            oldData = oldData.setIn(data.path, data.rhs);
          } else {
            oldData = oldData.setIn(data.path, randomStr);
            editor.setValue(yaml.safeDump(oldData.toJS(), { lineWidth: 400 }));
            this.handleHighLigth(data, pathLen - 1, randomStr);
            oldData = oldData.setIn(data.path, data.lhs);
          }
          editor.setValue(yaml.safeDump(oldData.toJS(), { lineWidth: 400 }));
        }
        if (index === len - 1) {
          editor.setValue(yaml.safeDump(oldData.toJS(), { lineWidth: 400 }));
          this.ace.editor.clearSelection();
        }
      });

      return showData;
    });
  };

  /**
   * 生成随机字符串ƒ
   * @param len 字符串长度
   * @returns 生成的字符串
   */
  randomString =(len) => {
    const lens = len;
    const $chars = '$';// yaml文件开头只能是$
    const maxPos = $chars.length;
    let res = '';
    for (let i = 0; i < lens; i += 1) {
      res += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return res;
  };

  handleHighLigth = (data, index, tarStr) => {
    const editor = this.ace.editor;
    const rangeObj = editor.find(tarStr);
    const range = this.getRangeObj(rangeObj);
    editor.session.addMarker(range, 'lineHeight', 'fullLine', false);
    editor.session.addMarker(range, 'errorHighlight', 'text', false);
  };

  render() {
    const { value, height, width, options, className } = this.props;
    return (
      <ReactAce
        className={className}
        value={value}
        showGutter={false}
        setOptions={options}
        onChange={this.onChange}
        style={{ height: height || '800px', width }}
        ref={(instance) => { this.ace = instance; }} // Let's put things into scope
      />
    );
  }
}

export default AceForYaml;
