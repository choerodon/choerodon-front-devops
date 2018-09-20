import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Select, Button, Tooltip, Table, Popover, Spin } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import TimeAgo from 'timeago-react';
import ChartSwitch from '../Component/ChartSwitch';
import './BuildDuration.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import CiPipelineStore from '../../../../stores/project/ciPipelineManage';


const { AppState } = stores;
const { Option } = Select;
const ICONS = {
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
    const { ReportsStore } = this.props;
    const { id } = AppState.currentMenuType;
    ReportsStore.loadApps(id);
  }

  /**
   * 刷新
   */
  handleRefresh = () => {};

  /**
   * 选择应用
   * @param value
   */
  handleAppSelect = (value) => {
    const { ReportsStore } = this.props;
    const { id } = AppState.currentMenuType;
    ReportsStore.setAppId(value);
  };

  getOption() {
    const { intl: { formatMessage } } = this.props;
    const datas = [12, 13, 10, 13, 50, 23, 21, 22, 10];
    const date = ['09-01', '09-02', '09-03', '09-04', '09-05', '09-06', '09-07', '09-08', '09-09']
    const arr = [];
    _.map(datas, (value, index) => {
      arr[index] = (_.reduce(datas.slice(0, index + 1), (sum, n) => sum + n)) / (index + 1);
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
          // const data = []
          return `<div>
            <div>${formatMessage({ id: 'report.build-duration.time' })}：${date[params[0].dataIndex]}</div>
            <div>${formatMessage({ id: 'report.build-duration.version' })}：</div>
            <div>${formatMessage({ id: 'report.build-duration.duration' })}：${params[0].value}</div>
          </div>`;
        },
      },
      grid: {
        top: 38,
        left: 0,
        right: 0,
        bottom: 40,
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
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          },
        },
        data: ['c7n-1', 'c7n-2', 'c7n-3', 'c7n-4', 'c7n-5', 'c7n-6', 'c7n-7', 'c7n-8', 'c7n-9'],
      },
      yAxis: {
        name: `${formatMessage({ id: 'report.build-duration.yAxis' })}`,
        type: 'value',

        nameTextStyle: {
          fontSize: 13,
          color: '#000',
          padding: [0, 0, 10, 0],
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
          data: datas,
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
          data: arr,
        },
      ],
    };
  }

  tableChange = () => {};

  getColumns() {
    return [
      {
        title: <FormattedMessage id="ciPipeline.status" />,
        dataIndex: 'status',
        // render: (status, record) => this.renderStatus(status, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.sign" />,
        dataIndex: 'id',
        // render: (id, record) => this.renderSign(id, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.commit" />,
        dataIndex: 'sha',
        // render: (sha, record) => this.renderCommit(sha, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.jobs" />,
        dataIndex: 'jobs',
        // render: (jobs, record) => this.renderJobs(jobs, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.time" />,
        dataIndex: 'time',
        // render: (time, record) => (
        //   <span>
        //     {this.renderTime(time, record)}
        //   </span>
        // ),
      },
      {
        title: <FormattedMessage id="ciPipeline.createdAt" />,
        dataIndex: 'createdAt',
        // render: (createdAt, record) => (
        //   <div>
        //     <Popover
        //       rowKey="creationDate"
        //       title={<FormattedMessage id="ciPipeline.createdAt" />}
        //       content={createdAt}
        //       placement="left"
        //     >
        //       <TimeAgo
        //         datetime={createdAt}
        //         locale={this.props.intl.formatMessage({ id: 'language' })}
        //       />
        //     </Popover>
        //   </div>),
      },
      {
        width: 56,
        dataIndex: 'gitlabProjectId',
        // render: (gitlabProjectId, record) => this.renderAction(record),
      },
    ];
  }

  renderStatus = (status, record) => (
    <div className="c7n-status">
      <a
        href={`${record.gitlabUrl.slice(0, -4)}/pipelines/${record.id}`}
        target="_blank"
        rel="nofollow me noopener noreferrer"
      >
        <i className={`icon ${ICONS[status].icon} c7n-icon-${status} c7n-icon-lg`} />
        <span className="c7n-text-status black">{ICONS[status].display}</span>
      </a>
    </div>
  );

  renderSign = (id, record) => (
    <div className="c7n-sign">
      <div className="c7n-des-sign">
        <span>
          <a
            className="c7n-link-decoration"
            href={`${record.gitlabUrl.slice(0, -4)}/pipelines/${record.id}`}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span className="mr7 black">
              #{id}
            </span>
          </a>
            by
        </span>
        <Tooltip
          placement="top"
          title={record.createUser}
          trigger="hover"
        >
          <span className="c7n-avatar m8 mt3">{record.createUser.substring(0, 1)}</span>
        </Tooltip>
      </div>
      {
        record.latest
          ? (
            <Tooltip
              placement="top"
              title="Latest pipeline for this branch"
              trigger="hover"
            >
              <span title="" className="c7n-latest">
                latest
              </span>
            </Tooltip>
          )
          : null
      }
    </div>
  );

  renderCommit = (sha, record) => (
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
          title={record.sha}
          trigger="hover"
        >
          <a
            className="c7n-link-decoration"
            href={`${record.gitlabUrl.slice(0, -4)}/commit/${record.sha}`}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span>
              {
                _.find(CiPipelineStore.commits, { id: sha })
                  ? _.find(CiPipelineStore.commits, { id: sha }).shortId
                  : ''
              }
            </span>
          </a>
        </Tooltip>
      </div>
      <div className="c7n-des-commit">
        <Tooltip
          placement="top"
          title={
            _.find(CiPipelineStore.commits, { id: sha })
              ? _.find(CiPipelineStore.commits, { id: sha }).authorName
              : ''
          }
          trigger="hover"
        >
          <span className="c7n-avatar mr7">
            {
              _.find(CiPipelineStore.commits, { id: sha })
                ? _.find(CiPipelineStore.commits, { id: sha }).authorName.substring(0, 1)
                : ''
            }
          </span>
        </Tooltip>
        <a
          className="c7n-link-decoration"
          href={`${record.gitlabUrl.slice(0, -4)}/commit/${record.sha}`}
          target="_blank"
          rel="nofollow me noopener noreferrer"
        >
          <span className="gray">
            {
              _.find(CiPipelineStore.commits, { id: sha })
                ? _.find(CiPipelineStore.commits, { id: sha }).title
                : ''
            }
          </span>
        </a>
      </div>
    </div>
  );

  renderJobs = (jobs, record) => {
    const pipeStage = [];
    if (jobs && jobs.length) {
      for (let i = 0, l = jobs.length; i < l; i += 1) {
        pipeStage.push(<span className="c7n-jobs" key={i}>
          {
            i !== 0
              ? <span className="c7n-split-before" />
              : null
          }
          <Tooltip
            title={(jobs[i].stage === 'sonarqube' && jobs[i].status === 'failed') ? `${jobs[i].stage} : ${jobs[i].description}` : `${jobs[i].stage} : ${jobs[i].status}`}
          >
            {jobs[i].stage === 'sonarqube' ? <i
              className={`icon ${ICONS[jobs[i].status || 'skipped'].icon || ''}
                c7n-icon-${jobs[i].status} c7n-icon-lg`}
            /> : <a
              className=""
              href={`${record.gitlabUrl.slice(0, -4)}/-/jobs/${jobs[i].id}`}
              target="_blank"
              rel="nofollow me noopener noreferrer"
            >
              <i
                className={`icon ${ICONS[jobs[i].status || 'skipped'].icon || ''}
                c7n-icon-${jobs[i].status} c7n-icon-lg`}
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

  renderTime = (time, record) => {
    if (time) {
      const day = time[0] ? `${time[0]}${this.props.intl.formatMessage({ id: 'ist.day' })}` : '';
      const hour = time[1] ? `${time[1]}${this.props.intl.formatMessage({ id: 'ist.hour' })}` : '';
      const minute = time[2] ? `${time[2]}${this.props.intl.formatMessage({ id: 'ist.min' })}` : '';
      const second = time[3] ? `${time[3]}${this.props.intl.formatMessage({ id: 'ist.sec' })}` : '';
      return `${day}${hour}${minute}${second}`;
    } else {
      return '--';
    }
  };

  renderAction = (record) => {
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    if (record.status && record.status !== 'success' && record.status !== 'skipped') {
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

  render() {
    const { intl: { formatMessage }, history, ReportsStore } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const apps = ReportsStore.getApps;
    const appId = ReportsStore.getAppId;
    const echartsLoading = ReportsStore.getEchartsLoading;
    return (<Page className="c7n-region">
      <Header
        title={formatMessage({ id: 'report.build-duration.head' })}
        backPath={`/devops/reports?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`}
      >
        <ChartSwitch
          history={history}
          current="buildDuration"
        />
        <Button
          icon="refresh"
          onClick={this.handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Content code="report.build-duration" value={{ name }} className="c7n-buildDuration-content">
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
        <Spin spinning={echartsLoading}>
          <ReactEcharts className="c7n-buildDuration-echarts" option={this.getOption()} />
        </Spin>
        <Table
          onChange={this.tableChange}
          // loading={}
          columns={this.getColumns()}
          className="c7n-buildDuration-table"
          // dataSource
          // pagination={}
          filterBar={false}
        />
      </Content>
    </Page>);
  }
}

export default injectIntl(BuildDuration);
