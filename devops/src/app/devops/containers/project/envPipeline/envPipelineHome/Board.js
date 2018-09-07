import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Button, Tooltip, Icon } from 'choerodon-ui';
import { Permission } from 'choerodon-front-boot';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import EnvCard from './EnvCard';
import BoardSquare from './BoardSquare';
import './EnvPipeLineHome.scss';
import EnvPipelineStore from '../../../../stores/project/envPipeline';

let scrollLeft = 0;

@inject('AppState')
@observer
class Board extends Component {
  static propTypes = {
    envcardPositionChild: PropTypes.arrayOf(
      PropTypes.object.isRequired,
    ).isRequired,
    projectId: PropTypes.number.isRequired,
    Title: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      move: false,
      moveRight: 300,
    };
  }

  editGroup = (id, name) => {
    EnvPipelineStore.setShowGroup(true);
    EnvPipelineStore.setGroupOne({ id, name });
    EnvPipelineStore.setSideType('editGroup');
  };

  delGroup = (id, name) => {
    EnvPipelineStore.setBan(true);
    EnvPipelineStore.setSideType('delGroup');
    EnvPipelineStore.setGroupOne({ id, name });
  };

  pushScrollRight = () => {
    const { moveRight } = this.state;
    scrollLeft -= 300;
    if (scrollLeft < 0) {
      scrollLeft = 0;
    }
    this.setState({
      move: false,
      moveRight: moveRight - 300,
    });
    document.getElementsByClassName('c7n-inner-container')[0].scroll({ left: scrollLeft, behavior: 'smooth' });
  };

  pushScrollLeft = () => {
    const domPosition = document.getElementsByClassName('c7n-inner-container')[0].scrollLeft;
    this.setState({
      moveRight: domPosition,
    });
    if (this.state.moveRight === domPosition) {
      this.setState({
        move: true,
      });
      scrollLeft = domPosition;
    } else {
      this.setState({
        move: false,
      });
    }
    document.getElementsByClassName('c7n-inner-container')[0].scroll({ left: scrollLeft + 300, behavior: 'smooth' });
    scrollLeft += 300;
  };

  renderSquare(i) {
    const x = i;
    const y = 0;
    return (
      <div
        key={i}
        className="c7n-env-square"
      >
        <BoardSquare
          x={x}
          y={y}
        >
          {this.renderPiece(x)}
        </BoardSquare>
      </div>
    );
  }

  renderPiece(x) {
    const { projectId, envcardPositionChild } = this.props;
    return (<EnvCard projectId={projectId} cardData={envcardPositionChild[x]} />);
  }

  render() {
    const squares = [];
    const { AppState, envcardPositionChild, groupId, Title, intl } = this.props;
    const { id: projectId, organizationId, type } = AppState.currentMenuType;

    for (let i = 0; i < envcardPositionChild.length; i += 1) {
      squares.push(this.renderSquare(i));
    }

    const rightStyle = classNames({
      'c7n-push-right icon icon-navigate_next': ((window.innerWidth >= 1680 && window.innerWidth < 1920) && envcardPositionChild.length >= 5) || (window.innerWidth >= 1920 && envcardPositionChild.length >= 6) || (window.innerWidth < 1680 && envcardPositionChild.length >= 4),
      'c7n-push-none': envcardPositionChild.length <= 4,
    });

    const outerContainer = classNames({
      'c7n-outer-container t-height': Title,
      'c7n-outer-container': !Title,
    });

    const innerContainer = classNames({
      'c7n-inner-container t-height': Title,
      'c7n-inner-container': !Title,
    });

    const envBoard = classNames({
      'c7n-env-board t-padding': Title,
      'c7n-env-board': !Title,
    });

    return (
      <div className={outerContainer}>
        {scrollLeft !== 0
          ? <div role="none" className="c7n-push-left icon icon-navigate_before" style={Title && { top: 90 }} onClick={this.pushScrollRight} />
          : ''}
        {Title ? (<div className="c7n-env-group-wrap">
          <div
            className="c7n-env-card-group"
          >
            {Title}
          </div>
          <Permission
            service={['devops-service.devops-env-group.update']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Tooltip title={<FormattedMessage id="envPl.group.edit" />}>
              <Button
                funcType="flat"
                shape="circle"
                onClick={this.editGroup.bind(this, groupId, Title)}
              >
                <Icon type="mode_edit" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission
            service={['devops-service.devops-env-group.delete']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Tooltip title={<FormattedMessage id="envPl.group.del" />}>
              <Button
                funcType="flat"
                shape="circle"
                onClick={this.delGroup.bind(this, groupId, Title)}
              >
                <Icon type="delete_forever" />
              </Button>
            </Tooltip>
          </Permission>
        </div>) : null}
        <div className={innerContainer}>
          <div className={envBoard}>
            {squares.length ? squares : (<div className="c7n-env-card c7n-env-card-ban">
              <div className="c7n-env-card-header">
                <div>
                  {intl.formatMessage({ id: 'envPl.add' })}
                </div>
              </div>
              <div className="c7n-env-card-content">
                <div className="c7n-env-state c7n-env-state-ban">
                  {intl.formatMessage({ id: 'envPl.no.add' })}
                </div>
                <div className="c7n-env-des">
                  <span className="c7n-env-des-head">{intl.formatMessage({ id: 'envPl.description' })}</span>
                  {intl.formatMessage({ id: 'envPl.add.description' })}
                </div>
              </div>
            </div>)}
          </div>
        </div>
        {this.state.move ? '' : <div role="none" className={rightStyle} style={Title && { top: 90 }} onClick={this.pushScrollLeft} />}
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(injectIntl(Board));
