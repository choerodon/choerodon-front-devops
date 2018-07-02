import React, { Component } from 'react';
import ReactAce from 'react-ace-editor';
import 'brace/mode/text';
import 'brace/theme/terminal';
import './Log.scss';

class Log extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    const ele = document.getElementById('editor');
    let editor;
    if (ele) {
      editor = window.ace.edit('editor', {
        mode: 'ace/mode/text',
      });
      editor.setTheme('ace/theme/terminal');
      editor.setReadOnly(true);
      editor.setAutoScrollEditorIntoView(true);
      editor.$blockScrolling = Infinity;
    }
    if (editor && this.props.value) {
      editor.setValue(this.props.value);
      editor.clearSelection();
    }
  }
  componentWillReceiveProps() {
    const ele = document.getElementById('editor');
    let editor;
    if (ele) {
      editor = window.ace.edit('editor', {
        mode: 'ace/mode/text',
      });
      editor.setTheme('ace/theme/terminal');
      editor.setReadOnly(true);
      editor.setAutoScrollEditorIntoView(true);
      editor.$blockScrolling = Infinity;
    }
    if (editor && this.props.value) {
      editor.setValue(this.props.value);
      editor.clearSelection();
    }
  }

  render() {
    return (<div id="editor" style={{ height: 500, width: '100%' }} />);
  }
}

export default Log;
