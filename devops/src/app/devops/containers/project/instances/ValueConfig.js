import React, { Component, Fragment } from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { injectIntl } from "react-intl";
import { Modal, Button } from "choerodon-ui";
import { Content, stores } from "choerodon-front-boot";
import YAML from "yamljs";
import YamlEditor from "../../../components/yamlEditor";
import InterceptMask from "../../../components/interceptMask/InterceptMask";
import "./Instances.scss";
import "../../main.scss";

const { Sidebar } = Modal;
const { AppState } = stores;

@observer
class ValueConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      loading: false,
      hasChanged: false,
      modalDisplay: false,
      hasEditorError: false,
    };
  }

  /**
   * 关闭弹窗
   */
  onClose = () => this.props.onClose(false);

  /**
   * 点击重新部署，判断是否显示弹窗
   */
  handleOk = () => {
    const { hasChanged } = this.state;
    if (hasChanged) {
      this.reDeploy();
    } else {
      this.setState({ modalDisplay: true });
    }
  };

  /**
   * 修改配置重新部署
   */
  reDeploy = () => {
    const { store, id, idArr, onClose } = this.props;
    const { value } = this.state;
    const { id: projectId } = AppState.currentMenuType;

    const data = {
      ...idArr,
      values: value,
      appInstanceId: id,
      type: "update",
    };

    this.setState({ modalDisplay: false, loading: true });

    store.reDeploy(projectId, data).then(res => {
      if (res && res.failed) {
        Choerodon.prompt(res.message);
      } else {
        onClose(true);
      }
      this.setState({
        loading: false,
      });
    });
  };

  /**
   * yaml编辑器内容改变
   * @param value
   */
  handleChangeValue = (value) => {
    const {store} = this.props;
    const config = store.getValue;
    const oldYaml = config ? config.yaml : '';

    try {
      const oldValue = YAML.parse(oldYaml);
      const newValue = YAML.parse(value);

      let hasChanged = true;
      // 实际值变动检测
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        hasChanged = false;
      }
      this.setState({value, hasChanged});
    } catch (e) {
    }

  };


  handleEnableNext = flag => this.setState({hasEditorError: flag});

  /**
   * 未修改配置取消重新部署
   */
  handleCancel = () => this.setState({ modalDisplay: false });

  render() {
    const { intl: { formatMessage }, store, name, visible } = this.props;
    const { loading, modalDisplay, hasEditorError } = this.state;

    const yamlConfig = store.getValue;

    const sideDom = (
      <Content code="ist.edit" values={{ name }} className="sidebar-content">
        <YamlEditor
          readOnly={false}
          value={yamlConfig ? yamlConfig.yaml : ''}
          onValueChange={this.handleChangeValue}
          handleEnableNext={this.handleEnableNext}
        />
      </Content>
    );

    return (
      <Fragment>
        <Sidebar
          title={formatMessage({ id: "ist.values" })}
          visible={visible}
          footer={
            [<Button
              key="submit"
              type="primary"
              funcType="raised"
              onClick={this.handleOk}
              loading={loading}
              disabled={hasEditorError}
            >
              {formatMessage({ id: "deploy.btn.deploy" })}
            </Button>,
            <Button
              funcType="raised"
              key="back"
              onClick={this.onClose}
              disabled={loading}
                >
                {formatMessage({ id: "cancel" })}
            </Button>]
          }
        >
          {sideDom}
          <InterceptMask visible={loading} />
        </Sidebar>
        <Modal
          visible={modalDisplay}
          width={400}
          onOk={this.reDeploy}
          onCancel={this.handleCancel}
          closable={false}
        >
          <div className="c7n-deploy-modal-content">
            {formatMessage({ id: "envOverview.confirm.reDeploy" })}
          </div>
          <span>
            {formatMessage({ id: "envOverview.confirm.content.reDeploy" })}
          </span>
        </Modal>
      </Fragment>
    );
  }
}

export default withRouter(injectIntl(ValueConfig));
