import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Select, Button } from 'choerodon-ui';
import _ from 'lodash';
import ChartSwitch from '../Component/ChartSwitch';
import LineChart from './LineChart';
import CommitHistory from './CommitHistory';
import TimePicker from '../Component/TimePicker';
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
  total.items = _.countBy(totalCommitsDate, item => item.slice(0, 10));
  total.count = totalCommitsDate.length;
  _.forEach(commitFormUserDTOList, (item) => {
    const { name, imgUrl, commitDates } = item;
    const userTotal = {
      name,
      avatar: imgUrl,
    };
    userTotal.items = _.countBy(commitDates, cit => cit.slice(0, 10));
    userTotal.count = commitDates.length;
    user.push(userTotal);
  });

  return {
    total,
    user,
  };
}

const { AppState } = stores;
const { Option } = Select;

const dataSource = {
  totalCommitsDate: [
    '2018-09-09 12:56:04',
    '2018-09-14 09:56:53',
    '2018-09-15 09:57:18',
    '2018-09-14 09:56:53',
    '2018-09-15 09:57:18',
    '2018-09-14 09:56:53',
    '2018-09-15 09:57:18',
    '2018-09-14 09:56:53',
    '2018-09-15 09:57:18',
    '2018-09-28 09:57:36',
    '2018-09-10 17:35:18',
    '2018-09-04 16:56:36',
    '2018-09-15 09:57:18',
    '2018-09-28 09:57:36',
    '2018-09-10 17:35:18',
    '2018-09-04 09:32:13',
    '2018-09-15 09:57:18',
    '2018-09-28 09:57:36',
    '2018-09-10 17:35:18',
    '2018-09-04 09:32:13',
    '2018-09-04 16:56:36',
    '2018-09-16 16:56:36',
    '2018-09-26 09:57:06',
    '2018-09-11 16:56:36',
    '2018-09-26 09:57:06',
    '2018-09-11 16:56:36',
    '2018-09-26 09:57:06',
  ],
  commitFormUserDTOList: [
    {
      name: 'rua',
      imgUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      commitDates: [
        '2018-09-09 12:56:04',
      ],
    },
    {
      name: 'rua',
      imgUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      commitDates: [
        '2018-09-14 09:56:53',
        '2018-09-15 09:57:18',
        '2018-09-28 09:57:36',
      ],
    },
    {
      name: 'rua',
      imgUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      commitDates: [
        '2018-09-10 17:35:18',
      ],
    },
    {
      name: '邮件营销',
      imgUrl: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      commitDates: [
        '2018-09-06 09:32:13',
        '2018-09-11 16:56:36',
        '2018-09-26 09:57:06',
      ],
    },
  ],
};

const commitFormRecordDTOPage = {
  totalPages: 3,
  totalElements: 12,
  numberOfElements: 5,
  size: 5,
  number: 0,
  content: [
    {
      id: 1,
      appId: 1,
      userId: '昨夜小楼又东风',
      commitSha: null,
      commitContent: 'i.7435yi.7435yi.7435yi.7435yi.7435yi.7435yi.7435yi.7435yi.7435yi.7435yi.7435yi.7435y',
      commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
      ref: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
      commitDate: '2018-09-10 09:57:36',
    },
    {
      id: 2,
      appId: 1,
      userId: 346,
      commitSha: null,
      commitContent: 'aw3t',
      commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
      ref: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
      commitDate: '2018-09-15 09:57:18',
    },
    {
      id: 3,
      appId: 1,
      userId: 346,
      commitSha: null,
      commitContent: 'i.7435y',
      commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
      ref: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
      commitDate: '2018-09-28 09:57:36',
    },
    {
      id: 4,
      appId: 1,
      userId: 346,
      commitSha: null,
      commitContent: 'aw3t',
      commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
      ref: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
      commitDate: '2018-09-15 09:57:18',
    },
    {
      id: 5,
      appId: 1,
      userId: 346,
      commitSha: null,
      commitContent: 'i.7435y',
      commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
      ref: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
      commitDate: '2018-09-28 09:57:36',
    },
  ],
};

@observer
class Submission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // rec: null
    };
  }

  componentDidMount() {
    this.loadData();
  }

  handleRefresh = () => {};

  /**
   * 应用选择
   * @param e
   */
  handleSelect = (e) => {
    console.log(e.target.value);
  };

  loadData = () => {
    const { ReportsStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    ReportsStore.loadApps(projectId);
  };

  render() {
    const { intl: { formatMessage }, history, ReportsStore } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const apps = ReportsStore.getApps;
    const options = _.map(apps, item => (<Option key={item.id} value={item.id}>{item.name}</Option>));
    const { total, user } = formatData(dataSource);
    const commits = commitFormRecordDTOPage;
    const personChart = user.map(item => (<div key={item.name} className="c7n-report-submission-item">
      <LineChart
        name={item.name}
        color="#ff9915"
        style={{ width: '100%', height: 176 }}
        data={item}
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
        <div className="c7n-report-control">
          <Select
            className=" c7n-report-control-select"
            mode="multiple"
            placeholder={formatMessage({ id: 'report.app.noselect' })}
            maxTagCount={5}
            maxTagPlaceholder={formatMessage({ id: 'report.app.more' })}
            onChange={this.handleSelect}
            optionFilterProp="children"
            filter
          >
            {options}
          </Select>
          {/* <TimePicker /> */}
        </div>
        <div className="c7n-report-submission clearfix">
          <div className="c7n-report-submission-overview">
            <LineChart
              name="提交情况"
              color="#4677dd"
              style={{ width: '100%', height: 276 }}
              data={total}
            />
          </div>
          <div className="c7n-report-submission-history"><CommitHistory dataSource={commits} /></div>
        </div>
        <div className="c7n-report-submission-wrap">{personChart}</div>
      </Content>
    </Page>);
  }
}

export default injectIntl(Submission);
