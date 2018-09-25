import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Select, Button } from 'choerodon-ui';
import _ from 'lodash';
import ChartSwitch from '../Component/ChartSwitch';
import LineChart from './LineChart';
import CommitHistory from './CommitHistory';
import TimePicker from '../Component/TimePicker';
import NoChart from '../Component/NoChart';
import './Submission.scss';
import '../../../main.scss';

/**
 * 将数据转为图表可用格式
 * @param data
 * @returns {{total, user: Array}}
 */
function formatData(data) {
  const { totalCommitsDate, commitFormUserDTOList } = data;
  const total = {};
  const user = [];
  if (totalCommitsDate && commitFormUserDTOList) {
    total.items = _.countBy(totalCommitsDate, item => item.slice(0, 10));
    total.count = totalCommitsDate.length;
    _.forEach(commitFormUserDTOList, (item) => {
      const { name, imgUrl, commitDates, id } = item;
      const userTotal = {
        name,
        avatar: imgUrl,
      };
      userTotal.id = id;
      userTotal.items = _.countBy(commitDates, cit => cit.slice(0, 10));
      userTotal.count = commitDates.length;
      user.push(userTotal);
    });
  }

  return {
    total,
    user,
  };
}

const { AppState } = stores;
const { Option } = Select;

@observer
class Submission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: null,
      page: 0,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    const { ReportsStore } = this.props;
    ReportsStore.setApps([]);
  }

  handleRefresh = () => this.loadData();

  /**
   * 应用选择
   * @param e
   */
  handleSelect = (e) => {
    const { ReportsStore } = this.props;
    const { page } = this.state;
    const { id: projectId } = AppState.currentMenuType;
    this.setState({ appId: e });
    let appIds = e;
    if (!e.length) {
      appIds = null;
    }
    ReportsStore.loadCommits(projectId, appIds);
    ReportsStore.loadCommitsRecord(projectId, appIds, page);
  };

  handlePageChange = (page) => {
    const { ReportsStore } = this.props;
    const { appId } = this.state;
    const { id: projectId } = AppState.currentMenuType;
    this.setState({ page });
    ReportsStore.loadCommitsRecord(projectId, appId, page - 1);
  };

  loadData = () => {
    const { ReportsStore: { loadApps, loadCommits, loadCommitsRecord, getStartTime, getEndTime } } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    loadApps(projectId).then((data) => {
      if (data && data.length) {
        loadCommits(projectId, getStartTime, getEndTime);
        loadCommitsRecord(projectId, getStartTime, getEndTime);
      }
    });
  };

  render() {
    const { intl: { formatMessage }, history, ReportsStore } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const { appId } = this.state;
    const commits = ReportsStore.getCommits;
    const { total, user } = formatData(commits);
    const apps = ReportsStore.getApps;
    const commitsRecord = ReportsStore.getCommitsRecord;
    const defaultApp = [];
    const options = _.map(apps, (item) => {
      defaultApp.push(item.id);
      return (<Option key={item.id} value={item.id}>{item.name}</Option>);
    });
    const personChart = _.map(user, item => (<div key={item.id} className="c7n-report-submission-item">
      <LineChart
        loading={ReportsStore.getCommitLoading}
        name={item.name}
        color="#ff9915"
        style={{ width: '100%', height: 176 }}
        data={item}
        hasAvatar
      />
    </div>));
    return (<Page className="c7n-region">
      <Header
        title={formatMessage({ id: 'report.submission.head' })}
        backPath={`/devops/reports?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`}
      >
        <ChartSwitch
          history={history}
          current="submission"
        />
        <Button
          icon="refresh"
          onClick={this.handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Content code="report.submission" value={{ name }}>
        {apps && apps.length
          ? (<Fragment>
            <div className="c7n-report-control">
              <Select
                className=" c7n-report-control-select"
                mode="multiple"
                label={formatMessage({ id: 'chooseApp' })}
                placeholder={formatMessage({ id: 'report.app.noselect' })}
                maxTagCount={3}
                value={appId || defaultApp}
                maxTagPlaceholder={formatMessage({ id: 'report.app.more' })}
                onChange={this.handleSelect}
                optionFilterProp="children"
                filter
              >
                {options}
              </Select>
              <TimePicker
                startTime={ReportsStore.getStartTime}
                endTime={ReportsStore.getEndTime}
                func={this.loadData}
                store={ReportsStore}
              />
            </div>
            <div className="c7n-report-submission clearfix">
              <div className="c7n-report-submission-overview">
                <LineChart
                  loading={ReportsStore.getCommitLoading}
                  name="提交情况"
                  color="#4677dd"
                  style={{ width: '100%', height: 276 }}
                  data={total}
                  hasAvatar={false}
                />
              </div>
              <div className="c7n-report-submission-history">
                <CommitHistory
                  onPageChange={this.handlePageChange}
                  dataSource={commitsRecord}
                />
              </div>
            </div>
            <div className="c7n-report-submission-wrap clearfix">{personChart}</div>
          </Fragment>)
          : <NoChart title={formatMessage({ id: 'report.no-app' })} des={formatMessage({ id: 'report.no-app-des' })} />}
      </Content>
    </Page>);
  }
}

export default injectIntl(Submission);
