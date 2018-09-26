import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action, configure, toJS } from 'mobx';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Select, Button, Table, Spin } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import ChartSwitch from '../Component/ChartSwitch';
import TimePicker from '../Component/TimePicker';
import StatusTags from '../../../../components/StatusTags';
import NoChart from '../Component/NoChart';
import ContainerStore from '../../../../stores/project/container';
import './DeployDuration.scss';

configure({ enforceActions: false });

const { AppState } = stores;
const { Option } = Select;
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

const COLOR = ['50,198,222', '87,170,248', '255,177,0', '116,59,231', '237,74,103'];

@observer
class DeployDuration extends Component {
  @observable env = [];

  @observable app = [];

  @observable envId = null;

  @observable appIds = [];

  @observable appArr = [];

  @observable dateArr = [];

  @observable seriesArr = [];

  handleRefresh = () => {
    this.loadEnvCards();
  };

  /**
   * 选择环境
   * @param id 环境ID
   */
  @action
  handleEnvSelect = (id) => {
    this.envId = id;
    this.loadAppByEnv(id);
    this.loadCharts();
  };

  /**
   * 选择应用
   * @param ids 应用ID
   */
  @action
  handleAppSelect = (ids) => {
    const { intl: { formatMessage } } = this.props;
    this.appIds = ids;
    if (ids.length < 6) {
      this.loadCharts();
    } else {
      Choerodon.prompt(formatMessage({ id: 'report.deploy-duration.apps' }));
    }
  };

  componentDidMount() {
    this.loadEnvCards();
  }

  componentWillUnmount() {
    const { ReportsStore } = this.props;
    ReportsStore.setAllData([]);
    ReportsStore.setStartTime(moment().subtract(6, 'days'));
    ReportsStore.setEndTime(moment());
    ReportsStore.setPageInfo({ number: 0, totalElements: 0, size: HEIGHT <= 900 ? 10 : 15 });
  }

