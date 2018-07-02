import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import '../../main.scss';
import './AppTag.scss';

@observer
class AppTag extends Component {
  render() {
    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.application.create',
          'devops-service.application.update',
          'devops-service.application.checkCode',
          'devops-service.application.checkName',
          'devops-service.application.pageByOptions',
          'devops-service.application.listTemplate',
          'devops-service.application.queryByAppIdAndActive',
          'devops-service.git-flow.listByAppId',
          'devops-service.git-flow.queryTags',
          'devops-service.application.queryByAppId',
        ]}
      >
        <React.Fragment>
          <Header title={<FormattedMessage id="app.title" />} />
        </React.Fragment>
      </Page>
    );
  }
}

export default withRouter(injectIntl(AppTag));
