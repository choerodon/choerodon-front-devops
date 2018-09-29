import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Select, Button, Tooltip, Spin } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import moment from 'moment';
import ChartSwitch from '../Component/ChartSwitch';
import './BuildNumber.scss';
import TimePicker from '../Component/TimePicker';
import NoChart from '../Component/NoChart';
import BuildTable from '../BuildTable/BuildTable';
import { getAxis } from '../../../../utils';


const { AppState } = stores;
const { Option } = Select;
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

@observer
class BuildNumber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateType: 'seven',
    };
  }

  componentDidMount() {
    this.loadDatas();
  }

  componentWillUnmount() {
    const { ReportsStore } = this.props;
    ReportsStore.setAllData([]);
    ReportsStore.setBuildNumber({});
    ReportsStore.setStartTime(moment().subtract(6, 'days'));
    ReportsStore.setEndTime(moment());
    ReportsStore.setAppId(null);
    ReportsStore.setPageInfo({ number: 0, totalElements: 0, size: HEIGHT <= 900 ? 10 : 15 });
    ReportsStore.setStartDate();
    ReportsStore.setEndDate();
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
    const { pageInfo } = ReportsStore;
    ReportsStore.loadApps(id);
    this.loadCharts(pageInfo);
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

  /**
   * 图表函数
   */
  getOption() {
    const { intl: { formatMessage }, ReportsStore } = this.props;
    const { createDates, pipelineFrequencys, pipelineSuccessFrequency, pipelineFailFrequency } = ReportsStore.getBuildNumber;
    const val = [{ name: `${formatMessage({ id: 'report.build-number.fail' })}` }, { name: `${formatMessage({ id: 'report.build-number.success' })}` }, { name: `${formatMessage({ id: 'report.build-number.total' })}` }];
    val[0].value = _.reduce(pipelineFailFrequency, (sum, n) => sum + n, 0);
    val[1].value = _.reduce(pipelineSuccessFrequency, (sum, n) => sum + n, 0);
    val[2].value = _.reduce(pipelineFrequencys, (sum, n) => sum + n, 0);
    const startTime = ReportsStore.getStartTime;
    const endTime = ReportsStore.getEndTime;
    const { xAxis, yAxis } = getAxis(startTime, endTime, createDates, { pipelineFailFrequency, pipelineSuccessFrequency, pipelineFrequencys });
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none',
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
        formatter(params) {
          if (params[1] && params[0] && params[0].value) {
            const total = params[0].value + params[1].value;
            return `<div>
              <div>${formatMessage({ id: 'branch.issue.date' })}：${params[1].name}</div>
              <div><span class="c7n-echarts-tooltip" style="background-color:${params[1].color};"></span>${formatMessage({ id: 'report.build-number.build' })}${params[1].seriesName}：${params[1].value}</div>
              <div><span class="c7n-echarts-tooltip" style="background-color:${params[0].color};"></span>${formatMessage({ id: 'report.build-number.build' })}${params[0].seriesName}：${params[0].value}</div>
              <div>${formatMessage({ id: 'report.build-number.build' })}${formatMessage({ id: 'report.build-number.total' })}：${total}</div>
              <div>${formatMessage({ id: 'report.build-number.build' })}${formatMessage({ id: 'report.build-number.success.rate' })}：${((params[0].value / total) * 100).toFixed(2)}%</div>
            <div>`;
          } else if (params[0].value || (params[1] && params[1].value)) {
            const pr = params[1] || params[0];
            return `<div>
              <div>${formatMessage({ id: 'branch.issue.date' })}：${pr.name}</div>
              <div><span class="c7n-echarts-tooltip" style="background-color:${pr.color};"></span>${formatMessage({ id: 'report.build-number.build' })}${pr.seriesName}：${pr.value}</div>
            <div>`;
          }
          return null;
        },
      },
      legend: {
        left: 'right',
        itemWidth: 14,
        itemGap: 20,
        formatter(name) {
          let count = 0;
          _.map(val, (data) => {
            if (data.name === name) {
              count = data.value;
            }
          });
          return `${name}：${count}`;
        },
        selectedMode: false,
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
          formatter(value) {
            return `${value.substr(5).replace('-', '/')}`;
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          },
        },
        data: xAxis,
      },
      yAxis: {
        name: `${formatMessage({ id: 'report.build-number.yAxis' })}`,
        type: 'value',

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
          margin: 13,
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
        min: (yAxis.pipelineFrequencys && yAxis.pipelineFrequencys.length) ? null : 0,
        max: (yAxis.pipelineFrequencys && yAxis.pipelineFrequencys.length) ? null : 4,
      },
      series: [
        {
          name: `${formatMessage({ id: 'report.build-number.success' })}`,
          type: 'bar',
          barWidth: '40%',
          itemStyle: {
            color: '#00BFA5',
            emphasis: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.20)',
            },
          },
          stack: 'total',
          data: yAxis.pipelineSuccessFrequency,
        },
        {
          name: `${formatMessage({ id: 'report.build-number.fail' })}`,
          type: 'bar',
          barWidth: '40%',
          itemStyle: {
            color: '#FFB100',
            emphasis: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.20)',
            },
          },
          stack: 'total',
          data: yAxis.pipelineFailFrequency,
        },
        {
          name: `${formatMessage({ id: 'report.build-number.total' })}`,
          type: 'bar',
          color: '#FFF',
          stack: 'total',
        },
      ],
    };
  }

  loadCharts = (pageInfo) => {
    const { ReportsStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const appId = ReportsStore.getAppId;
    const startTime = ReportsStore.getStartTime.format().split('T')[0].replace(/-/g, '/');
    const endTime = ReportsStore.getEndTime.format().split('T')[0].replace(/-/g, '/');
    ReportsStore.loadBuildNumber(projectId, appId, startTime, endTime);
    if (pageInfo) {
      ReportsStore.loadBuildTable(projectId, appId, startTime, endTime, pageInfo.current - 1, pageInfo.pageSize);
    } else {
      ReportsStore.loadBuildTable(projectId, appId, startTime, endTime);
    }
  };

  handleDateChoose = (type) => {
    this.setState({ dateType: type });
  };

  render() {
    const { intl: { formatMessage }, history, ReportsStore } = this.props;
    const { dateType } = this.state;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const { apps, appId, echartsLoading, loading, pageInfo, allData } = ReportsStore;
    return (<Page
      className="c7n-region c7n-ciPipeline"
      service={[
        'devops-service.application.listByActive',
        'devops-service.devops-gitlab-pipeline.listPipelineFrequency',
        'devops-service.devops-gitlab-pipeline.pagePipeline',
      ]}
    >
      <Header
        title={formatMessage({ id: 'report.build-number.head' })}
        backPath={`/devops/reports?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`}
      >
        <ChartSwitch
          history={history}
          current="build-number"
        />
        <Button
          icon="refresh"
          onClick={this.handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Content code="report.build-number" value={{ name }} className="c7n-buildNumber-content">
        {apps && apps.length ? <React.Fragment>
          <div className="c7n-buildNumber-select">
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
            <TimePicker
              startTime={ReportsStore.getStartDate}
              endTime={ReportsStore.getEndDate}
              func={this.loadCharts}
              type={dateType}
              onChange={this.handleDateChoose}
              store={ReportsStore}
            />
          </div>
          <Spin spinning={echartsLoading}>
            <ReactEcharts className="c7n-buildNumber-echarts" option={this.getOption()} />
          </Spin>
          <BuildTable loading={loading} dataSource={allData} pagination={pageInfo} loadDatas={this.loadDatas} />
        </React.Fragment> : <NoChart title={formatMessage({ id: 'report.no-app' })} des={formatMessage({ id: 'report.no-app-des' })} />}
      </Content>
    </Page>);
  }
}

export default injectIntl(BuildNumber);
