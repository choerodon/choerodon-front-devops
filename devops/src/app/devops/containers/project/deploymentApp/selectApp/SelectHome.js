import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Tabs, Icon, Modal, Input, Table, Pagination } from 'choerodon-ui';
import { stores, Content } from 'choerodon-front-boot';
import Loadingbar from '../../../../components/loadingBar';
import '../../../main.scss';
import './SelectApp.scss';
import SelectAppStore from '../../../../stores/project/deploymentApp/SelectAppStore';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const SideBar = Modal.Sidebar;
const { AppState } = stores;

@observer
class DeployAppHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      projectId: AppState.currentMenuType.id,
      view: 'card',
    };
  }

  componentDidMount() {
    SelectAppStore.loadData({ projectId: this.state.projectId });
    this.handleSelectData();
  }

  /**
   * 切换分页
   * @param page
   * @param size
   */
  onPageChange =(page, size) => {
    const key = this.state.activeTab;
    if (key === '1') {
      SelectAppStore.loadData({
        projectId: this.state.projectId, page: page - 1, size });
    } else {
      SelectAppStore.loadApps({
        projectId: this.state.projectId, page: page - 1, size });
    }
  }
  /**
   * 获取本项目的app
   * @returns {*}
   */
  getProjectTable = () => {
    const dataSource = SelectAppStore.getAllData;
    const column = [{
      key: 'check',
      width: '50px',
      render: record => (
        this.state.app && record.id === this.state.app.id && !this.state.isMarket && <i className="icon icon-check icon-select" />
      ),

    }, {
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
    }];
    return (<Table
      filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
      rowClassName={'col-check'}
      onRow={(record) => {
        const a = record;
        return {
          onClick: this.hanldeSelectApp.bind(this, record),
        };
      }}
      onChange={this.tableChange}
      columns={column}
      rowKey={record => record.id}
      dataSource={dataSource}
      pagination={SelectAppStore.getLocalPageInfo}
    />);
  }
  /**
   * 获取应用市场的数据
   * @returns {*}
   */
  getMarketTable = () => {
    const dataSource = SelectAppStore.getStoreData;
    const column = [{
      key: 'check',
      width: '50px',
      render: record => (
        this.state.app && this.state.isMarket && record.appId === this.state.app.appId && <i className="icon icon-check icon-select" />
      ),

    }, {
      title: <FormattedMessage id={'appstore.name'} />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id={'appstore.contributor'} />,
      dataIndex: 'contributor',
      key: 'contributor',
    }, {
      title: <FormattedMessage id={'appstore.category'} />,
      dataIndex: 'category',
      key: 'category',
    }, {
      title: <FormattedMessage id={'appstore.description'} />,
      dataIndex: 'description',
      key: 'description',
    }];
    return (<Table
      onRow={(record) => {
        const a = record;
        return {
          onClick: this.hanldeSelectApp.bind(this, record),
        };
      }}
      filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
      rowClassName={'col-check'}
      onChange={this.tableChange}
      columns={column}
      rowKey={record => record.id}
      dataSource={dataSource}
      pagination={SelectAppStore.getStorePageInfo}
    />);
  };
  /**
   * 初始化选择数据
   */
  handleSelectData =() => {
    if (this.props.app) {
      if (this.props.isMarket) {
        const app = this.props.app;
        app.appId = app.id;
      }
      this.setState({ app: this.props.app, isMarket: this.props.isMarket });
    }
  };
  /**
   * 切换视图
   * @param view
   */
  changeView =(view) => {
    this.setState({ view });
  };
  /**
   * 搜索
   * @param e
   */
  handleSearch =(e) => {
    this.setState({ val: e.target.value });
    if (this.state.activeTab === '1') {
      SelectAppStore.loadData({
        projectId: this.state.projectId,
        postData: { param: e.target.value, searchParam: {} },
        page: 0,
      });
    } else {
      SelectAppStore.loadApps({
        projectId: this.state.projectId,
        postData: { param: e.target.value, searchParam: {}, page: 0 },
      });
    }
  };
  /**
   * 清空搜索框数据
   */
  clearInputValue = () => {
    this.setState({ val: '' });
    SelectAppStore.loadData({
      projectId: this.state.projectId, postData: { param: '', searchParam: {} } });
  }
  /**
   * 点击选择数据
   * @param record
   */
  hanldeSelectApp = (record) => {
    this.setState({ app: record, isMarket: this.state.activeTab === '2' });
  };

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  tableChange =(pagination, filters, sorter, paras) => {
    const key = this.state.activeTab;
    const menu = AppState.currentMenuType;
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
    const page = pagination.current - 1;
    if (Object.keys(filters).length) {
      // page = 0;
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    if (key === '1') {
      SelectAppStore.loadData({
        projectId: organizationId,
        sorter: sort,
        postData,
        page,
        pageSize: pagination.pageSize,
      });
    } else {
      SelectAppStore.loadApps({
        projectId: organizationId,
        sorter: sort,
        postData,
        page,
        pageSize: pagination.pageSize,
      });
    }
  };
  /**
   * 切换tabs
   * @param key
   */
  changeTab =(key) => {
    if (key === '1') {
      SelectAppStore.loadData({
        projectId: this.state.projectId, page: 0, size: SelectAppStore.localPageInfo.pageSize });
    } else {
      SelectAppStore.loadApps({
        projectId: this.state.projectId, page: 0, size: SelectAppStore.storePageInfo.pageSize });
    }
    this.setState({ activeTab: key, page: 0 });
  }
  /**
   * 确定选择数据
   */
  handleOk =() => {
    if (this.state.app) {
      this.props.handleOk(this.state.app, this.state.activeTab);
    } else {
      Choerodon.prompt(this.props.intl.formatMessage({ id: 'network.form.version.disable' }));
    }
  };

  render() {
    const { formatMessage } = this.props.intl;
    const localDataSource = SelectAppStore.getAllData;
    const storeDataSource = SelectAppStore.getStoreData;
    const { total: lt, current: lc, pageSize: lp } = SelectAppStore.getLocalPageInfo;
    const { total: st, current: sc, pageSize: sp } = SelectAppStore.getStorePageInfo;
    const projectName = AppState.currentMenuType.name;
    const prefix = <Icon type="search" onClick={this.handleSearch} />;
    const suffix = this.state.val ? <Icon type="close" onClick={this.clearInputValue} /> : null;
    const loading = SelectAppStore.getLoading;
    return (
      <SideBar
        title={<FormattedMessage id={'deploy.step.one.app'} />}
        visible={this.props.show}
        onOk={this.handleOk}
        okText={formatMessage({ id: 'ok' })}
        cancelText={formatMessage({ id: 'cancel' })}
        onCancel={this.props.handleCancel}
      >
        <Content className="c7n-deployApp-sidebar sidebar-content" code={'deploy.sidebar'} value={projectName}>
          <div>
            <Tabs
              animated={false}
              tabBarExtraContent={<ButtonGroup>
                <Button onClick={this.changeView.bind(this, 'list')} className={this.state.view === 'list' ? 'c7n-tab-active' : ''}><Icon type="format_list_bulleted" /></Button>
                <Button onClick={this.changeView.bind(this, 'card')} className={this.state.view === 'card' ? 'c7n-tab-active' : ''}><Icon type="dashboard" /></Button>
              </ButtonGroup>}
              onChange={this.changeTab}

            >
              <TabPane className="c7n-deploy-tabpane" tab={formatMessage({ id: 'deploy.sidebar.project' })} key="1">
                {this.state.view === 'list' && this.getProjectTable()}
                {this.state.view === 'card' && <React.Fragment>
                  <div className="c7n-store-search">
                    <Input
                      value={this.state.val}
                      prefix={prefix}
                      suffix={suffix}
                      onChange={this.handleSearch}
                      onPressEnter={this.handleSearch}
                      placeholder={formatMessage({ id: 'deploy.sidebar.search' })}
                      // eslint-disable-next-line no-return-assign
                      ref={node => this.searchInput = node}
                    />
                  </div>
                  {loading ? <Loadingbar display /> : <React.Fragment>
                    <div>
                      {localDataSource.length >= 1 && localDataSource.map(card => (
                        <div
                          key={card.id}
                          role="none"
                          className={`c7n-store-card ${this.state.app && this.state.app.id === card.id && !this.state.isMarket && 'c7n-card-active'}`}
                          onClick={this.hanldeSelectApp.bind(this, card)}
                        >
                          {this.state.app && !this.state.isMarket && this.state.app.id === card.id && <span className="span-icon-check" ><i className="icon icon-check" /></span> }
                          <div className="c7n-store-card-icon" />
                          <div className="c7n-store-card-name">
                            <MouserOverWrapper text={card.name} width={0.15}>
                              {card.name}</MouserOverWrapper>
                          </div>
                          <div title={card.code} className="c7n-store-card-des-60">
                            {card.code}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="c7n-store-pagination">
                      <Pagination
                        total={lt}
                        current={lc}
                        pageSize={lp}
                        showSizeChanger
                        onChange={this.onPageChange}
                        onShowSizeChange={this.onPageChange}
                      />
                    </div>
                  </React.Fragment> }
                </React.Fragment> }

              </TabPane>
              <TabPane className="c7n-deploy-tabpane" tab={formatMessage({ id: 'deploy.sidebar.market' })} key="2">
                {this.state.view === 'list' && this.getMarketTable()}
                {this.state.view === 'card' && <React.Fragment>
                  <div className="c7n-store-search">
                    <Input
                      placeholder={formatMessage({ id: 'deploy.sidebar.search' })}
                      value={this.state.val}
                      prefix={prefix}
                      suffix={suffix}
                      onChange={this.handleSearch}
                      onPressEnter={this.handleSearch}
                      // eslint-disable-next-line no-return-assign
                      ref={node => this.searchInput = node}
                    />
                  </div>
                  {loading ? <Loadingbar display /> : <React.Fragment>
                    <div>
                      {storeDataSource.length >= 1 && storeDataSource.map(card => (
                        <div
                          key={card.id}
                          role="none"
                          className={`c7n-store-card ${this.state.app && this.state.isMarket && this.state.app.appId === card.appId && 'c7n-card-active'}`}
                          onClick={this.hanldeSelectApp.bind(this, card)}
                        >
                          {this.state.app && this.state.app.appId === card.appId && this.state.isMarket && <span className="span-icon-check" ><i className="icon icon-check " /></span> }
                          {card.imgUrl ? <div className="c7n-store-card-icon" style={{ backgroundImage: `url(${Choerodon.fileServer(card.imgUrl)})` }} />
                            : <div className="c7n-store-card-icon" />}
                          <div title={card.name} className="c7n-store-card-name">
                            {card.name}
                          </div>
                          <div className="c7n-store-card-source">
                            {card.category}
                          </div>
                          <div title={card.description} className="c7n-store-card-des-60">
                            {card.description}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="c7n-store-pagination">
                      <Pagination
                        total={st}
                        current={sc}
                        pageSize={sp}
                        showSizeChanger
                        onChange={this.onPageChange}
                        onShowSizeChange={this.onPageChange}
                      />
                    </div>
                  </React.Fragment>}
                </React.Fragment> }
              </TabPane>
            </Tabs>
          </div>
        </Content>
      </SideBar>);
  }
}

export default withRouter(injectIntl(DeployAppHome));
