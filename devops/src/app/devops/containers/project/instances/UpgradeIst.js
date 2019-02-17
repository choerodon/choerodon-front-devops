import React, { Component, Fragment } from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { Modal, Select, Icon } from "choerodon-ui";
import { stores, Content } from "choerodon-front-boot";
import { injectIntl, FormattedMessage } from "react-intl";
import _ from "lodash";
import YamlEditor from "../../../components/yamlEditor";
import InterceptMask from "../../../components/interceptMask/InterceptMask";
import "./Instances.scss";
import "../../main.scss";

const { Sidebar } = Modal;
const { AppState } = stores;
const Option = Select.Option;

@observer
class UpgradeIst extends Component {
  constructor(props) {
    super(props);
    this.state = {
      versionId: undefined,
      values: null,
      loading: false,
      hasEditorError: false,
    };
  }

  handleNextStepEnable = flag => this.setState({ hasEditorError: flag });
  handleChangeValue = values => this.setState({values});

  onClose = () => {
    const { onClose } = this.props;
    onClose(false);
  };

  /**
   * 修改配置升级实例
   */
  handleOk = () => {

    const {id: projectId} = AppState.currentMenuType;
    const { store, appInstanceId, idArr, onClose } = this.props;
    const { values, versionId } = this.state;

    const verValue = store.getVerValue;

    const verId = versionId || verValue[0].id;

    const data = {
      ...idArr,
      values,
      appInstanceId,
      appVersionId: verId,
      type: "update",
    };

    this.setState({ loading: true });
    store.reDeploy(projectId, data).then(res => {

      if (res && res.failed) {
        Choerodon.prompt(res.message);
      } else {
        onClose(true);
      }

      this.setState({ loading: false });
    });
  };


  /**
   * 切换实例版本，加载该版本下的配置内容
   * @param id
   */
  handleVersionChange = (id) => {
    const { store, appInstanceId, idArr } = this.props;
    const {id: projectId} = AppState.currentMenuType;

    store.loadValue(projectId, appInstanceId, id)
      .then(res => {
        if (res) {
          this.setState({ values: res.yaml, versionId: id });
        }
      })
      .catch(error => {
        Choerodon.handleResponseError(error);
      });
  };

  render() {
    const {
      intl: {formatMessage},
      store: {
        getValue,
        getVerValue,
      },
      name,
    } = this.props;
    const { values, loading, versionId } = this.state;

    const versionOptions = _.map(getVerValue, app => (
      <Option key={app.id} value={app.id}>
        {app.version}
      </Option>
    ));

    return (
      <Sidebar
        title={formatMessage({ id: "ist.upgrade" })}
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.onClose}
        cancelText={formatMessage({ id: "cancel" })}
        okText={formatMessage({ id: "ist.upgrade" })}
        confirmLoading={loading}
      >
        <Content
          code="ist.upgrade"
          values={{ name }}
          className="sidebar-content"
        >
          <Select
            filter
            className="c7n-app-select_512"
            label={formatMessage({id: "deploy.step.one.version.title"})}
            notFoundContent={formatMessage({ id: "ist.noUpVer" })}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={this.handleVersionChange}
            value={versionId || (getVerValue.length ? getVerValue[0].id : undefined)}
          >
            {versionOptions}
          </Select>

          {getVerValue.length === 0 ? (
            <div>
              <Icon type="error" className="c7n-noVer-waring" />
              {formatMessage({ id: "ist.noUpVer" })}
            </div>
          ) : null}

          <div className="c7n-config-section">
            <YamlEditor
              readOnly={false}
              value={values || (getValue ? getValue.yaml : '')}
              handleEnableNext={this.handleNextStepEnable}
              onValueChange={this.handleChangeValue}
            />
          </div>
        </Content>

        <InterceptMask visible={loading} />
      </Sidebar>
    );
  }
}

export default withRouter(injectIntl(UpgradeIst));
