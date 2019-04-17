import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Permission, Content, Header, Page, Action } from 'choerodon-front-boot';

@injectIntl
@withRouter
@inject('AppState')
@observer
export default class PipelineDetail extends Component {
  render() {
    const { location } = this.props;
    return(
      <div>{location.state ? location.state.name : 'hello'}</div>
    );
  }
}
