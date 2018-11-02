import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Tooltip, Icon } from 'choerodon-ui';
import "./index.scss";

function UploadIcon (props) {
  const { text, status, prevText, intl: { formatMessage } } = props;
  let dom = text;
  switch (status) {
    case 'upload':
      dom = (<Fragment>
        <span className="c7n-instance-upload-text">{text || formatMessage({ id: 'ist.version.deploy' }, { text: prevText })}</span>
        {text ? <Tooltip title={formatMessage({ id: `ist.version.${text ? 'upload' : 'deploy'}` }, { text: prevText })}>
          <svg className="c7n-instance-upload" width="16" height="16">
            <path className="c7n-instance-upload-arrow" d="
            M 4.5  13
            L 11.5 13
            L 11.5 7
            L 15   7
            L 8    1
            L 1    7
            L 4.5  7
            Z
          "/>
            <line  className="c7n-instance-upload-line" x1="1.5" y1="14" x2="14.5" y2="14" />
          </svg>
        </Tooltip> : null}
      </Fragment>)
      break;
    case 'failed':
      dom = (<Fragment>
        <span className="c7n-instance-upload-text">{text ||  formatMessage({ id: 'ist.version.deploy.failed' }, { text: prevText })}</span>
        {text ? <Tooltip title={formatMessage({ id: 'ist.version.failed' }, { text: prevText })}>
          <Icon type="error" className="c7n-instance-upload-failed" />
        </Tooltip> : null}
      </Fragment>);
      break;
    default:
      dom = <span className="c7n-instance-upload-text">{text}</span>;
  }
  return(dom);
}

UploadIcon.defaultProps = {
  status: 'text',
  prevText: '',
};

UploadIcon.propTypes = {
  status: PropTypes.string,
  prevText: PropTypes.string,
  text: PropTypes.string,
};

export default injectIntl(UploadIcon);
