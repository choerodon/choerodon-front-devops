import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';

require('codemirror/lib/codemirror.css');
require('codemirror/mode/yaml/yaml');
require('codemirror/theme/3024-day.css');

class Logs extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const editor = this.codeEditor.getCodeMirror();
    if (this.props.value) {
      editor.setValue(this.props.value);
    }
  }

  componentWillReceiveProps() {
    const editor = this.codeEditor.getCodeMirror();
    if (this.props.value) {
      editor.setValue(this.props.value);
    }
  }

  render() {
    const options = {
      theme: '3024-day',
      mode: 'yaml',
      readOnly: true,
      lineNumbers: true,
    };
    return (<CodeMirror options={options} ref={(instance) => { this.codeEditor = instance; }} />);
  }
}

export default Logs;
