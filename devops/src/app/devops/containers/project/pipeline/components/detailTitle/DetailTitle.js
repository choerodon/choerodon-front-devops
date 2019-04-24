import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Icon, Tooltip } from 'choerodon-ui';
import classnames from 'classnames';
import { timeConvert } from '../../../../../utils';
import { statusIcon } from '../statusMap';

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

    const { name, time, type, user, status, avatar } = this.props;
    const statusStyle = classnames({
      'c7ncd-pipeline-status': true,
      [`c7ncd-pipeline-status_${status}`]: true,
    });
    const bkColor = classnames({
      'c7ncd-pipeline-title': true,
      [`c7ncd-pipeline-title_${status}`]: true,
    });

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
          <Tooltip title={user}>
            {avatar ? <img src={avatar} alt="avatar" /> : <span>{}</span>}
          </Tooltip>
          <FormattedMessage id={`pipeline.flow.${type}`} />
        </div>
      </div>
    );
  }
}
