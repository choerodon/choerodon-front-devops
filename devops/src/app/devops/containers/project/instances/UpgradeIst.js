import React, { Component } from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { Modal, Select, Icon } from "choerodon-ui";
import { stores, Content } from "choerodon-front-boot";
import { injectIntl, FormattedMessage } from "react-intl";
import _ from "lodash";
import YamlEditor from "../../../components/yamlEditor";
import "./Instances.scss";
import "../../main.scss";
import InterceptMask from "../../../components/interceptMask/InterceptMask";

const { Sidebar } = Modal;
const { AppState } = stores;
const Option = Select.Option;

@observer
class UpgradeIst extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: undefined,
      value: "",
      loading: false,
      oldData: null,
      change: false,
      hasEditorError: false,
    };
  }

  /**
   * 关闭弹窗
   * @param res
   */
  onClose = res => {
    const { store, onClose } = this.props;
    this.setState({
      value: store.getValue,
    });
    onClose(res);
  };

  /**
   * 修改配置升级实例
   */
  handleOk = () => {
    this.setState({ loading: true });
    const { store, appInstanceId, idArr, intl } = this.props;
    const { value, id } = this.state;
    const projectId = AppState.currentMenuType.id;
    const updateValue = value || store.getValue.yaml;
    const verValue = store.getVerValue;
    const verId = id || verValue[0].id;
    const data = {
      ...idArr,
      values: updateValue,
      appInstanceId,
      appVersionId: verId,
      type: "update",
    };
  };

  handleSecondNextStepEnable = flag => {
    this.setState({ hasEditorError: flag });
  };

  aceDom = data => {
    const { errorLine, change } = this.state;
    return data ? (
      <YamlEditor
        readOnly={false}
        value={data.yaml}
        handleEnableNext={this.handleSecondNextStepEnable}
        change={change}
      />
    ) : null;
  };

  handleChange(id) {
    const { store, appInstanceId, idArr } = this.props;
    const projectId = AppState.currentMenuType.id;
    this.setState({
      id,
    });
    store.loadValue(projectId, appInstanceId, id).then(res => {
      if (res) {
        this.setState({ oldData: res, change: false });
      }
    });
  }

  render() {
    const { intl, store, name } = this.props;
    const { oldData, loading, id } = this.state;
    const data = oldData || store.getValue;
    const verValue = this.props.store.getVerValue;
    const sideDom = (
      <div className="c7n-region">
        <Content
          code="ist.upgrade"
          values={{ name }}
          className="sidebar-content"
        >
          {verValue && (
            <div>
              <Select
                className="c7n-app-select_512"
                notFoundContent={intl.formatMessage({ id: "ist.noUpVer" })}
                value={id || (verValue.length ? verValue[0].id : undefined)}
                label={intl.formatMessage({
                  id: "deploy.step.one.version.title",
                })}
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                filter
                onChange={this.handleChange.bind(this)}
              >
                {_.map(verValue, app => (
                  <Option key={app.id} value={app.id}>
                    {app.version}
                  </Option>
                ))}
              </Select>
              {verValue.length === 0 ? (
                <div>
                  <Icon type="error" className="c7n-noVer-waring" />
                  {intl.formatMessage({ id: "ist.noUpVer" })}
                </div>
              ) : null}
            </div>
          )}
          <div className="c7n-ace-section">
            {this.aceDom(data)}
          </div>
        </Content>
      </div>
    );
    return (
      <Sidebar
        title={intl.formatMessage({ id: "ist.upgrade" })}
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.onClose.bind(this, false)}
        cancelText={intl.formatMessage({ id: "cancel" })}
        okText={intl.formatMessage({ id: "ist.upgrade" })}
        confirmLoading={loading}
      >
        {sideDom}
        <InterceptMask visible={loading} />
      </Sidebar>
    );
  }
}

export default withRouter(injectIntl(UpgradeIst));
