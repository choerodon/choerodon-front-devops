import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Select, Button, DatePicker } from 'choerodon-ui';
import ChartSwitch from '../Component/ChartSwitch';
import LineChart from './LineChart';
import CommitHistory from './CommitHistory';
import './Submission.scss';
import '../../../main.scss';

const { AppState } = stores;
const { Option } = Select;
const { RangePicker } = DatePicker;

const commitsData = [{
  commitsId: 1,
  commitContent: 'Update .gitlab-ci.yml',
  commitDate: '2018-08-15 10:14:10',
  commitUrl: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
  commitUserName: 'crockitwood2',
  commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
}, {
  commitsId: 2,
  commitContent: 'Update .gitlab-ci.yml',
  commitDate: '2018-08-15 10:14:10',
  commitUrl: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
  commitUserName: 'crockitwood2',
  commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
}, {
  commitsId: 3,
  commitContent: 'Update .gitlab-ci.yml',
  commitDate: '2018-08-15 10:14:10',
  commitUrl: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
  commitUserName: 'crockitwood2',
  commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
}, {
  commitsId: 4,
  commitContent: 'Update .gitlab-ci.yml',
  commitDate: '2018-08-15 10:14:10',
  commitUrl: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
  commitUserName: 'crockitwood2',
  commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
}, {
  commitsId: 5,
  commitContent: 'Update .gitlab-ci.yml',
  commitDate: '2018-08-15 10:14:10',
  commitUrl: 'http://git.staging.saas.hand-china.com/operation-pro0815/app0815/commit/c4cfa9d84e29984c3af3467dc0d800e75d5df268?view=parallel',
  commitUserName: 'crockitwood2',
  commitUserUrl: 'http://minio.staging.saas.hand-china.com/iam-service/file_d0c99fab16c14c38ac023bca0110ac05_WX20180720-141353%402x.png',
}];
const dataSource = {
  total: {
    commits: 1330,
    keys: ['9/12', '9/13', '9/14', '9/15', '9/16', '9/17', '9/12'],
    value: [820, 932, 901, 934, 1290, 1330, 1320],
  },
  personal: [
    {
      name: '邮件营销',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      commits: 230,
      keys: ['9/12', '9/13', '9/14', '9/15', '9/16', '9/17', '9/12'],
      value: [120, 132, 101, 134, 90, 230, 210],
    },
    {
      name: '联盟广告',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      commits: 330,
      keys: ['9/12', '9/13', '9/14', '9/15', '9/16', '9/17', '9/12'],
      value: [220, 182, 191, 234, 290, 330, 310],
    },
    {
      name: '视频广告',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      commits: 330,
      keys: ['9/12', '9/13', '9/14', '9/15', '9/16', '9/17', '9/12'],
      value: [150, 232, 201, 154, 190, 330, 410],
    },
    {
      name: '直接访问',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      commits: 330,
      keys: ['9/12', '9/13', '9/14', '9/15', '9/16', '9/17', '9/12'],
      value: [320, 332, 301, 334, 390, 330, 320],
    },
  ],
};

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

@observer
class Submission extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recent: null,
    };
  }

  handleRefresh = () => {};

  /**
   * 用户、应用选择
   * @param e
   */
  handleSelect = (e) => {
    console.log(e.target.value);
  };

  onDataChange = (data, dataString) => {
    console.log(data, dataString);
  }

  render() {
    const { intl: { formatMessage }, history } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const { recent } = this.state;
    const { total, personal } = dataSource;
    const personChart = personal.map(item => (<div key={item.name} className="c7n-report-submission-item">
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
            placeholder="Please select"
            defaultValue={['a10', 'c12']}
            onChange={this.handleSelect}
          >
            {children}
          </Select>
          <div className="c7n-report-control-recently">
            <Button type={recent === 1 ? 'primary' : null}>{formatMessage({ id: 'report.data.today' })}</Button>
            <Button>{formatMessage({ id: 'report.data.seven' })}</Button>
            <Button>{formatMessage({ id: 'report.data.thirty' })}</Button>
            <RangePicker
              className="c7n-report-control-datepick"
              // getCalendarContainer={triggerNode => triggerNode.parentNode}
              onChange={this.onDataChange}
            />
          </div>
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
          <div className="c7n-report-submission-history"><CommitHistory dataSource={commitsData} /></div>
        </div>
        <div className="c7n-report-submission-wrap">{personChart}</div>
      </Content>
    </Page>);
  }
}

export default injectIntl(Submission);
