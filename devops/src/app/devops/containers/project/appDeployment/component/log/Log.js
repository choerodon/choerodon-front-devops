import React, { Component } from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/text';
import 'brace/theme/terminal';

import './Log.scss';

class Log extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const height = (window.innerHeight);
    const aceHeight = (height * 53) / 100;
    return (<AceEditor
      mode="text"
      theme="terminal"
      name="blah2"
      style={{ width: '100%', height: '500px', marginBottom: 32 }}
      onLoad={this.onLoad}
      onChange={this.onChange}
      fontSize={14}
      showGutter
      highlightActiveLine
      value={this.props.value}
      setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />);
  }
}

export default Log;
