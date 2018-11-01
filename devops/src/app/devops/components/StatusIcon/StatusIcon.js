import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Tooltip, Progress, Icon } from 'choerodon-ui';
import './StatusIcon.scss';

function StatusIcon(props) {
  const { status, error, name, intl: { formatMessage } } = props;
  let statusDom = null;
  switch (status) {
    case 'failed':
      statusDom = (<Tooltip title={`${status} ${error ? `:${error}` : ''}`}>
        <Icon type="error" className="c7n-status-failed" />
      </Tooltip>);
      break;
    case 'operating':
      statusDom = (<Tooltip title={formatMessage({ id: `ist_${status}` })}>
        <Progress type="loading" width={15} className="c7n-status-progress" />
      </Tooltip>);
      break;
    default:
      statusDom = null;
  }
  return (<React.Fragment>
    <span className="c7n-status-text">{name}</span>
    {statusDom}
  </React.Fragment>);
}

StatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default injectIntl(StatusIcon);
