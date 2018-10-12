import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { DashBoardNavBar, stores } from 'choerodon-front-boot';
import './index.scss';

const { AppState } = stores;

class DevOpsCommit extends Component {
  render() {
    const { history } = this.props;
    const { id: projectId, name: projectName, organizationId, type } = AppState.currentMenuType;
    return (<div>
      <DashBoardNavBar>
        <a
          role="none"
          onClick={() => {
            history.push(`/devops/reports/submission?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`);
            return false;
          }}
        >
          {'查看代码提交详情'}
        </a>
      </DashBoardNavBar>
    </div>);
  }
}

export default withRouter(DevOpsCommit);
