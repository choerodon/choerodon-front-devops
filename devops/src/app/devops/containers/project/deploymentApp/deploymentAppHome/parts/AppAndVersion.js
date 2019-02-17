import React, { Component, Fragment } from "react";
import {
  Permission,
  stores,
} from "choerodon-front-boot";
import _ from "lodash";
import SelectApp from "../../selectApp";

const { AppState } = stores;

class AppAndVersion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  handleCancel = () => {
    this.setState({ show: false });
  };

  /**
   * 弹框确定
   * @param app 选择的数据
   * @param key 标明是项目应用还是应用市场应用
   */
  handleOk = (app, key) => {
    const { DeploymentAppStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    if (app) {
      if (key === "1") {
        DeploymentAppStore.loadVersion(app.id, projectId, "");
        this.setState({
          app,
          istName: `${app.code}-${uuidv1().substring(0, 5)}`,
          appId: app.id,
          show: false,
          is_project: true,
          versionId: undefined,
          versionDto: null,
        });
      } else {
        DeploymentAppStore.loadVersion(app.appId, projectId, true);
        this.setState({
          app,
          istName: `${app.code}-${uuidv1().substring(0, 5)}`,
          appId: app.appId,
          show: false,
          is_project: false,
          versionId: undefined,
          versionDto: null,
        });
      }
    } else {
      this.setState({ show: false });
    }
  };

  render() {
    const { show } = this.state;
    return (<Fragment>
      {show && (
        <SelectApp
          isMarket={!is_project}
          app={app}
          show={show}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
        />
      )}
    </Fragment>);
  }
}

export default AppAndVersion;
