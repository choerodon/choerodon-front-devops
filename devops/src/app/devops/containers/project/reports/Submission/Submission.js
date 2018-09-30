import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Select, Button } from 'choerodon-ui';
import _ from 'lodash';
import moment from 'moment';
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
    // total.items = _.countBy(totalCommitsDate, item => item.slice(0, 10));
    total.items = totalCommitsDate.slice();
    total.count = totalCommitsDate.length;
    _.forEach(commitFormUserDTOList, (item) => {
      const { name, imgUrl, commitDates, id } = item;
      const userTotal = {
        name,
        avatar: imgUrl,
      };
      userTotal.id = id;
      // userTotal.items = _.countBy(commitDates, cit => cit.slice(0, 10));
      userTotal.items = commitDates.slice();
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
      dateType: 'seven',
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillUnmount() {
    const { ReportsStore } = this.props;
    ReportsStore.setApps([]);
    ReportsStore.setStartTime(moment().subtract(6, 'days'));
    ReportsStore.setEndTime(moment());
    ReportsStore.setStartDate(null);
    ReportsStore.setEndDate(null);
  }

  handleRefresh = () => this.loadData();

  /**
   * 应用选择
   * @param e
   */
  handleSelect = (e) => {
    const { ReportsStore: { loadCommits, loadCommitsRecord, getStartTime, getEndTime } } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    this.setState({ appId: e });
    loadCommits(projectId, getStartTime, getEndTime, e);
    loadCommitsRecord(projectId, getStartTime, getEndTime, e, 0);
  };

  handlePageChange = (page) => {
    const { ReportsStore: { loadCommitsRecord, getStartTime, getEndTime } } = this.props;
    const { appId } = this.state;
    const { id: projectId } = AppState.currentMenuType;
    this.setState({ page: page - 1 });
    loadCommitsRecord(projectId, getStartTime, getEndTime, appId, page - 1);
  };

  loadData = () => {
    const { ReportsStore: { loadApps, loadCommits, loadCommitsRecord, getStartTime, getEndTime } } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { page, appId, dateType } = this.state;
    loadApps(projectId).then((data) => {
      if (data && data.length) {
        const selectApp = appId || _.map(data, item => item.id);
        if (!appId) {
          this.setState({ appId: selectApp });
        }
        loadCommits(projectId, getStartTime, getEndTime, selectApp);
        loadCommitsRecord(projectId, getStartTime, getEndTime, selectApp, page);
      }
    });
  };

  /**
   * 选择今天、近7天和近30天的选项，当使用DatePick的时候清空type
   * @param type 时间范围类型
   */
  handleDateChoose = type => this.setState({ dateType: type });

  render() {
    const { intl: { formatMessage }, history, ReportsStore } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const { appId, dateType } = this.state;
    const commits = ReportsStore.getCommits;
    const startTime = ReportsStore.getStartTime;
    const endTime = ReportsStore.getEndTime;
    const { total, user } = formatData(commits);
    const apps = ReportsStore.getApps;
    const commitsRecord = ReportsStore.getCommitsRecord;
    const options = _.map(apps, item => (<Option key={item.id} value={item.id}>{item.name}</Option>));
    const personChart = _.map(user, item => (<div key={item.id} className="c7n-report-submission-item">
      <LineChart
        loading={ReportsStore.getCommitLoading}
        name={item.name || 'Unknown'}
        color="#ff9915"
        style={{ width: '100%', height: 176 }}
        data={item}
        start={startTime}
        end={endTime}
        hasAvatar
      />
    </div>));
    return (<Page
      className="c7n-region"
      service={[
        'devops-service.application.listByActive',
        'devops-service.devops-gitlab-commit.getCommits',
        'devops-service.devops-gitlab-commit.getRecordCommits',
      ]}
    >
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
                value={appId || []}
                maxTagPlaceholder={`+ ${appId ? (appId.length - 3) : ''} ...`}
                onChange={this.handleSelect}
                optionFilterProp="children"
                filter
              >
                {options}
              </Select>
              <TimePicker
                unlimit
                startTime={ReportsStore.getStartDate}
                endTime={ReportsStore.getEndDate}
                func={this.loadData}
                store={ReportsStore}
                type={dateType}
                onChange={this.handleDateChoose}
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
                  start={startTime}
                  end={endTime}
                />
              </div>
              <div className="c7n-report-submission-history">
                <CommitHistory
                  loading={ReportsStore.getHistoryLoad}
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
