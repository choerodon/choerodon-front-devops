import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { DashBoardNavBar, stores } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { Select, Spin } from 'choerodon-ui';
import '../common.scss';
import './index.scss';

const { AppState } = stores;
const { Option } = Select;

@observer
class DevOpsDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: null,
      loading: false,
    };
  }

  handleChange = (id) => {
    this.setState({ appId: id });
  };

  getContent = () => {
    const { loading } = this.state;
    if (loading) {
      return (<Spin />);
    }
    return (<div>hello</div>);
  };

  render() {
    const { history } = this.props;
    const { id: projectId, name: projectName, organizationId, type } = AppState.currentMenuType;
    return (<Fragment>
      <Select
        className="c7ncd-db-select"
        placeholder="选择应用"
        style={{ width: 150 }}
        onChange={this.handleChange}
      >
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
      </Select>
      <div className="c7ncd-db-panel">{this.getContent()}</div>
      <DashBoardNavBar>
        <Link to={`/devops/reports/submission?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`}>
          <FormattedMessage id="dashboard.commits" />
        </Link>
      </DashBoardNavBar>
    </Fragment>);
  }
}

export default withRouter(DevOpsDeploy);
