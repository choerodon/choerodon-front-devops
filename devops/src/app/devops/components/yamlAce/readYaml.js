/**
 * yaml 编辑框的高亮效果
 */
import React, { Component } from 'react';
import ReactAce from 'react-ace-editor';
import ace from 'brace';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getIn, toJS } from 'immutable';
import './AceForYaml.scss';

const yaml = require('js-yaml');

const { Range } = ace.acequire('ace/range');

const jsdiff = require('diff');

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
    this.setOptions();
    const linw = this.cmpoDiff();
    const editor = this.ace.editor;
    const str = '# Default values for api-gateway.\n' +
      '# This is a YAML-formatted file.\n' +
      '# Declare variables to be passed into your templates.\n' +
      'replicaCount: 2\n' +
      '\n' +
      'replicaCount: 2\n' +
      '\n' +
      'image:\n' +
      '  repository: registry.saas.hand-china.com/choerodon-devops/choerodon-front-devops\n' +
      '  tag: develop.20180502172827\n' +
      '  pullPolicy: Always';
    editor.setValue(str);
    _.map(linw, (line) => {
      if(line.lineNumber === line.endLineNumber) {
        if (line.removed === undefined) {
          this.handleLineHigh(line);
        }
      } else {
        let index = 0;
        for (let i = line.lineNumber; i <= line.endLineNumber; i += 1) {
          const data = _.cloneDeep(line);
          data.endLineNumber = i;
          data.lineNumber = i;
          const values = line.value.split('\n');
          data.value = values[index];
          this.handleLineHigh(data);
          index += 1;
        }
      }
    })
  }
  handleLineHigh = (line) => {
    const editor = this.ace.editor;
    const row = line.lineNumber;
    const range = this.getRange(row);
    editor.session.replace(range, line.value.split('\n')[0]);
    const newStrLength = line.value.split(':')[1].length - 2;
    const rangObj = this.getRangeObj(range, newStrLength);
    editor.session.addMarker(rangObj, 'lineHeight', 'fullLine', false);
    editor.session.addMarker(rangObj, 'errorHighlight', 'text', false);
  }
  getRange = (row, range = null) => {
    let ranges;
    const editor = this.ace.editor;
    const oldValue = editor.session.getLine(row);
    ranges = editor.find(oldValue, {start: range });
    if (ranges && ranges.start.row !== row) {
      return this.getRange(row, ranges)
    } else if (ranges) {
      return ranges;
    }
  };
  getRangeObj =(range, length) =>
    new Range(range.start.row, range.end.column - length, range.end.row, range.end.column + 100);
  cmpoDiff = () => {
    const str = '# Default values for api-gateway.\n' +
      '# This is a YAML-formatted file.\n' +
      '# Declare variables to be passed into your templates.\n' +
      'replicaCount: 1\n' +
      '\n' +
      'replicaCount: 1\n' +
      '\n' +
      'pullPolicy: Alwaysssxx\n' +
      'image:\n' +
      '  repository: registry.saas.hand-china.com/choerodon-devops/choerodon-front-devops\n' +
      '  tag: develop.20180502172827cc\n' +
      '  pullPolicy: Alwaysss\n' +
      '  name: mading\n' +
      '  test: 123';

    const newStr = '# Default values for api-gateway.\n' +
      '# This is a YAML-formatted file.\n' +
      '# Declare variables to be passed into your templates.\n' +
      '\n' +
      'replicaCount: 2\n' +
      '\n' +
      'pullPolicy: Alwaysssxx\n' +
      'image:\n' +
      '  repository: registry.saas.hand-china.com/choerodon-devops/choerodon-front-devops\n' +
      '  tag: develop.20180502172827cc\n' +
      '  pullPolicy: Alwaysss\n' +
      '  name: mading';
    const changes = jsdiff.diffChars(newStr, str);
    window.console.log(changes);


    let lineNumber = 1;
    return changes.reduce((acc, change) => {
      const findOnLine = acc.find(c => c.lineNumber === lineNumber);

      if (findOnLine) {
        Object.assign(findOnLine, change, {
          modified: true,
          endLineNumber: (lineNumber + change.count) - 1,
        });
      } else if ('added' in change || 'removed' in change) {
        acc.push(Object.assign({}, change, {
          lineNumber,
          modified: undefined,
          endLineNumber: (lineNumber + change.count) - 1,
        }));
      }

      if (!change.removed) {
        lineNumber += change.count;
      }
      return acc;
    }, []);
  };
  onChange =(values) => {
    window.console.log('+++');
    const number = this.state.number;
    const diffLen = this.state.diffLen;
    // window.console.log(this.state);
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
