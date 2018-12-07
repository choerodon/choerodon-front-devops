import React from "react";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import _ from "lodash";
import "./PodStatus.scss";

function PodStatus(props) {
  const { deploymentDTOS } = props;
  let correctCount = 0;
  let errorCount = 0;
  if (deploymentDTOS.length) {
    _.map(deploymentDTOS, (item) => {
      const {devopsEnvPodDTOS} = item;
      _.forEach(devopsEnvPodDTOS, (p) => {
        if (p.ready) {
          correctCount += 1;
        } else {
          errorCount += 1;
        }
      });
    });
  }
  const sum = correctCount + errorCount;
  const correct = sum > 0 ? (correctCount / sum) * (Math.PI * 2 * 10) : 0;
  const circle = (<svg width="24" height="24">
    <circle
      cx="50%"
      cy="50%"
      r="10"
      fill="none"
      strokeWidth={(sum === 0 || sum > correctCount) ? 4 : 0}
      stroke={sum > 0 ? '#FFB100' : '#f3f3f3'}
    />
    <circle
      cx="50%"
      cy="50%"
      r="10"
      fill="none"
      className="c7n-pod-circle"
      strokeWidth="4px"
      stroke="#0bc2a8"
      strokeDasharray={`${correct}, 10000`}
    />
    <text x="50%" y="16" className="c7n-pod-circle-num">{sum}</text>
  </svg>);
  return <div className="c7n-deploy-pod-status">{circle}</div>
}

PodStatus.propTypes = {
  deploymentDTOS: PropTypes.object.isRequired,
};

export default injectIntl(PodStatus);
