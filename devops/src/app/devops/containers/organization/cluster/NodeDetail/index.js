import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from "react-router-dom";
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Tooltip, Button, Icon } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import { Content, Header, Page, stores } from 'choerodon-front-boot';
import StatusTags from '../../../../components/StatusTags';
import TimePopover from '../../../../components/timePopover';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import '../../../main.scss';
import LogSiderbar from '../logSiderbar';
import './NodeDetail.scss';

const { AppState } = stores;

@observer
class NodeDetail extends Component {
  constructor(props) {
    super(...arguments);
    this.state = {
      showLog: false,
    };
    this.clusterId = this.props.match.params.clusterId;
    this.nodeName = this.props.history.location.search.split('&node=')[1];
  }

  componentDidMount() {
    this.loadPodTable();
    this.loadNodePie();
  }

  loadPodTable = () => {
    const { ClusterStore } = this.props;
    const { organizationId } = AppState.currentMenuType;
    ClusterStore.loadPodTable(organizationId, this.clusterId, this.nodeName);
  };

  loadNodePie = () => {
    const { ClusterStore } = this.props;
    const { organizationId } = AppState.currentMenuType;
    ClusterStore.loadNodePie(organizationId, this.clusterId, this.nodeName);
  };

  getOption = (data) => {
    return {
      tooltip: {
        show: false,
      },
      legend: {
        show: false,
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '55%'],
          hoverAnimation: false,
          label: { show: false },
          data: [
            { value: data.lmv,
              name: 'limitValue',
              itemStyle: { color: '#57AAF8' },
              label: {
                show: true,
                position: 'inner',
                formatter: data.limPercent,
                fontSize: 12,
                color: 'rgba(0,0,0,0.65)',
              },
            },
            { value: data.total, name: 'value', itemStyle: { color: 'rgba(0,0,0,0.08)' }},
          ],
        },
        {
          hoverAnimation: false,
          type: 'pie',
          radius: ['65%', '90%'],
          label: { show: false },
          data: [
            {
              value: data.rv,
              name: 'requestValue',
              itemStyle: { color: '#00BFA5' },
              label: {
                show: true,
                position: 'inner',
                formatter: data.resPercent,
                fontSize: 12,
                color: 'rgba(0,0,0,0.65)',
              },
            },
            { value: typeof data.total === 'number' ? data.total : 1, name: 'value', itemStyle: { color: 'rgba(0,0,0,0.08)' }},
          ],
        },
      ],
    };
  };

  getPodOption = () => {
    const { ClusterStore } = this.props;
    const node = ClusterStore.getNode;

    return {
      tooltip: {
        show: false,
      },
      legend: {
        show: false,
      },
      series: [
        {
          hoverAnimation: false,
          type: 'pie',
          radius: ['65%', '90%'],
          label: { show: false },
          data: [
            {
              value: node.podCount,
              name: 'requestValue',
              itemStyle: { color: '#00BFA5' },
              label: {
                show: true,
                position: 'inner',
                formatter: node.podPercentage,
                fontSize: 12,
                color: 'rgba(0,0,0,0.65)',
              },
            },
            { value: node.podTotal, name: 'value', itemStyle: { color: 'rgba(0,0,0,0.08)' }},
          ],
        },
      ],
    };
  };


  /**
   * 显示日志
   * @param record 容器record
   */
  showLog = record => {
    const logData = {
      namespace: record.namespace,
      podName: record.name,
      clusterId: this.clusterId,
      containerName: record.containersForLogs[0].containerName,
      logId: record.containersForLogs[0].logId,
    };
    this.setState({
      logParm: logData,
      showLog: true,
    });
  };

  closeLog = () => {
    this.setState({ showLog: false });
  };

  /**
   * 表格函数
   * @returns {*}
   */
  renderTable() {
    const { intl: { formatMessage }, ClusterStore } = this.props;
    const data = ClusterStore.getPodData;
    const { loading, pageInfo } = ClusterStore;
    const { paras } = ClusterStore.getInfo;
    const column = [
      {
        title: formatMessage({ id: 'status' }),
        key: 'status',
        render: record => (<StatusTags name={record.status} colorCode={record.status} />),
      }, {
        title: formatMessage({ id: 'node.podName' }),
        key: 'name',
        dataIndex: 'name',
        render: name => (<MouserOverWrapper text={name} width={0.2}>{name}</MouserOverWrapper>),
      }, {
        key: 'creationDate',
        title: formatMessage({ id: 'ciPipeline.createdAt' }),
        dataIndex: 'creationDate',
        render: creationDate => <TimePopover content={creationDate} />,
      },
      {
        align: 'right',
        key: 'action',
        render: record => (
          <Tooltip title={<FormattedMessage id="node.log" />}>
            <Button
              size="small"
              shape="circle"
              onClick={this.showLog.bind(this, record)}
            >
              <Icon type="find_in_page" />
            </Button>
          </Tooltip>
        ),
      },
    ];

    return (
      <Table
        rowKey={record => record.id}
        dataSource={data.slice()}
        columns={column}
        loading={loading}
        pagination={pageInfo}
        onChange={this.tableChange}
        filters={paras.slice()}
        filterBarPlaceholder={formatMessage({ id: "filter" })}
      />
    );
  }


  /**
   * table 操作
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange = (pagination, filters, sorter, paras) => {
    const { ClusterStore } = this.props;
    const { organizationId } = AppState.currentMenuType;
    ClusterStore.setInfo({ filters, sort: sorter, paras });
    const sort = { field: "", order: "desc" };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      if (sorter.order === "ascend") {
        sort.order = "asc";
      } else if (sorter.order === "descend") {
        sort.order = "desc";
      }
    }
    let searchParam = {};
    const page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    ClusterStore.loadPodTable(
      organizationId,
      this.clusterId,
      this.nodeName,
      page,
      pagination.pageSize,
      sort,
      postData
    );
  };

  pieDes = (data) => {
    const { intl: { formatMessage } } = this.props;

    return (<Fragment>
      <div className="c7n-node-pie-info">
        <span className="c7n-node-pie-info-span rv" />
        <span>{formatMessage({ id: 'node.rv' })}</span>
        <span>{data.rv}</span>
      </div>
      <div className="c7n-node-pie-info">
        <span className="c7n-node-pie-info-span lmv" />
        <span>{formatMessage({ id: 'node.lmv' })}</span>
        <span>{data.lmv}</span>
      </div>
      <div className="c7n-node-pie-info">
        <span className="c7n-node-pie-info-span" />
        <span>{formatMessage({ id: 'node.allV' })}</span>
        <span>{data.total}</span>
      </div>
    </Fragment>);
  };

  podPies = () => {
    const { ClusterStore, intl: { formatMessage } } = this.props;
    const node = ClusterStore.getNode;
    if (!node) { return; }
    const cpuData = {
      rv: node.cpuRequest,
      lmv: node.cpuLimit,
      resPercent: node.cpuRequestPercentage,
      limPercent: node.cpuLimitPercentage,
      total: node.cpuTotal,
    };
    const memoryPieData = {
      rv: node.memoryRequestPercentage.split('%')[0],
      lmv: node.memoryLimitPercentage.split('%')[0],
      resPercent: node.memoryRequestPercentage,
      limPercent: node.memoryLimitPercentage,
      total: 100,
    };
    const memoryData = {
      rv: node.memoryRequest,
      lmv: node.memoryLimit,
      resPercent: node.memoryRequestPercentage,
      limPercent: node.memoryLimitPercentage,
      total: node.memoryTotal,
    };
    return (<Fragment>
      <div className="c7n-node-pie-block">
        <ReactEcharts
          option={this.getOption(cpuData)}
          notMerge
          lazyUpdate
          style={{ height: '160px', width: '160px' }}
        />
        <div className="c7n-node-pie-title">
          {formatMessage({ id: 'cluster.cpu' })}
        </div>
        {this.pieDes(cpuData)}
      </div>
      <div className="c7n-node-pie-block">
        <ReactEcharts
          option={this.getOption(memoryPieData)}
          notMerge
          lazyUpdate
          style={{ height: '160px', width: '160px' }}
        />
        <div className="c7n-node-pie-title">
          {formatMessage({ id: 'cluster.memory' })}
        </div>
        {this.pieDes(memoryData)}
      </div>
      <div className="c7n-node-pie-block">
        <ReactEcharts
          option={this.getPodOption()}
          notMerge
          lazyUpdate
          style={{ height: '160px', width: '160px' }}
        />
        <div className="c7n-node-pie-title">
          {formatMessage({ id: 'node.pod.allocated' })}
        </div>
        <div className="c7n-node-pie-info">
          <span className="c7n-node-pie-info-span rv" />
          <span>{formatMessage({ id: 'node.allocated' })}</span>
          <span>{node.podCount}</span>
        </div>
        <div className="c7n-node-pie-info">
          <span className="c7n-node-pie-info-span" />
          <span>{formatMessage({ id: 'node.allV' })}</span>
          <span>{node.podTotal}</span>
        </div>
      </div>
    </Fragment>)
  };

  render() {
    const { type, organizationId, name } = AppState.currentMenuType;
    const { intl: { formatMessage } } = this.props;
    const { showLog, logParm } = this.state;

    return (
      <Page>
        <Header title={<FormattedMessage id="node.head" />} backPath={`/devops/cluster?type=${type}&id=${organizationId}&name=${name}&organizationId=${organizationId}`} />
        <Content code="node" values={{ name: this.nodeName }}>
          <div className="c7n-node-title">{formatMessage({ id: 'node.res' })}</div>
          <div className="c7n-node-pie">
            {this.podPies()}
          </div>
          <div className="c7n-node-title">{formatMessage({ id: 'node.pods' })}</div>
          {this.renderTable()}
          {showLog && <LogSiderbar visible={showLog} data={logParm} onClose={this.closeLog}/>}
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(NodeDetail));
