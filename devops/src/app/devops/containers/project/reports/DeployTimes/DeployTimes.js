import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Select, Button, Table, Spin } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import ChartSwitch from '../Component/ChartSwitch';
import StatusTags from '../../../../components/StatusTags';
import '../DeployDuration/DeployDuration.scss';

const { AppState } = stores;
const { Option } = Select;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

@observer
class DeployTimes extends Component {
  handleRefresh = () => {};

  /**
   * 视图切换
   * @param e
   */
  handleChange = (e) => {
    console.log(e.target.value);
  };

  /**
   * 用户、应用选择
   * @param e
   */
  handleSelect = (e) => {
    console.log(e.target.value);
  };

  getOption = () => ({
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
      padding: [10, 15, 10, 15],
      extraCssText:
        'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
      formatter(params, ticket) {
        if (params[1] && params[0]) {
          const total = params[0].value + params[1].value;
          return `<div>
              <div>日期：${params[1].name}</div>
              <div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[1].color};"></span>部署${params[1].seriesName}：${params[1].value}</div>
              <div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[0].color};"></span>部署${params[0].seriesName}：${params[0].value}</div>
              <div>部署总次数：${total}</div>
              <div>部署成功率：${(params[0].value / total).toFixed(2)}%</div>
            <div>`;
        } else {
          return `<div>
              <div>日期：${params[0].name}</div>
              <div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[0].color};"></span>部署${params[0].seriesName}：${params[0].value}</div>
            <div>`;
        }
      },
    },
    legend: {
      data: ['失败次数', '成功次数', '总次数'],
      left: 'right',
      itemWidth: 14,
      itemGap: 20,
      // formatter(name) {
      //   const val = [{ name: '失败次数', value: 20 }, { name: '成功次数', value: 40 }, { name: '总次数', value: 60 }];
      //   let count = 0;
      //   val.map((data) => {
      //     if (data.name === name) {
      //       count = data.value;
      //     }
      //   });
      //   return `${name}：${count}`;
      // },
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
      },
      splitLine: {
        lineStyle: {
          color: ['#eee'],
          width: 1,
          type: 'solid',
        },
      },
      data: ['08/01', '08/02', '08/03', '08/04', '08/05', '08/06', '08/07', '08/08', '08/09'],
    },
    yAxis: {
      name: '次数',
      type: 'value',

      nameTextStyle: {
        fontSize: 13,
        color: '#000',
        padding: [0, 20, 10, 0],
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
        name: '成功次数',
        type: 'bar',
        color: '#00BFA5',
        barWidth: '40%',
        stack: '总次数',
        data: [22, 18, 19, 23, 29, 33, 31, 11, 5],
      },
      {
        name: '失败次数',
        type: 'bar',
        color: '#FFB100',
        barWidth: '40%',
        stack: '总次数',
        data: [12, 13, 10, 13, 9, 23, 21, 22, 10],
      },
      {
        name: '总次数',
        type: 'bar',
        color: '#FFF',
        stack: '总次数',
      },
    ],
  });

  renderTable() {
    const { intl: { formatMessage } } = this.props;
    const data = [{
      status: 'success',
      time: '2018-08-02 10:57:15',
      code: 'hgo-app-ce70a',
      appName: '部署应用',
      ver: '2018.9.10-171543-feature-c7ncd-783',
      long: '17分',
      user: '12938李洪',
    }];
    const column = [
      {
        title: formatMessage({ id: 'app.active' }),
        render: record => (<StatusTags name={formatMessage({ id: record.status })} colorCode={record.status} />),
      }, {
        title: formatMessage({ id: 'report.deploy-duration.time' }),
        dataIndex: 'time',
      }, {
        title: formatMessage({ id: 'deploy.instance' }),
        dataIndex: 'code',
      }, {
        title: formatMessage({ id: 'deploy.appName' }),
        dataIndex: 'appName',
      }, {
        title: formatMessage({ id: 'deploy.ver' }),
        dataIndex: 'ver',
      }, {
        title: formatMessage({ id: 'report.deploy-duration.long' }),
        dataIndex: 'long',
      }, {
        title: formatMessage({ id: 'report.deploy-duration.user' }),
        dataIndex: 'user',
      },
    ];
    return (
      <Table
        rowKey={record => record.id}
        dataSource={data}
        filterBar={false}
        columns={column}
        // loading={tableLoading}
      />
    );
  }

  render() {
    const { intl: { formatMessage }, history, ReportsStore } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    const echartsLoading = ReportsStore.getEchartsLoading;
    return (<Page className="c7n-region">
      <Header
        title={formatMessage({ id: 'report.deploy-times.head' })}
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
      <Content code="report.deploy-times" value={{ name }}>
        <div className="c7n-report-screen">
          <Select
            label={formatMessage({ id: 'deploy.envName' })}
            className="c7n-select_200"
            placeholder="Please select"
            onChange={this.handleSelect}
          >
            {children}
          </Select>
          <Select
            label={formatMessage({ id: 'deploy.appName' })}
            className="c7n-select_400"
            mode="multiple"
            placeholder="Please select"
            defaultValue={['a10', 'c12']}
            onChange={this.handleSelect}
          >
            {children}
          </Select>
          <div className="c7n-report-history">right</div>
        </div>
        <div className="c7n-report-content">
          <Spin spinning={echartsLoading}>
            <ReactEcharts
              option={this.getOption()}
              notMerge
              lazyUpdate
              style={{ height: '350px', width: '100%' }}
              theme="theme_name"
              onChartReady={this.onChartReadyCallback}
            />
          </Spin>
        </div>
        <div className="c7n-report-table">
          {this.renderTable()}
        </div>
      </Content>
    </Page>);
  }
}

export default injectIntl(DeployTimes);
