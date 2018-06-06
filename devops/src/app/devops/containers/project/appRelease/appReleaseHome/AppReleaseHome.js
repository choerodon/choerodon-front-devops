import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Popover, Modal, Tabs, Tooltip, Icon } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import Permission from 'PerComponent';
import '../../../main.scss';
import '../AppRelease.scss';
import editReleaseStore from '../../../../stores/project/appRelease/editRelease';

const TabPane = Tabs.TabPane;
@inject('AppState')
@observer
class AppReleaseHome extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      openRemove: false,
      show: false,
      projectId: menu.id,
      key: props.match.params.key ? '2' : '1',
    };
  }
  componentDidMount() {
    const { AppReleaseStore } = this.props;
    AppReleaseStore.loadData({ projectId: this.state.projectId, key: this.state.key });
  }

  getColumn = () => {
    const { type, id: orgId } = this.props.AppState.currentMenuType;
    return [{
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }, {
      title: '发布范围',
      key: 'publishLevel',
      sorter: true,
      filters: [{
        text: '全平台',
        value: 2,
      }, {
        text: '本组织',
        value: 1,
      }],
      render: record => (
        <span>{Choerodon.languageChange(`${record.publishLevel}`)}</span>
      ),
    }, {
      width: '100px',
      key: 'action',
      render: record => (
        <div>
          <Permission service={['devops-service.application-market.update']}>
            <Tooltip trigger="hover" placement="bottom" title={<div>修改</div>}>
              <Button shape="circle" onClick={this.handleEdit.bind(this, record.id)}>
                <Icon type="mode_edit" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission service={['devops-service.application-market.updateVersions']}>
            <Tooltip trigger="hover" placement="bottom" title={<div>版本控制</div>}>
              <Button shape="circle" onClick={this.handleEditVersion.bind(this, record)}>
                <Icon type="versionline" />
              </Button>
            </Tooltip>
          </Permission>
        </div>
      ),
    }];
  } ;
  /**
   * 修改基本信息
   * @param ids
   */
  handleEdit = (ids) => {
    const { name, id, organizationId } = this.props.AppState.currentMenuType;
    this.props.history.push(`/devops/app-release/edit/${ids}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  };
  /**
   *发布应用
   * @param record 发布的数据
   */
  handleCreate = (record) => {
    const { name, id, organizationId } = this.props.AppState.currentMenuType;
    editReleaseStore.setApp(record);
    this.props.history.push(`/devops/app-release/add/${record.id}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  }
  /**
   * 版本控制
   * @param ids
   */
  handleEditVersion = (ids) => {
    const { name, id, organizationId } = this.props.AppState.currentMenuType;
    this.props.history.push(`/devops/app-release/app/${ids.name}/edit-version/${ids.id}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  }
  /**
   * 控制显示为项目下的数据
   * @returns {*}
   */
  showProjectTable = () => {
    const { AppReleaseStore } = this.props;
    const data = AppReleaseStore.allData;
    const column = [{
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }, {
      width: '40px',
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission service={['devops-service.application-market.create']}>
            <Tooltip placement="bottom" title={'发布应用'}>
              <Button shape="circle" onClick={this.handleCreate.bind(this, record)}><Icon type="publish2" /></Button>
            </Tooltip>
          </Permission>
        </div>),
    }];
    return (
      <Table
        filterBarPlaceholder={'过滤表'}
        loading={AppReleaseStore.loading}
        pagination={AppReleaseStore.pageInfo}
        columns={column}
        dataSource={data}
        rowKey={record => record.id}
        onChange={this.tableChange}
      />
    );
  }
  /**
   * 切换tabs
   * @param value
   */
  handleChangeTabs = (value) => {
    const { AppReleaseStore } = this.props;
    AppReleaseStore.loadData({ page: 0, key: value, projectId: this.state.projectId, size: 10 });
    this.setState({ key: value });
  }

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  tableChange =(pagination, filters, sorter, paras) => {
    const { AppReleaseStore } = this.props;
    const menu = this.props.AppState.currentMenuType;
    const organizationId = menu.id;
    const sort = { field: 'id', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      // sort = sorter;
      if (sorter.order === 'ascend') {
        sort.order = 'asc';
      } else if (sorter.order === 'descend') {
        sort.order = 'desc';
      }
    }
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    AppReleaseStore
      .loadData({ projectId: organizationId, sorter: sort, postData, key: this.state.key });
  };
  handleRefresh =() => {
    const { AppReleaseStore } = this.props;
    AppReleaseStore.loadData({
      projectId: this.state.projectId,
      isRefresh: true,
      key: this.state.key,
    });
  };

  render() {
    const { AppReleaseStore } = this.props;
    const data = AppReleaseStore.allData;
    return (
      <div className="c7n-region page-container app-release-wrapper">
        <PageHeader title="应用发布">
          <Button
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh page-head-icon" />
            <span className="icon-space">刷新</span>
          </Button>
        </PageHeader>
        <div className="page-content">
          <h2 className="c7n-space-first">项目&quot;{this.props.AppState.currentMenuType.name}&quot;的应用发布 </h2>
          <p>
            应用发布是可以将您研发的应用发布至其他项目使用，可发布的范围有本组织或全平台下的所有项目。并且可以控制发布应用版本的范围。
            <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/application-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          <Tabs defaultActiveKey={this.state.key} onChange={this.handleChangeTabs}>
            <TabPane tab="未发布应用" key="1">
              {this.showProjectTable()}
            </TabPane>
            <TabPane tab="已发布应用" key="2">
              <Table
                filterBarPlaceholder={'过滤表'}
                loading={AppReleaseStore.loading}
                pagination={AppReleaseStore.pageInfo}
                columns={this.getColumn()}
                dataSource={data}
                rowKey={record => record.id}
                onChange={this.tableChange}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>

    );
  }
}

export default withRouter(AppReleaseHome);
