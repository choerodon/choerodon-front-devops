import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Select, Button, Tooltip, Table, Popover, Spin } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import TimeAgo from 'timeago-react';
import moment from 'moment';
import ChartSwitch from '../Component/ChartSwitch';
import './BuildDuration.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import CiPipelineStore from '../../../../stores/project/ciPipelineManage';
import TimePicker from '../Component/TimePicker';
import '../../ciPipelineManage/ciPipelineHome/CiPipelineHome.scss';
import NoChart from '../Component/NoChart';


const { AppState } = stores;
const { Option } = Select;
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

const ICONS = {
  passed: {
    icon: 'icon-check_circle',
    code: 'passed',
    display: 'Passed',
  },
  success: {
    icon: 'icon-check_circle',
    code: 'success',
    display: 'Passed',
  },
  pending: {
    icon: 'icon-pause_circle_outline',
    code: 'pending',
    display: 'Pending',
  },
  running: {
    icon: 'icon-timelapse',
    code: 'running',
    display: 'Running',
  },
  failed: {
    icon: 'icon-cancel',
    code: 'failed',
    display: 'Failed',
  },
  canceled: {
    icon: 'icon-not_interested',
    code: 'canceled',
    display: 'Cancel',
  },
  skipped: {
    icon: 'icon-skipped_b',
    code: 'skipped',
    display: 'Skipped',
  },
};
const ICONS_ACTION = {
  pending: {
    icon: 'icon-not_interested',
  },
  running: {
    icon: 'icon-not_interested',
  },
  failed: {
    icon: 'icon-refresh',
  },
  canceled: {
    icon: 'icon-refresh',
  },
  skipped: {
    icon: 'icon-refresh',
  },
};


