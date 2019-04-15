import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button } from 'choerodon-ui';

import './StageTitle.scss';

export default class StageTitle extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  };

  static defaultProps = {
    name: '',
    type: 'auto',
  };

  render() {
    const {
      name,
      type,
      onChange,
      onRemove,
    } = this.props;

    return (
      <div className="c7ncd-pipeline-stage-head">
        <div className="c7ncd-pipeline-stage-title">
          <h3 className="c7ncd-pipeline-stage-name">{name}</h3>
          <div className="c7ncd-pipeline-stage-type">
            <FormattedMessage id={`pipeline.flow.${type}`} />
          </div>
        </div>
        <div className="c7ncd-pipeline-stage-op">
          <Button
            className="c7ncd-pipeline-stage-btn"
            size="small"
            icon="mode_edit"
            shape="circle"
            onClick={onChange}
          />
          <Button
            size="small"
            icon="delete_forever"
            shape="circle"
            onClick={onRemove}
          />
        </div>
      </div>
    );
  }
}
