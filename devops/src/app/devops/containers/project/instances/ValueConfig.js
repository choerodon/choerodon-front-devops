import React, { Component } from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { Modal, Button } from "choerodon-ui";
import { Content, stores } from "choerodon-front-boot";
import YAML from "yamljs";
import { injectIntl, FormattedMessage } from "react-intl";
import Ace from "../../../components/yamlAce/index";
import "./Instances.scss";
import "../../main.scss";

const { Sidebar } = Modal;
const { AppState } = stores;

@observer
class ValueConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      loading: false,
      disabled: true,
      isNotChange: false,
      NotChangeloading: false,
    };
  }

  /**
   * 事件处理，修改value值后写入store
   * @param {*} value 修改后的value值
   */
  onChange = value => {
    const { store } = this.props;
    const projectId = AppState.currentMenuType.id;
    store.checkYaml(value, projectId).then(data => {
      this.setState({ errorLine: data });
      const oldYaml = store.getValue ? store.getValue.yaml : "";
      const oldvalue = YAML.parse(oldYaml);
      const newvalue = YAML.parse(value);
      if (JSON.stringify(oldvalue) === JSON.stringify(newvalue)) {
        this.setState({
          disabled: true,
        });
      } else {
        this.setState({
          disabled: false,
        });
      }
    });
    this.setState({
      value,
    });
  };

  /**
   * 关闭弹窗
   * @param res
   */
  onClose = res => {
    const { store } = this.props;
    this.setState({
      value: store.getValue,
    });
    this.props.onClose(res);
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
      appVerisonId: idArr[1],
      appId: idArr[2],
      type: "update",
      isNotChange: disabled,
    };
    this.setState({ NotChangeloading: true });
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
            NotChangeloading: false,
          });
        });
      } else {
        Choerodon.prompt(intl.formatMessage({ id: "ist.yamlErr" }));
        this.setState({
          loading: false,
          isNotChange: false,
          NotChangeloading: false,
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
    const { errorLine, loading, isNotChange, NotChangeloading } = this.state;
    const data = store.getValue;
    let error = data && data.errorLines;
    if (errorLine !== undefined) {
      error = errorLine;
    }
    const sideDom = (
      <div className="c7n-region">
        <Content code="ist.edit" values={{ name }} className="sidebar-content">
          <div className="c7n-ace-section">
            <div className="c7n-body-section c7n-border-done">
              <div>
                {data && (
                  <Ace
                    newLines={data.newLines}
                    isFileError={!!data.errorLines}
                    errorLines={error}
                    totalLine={data.totalLine}
                    value={data.yaml}
                    highlightMarkers={
                      data.highlightMarkers && data.highlightMarkers.slice()
                    }
                    onChange={this.onChange}
                    change
                  />
                )}
              </div>
            </div>
          </div>
        </Content>
      </div>
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
              >
                {intl.formatMessage({ id: "cancel" })}
              </Button>
            </div>
          }
        >
          {sideDom}
        </Sidebar>
        <Modal
          visible={isNotChange}
          width={400}
          onOk={this.reDeploy}
          onCancel={this.handleCancel}
          closable={false}
          confirmLoading={NotChangeloading}
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
