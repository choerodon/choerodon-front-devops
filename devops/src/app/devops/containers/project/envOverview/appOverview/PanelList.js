import React, { Component } from "react";
import { observer } from "mobx-react";
import { injectIntl, FormattedMessage } from "react-intl";
import {
  Button,
  Form,
  Collapse,
  Icon,
  Input,
  Tooltip,
  Modal,
  Progress,
  Select,
} from "choerodon-ui";

const { AppState } = stores;
const Panel = Collapse.Panel;

@observer
@injectIntl
export default class PanelList extends Component {
  render() {
    return (
      <Collapse accordion key={`${appName}-collapse`} onChange={this.onChange}>
        {_.map(applicationInstanceDTOS, detail => {
          return (
            <Panel
              forceRender
              showArrow={false}
              header={this.getPanelHeader.bind(this, detail)}
              key={id}
            >
              <ExpandRow record={detail} />
            </Panel>
          );
        })}
        {/* 处理Safari浏览器下，折叠面板渲染最后一个节点panel卡顿问题 */}
        <Panel className="c7n-envow-none" forceRender key={`${appName}-none`}>
          none
        </Panel>
      </Collapse>
    );
  }
}
