import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Icon, Tooltip } from 'choerodon-ui';
import classnames from 'classnames';
import _ from 'lodash';
import { timeConvert } from '../../../../../utils';
import { statusIcon } from '../statusMap';
import { STAGE_FLOW_MANUAL } from '../Constans';

import './DetailTitle.scss';

export default class DetailTitle extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    time: PropTypes.number,
    status: PropTypes.string,
  };

  static defaultProps = {
    name: '',
    type: 'auto',
  };

  render() {
    const { name, time, type, user, status } = this.props;
    const statusStyle = classnames({
      'c7ncd-pipeline-status': true,
      [`c7ncd-pipeline-status_${status}`]: true,
    });
    const bkColor = classnames({
      'c7ncd-pipeline-title': true,
      [`c7ncd-pipeline-title_${status}`]: true,
    });

    let triggerDom = null;

    if (type === STAGE_FLOW_MANUAL) {
      const audit = _.find(user, 'audit');
      if (audit) {
        const { realName, imageUrl } = audit;
        triggerDom = <Fragment>
          <Tooltip title={realName}>
            {imageUrl
              ? <img className="c7ncd-trigger-img" src={imageUrl} alt="avatar" />
              : <span className="c7ncd-trigger-text">{_.toString(realName).toUpperCase().substring(0, 1)
              }</span>}
          </Tooltip>
          <FormattedMessage id={`pipeline.flow.${type}`} />
        </Fragment>;
      } else {
        const userName = _.map(user, ({ realName }) => realName).join('，');
        triggerDom = <Tooltip title={userName}>
          <span className="c7ncd-trigger-pending"><FormattedMessage id={`pipeline.flow.${type}`} /></span>
        </Tooltip>;
      }
    } else {
      triggerDom = <FormattedMessage id={`pipeline.flow.${type}`} />;
    }

    return (
      <div className={bkColor}>
        <div className={statusStyle}>
          <Icon className="stage-icon" type={statusIcon[status]} />
        </div>
        <div className="c7ncd-pipeline-detail-execute">
          <div className="c7ncd-pipeline-execute-name">{name}</div>
          <div className="c7ncd-pipeline-execute-time">{timeConvert(Number(time))}</div>
        </div>
        <div className="c7ncd-pipeline-title-trigger">
          {triggerDom}
        </div>
      </div>
    );
  }
}
