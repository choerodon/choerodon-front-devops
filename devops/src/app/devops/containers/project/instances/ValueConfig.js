import React, { Component } from "react";
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
      disabled: true,
      isNotChange: false,
      NotChangeLoading: false,
    };
  }

  /**
   * 事件处理，修改value值后写入store
   * @param {*} value 修改后的value值
   */
  onChange = value => {
    const { store } = this.props;
    const projectId = AppState.currentMenuType.id;
  };

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
   * 点击重新部署，判断是否显示弹窗
   */
  handleOk = () => {
    const { disabled } = this.state;
    if (disabled) {
      this.setState({ isNotChange: true });
    } else {
      this.setState({
        loading: true,
      });
      this.reDeploy();
    }
  };

  /**
   * 修改配置重新部署
   */
  reDeploy = () => {
    const { store, id, idArr, intl } = this.props;
    const { disabled, value } = this.state;
    const projectId = AppState.currentMenuType.id;
    const val = value || store.getValue.yaml;
    const data = {
      values: val,
      appInstanceId: id,
      environmentId: idArr[0],
      appVersionId: idArr[1],
      appId: idArr[2],
      type: "update",
      isNotChange: disabled,
    };
    this.setState({ NotChangeLoading: true });
    store.checkYaml(val, projectId).then(datas => {
      this.setState({ errorLine: datas });
      if (datas.length === 0) {
        store.reDeploy(projectId, data).then(res => {
          if (res && res.failed) {
            Choerodon.prompt(res.message);
          } else {
            this.onClose(res);
          }
          this.setState({
            loading: false,
            isNotChange: false,
            NotChangeLoading: false,
          });
        });
      } else {
        Choerodon.prompt(intl.formatMessage({ id: "ist.yamlErr" }));
        this.setState({
          loading: false,
          isNotChange: false,
          NotChangeLoading: false,
        });
      }
    });
  };

  /**
   * 未修改配置取消重新部署
   */
  handleCancel = () => {
    this.setState({ isNotChange: false });
  };

  render() {
    const { intl, store, name, visible } = this.props;
    const { errorLine, loading, isNotChange, NotChangeLoading } = this.state;
    const data = store.getValue;
    let error = data && data.errorLines;
    if (errorLine !== undefined) {
      error = errorLine;
    }
    const sideDom = (
      <Content code="ist.edit" values={{ name }} className="sidebar-content">
        {data && (
          <YamlEditor
            readOnly={false}
            value={data.yaml}
            // onValueChange={this.handleChangeValue}
            // handleEnableNext={this.handleSecondNextStepEnable}
          />
        )}
      </Content>
    );
    return (
      <React.Fragment>
        <Sidebar
          title={intl.formatMessage({ id: "ist.values" })}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.onClose.bind(this, false)}
          cancelText={intl.formatMessage({ id: "cancel" })}
          okText={intl.formatMessage({ id: "deploy.btn.deploy" })}
          footer={
            <div className="ant-modal-btns">
              <Button
                key="submit"
                type="primary"
                funcType="raised"
                onClick={this.handleOk}
                loading={loading}
                className="ant-modal-btn-ok"
              >
                {intl.formatMessage({ id: "deploy.btn.deploy" })}
              </Button>
              <Button
                funcType="raised"
                className="ant-modal-btn-cancel"
                key="back"
                onClick={this.onClose.bind(this, false)}
                disabled={loading}
              >
                {intl.formatMessage({ id: "cancel" })}
              </Button>
            </div>
          }
        >
          {sideDom}
          <InterceptMask visible={loading} />
        </Sidebar>
        <Modal
          visible={isNotChange}
          width={400}
          onOk={this.reDeploy}
          onCancel={this.handleCancel}
          closable={false}
          confirmLoading={NotChangeLoading}
        >
          <div className="c7n-deploy-modal-content">
            {intl.formatMessage({ id: "envOverview.confirm.reDeploy" })}
          </div>
          <span>
            {intl.formatMessage({ id: "envOverview.confirm.content.reDeploy" })}
          </span>
        </Modal>
      </React.Fragment>
    );
  }
}

export default withRouter(injectIntl(ValueConfig));
