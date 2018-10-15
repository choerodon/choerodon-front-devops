import React, { Component, Fragment } from 'react';
import { Link, withRouter, intl } from 'react-router-dom';
import { DashBoardNavBar, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { Select, Spin, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import '../common.scss';
import './index.scss';
import BuildChart from '../../containers/project/reports/BuildNumber/BuildChart';
import ReportsStore from '../../stores/project/reports';
import '../../containers/project/reports/BuildNumber/BuildNumber.scss';

const { AppState } = stores;
const { Option } = Select;

@observer
class DevOpsBuild extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: null,
      loading: true,
    };
  }

  componentDidMount() {
    const { id } = AppState.currentMenuType;
    ReportsStore.loadApps(id).then((data) => {
      if (data && data.length) {
        this.setState({ appId: data[0].id });
        this.loadCharts();
      }
    });
  }

  /**
   * 加载图表
   */
  loadCharts = () => {
    const projectId = AppState.currentMenuType.id;
    const { appId } = this.state;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    ReportsStore.loadBuildNumber(projectId, appId, startTime, endTime);
    this.setState({ loading: false });
  };

  handleChange = (id) => {
    this.setState({ appId: id }, () => this.loadCharts());
  };

  getContent = () => {
    const { loading } = this.state;
    const { echartsLoading } = ReportsStore;
    if (loading) {
      return (<Spin />);
    }
    return (<div className="c7n-buildNumber-content"><BuildChart height="200px" echartsLoading={echartsLoading} top="17%" /></div>);
  };

  render() {
    const { history } = this.props;
    const { id: projectId, name: projectName, organizationId, type } = AppState.currentMenuType;
    const { apps } = ReportsStore;
    const { appId } = this.state;
    return (<Fragment>
      <Select
        className="c7ncd-db-select"
        placeholder="选择应用"
        style={{ width: 85 }}
        onChange={this.handleChange}
        defaultValue={appId}
        value={appId}
      >
        {
          _.map(apps, (app, index) => (
            <Option value={app.id} key={index}>
              <Tooltip title={app.code}>
                <span className="c7n-app-select-tooltip">
                  {app.name}
                </span>
              </Tooltip>
            </Option>))
        }
      </Select>
      <div className="c7ncd-db-panel">{this.getContent()}</div>
      <DashBoardNavBar>
        <Link to={`/devops/reports/build-number?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`}>
          <FormattedMessage id="dashboard.build" />
        </Link>
      </DashBoardNavBar>
    </Fragment>);
  }
}

export default withRouter(injectIntl(DevOpsBuild));
