/*
*
* 对具有hover效果显示描述的Options封装组件
*
* */

import React from 'react';
import { observer } from 'mobx-react';
import { Popover } from 'choerodon-ui';
import './OptionHover.scss';

const OptionHoverRequiredProps = {
  name: React.PropTypes.string,
  description: React.PropTypes.string,
};

function OptionHover({ name, description }) {
  return (<div>
    {description ? <Popover
      placement="left"
      content={
        <div>
          {Choerodon.languageChange('environment.description')} : {description}
        </div>}
      trigger="hover"
    >
      <span className="popover-inner">{name}</span>
    </Popover> : <Popover
      placement="left"
      content={null}
      trigger="focus"
    >
      <span className="popover-inner">{name}</span>
    </Popover>}
  </div>);
}

OptionHover.propTypes = OptionHoverRequiredProps;
export default observer(OptionHover);
