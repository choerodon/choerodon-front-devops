import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import classNames from 'classnames';
import EnvCard from './EnvCard';
import BoardSquare from './BoardSquare';
import './EnvPipeLineHome.scss';

let scrollLeft = 0;

class Board extends Component {
  static propTypes = {
    envcardPosition: PropTypes.arrayOf(
      PropTypes.object.isRequired,
    ).isRequired,
    projectId: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      move: false,
      moveRight: 300,
    };
  }

  pushScrollRight = () => {
    scrollLeft -= 300;
    if (scrollLeft < 0) {
      scrollLeft = 0;
    }
    this.setState({
      move: false,
      moveRight: this.state.moveRight - 300,
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
    const { projectId, envcardPosition } = this.props;
    return (<EnvCard projectId={projectId} cardData={envcardPosition[x]} />);
  }

  render() {
    const squares = [];
    const { envcardPosition } = this.props;
    for (let i = 0; i < envcardPosition.length; i += 1) {
      squares.push(this.renderSquare(i));
    }

    const rightStyle = classNames({
      'c7n-push-right icon-navigate_next': ((window.innerWidth >= 1680 && window.innerWidth < 1920) && envcardPosition.length >= 5) || (window.innerWidth >= 1920 && envcardPosition.length >= 6) || (window.innerWidth < 1680 && envcardPosition.length >= 4),
      'c7n-push-none': envcardPosition.length <= 4,
    });

    return (
      <div className="c7n-outer-container">
        {scrollLeft !== 0 ?
          <div role="none" className="c7n-push-left icon-navigate_before" onClick={this.pushScrollRight} />
          : ''}
        <div className="c7n-inner-container">
          <div className="c7n-env-board">
            {squares.length ? squares : (<div className="c7n-env-card c7n-env-card-ban">
              <div className="c7n-env-card-header">
                <div>
                  请添加一个环境
                </div>
              </div>
              <div className="c7n-env-state c7n-env-state-ban">
                未添加
              </div>
              <div className="c7n-env-des">
                <span className="c7n-env-des-head">描述：</span>
                请添加一个环境，并填写相应的环境描述信息
              </div>
            </div>)}
          </div>
        </div>
        {this.state.move ? '' : <div role="none" className={rightStyle} onClick={this.pushScrollLeft} />}
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Board);
