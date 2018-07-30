import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Table, Popover, Modal, Tabs, Tooltip, Icon } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import '../../../main.scss';
import '../AppRelease.scss';
import editReleaseStore from '../../../../stores/project/appRelease/editRelease';

const TabPane = Tabs.TabPane;
const { AppState } = stores;
@observer
class AppReleaseHome extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      openRemove: false,
      show: false,
      projectId: menu.id,
      key: props.match.params.key === '2' ? '2' : '1',
      filters: [],
    };
  }
  componentDidMount() {
    const { AppReleaseStore } = this.props;
    AppReleaseStore.loadData({ projectId: this.state.projectId, key: this.state.key });
  }

  getColumn = () => {
    const { type, id: orgId } = AppState.currentMenuType;
    return [{
      title: <FormattedMessage id={'app.name'} />,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      title: <FormattedMessage id={'app.code'} />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }, {
      title: <FormattedMessage id={'release.column.level'} />,
      key: 'publishLevel',
      sorter: true,
      filters: [{
        text: this.props.intl.formatMessage({ id: 'public' }),
        value: 2,
      }, {
        text: this.props.intl.formatMessage({ id: 'organization' }),
        value: 1,
      }],
      render: record => (
        <span>{record.publishLevel && <FormattedMessage id={`${record.publishLevel}`} />}</span>
      ),
    }, {
      align: 'right',
      key: 'action',
      render: record => (
        <div>
          <Permission service={['devops-service.application-market.update']}>
            <Tooltip trigger="hover" placement="bottom" title={<div>{this.props.intl.formatMessage({ id: 'edit' })}</div>}>
              <Button shape="circle" size={'small'} onClick={this.handleEdit.bind(this, record.id)}>
                <Icon type="mode_edit" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission service={['devops-service.application-market.updateVersions']}>
            <Tooltip trigger="hover" placement="bottom" title={<div>{this.props.intl.formatMessage({ id: 'release.action.version' })}</div>}>
              <Button shape="circle" size={'small'} onClick={this.handleEditVersion.bind(this, record)}>
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
    const { name, id, organizationId } = AppState.currentMenuType;
    this.props.history.push(`/devops/app-release/edit/${ids}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  };
  /**
   *发布应用
   * @param record 发布的数据
   */
  handleCreate = (record) => {
    const { name, id, organizationId } = AppState.currentMenuType;
    editReleaseStore.setApp(record);
    this.props.history.push(`/devops/app-release/add/${record.id}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  }
  /**
   * 版本控制
   * @param ids
   */
  handleEditVersion = (ids) => {
    const { name, id, organizationId } = AppState.currentMenuType;
    this.props.history.push(`/devops/app-release/app/${ids.name}/edit-version/${ids.id}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  }
  /**
   * 控制显示为项目下的数据
   * @returns {*}
   */
  showProjectTable = () => {
    const { AppReleaseStore } = this.props;
    const data = AppReleaseStore.getUnReleaseData;
    const { filters } = this.state;

    const column = [{
      title: <FormattedMessage id={'app.name'} />,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      title: <FormattedMessage id={'app.code'} />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }, {
      width: 64,
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission service={['devops-service.application-market.create']}>
            <Tooltip placement="bottom" title={<FormattedMessage id={'release.action.publish'} />}>
              <Button shape="circle" onClick={this.handleCreate.bind(this, record)}><Icon type="publish2" /></Button>
            </Tooltip>
          </Permission>
        </div>),
    }];
    return (
      <Table
        filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
        loading={AppReleaseStore.loading}
        pagination={AppReleaseStore.getUnPageInfo}
        columns={column}
        dataSource={data}
        filters={filters}
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
    this.setState({
      key: value,
      filters: [],
    });
  }

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  tableChange =(pagination, filters, sorter, paras) => {
    const { AppReleaseStore } = this.props;
    const menu = AppState.currentMenuType;
    const organizationId = menu.id;
    const sort = { field: 'id', order: 'desc' };
    this.setState({
      filters: paras,
    });
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      if (sorter.order === 'ascend') {
        sort.order = 'asc';
      } else if (sorter.order === 'descend') {
        sort.order = 'desc';
      }
    }
    const page = pagination.current - 1;
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    AppReleaseStore
      .loadData({
        projectId: organizationId,
        sorter: sort,
        postData,
        key: this.state.key,
        page,
        size: pagination.pageSize,
      });
  };
  handleRefresh =() => {
    const { AppReleaseStore } = this.props;
    this.setState({ filters: [] });
    AppReleaseStore.loadData({
      projectId: this.state.projectId,
      isRefresh: true,
      key: this.state.key,
    });
  };

  render() {
    const { AppReleaseStore } = this.props;
    const data = AppReleaseStore.getReleaseData;
    const { filters } = this.state;
    return (
      <Page
        service={[
          'devops-service.application-market.pageListMarketAppsByProjectId',
          'devops-service.application.listByActiveAndPubAndVersion',
          'devops-service.application-market.updateVersions',
          'devops-service.application-market.update',
        ]}
        className="c7n-region app-release-wrapper"
      >
        <Header title={<FormattedMessage id={'release.home.header.title'} />}>
          <Button
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh icon" />
            <FormattedMessage id={'refresh'} />
          </Button>
        </Header>
        <Content code={'release'} values={{ name: AppState.currentMenuType.name }}>
          <Tabs defaultActiveKey={this.state.key} onChange={this.handleChangeTabs} animated={false}>
            <TabPane tab={<FormattedMessage id={'release.home.app.unpublish'} />} key="1">
              {this.showProjectTable()}
            </TabPane>
            <TabPane tab={<FormattedMessage id={'release.home.app.publish'} />} key="2">
              <Table
                filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
                loading={AppReleaseStore.loading}
                pagination={AppReleaseStore.getPageInfo}
                columns={this.getColumn()}
                dataSource={data}
                filters={filters}
                rowKey={record => record.id}
                onChange={this.tableChange}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Page>

    );
  }
}

export default withRouter(injectIntl(AppReleaseHome));
