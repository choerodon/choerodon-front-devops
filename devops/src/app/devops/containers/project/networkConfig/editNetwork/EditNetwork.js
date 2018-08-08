import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import CreateNetwork from '../createNetwork';

@observer
class EditNetwork extends CreateNetwork {
  render() {
    return (<div>
      hello
    </div>);
  }
}

export default withRouter(EditNetwork);
