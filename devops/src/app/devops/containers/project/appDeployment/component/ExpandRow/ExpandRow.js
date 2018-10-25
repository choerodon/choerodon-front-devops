import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import './index.scss';

export default function ExpandRow(props) {
  const { record: { deploymentDTOS } } = props;
  const content = _.map(deploymentDTOS, (item) => {
    const { name, available, age, devopsEnvPodDTOS, current, desired } = item;
    let correctCount = 0;
    let errorCount = 0;
    _.forEach(devopsEnvPodDTOS, (p) => {
      if (p.ready) {
        correctCount += 1;
      } else {
        errorCount += 1;
      }
    });
    const sum = correctCount + errorCount;
    const correct = sum > 0 ? (correctCount / sum) * (Math.PI * 2 * 30) : 0;
    return (<div key={name} className="c7n-deploy-expanded-item">
      <ul className="c7n-deploy-expanded-text">
        <li className="c7n-deploy-expanded-lists">
          <span className="c7n-deploy-expanded-keys"><FormattedMessage id="ist.expand.name" />：</span>
          <span className="c7n-deploy-expanded-values">{name}</span>
        </li>
        <li className="c7n-deploy-expanded-lists">
          <span className="c7n-deploy-expanded-keys">ReplicaSet：</span>
          <span className="c7n-deploy-expanded-values">{`${current} current / ${desired} desired`}</span>
        </li>
        <li className="c7n-deploy-expanded-lists">
          <span className="c7n-deploy-expanded-keys"><FormattedMessage id="ist.expand.replica" />：</span>
          <span className="c7n-deploy-expanded-values">{available || 0}</span>
        </li>
        <li className="c7n-deploy-expanded-lists">
          <span className="c7n-deploy-expanded-keys"><FormattedMessage id="ist.expand.date" />：</span>
          <span className="c7n-deploy-expanded-values">{age}</span>
        </li>
      </ul>
      <div className="c7n-deploy-expanded-pod">
        <svg width="70" height="70">
          <circle
            cx="35"
            cy="35"
            r="30"
            strokeWidth={(sum === 0 || sum > correctCount) ? 5 : 0}
            stroke={sum > 0 ? '#f44336' : '#f3f3f3'}
            className="c7n-pod-circle-error"
          />
          <circle
            cx="35"
            cy="35"
            r="30"
            className="c7n-pod-circle"
            strokeDasharray={`${correct}, 10000`}
          />
          <text x="50%" y="32.5" className="c7n-pod-circle-num">{sum}</text>
          <text x="50%" y="50" className="c7n-pod-circle-text">pod</text>
        </svg>
      </div>
    </div>);
  });
  return (<Fragment>
    {deploymentDTOS && deploymentDTOS.length ? (<div className="c7n-deploy-expanded">
      <div className="c7n-deploy-expanded-title">Deployments</div>
      {content}
    </div>) : <div className="c7n-deploy-expanded-empty"><FormattedMessage id="ist.expand.empty" /></div>}
  </Fragment>);
}
