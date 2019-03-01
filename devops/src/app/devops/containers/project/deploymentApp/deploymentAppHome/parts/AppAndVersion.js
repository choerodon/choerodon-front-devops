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
   * 确认选择APP
   * @param app 选择的数据
   * @param key 标明是项目应用还是应用市场应用
   */
  handleOk = (app, key) => {
    const {DeploymentAppStore} = this.props;
    const {id: projectId} = AppState.currentMenuType;
    if (app) {
      const appId = key === "1" ? app.id: app.appId;
      const isLocalProject = key === "1";
      DeploymentAppStore.loadVersion(appId, projectId, !isLocalProject || '');
      this.setState({
        app,
        appId,
        isLocalProject,
        show: false,
        versionDto: null,
        versionId: undefined,
        istName: `${app.code}-${uuidv1().substring(0, 5)}`,
      });
    } else {
      this.setState({show: false});
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
