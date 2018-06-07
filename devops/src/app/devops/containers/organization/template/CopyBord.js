import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Input } from 'choerodon-ui';
import CopyToBoard from 'react-copy-to-clipboard';

@observer
class CopyBord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copy: false,
    };
  }
  handleChange =(e) => {
    this.setState({ value: e.target.value, copy: false });
  }

  handleCopy =() => {
    this.setState({ copy: true });
  }

  render() {
    return (
      <div>
        <Input value={this.state.value} onChange={this.handleChange} />
        <CopyToBoard text={this.state.value} onCopy={this.handleCopy}>
          {this.state.copy ? <span>已复制</span> : <button>复制到剪贴板</button>}
        </CopyToBoard>
      </div>
    );
  }
}

export default (withRouter(CopyBord));
