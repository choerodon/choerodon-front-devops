import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import _ from 'lodash';
import Square from './Square';
import EnvPipelineStore from '../../../../stores/project/envPipeline';

const ItemTypes = {
  ENVCARD: 'envCard',
};

const squareTarget = {
  drop(props, monitor) {
    // Obtain the dragged item
    const item = monitor.getItem();
    const pos = EnvPipelineStore.getEnvcardPosition;
    if (props.children.props.cardData.sequence !== item.cardData.sequence) {
      EnvPipelineStore.switchData(props.children.props.cardData.sequence,
        item.cardData.sequence);
      const envIds = _.map(pos, 'id');
      EnvPipelineStore.updateSort(props.children.props.projectId, envIds);
    }
  },
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

class BoardSquare extends Component {
  render() {
    const { x, y, connectDropTarget, isOver } = this.props;
    return connectDropTarget(
      <div className="c7n-env-boardsquare">
        <Square>
          {this.props.children}
        </Square>
        {isOver
        && <div className="c7n-env-moveing" />
        }
        <span className="c7n-env-arrow">→</span>
      </div>,
    );
  }
}

BoardSquare.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired,
};

export default DropTarget(ItemTypes.ENVCARD, squareTarget, collect)(BoardSquare);
