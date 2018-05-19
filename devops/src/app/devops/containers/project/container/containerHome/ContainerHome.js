import React, { Component } from 'react';
import { Table, Button, Spin, message, Radio, Input, Form, Modal, Tooltip, Select, Popover } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import PageHeader from 'PageHeader';
import { fromJS, is } from 'immutable';
import { Observable } from 'rxjs';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import LoadingBar from '../../../../components/loadingBar';
import './ContainerHome.scss';
import '../../../main.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

@inject('AppState')
@commonComponent('ContainerStore')
@observer
class ContainerHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      id: '',
      show: false,
      name: '',
      log: [],
    };
  }

  componentDidMount() {
    this.loadAllData(this.state.page);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  };

  /**
   * 获取行
   *
   */
  getColumn = () => [{
    title: Choerodon.languageChange('container.status'),
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    render: (text, record) => {
      let dom = null;
      switch (record.status) {
        case 'Running':
          dom = (<MouserOverWrapper text={record.status} width={80}>
            <span className="icon-check_circle c7n-icon-finish" />
            <span className="c7n-container-title">{record.status}</span>
          </MouserOverWrapper>);
          break;
        case 'Pending':
          dom = (<div>
            <span className="icon-timelapse c7n-icon-timelapse" />
            <span className="c7n-container-title">{record.status}</span>
          </div>);
          break;
        default:
          dom = (<div>
            <span className="icon-help c7n-icon-help" />
          </div>);
      }
      return dom;
    },
  }, {
    title: Choerodon.languageChange('container.name'),
    key: 'name',
    sorter: true,
    filters: [],
    filterMultiple: false,
    render: record => (
      <MouserOverWrapper text={record.name} width={200} >{record.name}</MouserOverWrapper>),
  }, {
    title: Choerodon.languageChange('container.app'),
    dataIndex: 'app',
    key: 'app',
    filters: [],
    filterMultiple: false,
    render: (text, record) => (<div>
      <div className="c7n-container-col-inside">
        <div className="c7n-container-square"><div>App</div></div>
        <span>{record.appName}</span>
      </div>
      <div>
        <span className="c7n-container-circle">V</span>
        <span>{record.appVersion}</span>
      </div>
    </div>),
  }, {
    title: Choerodon.languageChange('container.ip'),
    dataIndex: 'ip',
    key: 'ip',
    sorter: true,
    filters: [],
    filterMultiple: false,
  }, {
    title: Choerodon.languageChange('container.usable'),
    dataIndex: 'ready',
    key: 'ready',
    filters: [{
      text: '可用',
      value: '1',
    }, {
      text: '不可用',
      value: '0',
    }],
    filterMultiple: false,
    render: (text, record) => (<div className="c7n-container-table">
      {record.ready ? <span className="icon-done" /> : <span className="icon-close" />}
    </div>),
  }, {
    title: Choerodon.languageChange('container.createTime'),
    dataIndex: 'creationDate',
    key: 'creationDate',
    sorter: true,
    render: (text, record) => <TimePopover content={record.creationDate} />,
  }] ;

  render() {
    const { ContainerStore, AppState } = this.props;
    const serviceData = ContainerStore.getAllData;
    const projectName = AppState.currentMenuType.name;
    const contentDom = ContainerStore.isRefresh ? <LoadingBar display /> : (<React.Fragment>
      <PageHeader title={Choerodon.languageChange('container.title')}>
        <Button
          className="leftBtn"
          onClick={this.handleRefresh}
        >
          <span className="icon-refresh page-head-icon" />
          <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
        </Button>
      </PageHeader>
      <div className="page-content">
        <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的容器管理</h2>
        <p>
          容器管理便于您查看和管理Kubernetes中应用实例生成的容器，
          可以实时查看相关容器的地址、创建时间、状态，确定容器是否正常运行且通过健康检查，并且可以查看容器日志进行错误定位和状态监控。
          <a href="http://choerodon.io/zh/docs/user-guide/deploy/container-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
              了解详情
            </span>
            <span className="icon-open_in_new" />
          </a>
        </p>
        <Table
          loading={ContainerStore.loading}
          pagination={ContainerStore.pageInfo}
          columns={this.getColumn()}
          dataSource={serviceData}
          rowKey={record => record.id}
          onChange={this.tableChange}
        />
      </div>
    </React.Fragment>);

    return (
      <div className="c7n-region page-container c7n-container-wrapper">
        {contentDom}
      </div>
    );
  }
}

export default withRouter(ContainerHome);
