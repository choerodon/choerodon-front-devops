import React, { PureComponent } from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';

import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
// import 'echarts/lib/component/legend';
import 'echarts/lib/component/grid';
import './Submission.scss';

class LineChart extends PureComponent {
  getOption = () => {
    const { color, data: { keys, value } } = this.props;
    return {
      title: {
        show: false,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
        formatter: '日期：{b}<br/>提交次数：{c}',
      },
      grid: {
        top: 42,
        left: 0,
        right: 15,
        bottom: '0',
        // 防止标签溢出
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#eee'],
          },
        },
        // axisLabel: {
        //   formatter(value, idx) {
        //     const date = new Date(value);
        //     return idx === 0 ? value : [date.getMonth() + 1, date.getDate()].join('/');
        //   },
        // },
        data: keys,
      },
      yAxis: {
        name: '次数        ',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#eee'],
          },
        },
        type: 'value',
      },
      series: [{
        data: value,
        type: 'line',
        smooth: true,
        smoothMonotone: 'x',
        symbol: 'circle',
        itemStyle: {
          normal: {
            color,
          },
        },
        areaStyle: {
          color,
          opacity: '0.5',
        },
        lineStyle: {
          color,
        },
      }],
    };
  };

  render() {
    const { style, data: { avatar, commits }, name } = this.props;
    return (
      <div>
        <div className="c7n-report-commits-title">
          {avatar ? <img className="c7n-report-commits-avatar" src={avatar} alt="avatar" /> : null}
          {name}
          {commits ? <span className="c7n-report-commits-text">{commits} commits</span> : null}
        </div>
        <ReactEchartsCore
          echarts={echarts}
          option={this.getOption()}
          style={style}
          notMerge
          lazyUpdate
        />
      </div>
    );
  }
}

export default LineChart;
