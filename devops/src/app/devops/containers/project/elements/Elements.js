import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Button, Form } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';

const { AppState } = stores;

@observer
class Elements extends Component {
  handleRefresh = () => {

  };

  render() {
    const {
      type,
      id: projectId,
      organizationId: orgId,
      name,
    } = AppState.currentMenuType;

    return (
      <Page className="c7n-region">
        <Header title={<FormattedMessage id="elements.head" />}>
          <Button
            icon='refresh'
            onClick={this.handleRefresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="elements" values={{ name }}>
          hello
        </Content>
      </Page>
    );
  }
}

export default injectIntl(withRouter(Elements));
