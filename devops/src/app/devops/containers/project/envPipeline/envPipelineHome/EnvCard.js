import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DragSource } from 'react-dnd';
import { Button, Tooltip, Icon } from 'choerodon-ui';
import { Permission } from 'choerodon-front-boot';
import './EnvPipeLineHome.scss';
import EnvPipelineStore from '../../../../stores/project/envPipeline';

const ItemTypes = {
  ENVCARD: 'envCard',
};


const envCardSource = {
  beginDrag(props) {
    return {
      cardData: props.cardData,
      projectId: props.projectId,
    };
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

@inject('AppState')
@observer
class EnvCard extends Component {
  editEnv = (id) => {
    const { projectId } = this.props;
    EnvPipelineStore.setSideType('edit');
    EnvPipelineStore.loadEnvById(projectId, id);
    EnvPipelineStore.setShow(true);
  };

  editPrm = (id) => {
    const { projectId } = this.props;
    EnvPipelineStore.setSideType('permission');
    EnvPipelineStore.loadPrm(projectId, 0, 10, id);
    EnvPipelineStore.loadTags(projectId, id);
    EnvPipelineStore.loadEnvById(projectId, id);
    EnvPipelineStore.setShow(true);
  };

  copyKey = (id, update) => {
    const { projectId } = this.props;
    EnvPipelineStore.setSideType('key');
    EnvPipelineStore.loadEnvById(projectId, id);
    EnvPipelineStore.loadShell(projectId, id, update);
    EnvPipelineStore.setShow(true);
  };

  banEnv = (id) => {
    const { projectId } = this.props;
    EnvPipelineStore.setSideType(null);
    EnvPipelineStore.loadEnvById(projectId, id);
    EnvPipelineStore.loadInstance(projectId, 0, 10, null, id);
    EnvPipelineStore.setBan(true);
  };

  render() {
    const { AppState, connectDragSource, isDragging, cardData } = this.props;
    const { id: projectId, organizationId, type } = AppState.currentMenuType;
    const envCardStyle = classNames({
      'c7n-env-card': !isDragging,
      'c7n-env-card-dragging': isDragging,
    });
    const envStatusStyle = classNames({
      'c7n-env-state': cardData.connect,
      'c7n-env-state-pending': !cardData.connect,
    });
    return connectDragSource(
      <div className={envCardStyle}>
        <Tooltip placement="bottom" title={cardData.update ? <FormattedMessage id="envPl.status.update" /> : null}>
          <div className="c7n-env-card-header">
            {cardData
              ? (<React.Fragment>
                <span>{cardData.name}</span>
                <div className="c7n-env-card-action">
                  {cardData.connect ? null : <Permission
                    service={['devops-service.devops-environment.queryShell']}
                    organizationId={organizationId}
                    projectId={projectId}
                    type={type}
                  >
                    <Tooltip title={<FormattedMessage id="envPl.active" />}>
                      <Button
                        funcType="flat"
                        shape="circle"
                        onClick={this.copyKey.bind(this, cardData.id, cardData.update)}
                      >
                        <Icon type="vpn_key" />
                      </Button>
                    </Tooltip>
                  </Permission>}
                  <Permission
                    service={['devops-service.devops-environment.listUserPermissionByEnvId']}
                    organizationId={organizationId}
                    projectId={projectId}
                    type={type}
                  >
                    <Tooltip title={<FormattedMessage id="envPl.authority" />}>
                      <Button
                        funcType="flat"
                        shape="circle"
                        onClick={this.editPrm.bind(this, cardData.id)}
                      >
                        <Icon type="authority" />
                      </Button>
                    </Tooltip>
                  </Permission>
                  <Permission
                    service={['devops-service.devops-environment.update']}
                    organizationId={organizationId}
                    projectId={projectId}
                    type={type}
                  >
                    <Tooltip title={<FormattedMessage id="envPl.edit" />}>
                      <Button
                        funcType="flat"
                        shape="circle"
                        onClick={this.editEnv.bind(this, cardData.id)}
                      >
                        <Icon type="mode_edit" />
                      </Button>
                    </Tooltip>
                  </Permission>
                  <Permission
                    service={['devops-service.devops-environment.enableOrDisableEnv']}
                    organizationId={organizationId}
                    projectId={projectId}
                    type={type}
                  >
                    <Tooltip title={<FormattedMessage id="envPl.stop" />}>
                      <Button
                        funcType="flat"
                        shape="circle"
                        onClick={this.banEnv.bind(this, cardData.id)}
                      >
                        <Icon type="remove_circle_outline" />
                      </Button>
                    </Tooltip>
                  </Permission>
                </div>
              </React.Fragment>)
              : this.props.intl.formatMessage({ id: 'envPl.add' })}
          </div>
          {cardData ? <div className="c7n-env-card-content">
            <div className={envStatusStyle}>
              {cardData.connect ? this.props.intl.formatMessage({ id: 'running' }) : this.props.intl.formatMessage({ id: 'disconnect' })}
            </div>
            <div className="c7n-env-des" title={cardData.description}>
              <span className="c7n-env-des-head">{this.props.intl.formatMessage({ id: 'envPl.description' })}</span>
              {cardData.description}
            </div>
          </div> : this.props.intl.formatMessage({ id: 'envPl.add' }) }</Tooltip></div>,
    );
  }
}

EnvCard.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  projectId: PropTypes.number.isRequired,
};

export default DragSource(ItemTypes.ENVCARD, envCardSource, collect)(injectIntl(EnvCard));
