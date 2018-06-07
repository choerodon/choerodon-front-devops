import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DragSource } from 'react-dnd';
import { Button, Tooltip } from 'choerodon-ui';
import Permission from 'PerComponent';
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
    EnvPipelineStore.setShow(true);
    EnvPipelineStore.setSideType('edit');
    EnvPipelineStore.loadEnvById(projectId, id);
  };

  copyKey = (id, update) => {
    const { projectId } = this.props;
    EnvPipelineStore.setShow(true);
    EnvPipelineStore.setSideType('key');
    EnvPipelineStore.loadEnvById(projectId, id);
    EnvPipelineStore.loadShell(projectId, id, update);
  };

  banEnv = (id) => {
    const { projectId } = this.props;
    EnvPipelineStore.setBan(true);
    EnvPipelineStore.loadEnvById(projectId, id);
    EnvPipelineStore.loadInstance(projectId, 0, 10, null, id);
  };

  render() {
    const { AppState, connectDragSource, isDragging, cardData } = this.props;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
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
        <Tooltip placement="bottom" title={cardData.update ? '版本过低，请更新！' : null}>
          <div className="c7n-env-card-header">
            {cardData ?
              (<React.Fragment>
                <span>{cardData.name}</span>
                <div className="c7n-env-card-action">
                  {cardData.connect ? null : <Permission
                    service={['devops-service.devops-environment.queryShell']}
                    organizationId={organizationId}
                    projectId={projectId}
                    type={type}
                  >
                    <Tooltip title="激活环境">
                      <Button
                        funcType="flat"
                        shape="circle"
                        onClick={this.copyKey.bind(this, cardData.id, cardData.update)}
                      >
                        <span className="icon-vpn_key" />
                      </Button>
                    </Tooltip>
                  </Permission>}
                  <Permission
                    service={['devops-service.devops-environment.update']}
                    organizationId={organizationId}
                    projectId={projectId}
                    type={type}
                  >
                    <Tooltip title="修改环境">
                      <Button
                        funcType="flat"
                        shape="circle"
                        onClick={this.editEnv.bind(this, cardData.id)}
                      >
                        <span className="icon-mode_edit" />
                      </Button>
                    </Tooltip>
                  </Permission>
                  <Permission
                    service={['devops-service.devops-environment.queryByEnvIdAndActive']}
                    organizationId={organizationId}
                    projectId={projectId}
                    type={type}
                  >
                    <Tooltip title="停用环境">
                      <Button
                        funcType="flat"
                        shape="circle"
                        onClick={this.banEnv.bind(this, cardData.id)}
                      >
                        <span className="icon-remove_circle_outline" />
                      </Button>
                    </Tooltip>
                  </Permission>
                </div>
              </React.Fragment>)
              : '请添加一个环境'}
          </div>
          {cardData ? <div>
            <div className={envStatusStyle}>
              {cardData.connect ? '运行中' : '未连接'}
            </div>
            <div className="c7n-env-des">
              <span className="c7n-env-des-head">描述：</span>
              {cardData.description}
            </div>
          </div> : '请添加一个环境'}</Tooltip></div>,
    );
  }
}

EnvCard.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  projectId: PropTypes.number.isRequired,
  cardData: PropTypes.arrayOf(
    PropTypes.object.isRequired,
  ).isRequired,
};

export default DragSource(ItemTypes.ENVCARD, envCardSource, collect)(EnvCard);