  /**
   * 获取可用环境
   */
  @action
  loadEnvCards = () => {
    const { ReportsStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    ContainerStore.loadActiveEnv(projectId)
      .then((env) => {
        if (env.length) {
          this.env = env;
          this.envId = this.envId || env[0].id;
          this.loadAppByEnv(this.envId);
        } else {
          ReportsStore.setEchartsLoading(false);
        }
      });
  };

  /**
   * 加载table数据
   */
  loadTables = () => {
    const { ReportsStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    const { pageInfo } = ReportsStore;
    ReportsStore.loadDeployDurationTable(projectId, this.envId, startTime, endTime, this.appIds.slice(), pageInfo.current - 1, pageInfo.pageSize);
  };

  /**
   * 加载图表数据
   */
  @action
  loadCharts = () => {
    const { ReportsStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    ReportsStore.loadDeployDurationChart(projectId, this.envId, startTime, endTime, this.appIds.slice())
      .then((res) => {
        if (res) {
          this.appArr = _.map(res.deployAppDTOS, v => v.appName);
          this.dateArr = res.creationDates;
          const seriesArr = [];
          _.map(res.deployAppDTOS, (v, index) => {
            const series = {
              name: v.appName,
              symbolSize: 24,
              itemStyle: {
                color: `rgba(${COLOR[index]}, 0.4)`,
                borderColor: `rgb(${COLOR[index]})`,
              },
              data: _.map(v.deployAppDetails, c => Object.values(c)),
              type: 'scatter',
            };
            seriesArr.push(series);
          });
          this.seriesArr = seriesArr;
        }
      });
    this.loadTables();
  };

  /**
   * 环境ID筛选应用
   * @param envId
   */
  @action
  loadAppByEnv = (envId) => {
    const projectId = AppState.currentMenuType.id;
    ContainerStore.loadAppDataByEnv(projectId, envId)
      .then((app) => {
        this.app = app;
        if (app.length) {
          this.appIds = this.appIds.length || [app[0].id];
        } else {
          this.appIds = [];
        }
        this.loadCharts();
      });
  };

  /**
   * 图表函数
   * @returns {*}
   */
  getOption() {
    const { intl: { formatMessage } } = this.props;
    return {
      legend: {
        data: this.appArr,
      },
      toolbox: {
        feature: {
          dataZoom: {},
          brush: {
            type: ['clear'],
          },
        },
      },
      brush: {
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
          fontSize: 13,
          lineHeight: 20,
        },
        padding: [10, 15, 10, 15],
        extraCssText:
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
        formatter(params, ticket) {
          let time = params[0].value[1];
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
                <div>${formatMessage({ id: 'branch.issue.date' })}：${params[0].name}</div>
                <div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[0].color};"></span>${params[0].seriesName}：${time}</div>
              <div>`;
        },
      },
      grid: {
        left: '2%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        scale: true,
        boundaryGap: false,
        data: this.dateArr,
        axisLine: {
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },
        axisTick: { show: false },
        axisLabel: {
          margin: 13,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
          },
          formatter(value) {
            return value.slice(5, 10).replace('-', '/');
          },
        },
      },
      yAxis: {
        nameTextStyle: {
          fontSize: 13,
          color: '#000',
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
          margin: 18,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            show: true,
            type: 'solid',
          },
        },
        boundaryGap: false,
        name: formatMessage({ id: 'minTime' }),
        scale: true,
      },
      series: this.seriesArr,
    };
  }

  /**
   * 表格函数
   * @returns {*}
   */
  renderTable() {
    const { intl: { formatMessage }, ReportsStore } = this.props;
    const data = ReportsStore.getAllData;
    const { loading, pageInfo } = ReportsStore;

    const column = [
      {
        title: formatMessage({ id: 'app.active' }),
        key: 'status',
        render: record => (<StatusTags name={formatMessage({ id: record.status })} colorCode={record.status} />),
      }, {
        title: formatMessage({ id: 'report.deploy-duration.time' }),
        key: 'creationDate',
        dataIndex: 'creationDate',
      }, {
        title: formatMessage({ id: 'deploy.instance' }),
        key: 'appInstanceCode',
        dataIndex: 'appInstanceCode',
      }, {
        title: formatMessage({ id: 'deploy.appName' }),
        key: 'appName',
        dataIndex: 'appName',
      }, {
        title: formatMessage({ id: 'deploy.ver' }),
        key: 'appVersion',
        dataIndex: 'appVersion',
      }, {
        title: formatMessage({ id: 'report.deploy-duration.user' }),
        key: 'lastUpdatedName',
        dataIndex: 'lastUpdatedName',
      },
    ];

    return (
      <Table
        rowKey={record => record.creationDate}
        dataSource={data}
        filterBar={false}
        columns={column}
        loading={loading}
        pagination={pageInfo}
        onChange={this.tableChange}
      />
    );
  }

  tableChange = (pagination) => {
    const { ReportsStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    ReportsStore.loadDeployDurationTable(projectId, this.envId, startTime, endTime, this.appIds.slice(), pagination.current - 1, pagination.pageSize);
  };

  render() {
    const { intl: { formatMessage }, history, ReportsStore } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const echartsLoading = ReportsStore.getEchartsLoading;

    const envDom = this.env.length ? _.map(this.env, d => (<Option key={d.id} value={d.id}>{d.name}</Option>)) : null;

    const appDom = this.app.length ? _.map(this.app, d => (<Option key={d.id} value={d.id}>{d.name}</Option>)) : null;

    return (<Page
      className="c7n-region"
      service={[
        'devops-service.application.listByActive',
        'devops-service.application-instance.listDeployTime',
        'devops-service.application-instance.pageDeployTimeDetail',
        'devops-service.devops-environment.listByProjectIdAndActive',
      ]}
    >
      <Header
        title={formatMessage({ id: 'report.deploy-duration.head' })}
        backPath={`/devops/reports?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`}
      >
        <ChartSwitch
          history={history}
          current="deploy-duration"
        />
        <Button
          icon="refresh"
          onClick={this.handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Content code="report.deploy-duration" value={{ name }}>
        {this.env.length ? <React.Fragment>
          <div className="c7n-report-screen">
            <Select
              notFoundContent={formatMessage({ id: 'envoverview.noEnv' })}
              value={this.envId}
              label={formatMessage({ id: 'deploy.envName' })}
              className="c7n-select_200"
              onChange={this.handleEnvSelect}
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              filter
            >
              {envDom}
            </Select>
            <Select
              notFoundContent={formatMessage({ id: 'envoverview.unlist' })}
              value={this.appIds.length && this.appIds.slice()}
              label={formatMessage({ id: 'deploy.appName' })}
              className="c7n-select_400 margin-more"
              mode="multiple"
              maxTagCount={3}
              onChange={this.handleAppSelect}
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              filter
            >
              {appDom}
            </Select>
            <TimePicker startTime={ReportsStore.getStartTime} endTime={ReportsStore.getEndTime} func={this.loadCharts} store={ReportsStore} />
          </div>
          <div className="c7n-report-content">
            <Spin spinning={echartsLoading}>
              <ReactEcharts
                option={this.getOption()}
                notMerge
                lazyUpdate
                style={{ height: '350px', width: '100%' }}
              />
            </Spin>
          </div>
          <div className="c7n-report-table">
            {this.renderTable()}
          </div>
        </React.Fragment> : <NoChart title={formatMessage({ id: 'report.no-env' })} des={formatMessage({ id: 'report.no-env-des' })} />}
      </Content>
    </Page>);
  }
}

export default injectIntl(DeployDuration);
