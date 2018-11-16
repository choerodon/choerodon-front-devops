import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
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
import '../DevOpsBranch/index.scss';

const { AppState } = stores;
const { Option } = Select;

@observer
class DevOpsBuild extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: null,
      loading: true,
      noSelect: false,
    };
  }

  componentDidMount() {
    const { id } = AppState.currentMenuType;
    ReportsStore.loadAllApps(id).then((data) => {
      if (data && data.length) {
        this.setState({ appId: data[0].id });
        this.loadCharts();
      } else {
        this.setState({ noSelect: true, loading: false });
      }
    });
  }

  componentWillUnmount() {
    ReportsStore.setBuildNumber({});
    ReportsStore.setAllApps([]);
  }

  /**
   * 加载图表
   */
  loadCharts = () => {
    const projectId = AppState.currentMenuType.id;
    const { appId } = this.state;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    ReportsStore.loadBuildNumber(projectId, appId, startTime, endTime)
      .then(() => {
        this.setState({ loading: false });
      });
  };

  handleChange = (id) => {
    this.setState({ appId: id }, () => this.loadCharts());
  };

  getContent = () => {
    const { loading } = this.state;
    const { echartsLoading } = ReportsStore;
    if (loading) {
      return (<div className="c7ncd-dashboard-loading"><Spin /></div>);
    }
    return (<div className="c7n-buildNumber-content">
      <BuildChart
        height="300px"
        echartsLoading={echartsLoading}
        top="10%"
        bottom="4%"
        languageType="dashboard"
      />
    </div>);
  };

  render() {
    const { intl: { formatMessage } } = this.props;
    const { id: projectId, name: projectName, organizationId, type } = AppState.currentMenuType;
    const { getAllApps } = ReportsStore;
    const { appId, noSelect } = this.state;
    return (<Fragment>
      <Select
        className={`c7ncd-dashboard-select ${noSelect ? 'c7n-dashboard-build-select' : ''}`}
        notFoundContent={formatMessage({ id: 'dashboard.noApp' })}
        placeholder={formatMessage({ id: 'dashboard.environment.select' })}
        onChange={this.handleChange}
        defaultValue={appId}
        value={appId}
      >
        {
          _.map(getAllApps, (app, index) => (
            <Option value={app.id} key={index}>
              <Tooltip title={app.code}>
                <span className="c7n-app-select-tooltip">
                  {app.name}
                </span>
              </Tooltip>
            </Option>))
        }
      </Select>
      <div className="c7ncd-db-panel c7ncd-db-panel-size">{this.getContent()}</div>
      <DashBoardNavBar>
        <Link
          to={{
            pathname: '/devops/reports/build-number',
            search: `?type=${type}&id=${projectId}&name=${encodeURIComponent(projectName)}&organizationId=${organizationId}`,
            state: { appId },
          }}
        >
          <FormattedMessage id="dashboard.build" />
        </Link>
      </DashBoardNavBar>
    </Fragment>);
  }
}

export default withRouter(injectIntl(DevOpsBuild));
