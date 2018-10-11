import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Popover } from 'choerodon-ui';
import _ from 'lodash';
import '../common.scss';

export default function MaxTagPopover(props) {
  const { value, dataSource } = props;
  const moreOption = [];
  _.forEach(value, (item, index) => {
    const appName = _.find(dataSource, ['id', item]);
    moreOption.push(<span key={item}>{appName.name}{index < value.length - 1 ? '，' : ''}</span>);
  });
  return (
    <Popover
      arrowPointAtCenter
      placement="bottomLeft"
      content={<div className="c7n-report-maxPlace">{moreOption}</div>}
    >
      <div title="">
        <FormattedMessage id="more" />
      </div>
    </Popover>
  );
}
