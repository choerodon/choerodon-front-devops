import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from "react-router-dom";
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Tooltip, Button, Icon } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import StatusTags from '../../../../components/StatusTags';
import TimePopover from '../../../../components/timePopover';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import '../../../main.scss';
import LogSiderbar from '../logSiderbar';
import './NodeDetail.scss';
import EnvOverviewStore from "../../../../stores/project/envOverview";

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
  }

  componentWillUnmount() {

  }

  loadPodTable = () => {
    const { ClusterStore } = this.props;
    const { organizationId } = AppState.currentMenuType;
    ClusterStore.loadPodTable(organizationId, this.clusterId, this.nodeName);
  };

  getOption = () => {
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
          radius: ['35%', '65%'],
          hoverAnimation: false,
          label: { show: false },
          data: [
            { value: 1,
              name: '直达',
              itemStyle: { color: '#57AAF8' },
              label: {
                show: true,
                position: 'inner',
                formatter: '{d}% ',
                fontSize: 12,
                color: 'rgba(0,0,0,0.65)',
              },
            },
            { value: 3, name: '营销广告', itemStyle: { color: 'rgba(0,0,0,0.08)' }},
          ],
        },
        {
          hoverAnimation: false,
          type: 'pie',
          radius: ['70%', '100%'],
          label: { show: false },
          data: [
            {
              value: 2,
              name: '直达',
              itemStyle: { color: '#00BFA5' },
              label: {
                show: true,
                position: 'inner',
                formatter: '{d}% ',
                fontSize: 12,
                color: 'rgba(0,0,0,0.65)',
              },
            },
            { value: 9, name: '营销广告', itemStyle: { color: 'rgba(0,0,0,0.08)' }},
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
    const { ContainerStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    // ContainerStore.loadPodParam(projectId, record.id).then(data => {
    //   if (data && data.length) {
    //     this.setState({
    //       envId: record.envId,
    //       clusterId: record.clusterId,
    //       namespace: record.namespace,
    //       containerArr: data,
    //       podName: data[0].podName,
    //       containerName: data[0].containerName,
    //       logId: data[0].logId,
    //       showSide: true,
    //     });
    //   }
    // });
    this.setState({ showLog: true });
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
    // const data = [{
    //   id: 666,
    //   status: 'Unready',
    //   podName: 'node1',
    //   reTimes: 12,
    //   createdAt: '2019-01-14 11:04:30',
    // }];
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
        rowKey={record => record.podName}
        dataSource={data}
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

  render() {
    const { type, organizationId, name } = AppState.currentMenuType;
    const { ClusterStore, data, showSideBar, intl: { formatMessage }, delClusterShow } = this.props;
    const { showLog } = this.state;

    return (
      <Page>
        <Header title={<FormattedMessage id="node.head" />} backPath={`/devops/cluster?type=${type}&id=${organizationId}&name=${name}&organizationId=${organizationId}`} />
        <Content code="node" values={{ name: this.nodeName }}>
          <div className="c7n-node-title">{formatMessage({ id: 'node.res' })}</div>
          <div className="c7n-node-pie">
            <div className="c7n-node-pie-block">
              <ReactEcharts
                option={this.getOption()}
                notMerge
                lazyUpdate
                style={{ height: '160px', width: '160px' }}
              />
              <div className="c7n-node-pie-title">
                {formatMessage({ id: 'cluster.cpu' })}
              </div>
              <div className="c7n-node-pie-info">
                <span className="c7n-node-pie-info-span rv" />
                <span>{formatMessage({ id: 'node.arv' })}</span>
                <span>0.36</span>
              </div>
              <div className="c7n-node-pie-info">
                <span className="c7n-node-pie-info-span lmv" />
                <span>{formatMessage({ id: 'node.lmv' })}</span>
                <span>0.6</span>
              </div>
              <div className="c7n-node-pie-info">
                <span className="c7n-node-pie-info-span" />
                <span>{formatMessage({ id: 'node.allV' })}</span>
                <span>4</span>
              </div>
            </div>
          </div>
          <div className="c7n-node-title">{formatMessage({ id: 'node.pods' })}</div>
          {this.renderTable()}
          {showLog && <LogSiderbar visible={showLog} onClose={this.closeLog}/>}
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(NodeDetail));
