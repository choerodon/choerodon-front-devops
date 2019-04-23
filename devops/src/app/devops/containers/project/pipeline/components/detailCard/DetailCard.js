import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Collapse } from 'choerodon-ui';

import './DetailCard.scss';

const { Panel } = Collapse;

@injectIntl
export default class DetailCard extends PureComponent {
  static propTypes = {
    isParallel: PropTypes.number,
    tasks: PropTypes.array,
  };

  render() {
    const { isParallel, tasks, intl: { formatMessage } } = this.props;
    const executeType = ['serial', 'parallel'];

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
        const panelHead = <div className="c7ncd-pipeline-panel-title">
          <span className="c7ncd-pipeline-panel-name">
            【{formatMessage({ id: `pipeline.mode.${taskType}` })}】{name}
          </span>
          <span className="c7ncd-pipeline-panel-status">{status}</span>
        </div>;

        const expandRow = [
          () => (<Fragment>
            <div>审核模式：{isCountersigned}</div>
            <div>审核人员：{auditUsers}</div>
            <div>审核结果：{status}</div>
          </Fragment>),
          () => (<Fragment>
            <div>应用：{appName}</div>
            <div>版本：{version}</div>
            <div>环境：{envName}</div>
            <div>生成实例：{instanceName}</div>
          </Fragment>),
        ];
        return <Panel className="c7ncd-pipeline-panel" header={panelHead}>
          {expandRow[isCountersigned]()}
        </Panel>;
      });

    return (<div className="c7ncd-pipeline-card">
      <div>任务设置 - <FormattedMessage id={`pipeline.task.${executeType[isParallel]}`} /></div>
      <div>任务列表</div>
      {task.length ? <Collapse className="c7ncd-pipeline-collapse" bordered={false}>
        {tasks}
      </Collapse> : '空'}
    </div>);
  }
}
