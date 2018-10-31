import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Button, Icon } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import './DepPipelineEmpty.scss';
import EnvPipelineStore from '../../stores/project/envPipeline';
import deploymentPipelineStore from '../../stores/project/deploymentPipeline';

const { AppState } = stores;

class DepPipelineEmpty extends Component {

  componentDidMount() {
    deploymentPipelineStore.judgeRole();
  }

  componentWillUnmount() {
    deploymentPipelineStore.setProRole('');
  }

  handleClick = () => {
    const { history } = this.props;
    const { projectId, name, organizationId, type } = AppState.currentMenuType;
    EnvPipelineStore.setSideType('create');
    EnvPipelineStore.setShow(true);
    history.push(`/devops/env-pipeline?type=${type}&id=${projectId}&name=${name}&organizationId=${organizationId}`);
  };

  render() {
    const { intl: { formatMessage } } = this.props;
    const proRole = deploymentPipelineStore.getProRole;
    return (<div className="c7n-depPi-empty-card">
      {proRole === 'owner' ? (<Card title={formatMessage({ id: 'envPl.create' })}>
        <p>
          <FormattedMessage id="depPl.noEnv" />
          <a
            href={formatMessage({ id: 'depPl.link' })}
            rel="nofollow me noopener noreferrer"
            target="_blank"
          >
            <FormattedMessage id="depPl.more" /><Icon type="open_in_new" />
          </a>
        </p>
        <Button
          type="primary"
          funcType="raised"
          onClick={this.handleClick}
        >
          <FormattedMessage id="envPl.create" />
        </Button>
      </Card>) : ''}
      {proRole === 'member' ?(<Card title={formatMessage({ id: 'depPl.noPermission' })}>
        <div><FormattedMessage id="depPl.noPerDes" /></div>
        <div className="c7n-noPer-text"><FormattedMessage id="depPl.addPermission" /></div>
        <a
          href={formatMessage({ id: 'depPl.link' })}
          rel="nofollow me noopener noreferrer"
          target="_blank"
        >
          <FormattedMessage id="depPl.more" /><Icon type="open_in_new" />
        </a>
      </Card>) : ''}
    </div>);
  }
}

export default withRouter(injectIntl(DepPipelineEmpty));
