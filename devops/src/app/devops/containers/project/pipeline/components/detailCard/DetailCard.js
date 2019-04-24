import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import _ from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Collapse, Icon, Tooltip } from 'choerodon-ui';
import { statusIcon } from '../statusMap';

import './DetailCard.scss';

const { Panel } = Collapse;

@injectIntl
@withRouter
export default class DetailCard extends PureComponent {
  static propTypes = {
    isParallel: PropTypes.number,
    tasks: PropTypes.array,
  };

  render() {
    const {
      isParallel,
      tasks,
      intl: { formatMessage },
      location: {
        search,
      },
    } = this.props;
    const executeType = ['serial', 'parallel'];
    const mode = ['sign', 'orSign'];

    const task = _.map(tasks,
      ({
         id,
         name,
         status,
         taskType,
         isCountersigned,
         auditUsers,
         appName,
         envName,
         version,
         instanceName,
         instanceId,
       }) => {

        const panelHead = (<div className="c7ncd-pipeline-panel-title">
          <Tooltip
            title={name}
            placement="top"
          >
            <span className="c7ncd-pipeline-panel-name">
              【{formatMessage({ id: `pipeline.mode.${taskType}` })}】
              <span className="c7ncd-stage-name-light">{name}</span>
            </span>
          </Tooltip>
          <Icon type={statusIcon[status]} className={`task-status_${status}`} />
        </div>);

        const expandRow = {
          manual: () => (<Fragment>
            <div className="c7ncd-pipeline-task">
              <span className="c7ncd-pipeline-task-label">{formatMessage({ id: 'pipeline.detail.mode' })}</span>
              {formatMessage({ id: `pipeline.audit.${mode[isParallel]}` })}
            </div>
            <div className="c7ncd-pipeline-task">
              <span className="c7ncd-pipeline-task-label">{formatMessage({ id: 'pipeline.detail.users' })}</span>
              {auditUsers || formatMessage({ id: 'null' })}
            </div>
            <div className="c7ncd-pipeline-task">
              <span className="c7ncd-pipeline-task-label">{formatMessage({ id: 'pipeline.detail.result' })}</span>
              {formatMessage({ id: `pipeline.result.${status}` })}
            </div>
          </Fragment>),
          auto: () => (<Fragment>
            <div className="c7ncd-pipeline-task">
              <span className="c7ncd-pipeline-task-label">{formatMessage({ id: 'app' })}：</span>
              {appName}
            </div>
            <div className="c7ncd-pipeline-task">
              <span className="c7ncd-pipeline-task-label">{formatMessage({ id: 'version' })}：</span>
              {version || formatMessage({ id: 'null' })}
            </div>
            <div className="c7ncd-pipeline-task">
              <span className="c7ncd-pipeline-task-label">{formatMessage({ id: 'environment' })}：</span>
              {envName}
            </div>
            <div className="c7ncd-pipeline-task">
              <span className="c7ncd-pipeline-task-label">{formatMessage({ id: 'pipeline.detail.instance' })}</span>
              {instanceName || formatMessage({ id: 'null' })}
            </div>
          </Fragment>),
        };
        return <Panel className="c7ncd-pipeline-panel" header={panelHead}>
          {expandRow[taskType] ? expandRow[taskType]() : null}
        </Panel>;
      });

    return (<div className="c7ncd-pipeline-card">
      <div className="c7ncd-task-top">{formatMessage({ id: 'pipeline.task.settings' })} - <FormattedMessage
        id={`pipeline.task.${executeType[isParallel]}`} /></div>
      <h4 className="c7ncd-task-header">{formatMessage({ id: 'pipeline.task.list' })}</h4>
      {task.length
        ? <Collapse className="c7ncd-pipeline-collapse" bordered={false}>
          {task}
        </Collapse>
        : <div className="c7ncd-pipeline-task-empty">
          <FormattedMessage id="pipeline.task.empty" />
        </div>}
    </div>);
  }
}