@observer
class BuildDuration extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.loadDatas();
  }

  componentWillUnmount() {
    const { ReportsStore } = this.props;
    ReportsStore.setAllData([]);
    ReportsStore.setBuildDuration({});
    ReportsStore.setStartTime(moment().subtract(6, 'days'));
    ReportsStore.setEndTime(moment());
    ReportsStore.setAppId(null);
    ReportsStore.setPageInfo({ number: 0, totalElements: 0, size: HEIGHT <= 900 ? 10 : 15 });
  }

  /**
   * 加载数据
   */
  loadDatas = () => {
    const { ReportsStore } = this.props;
    const { id } = AppState.currentMenuType;
    ReportsStore.loadApps(id).then((data) => {
      if (data && data.length) {
        ReportsStore.setAppId(data[0].id);
        this.loadCharts();
      }
    });
  };

  /**
   * 刷新
   */
  handleRefresh = () => {
    const { ReportsStore } = this.props;
    const { id } = AppState.currentMenuType;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    const { appId, pageInfo } = ReportsStore;
    ReportsStore.loadApps(id);
    ReportsStore.loadBuildDuration(id, appId, startTime, endTime);
    this.tableChange(pageInfo);
  };

  /**
   * 选择应用
   * @param value
   */
  handleAppSelect = (value) => {
    const { ReportsStore } = this.props;
    ReportsStore.setAppId(value);
    this.loadCharts();
  };

  getOption() {
    const { intl: { formatMessage }, ReportsStore } = this.props;
    const { pipelineTime, refs, versions, createDates } = ReportsStore.getBuildDuration;
    const averageDuration = [];
    let sum = 0;
    _.map(pipelineTime, (value, index) => {
      sum += parseFloat(value);
      averageDuration[index] = sum / (index + 1);
    });
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
          fontSize: 13,
          lineHeight: 20,
        },
        padding: [10, 15],
        extraCssText:
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
        formatter(params, ticket) {
          const version = versions[params[0].dataIndex] ? `${versions[params[0].dataIndex]}` : `${formatMessage({ id: 'report.build-duration.noversion' })}`;
          let time = params[0].value;
          if (time.split('.')[1] === '00') {
            time = `${time.toString().split('.')[0]}${formatMessage({ id: 'minutes' })}`;
          } else if (time.split('.')[0] === '0') {
            time = `${Number(time.toString().split('.')[1]) * 6}${formatMessage({ id: 'seconds' })}`;
          } else if (time.split('.').length === 2) {
            time = `${time.toString().split('.')[0]}${formatMessage({ id: 'minutes' })}${(Number(time.toString().split('.')[1]) * 0.6).toFixed()}${formatMessage({ id: 'seconds' })}`;
          } else {
            time = null;
          }
          return `<div>
            <div>${formatMessage({ id: 'ist.time' })}：${createDates[params[0].dataIndex]}</div>
            <div>${formatMessage({ id: 'network.column.version' })}：${version}</div>
            <div>${formatMessage({ id: 'report.build-duration.duration' })}：${time}</div>
          </div>`;
        },
      },
      grid: {
        left: '2%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },
        axisLabel: {
          margin: 13,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
          },
          rotate: 40,
          formatter(value) {
            return `${value.substr(0, value.indexOf('-') + 5)}`;
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          },
        },
        data: refs,
      },
      yAxis: {
        name: `${formatMessage({ id: 'minTime' })}`,
        type: 'value',

        nameTextStyle: {
          fontSize: 13,
          color: '#000',
          // padding: [0, 0, 10, 0],
        },
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },

        axisLabel: {
          margin: 19.3,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 1,
          },
        },
      },
      series: [
        {
          type: 'bar',
          barWidth: '30%',
          itemStyle: {
            color: 'rgba(77, 144, 254, 0.60)',
            borderColor: '#4D90FE',
          },
          data: pipelineTime,
        },
        {
          type: 'line',
          symbol: 'none',
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.36)',
            width: 2,
            type: 'dashed',
            border: '1px solid #4D90FE',
          },
          data: averageDuration,
        },
      ],
    };
  }

  /**
   * 表格改变函数
   * @param pagination 分页
   */
  tableChange = (pagination) => {
    const { ReportsStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const appId = ReportsStore.getAppId;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    ReportsStore.loadBuildTable(projectId, appId, startTime, endTime, pagination.current - 1, pagination.pageSize);
  };

  getColumns() {
    return [
      {
        title: <FormattedMessage id="ciPipeline.status" />,
        dataIndex: 'status',
        render: (status, record) => this.renderStatus(status, record),
      },
      {
        title: <FormattedMessage id="network.column.version" />,
        dataIndex: 'version',
        render: version => this.renderVersion(version),
      },
      {
        title: <FormattedMessage id="ciPipeline.commit" />,
        dataIndex: 'commit',
        render: (commit, record) => this.renderCommit(commit, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.jobs" />,
        dataIndex: 'stages',
        render: (stages, record) => this.renderstages(stages, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.time" />,
        dataIndex: 'pipelineTime',
        render: (pipelineTime, record) => (
          <span>
            {this.renderTime(pipelineTime, record)}
          </span>
        ),
      },
      {
        title: <FormattedMessage id="ciPipeline.createdAt" />,
        dataIndex: 'creationDate',
        render: (creationDate, record) => (
          <div>
            <Popover
              rowKey="creationDate"
              title={<FormattedMessage id="ciPipeline.createdAt" />}
              content={creationDate}
              placement="left"
            >
              <TimeAgo
                datetime={creationDate}
                locale={this.props.intl.formatMessage({ id: 'language' })}
              />
            </Popover>
          </div>),
      },
      {
        width: 56,
        key: 'action',
        render: record => this.renderAction(record),
      },
    ];
  }

  renderStatus = (status, record) => (
    <div className="c7n-status">
      <a
        href={`${record.gitlabUrl.slice(0, -4)}/pipelines/${record.pipelineId}`}
        target="_blank"
        rel="nofollow me noopener noreferrer"
      >
        <i className={`icon ${ICONS[status].icon} c7n-icon-${status} c7n-icon-lg`} />
        <span className="c7n-text-status black">{ICONS[status].display}</span>
      </a>
    </div>
  );

  renderVersion = (version) => {
    if (version) {
      return <div>{version}</div>;
    }
    return <div>未生成版本</div>;
  };

  renderCommit = (commit, record) => (
    <div className="c7n-commit">
      <div className="c7n-title-commit">
        <i className="icon icon-branch mr7" />
        <Tooltip
          placement="top"
          title={record.ref}
          trigger="hover"
        >
          <a
            className="c7n-link-decoration"
            href={`${record.gitlabUrl.slice(0, -4)}/commits/${record.ref}`}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span className="black">{record.ref}</span>
          </a>
        </Tooltip>
        <i className="icon icon-point m8" />
        <Tooltip
          placement="top"
          title={record.commit}
          trigger="hover"
        >
          <a
            className="c7n-link-decoration"
            href={`${record.gitlabUrl.slice(0, -4)}/commit/${record.commit}`}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span>
              { record.commit.slice(0, 8) }
            </span>
          </a>
        </Tooltip>
      </div>
      <div className="c7n-des-commit">
        <Tooltip
          placement="top"
          title={record.commitUserName ? record.commitUserName : ''}
          trigger="hover"
        >
          {
            record.commitUserUrl
              ? <img className="c7n-image-avatar" src={record.commitUserUrl} alt="avatar" />
              : <span className="c7n-avatar mr7">{ record.commitUserName ? record.commitUserName.substring(0, 1) : '' }</span>
          }
        </Tooltip>
        <MouserOverWrapper text={record.commitContent} width={0.2}>
          <a
            className="c7n-link-decoration"
            href={`${record.gitlabUrl.slice(0, -4)}/commit/${record.commit}`}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span className="gray">
              {record.commitContent}
            </span>
          </a>
        </MouserOverWrapper>
      </div>
    </div>
  );

  renderstages = (stages, record) => {
    const pipeStage = [];
    if (stages && stages.length) {
      for (let i = 0, l = stages.length; i < l; i += 1) {
        pipeStage.push(<span className="c7n-jobs" key={i}>
          {
            i !== 0
              ? <span className="c7n-split-before" />
              : null
          }
          <Tooltip
            title={(stages[i].name === 'sonarqube' && stages[i].status === 'failed') ? `${stages[i].name} : ${stages[i].description}` : `${stages[i].name} : ${stages[i].status}`}
          >
            {stages[i].stage === 'sonarqube' ? <i
              className={`icon ${ICONS[stages[i].status || 'skipped'].icon || ''}
                c7n-icon-${stages[i].status} c7n-icon-lg`}
            /> : <a
              className=""
              href={`${record.gitlabUrl.slice(0, -4)}/-/jobs/${stages[i].id}`}
              target="_blank"
              rel="nofollow me noopener noreferrer"
            >
              <i
                className={`icon ${ICONS[stages[i].status || 'skipped'].icon || ''}
                c7n-icon-${stages[i].status} c7n-icon-lg`}
              />
            </a>}
          </Tooltip>
        </span>);
      }
    }
    return (
      <div className="c7n-jobs">
        {pipeStage}
      </div>
    );
  };

  renderTime = (pipelineTime, record) => {
    const { intl: { formatMessage } } = this.props;
    if (pipelineTime) {
      if (pipelineTime.split('.')[1] === '00') {
        pipelineTime = `${pipelineTime.toString().split('.')[0]}${formatMessage({ id: 'minutes' })}`;
      } else if (pipelineTime.split('.')[0] === '0') {
        pipelineTime = `${Number(pipelineTime.toString().split('.')[1]) * 6}${formatMessage({ id: 'seconds' })}`;
      } else if (pipelineTime.split('.').length === 2) {
        pipelineTime = `${pipelineTime.toString().split('.')[0]}${formatMessage({ id: 'minutes' })}${(Number(pipelineTime.toString().split('.')[1]) * 0.6).toFixed()}${formatMessage({ id: 'seconds' })}`;
      } else {
        pipelineTime = null;
      }
      return pipelineTime;
    } else {
      return '--';
    }
  };

  renderAction = (record) => {
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    if (record.status && record.status !== 'passed' && record.status !== 'skipped') {
      return (
        <Permission
          service={['devops-service.project-pipeline.retry', 'devops-service.project-pipeline.cancel']}
          organizationId={organizationId}
          projectId={projectId}
          type={type}
        >
          <Popover placement="bottom" content={<div><span>{(record.status === 'running' || record.status === 'pending') ? 'cancel' : 'retry'}</span></div>}>
            <Button
              size="small"
              shape="circle"
              onClick={this.handleAction.bind(this, record)}
            >
              <span className={`icon ${ICONS_ACTION[record.status].icon} c7n-icon-action c7n-icon-sm`} />
            </Button>
          </Popover>
        </Permission>
      );
    } else {
      return null;
    }
  };

  handleAction(record) {
    if (record.status === 'running' || record.status === 'pending') {
      CiPipelineStore.cancelPipeline(record.gitlabProjectId, record.pipelineId);
    } else {
      CiPipelineStore.retryPipeline(record.gitlabProjectId, record.pipelineId);
    }
    this.loadDatas();
  }

  loadCharts = () => {
    const { ReportsStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const appId = ReportsStore.getAppId;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    ReportsStore.loadBuildDuration(projectId, appId, startTime, endTime);
    ReportsStore.loadBuildTable(projectId, appId, startTime, endTime);
  };

  render() {
    const { intl: { formatMessage }, history, ReportsStore } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const { apps, appId, echartsLoading, loading, pageInfo, allData } = ReportsStore;
    return (<Page
      className="c7n-region c7n-ciPipeline"
      service={[
        'devops-service.application.listByActive',
        'devops-service.devops-gitlab-pipeline.listPipelineTime',
        'devops-service.devops-gitlab-pipeline.pagePipeline',
      ]}
    >
      <Header
        title={formatMessage({ id: 'report.build-duration.head' })}
        backPath={`/devops/reports?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`}
      >
        <ChartSwitch
          history={history}
          current="build-duration"
        />
        <Button
          icon="refresh"
          onClick={this.handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Content code="report.build-duration" value={{ name }} className="c7n-buildDuration-content">
        {appId ? <React.Fragment>
          <div className="c7n-buildDuration-select">
            <Select
              label={formatMessage({ id: 'chooseApp' })}
              className="c7n-app-select_247"
              defaultValue={appId}
              value={appId}
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              filter
              onChange={this.handleAppSelect}
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
            <TimePicker startTime={ReportsStore.getStartTime} endTime={ReportsStore.getEndTime} func={this.loadCharts} store={ReportsStore} />
          </div>
          <Spin spinning={echartsLoading}>
            <ReactEcharts className="c7n-buildDuration-echarts" option={this.getOption()} />
          </Spin>
          <Table
            onChange={this.tableChange}
            loading={loading}
            columns={this.getColumns()}
            className="c7n-buildDuration-table"
            dataSource={allData}
            pagination={pageInfo}
            filterBar={false}
            rowKey={record => record.pipelineId}
          />
        </React.Fragment> : <NoChart title={formatMessage({ id: 'report.no-app' })} des={formatMessage({ id: 'report.no-app-des' })} />}
      </Content>
    </Page>);
  }
}

export default injectIntl(BuildDuration);
