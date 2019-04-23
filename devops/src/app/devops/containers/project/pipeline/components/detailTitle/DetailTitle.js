import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Icon } from 'choerodon-ui';
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

    const { name, time, type, user, status } = this.props;
    const statusStyle = classnames({
      'c7ncd-pipeline-status': true,
      [`c7ncd-pipeline-status_${status || 'success'}`]: true,
    });
    const bkColor = classnames({
      'c7ncd-pipeline-title': true,
      [`c7ncd-pipeline-title_${status || 'success'}`]: true,
    });

    return (
      <div className={bkColor}>
        <div className={statusStyle}>
          <Icon type={statusIcon[status || 'success']} />
        </div>
        <div className="c7ncd-pipeline-execute">
          <div className="c7ncd-pipeline-execute-name">{name}</div>
          <div className="c7ncd-pipeline-execute-time">{timeConvert(time || 1223223)}</div>
        </div>
        <div className="c7ncd-pipeline-title-trigger">
          {type
            ? '自动流转'
            : `${user}审核后流转`
          }
        </div>
      </div>
    );
  }
}
