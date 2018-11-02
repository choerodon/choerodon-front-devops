import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Card, Button, Icon } from 'choerodon-ui';
import { stores, Header, Content } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import './DepPipelineEmpty.scss';
import EnvPipelineStore from '../../stores/project/envPipeline';
import DeploymentPipelineStore from '../../stores/project/deploymentPipeline';

const { AppState } = stores;

@observer
class DepPipelineEmpty extends Component {

  handleClick = () => {
    const { history } = this.props;
    const { projectId, name, organizationId, type } = AppState.currentMenuType;
    EnvPipelineStore.setSideType('create');
    EnvPipelineStore.setShow(true);
    history.push(`/devops/env-pipeline?type=${type}&id=${projectId}&name=${name}&organizationId=${organizationId}`);
  };

  render() {
    const { intl: { formatMessage }, title } = this.props;
    const proRole = DeploymentPipelineStore.getProRole;
    return (<Fragment>
      <Header title={title} />
      <Content>
        <div className="c7n-depPi-empty-card">
          {proRole === 'owner' && (<Card title={formatMessage({ id: 'envPl.create' })}>
            <div className="c7n-noEnv-content">
              <FormattedMessage id="depPl.noEnv" />
              <a
                href={formatMessage({ id: 'depPl.link' })}
                rel="nofollow me noopener noreferrer"
                target="_blank"
              >
                <FormattedMessage id="depPl.more" /><Icon type="open_in_new" />
              </a>
            </div>
            <Button
              type="primary"
              funcType="raised"
              onClick={this.handleClick}
            >
              <FormattedMessage id="envPl.create" />
            </Button>
          </Card>)}
          {proRole === 'member' && (<Card title={formatMessage({ id: 'depPl.noPermission' })}>
            <div className="c7n-noPer-text">
              <FormattedMessage id="depPl.noPerDes" /><br />
              <FormattedMessage id="depPl.addPermission" />
            </div>
            <a
              href={formatMessage({ id: 'depPl.link' })}
              rel="nofollow me noopener noreferrer"
              target="_blank"
            >
              <FormattedMessage id="depPl.more" /><Icon type="open_in_new" />
            </a>
          </Card>)}
        </div>
      </Content>
    </Fragment>);
  }
}

export default withRouter(injectIntl(DepPipelineEmpty));
