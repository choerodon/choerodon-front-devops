import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Popover, Modal, Tabs, Tooltip, Icon } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import Permission from 'PerComponent';
import Remove from 'Remove';
import _ from 'lodash';
import { commonComponent } from '../../../../components/commonFunction';
import '../../../main.scss';
import './AppRelease.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
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
      upDown: [],
      key: '1',
    };
  }
  componentDidMount() {
    const { AppReleaseStore } = this.props;
    AppReleaseStore.loadData({ projectId: this.state.projectId });
  }

  getColumn = () => {
    const { type, id: orgId } = this.props.AppState.currentMenuType;
    const { upDown } = this.state;
    return [{
      width: '25%',
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      width: '30%',
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }, {
      // width: '410px',
      width: '25%',
      title: '发布范围',
      // dataIndex: 'publishLevel',
      key: 'publishLevel',
      sorter: true,
      filters: [],
      render: record => (
        <span>{Choerodon.languageChange(`${record.publishLevel}`)}</span>
      ),
    }, {
      width: '98px',
      key: 'action',
      className: 'c7n-network-text_top',
      render: record => (
        <div>
          <Permission service={['devops-service.application-market.update']}>
            <Tooltip trigger="hover" placement="bottom" title={<div>修改</div>}>
              <Button shape="circle" funcType="flat" onClick={this.handleEdit.bind(this, record.id)}>
                <span className="icon-mode_edit" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission service={['devops-service.application-market.updateVersions']}>
            <Tooltip trigger="hover" placement="bottom" title={<div>版本控制</div>}>
              <Button shape="circle" funcType="flat" onClick={this.handleEditVersion.bind(this, record)}>
                <span className="icon-versionline" />
              </Button>
            </Tooltip>
          </Permission>
        </div>
      ),
    }];
  } ;
  /**
   * 获取屏幕的高度
   * @returns {number}
   */
  getHeight = () => {
    const screenHeight = window.screen.height;
    let height = 310;
    if (screenHeight <= 800) {
      height = 310;
    } else if (screenHeight > 800 && screenHeight <= 900) {
      height = 450;
    } else if (screenHeight > 900 && screenHeight <= 1050) {
      height = 600;
    } else {
      height = 630;
    }
    return height;
  };

  handleEdit = (ids) => {
    const { name, id, organizationId } = this.props.AppState.currentMenuType;
    this.props.history.push(`/devops/app-release/edit/${ids}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  };
  handleCreate = (record) => {
    const { name, id, organizationId } = this.props.AppState.currentMenuType;
    editReleaseStore.setApp(record);
    this.props.history.push(`/devops/app-release/add/${record.id}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  }
  handleEditVersion = (ids) => {
    const { name, id, organizationId } = this.props.AppState.currentMenuType;
    this.props.history.push(`/devops/app-release/app/${ids.name}/edit-version/${ids.id}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  }
  showProjectTable = () => {
    const { AppReleaseStore } = this.props;
    const data = AppReleaseStore.allData;
    const column = [{
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
      width: '45%',
      render: (test, record) => (<MouserOverWrapper text={record.name} width={120}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
      width: '45%',
      render: (test, record) => (<MouserOverWrapper text={record.code} width={120}>
        {record.code}
      </MouserOverWrapper>),
    }, {
      width: '46px',
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
      <div style={{ width: 512 }}>
        <Table
          // eslint-disable-next-line
          scroll={{ y: this.getHeight() }}
          // filters={['appCode', 'appName', 'version']}
          loading={AppReleaseStore.loading}
          pagination={AppReleaseStore.pageInfo}
          columns={column}
          dataSource={data}
          rowKey={record => record.id}
          onChange={this.tableChange}
        />
      </div>
    );
  }
  handleChangeTabs = (value) => {
    const { AppReleaseStore } = this.props;
    AppReleaseStore.loadData({ page: 0, key: value, projectId: this.state.projectId });
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
      .loadData({ projectId: organizationId, sorter: sort, postData });
  };
  handleRefresh =() => {
    const { AppReleaseStore } = this.props;
    AppReleaseStore.loadData({ isRefresh: true });
  };

  render() {
    const { AppReleaseStore } = this.props;
    const data = AppReleaseStore.allData || [{
      name: 'yesy',
      code: 'yeysu',
      appVersions: [{ version: 'ttyy' }],
      publishLevel: '组织',
      id: 1,
    }];
    return (
      <div className="c7n-region page-container app-release-wrapper">
        <PageHeader title="应用发布">
          <Button
            className="header-btn headRightBtn leftBtn2"
            ghost
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh" />
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
              <div style={{ width: 512 }}>
                <Table
                  // eslint-disable-next-line
                  scroll={{ y: this.getHeight() }}
                  // filters={['appCode', 'appName', 'version']}
                  loading={AppReleaseStore.loading}
                  pagination={AppReleaseStore.pageInfo}
                  columns={this.getColumn()}
                  dataSource={data}
                  rowKey={record => record.id}
                  onChange={this.tableChange}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
        <Modal
          visible={this.state.openRemove}
          title="取消应用发布"
          footer={[
            <Button key="back" onClick={this.closeRemove}>取消</Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete}>
              确定
            </Button>,
          ]}
        >
          <p>取消应用发布可能导致某些实例不可用，确定要取消应用发布吗？</p>
        </Modal>
      </div>

    );
  }
}

export default withRouter(AppReleaseHome);
