import React, { Component, Fragment } from 'react';
import { Link, withRouter } from "react-router-dom";
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Tooltip, Icon, Table, Pagination } from 'choerodon-ui';
import { Permission, stores } from 'choerodon-front-boot';
import StatusTags from '../../../../components/StatusTags';
import TimePopover from '../../../../components/timePopover';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import './ClusterList.scss';

const { AppState } = stores;

@observer
class ClusterList extends Component {
  constructor(props) {
    super(...arguments);
    this.state = {
      page: 0,
      size: 10,
    };
  }

  renderCm = (record, type) => {
    const { intl: { formatMessage } } = this.props;
    let request = record.cpuRequest;
    let limit = record.cpuLimit;
    let resPercent = record.cpuRequestPercentage;
    let limPercent = record.cpuLimitPercentage;
    if(type !== 'cpu') {
      request = record.memoryRequest;
      limit = record.memoryLimit;
      resPercent = record.memoryRequestPercentage;
      limPercent = record.memoryLimitPercentage;
    }
    return (<div className="c7n-cls-table-cm">
      <span className="c7n-cls-up"/>
      <Tooltip title={resPercent}>
        {formatMessage({ id: 'node.rv' })}：{request}
      </Tooltip>
      <span className="c7n-cls-down"/>
      <Tooltip title={limPercent}>
        {formatMessage({ id: 'node.lmv' })}：{limit}
      </Tooltip>
    </div>);
  };

  /**
   * table 操作
   * @param pagination
   */
  tableChange = (pagination) => {
    const { clusterId, tableChange } = this.props;
    tableChange(pagination, clusterId);
  };

  /**
   * 页码改变的回调
   * @param page
   * @param size
   */
  onPageChange = (page, size) => {
    const { store, clusterId } = this.props;
    const { organizationId } = AppState.currentMenuType;
    this.setState({ page: page - 1, size });
    store.loadMoreNode(organizationId, clusterId, page - 1, size);
  };

  showMore = id => {
    const { store, showMore } = this.props;
    let activeKey = store.getActiveKey;
    activeKey = [...activeKey];
    const index = activeKey.indexOf(id);
    const isActive = index > -1;
    if (isActive) {
      // remove active state
      activeKey.splice(index, 1);
      store.setNodeData([]);
    } else {
      showMore(id);
      activeKey.push(id);
    }
    store.setActiveKey(activeKey);
  };

  render(){
    const { store, data, tableData, showSideBar, intl: { formatMessage }, delClusterShow } = this.props;
    const { type, organizationId, name } = AppState.currentMenuType;
    const activeKey = store.getActiveKey;
    const { getNodePageInfo: { current, total, pageSize } } = store;

    const columns = [{
      key: 'status',
      title: formatMessage({ id: 'status' }),
      dataIndex: 'status',
      width: 90,
      render: status => <StatusTags name={status} colorCode={status} />,
    }, {
      key: 'nodeName',
      title: formatMessage({ id: 'cluster.node' }),
      render: record => (
        <Link
          to={{
            pathname: `/devops/cluster/${data.id}/node`,
            search: `?type=${type}&id=${organizationId}&name=${name}&organizationId=${organizationId}&node=${record.nodeName}`,
          }}
        >
          <MouserOverWrapper text={record.nodeName} width={0.1}>{record.nodeName}</MouserOverWrapper>
        </Link>
      ),
    }, {
      title: formatMessage({ id: 'ist.expand.net.type' }),
      key: 'type',
      dataIndex: 'type',
      render: type => <MouserOverWrapper text={type} width={0.05}>{type}</MouserOverWrapper>,
    }, {
      key: 'cpuAllocatable',
      title: formatMessage({ id: 'cluster.cpu' }),
      render: record => this.renderCm(record, 'cpu'),
    }, {
      key: 'memoryAllocatable',
      title: formatMessage({ id: 'cluster.memory' }),
      render: record => this.renderCm(record, 'memory'),
    }, {
      key: 'createTime',
      title: formatMessage({ id: 'ciPipeline.createdAt' }),
      dataIndex: 'createTime',
      render: createTime => <TimePopover content={createTime} />,
    }];

    return (
      <Tooltip placement="bottom" title={data.upgrade ? <FormattedMessage id="cluster.status.update" /> : null}>
        <div className="c7n-cls-wrap">
          <div className={`c7n-cls-head ${data.connect ? '' : 'c7n-cls-disconnect'}`}>
            <span className="c7n-cls-status-line" />
            <span className="c7n-cls-head-name">{data.name}</span>
            <span className="c7n-cls-status-tag">
              {data.connect ? formatMessage({ id: 'running' }) : formatMessage({ id: 'disconnect' })}
            </span>
            <span className="c7n-cls-head-des">{data.description}</span>
            <div className="c7n-cls-head-action">
              {data.connect ? null : <Permission
                service={['devops-service.devops-cluster.queryShell']}
                type={type}
                organizationId={organizationId}
              >
                <Tooltip title={<FormattedMessage id="cluster.active" />}>
                  <Button
                    funcType="flat"
                    shape="circle"
                    onClick={showSideBar.bind(this, 'key', data.id, data.name)}
                  >
                    <Icon type="vpn_key" />
                  </Button>
                </Tooltip>
              </Permission>}
              <Permission
                service={['devops-service.devops-cluster.update']}
                type={type}
                organizationId={organizationId}
              >
                <Tooltip title={<FormattedMessage id="cluster.edit" />}>
                  <Button
                    funcType="flat"
                    shape="circle"
                    onClick={showSideBar.bind(this, 'edit', data.id, data.name)}
                  >
                    <Icon type="mode_edit" />
                  </Button>
                </Tooltip>
              </Permission>
              {data.connect ? null : <Permission
                service={['devops-service.devops-cluster.deleteCluster']}
                type={type}
                organizationId={organizationId}
              >
                <Tooltip title={<FormattedMessage id="cluster.del" />}>
                  <Button
                    funcType="flat"
                    shape="circle"
                    onClick={delClusterShow.bind(this, data.id, data.name)}
                  >
                    <Icon type="delete_forever" />
                  </Button>
                </Tooltip>
              </Permission>}
            </div>
          </div>
          {data.connect ? <Fragment>
            {data.nodes.content.length ?
              <Table
                className="c7n-cls-node-table"
                filterBar={false}
                bordered={false}
                columns={columns}
                dataSource={tableData.slice()}
                pagination={false}
                rowKey={record => record.nodeName}
              /> : null}
            <div className="c7n-cls-node-table-footer">
              {data.nodes.totalElements > 3 ?
                <span className="c7n-cls-node-more" onClick={this.showMore.bind(this, data.id)}>
              {activeKey.indexOf(data.id) > -1 ? formatMessage({ id: "shrink" }) : formatMessage({ id: "expand" })}
            </span> : null}
              {activeKey.indexOf(data.id) > -1 && data.nodes.totalElements > 10 ? <Pagination
                showSizeChanger
                total={total}
                current={current}
                pageSize={pageSize}
                className="c7n-cls-node-pg"
                onChange={this.onPageChange}
                onShowSizeChange={this.onPageChange}
              /> : null}
            </div>
          </Fragment> : null}
        </div>
      </Tooltip>
    );
  }
}

export default withRouter(injectIntl(ClusterList));
