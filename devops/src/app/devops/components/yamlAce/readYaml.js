/**
 * yaml 编辑框的高亮效果
 */
import React, { Component } from 'react';
import ReactAce from 'react-ace-editor';
import ace from 'brace';
import PropTypes from 'prop-types';
import { Map, fromJS, getIn, toJS } from 'immutable';
import './AceForYaml.scss';

const yaml = require('js-yaml');

const observableDiff = require('deep-diff').observableDiff;

const { Range } = ace.acequire('ace/range');
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
      number: 1,
    },
  };
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    // 第一次加载没有数据
    // const doc = yaml.safeLoad(fs.readFileSync('./values.yml', 'utf8'));
    this.ace.editor.setPrintMarginColumn(0);
    this.ace.editor.setHighlightGutterLine(false);
    this.ace.editor.setWrapBehavioursEnabled(false);
    // this.ace.editor.session.setWrapLimitRange(50, 1000);
    // this.ace.editor.session.setUseWrapMode(true);
    // this.ace.editor.setShowGutter(false);
    this.ace.editor.session.setOptions({ wrap: 'off' });
    const { sourceData, value, showDiff } = this.props;
    if (sourceData && value && showDiff) {
      this.handleDataChange();
    } else if (value && !showDiff) {
      const datas = yaml.safeDump(value, { lineWidth: 400 });
      this.ace.editor.setValue(datas);
      // this.ace.editor.session.setWrapLimit(50, 1000);
      // this.ace.editor.session.setUseWrapMode(false);
      // this.ace.editor.session.ajustWraplimit(false);
      this.ace.editor.clearSelection();
    }
  }
  //
  // componentWillReceiveProps(nextProps) {
  //   const { sourceData, value, showDiff } = this.props;
  //   if (sourceData && value && showDiff) {
  //     this.handleDataChange();
  //   } else if (value && !showDiff) {
  //     this.ace.editor.setValue(yaml.dump(value));
  //     this.ace.editor.clearSelection();
  //   }
  // }

  onChange =(value) => {
    const a = yaml.safeLoadAll(value);
    if (this.props.showDiff && this.props.onChange) {
      const difflen = observableDiff(this.props.value, this.props.sourceData).length;
      const number = this.state.number;
      if (number >= difflen) {
        this.props.onChange(JSON.stringify(a[0]));
      }
    } else if (this.props.onChange && !this.props.showDiff) {
      this.props.onChange(JSON.stringify(a[0]));// window.console.log('jjjdj');
    }
  };
  getRangeObj =(range, length) => new Range(range.start.row, length
    || range.start.column, range.end.row, range.end.column);

  handleDiff = (data, dataSource) => {
    const number = this.state.number || 0;
    const editor = this.ace.editor;
    const pathArr = data.path;
    const pathLen = pathArr.length;
    if (data.kind === 'E') {
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
      // $$$&&&&
      const changeData = dataSource.setIn(data.path, randomStr);
      const datas = changeData.toJS();
      editor.setValue(yaml.dump(datas));
      this.handleHighLigth(data, pathLen - 1, randomStr);
    }
    this.setState({ number: number + 1 });
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
    const { value } = this.props;
    const editor = this.ace.editor;
    const rangeObj = editor.find(tarStr);
    // const start = rangeObj.start.column;
    // const length = start + 2 + data.path[index].length;
    const range = this.getRangeObj(rangeObj);
    editor.setValue(yaml.dump(value));
    this.ace.editor.clearSelection();
    editor.session.addMarker(range, 'errorHighlight', 'text', false);
  };

  handleDataChange =() => {
    const { sourceData, value } = this.props;
    const dat = yaml.dump(value);
    this.ace.editor.setValue(yaml.dump(value));
    this.ace.editor.clearSelection();
    const dataSource = fromJS(value);
    observableDiff(sourceData, value, diff => this.handleDiff(diff, dataSource));
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
        style={{ height: height || '600px', width }}
        ref={(instance) => { this.ace = instance; }} // Let's put things into scope
      />
    );
  }
}

export default AceForYaml;
