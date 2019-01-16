import React, { Component, Fragment } from 'react';
import { Link, withRouter } from "react-router-dom";
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Tooltip, Icon, Table } from 'choerodon-ui';
import { Permission, stores } from 'choerodon-front-boot';
import StatusTags from '../../../../components/StatusTags';
import TimePopover from '../../../../components/timePopover';
import './ClusterList.scss';

const { AppState } = stores;
const podData = [{
  id: 666,
  status: 'Unready',
  node: 'node1',
  cpu: { a: '请求值：0.81（40.50%）', b: '限制值：0.9 (22.50%)' },
  memory: { a: '请求值：0.81（40.50%）', b: '限制值：0.9 (22.50%)' },
  createdAt: '2019-01-14 01:04:30',
}, {
  id: 661,
  status: 'Unready',
  node: 'node1',
  cpu: { a: '请求值：0.81（40.50%）', b: '限制值：0.9 (22.50%)' },
  memory: { a: '请求值：0.81（40.50%）', b: '限制值：0.9 (22.50%)' },
  createdAt: '2019-01-14 11:04:30',
}, {
  id: 662,
  status: 'Unready',
  node: 'node1',
  cpu: { a: '请求值：0.81（40.50%）', b: '限制值：0.9 (22.50%)' },
  memory: { a: '请求值：0.81（40.50%）', b: '限制值：0.9 (22.50%)' },
  createdAt: '2019-01-15 11:04:30',
}];

@observer
class ClusterList extends Component {
  constructor(props) {
    super(...arguments);
    this.state = {
      activeKey: [],
    };
  }

  renderCm = (cpu) => {
    return (<div className="c7n-cls-table-cm">
      <span className="c7n-cls-up"/>{cpu.a}
      <span className="c7n-cls-down"/>{cpu.b}
    </div>);
  };

  showMore = id => {
    let activeKey = this.state.activeKey;
    activeKey = [...activeKey];
    const index = activeKey.indexOf(id);
    const isActive = index > -1;
    if (isActive) {
      // remove active state
      activeKey.splice(index, 1);
    } else {
      activeKey.push(id);
    }
    this.setState({ activeKey });
  };

  render(){
    const { store, data, showSideBar, intl: { formatMessage }, delClusterShow } = this.props;
    const { type, organizationId, name } = AppState.currentMenuType;
    const { activeKey } = this.state;
    const columns = [{
      key: 'status',
      title: formatMessage({ id: 'status' }),
      dataIndex: 'status',
      render: status => <StatusTags name={status} colorCode={'unReady'} />,
    }, {
      key: 'node',
      title: formatMessage({ id: 'cluster.node' }),
      render: record => (
        <Link
          to={{
            pathname: `/devops/cluster/${record.id}/node`,
            search: `?type=${type}&id=${organizationId}&name=${name}&organizationId=${organizationId}&node=${record.node}`,
          }}
        >
          {record.node}
        </Link>
      ),
    }, {
      key: 'cpu',
      title: formatMessage({ id: 'cluster.cpu' }),
      dataIndex: 'cpu',
      render: cpu => this.renderCm(cpu),
    }, {
      key: 'memory',
      title: formatMessage({ id: 'cluster.memory' }),
      dataIndex: 'memory',
      render: memory => this.renderCm(memory),
    }, {
      key: 'createdAt',
      title: formatMessage({ id: 'ciPipeline.createdAt' }),
      dataIndex: 'createdAt',
      render: createdAt => <TimePopover content={createdAt} />,
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
          <Table
            className="c7n-cls-pod-table"
            filterBar={false}
            bordered={false}
            columns={columns}
            dataSource={podData}
            pagination={activeKey.indexOf(data.id) > -1 && store.podPageInfo}
            loading={store.podLoading}
            onChange={this.tableChange}
            rowKey={record => record.key}
          />
          {podData.length > 2 ? <div className="c7n-cls-pod-more" onClick={this.showMore.bind(this, data.id)}>
            {activeKey.indexOf(data.id) > -1 ? formatMessage({ id: "shrink" }) : formatMessage({ id: "expand" })}
          </div> : null}
        </div>
      </Tooltip>
    );
  }
}

export default withRouter(injectIntl(ClusterList));
