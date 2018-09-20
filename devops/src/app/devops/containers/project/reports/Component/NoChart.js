import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import './NoChart.scss';

function NoChart(props) {
  const { title, des } = props;
  return (
    <div className="c7n-no-chart">
      <div className="c7n-no-chart-pic">
        <div />
      </div>
      <div className="c7n-no-chart-desc">
        <div className="c7n-no-chart-title">{title}</div>
        <div className="c7n-no-chart-des">{des}</div>
      </div>
    </div>
  );
}

NoChart.propTypes = {
  title: PropTypes.string.isRequired,
  des: PropTypes.string.isRequired,
};

export default withRouter(NoChart);
