import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Tabs, Icon, Modal, Input, Table, Pagination } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import '../../../main.scss';
import './SelectApp.scss';
import SelectAppStore from '../../../../stores/project/deploymentApp/SelectAppStore';

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
        this.state.app && record.id === this.state.app.id && <span className="icon icon-check icon-select" />
      ),

    }, {
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
    }];
    return (<Table
      filterBarPlaceholder={'过滤表'}
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
      pagination={SelectAppStore.pageInfo}
    />);
  }
  /**
   * 获取应用市场的数据
   * @returns {*}
   */
  getMarketTable = () => {
    const dataSource = SelectAppStore.allData;
    const column = [{
      key: 'check',
      width: '50px',
      render: record => (
        this.state.app && record.id === this.state.app.id && <span className="icon icon-check icon-select" />
      ),

    }, {
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '贡献者',
      dataIndex: 'contributor',
      key: 'contributor',
    }, {
      title: Choerodon.getMessage('应用分类', 'Category'),
      dataIndex: 'category',
      key: 'category',
    }, {
      title: Choerodon.getMessage('描述', 'Description'),
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
      filterBarPlaceholder={'过滤表'}
      rowClassName={'col-check'}
      onChange={this.tableChange}
      columns={column}
      rowKey={record => record.id}
      dataSource={dataSource}
      pagination={SelectAppStore.pageInfo}
    />);
  };
  /**
   * 初始化选择数据
   */
  handleSelectData =() => {
    if (this.props.app) {
      this.setState({ app: this.props.app });
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
    SelectAppStore.loadData({
      projectId: this.state.projectId, postData: { param: e.target.value, searchParam: {} } });
  }
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
    if (this.state.app && this.state.app.id === record.id) {
      this.setState({ app: null });
    } else {
      this.setState({ app: record });
    }
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
    let page = pagination.current - 1;
    if (Object.keys(filters).length) {
      page = 0;
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
      SelectAppStore.loadApp({
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
    SelectAppStore.setAllData([]);
    if (key === '1') {
      SelectAppStore.loadData({
        projectId: this.state.projectId, page: 0, size: 10 });
    } else {
      SelectAppStore.loadApps({
        projectId: this.state.projectId, page: 0, size: 10 });
    }
    this.setState({ activeTab: key, page: 0, size: 10 });
  }
  /**
   * 确定选择数据
   */
  handleOk =() => {
    this.props.handleOk(this.state.app, this.state.activeTab);
  }

  render() {
    const dataSource = SelectAppStore.getAllData;
    const pageInfo = SelectAppStore.pageInfo;
    const projectName = AppState.currentMenuType.name;
    const prefix = <Icon type="search" onClick={this.handleSearch} />;
    const suffix = this.state.val ? <Icon type="close" onClick={this.clearInputValue} /> : null;
    return (
      <SideBar
        title={'选择应用'}
        visible={this.props.show}
        onOk={this.handleOk}
        okText="确定"
        cancelText="取消"
        onCancel={this.props.handleCancel}
      >
        <div className="c7n-region c7n-deployApp-sidebar">
          <div>
            <h2 className="c7n-space-first">项目&quot;{projectName}&quot;部署选择应用</h2>
            <p>
              您可以在此灵活选择来源于本项目及应用市场的应用，且有列表式及卡片式两种展示方式可以切换。
              <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/application-deployment/" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  了解详情
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            <Tabs
              animated={false}
              tabBarExtraContent={<ButtonGroup>
                <Button onClick={this.changeView.bind(this, 'list')} className={this.state.view === 'list' ? 'c7n-tab-active' : ''}><Icon type="format_list_bulleted" /></Button>
                <Button onClick={this.changeView.bind(this, 'card')} className={this.state.view === 'card' ? 'c7n-tab-active' : ''}><Icon type="dashboard" /></Button>
              </ButtonGroup>}
              onChange={this.changeTab}

            >
              <TabPane className="c7n-deploy-tabpane" tab="项目应用" key="1">
                {this.state.view === 'list' && this.getProjectTable()}
                {this.state.view === 'card' && <React.Fragment>
                  <div className="c7n-store-search">
                    <Input
                      value={this.state.val}
                      prefix={prefix}
                      suffix={suffix}
                      onChange={this.handleSearch}
                      onPressEnter={this.handleSearch}
                      placeholder="搜索应用"
                      // eslint-disable-next-line no-return-assign
                      ref={node => this.searchInput = node}
                    />
                  </div>
                  <div>
                    {dataSource.length >= 1 && dataSource.map(card => (
                      <div
                        key={card.id}
                        role="none"
                        className={`c7n-store-card ${this.state.app && this.state.app.id === card.id && 'c7n-card-active'}`}
                        onClick={this.hanldeSelectApp.bind(this, card)}
                      >
                        {this.state.app && this.state.app.id === card.id && <span className="span-icon-check" ><i className="icon icon-check" /></span> }
                        {card.imgUrl ? <div className="c7n-store-card-icon" style={{ backgroundImage: `url(${card.imgUrl}` }} />
                          : <div className="c7n-store-card-icon" />}
                        <div className="c7n-store-card-name">
                          {card.name}
                        </div>
                        <div className="c7n-store-card-des-60">
                          {card.code}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="c7n-store-pagination">
                    <Pagination
                      total={pageInfo.total}
                      current={pageInfo.current}
                      pageSize={pageInfo.pageSize}
                      showSizeChanger
                      onChange={this.onPageChange}
                      onShowSizeChange={this.onPageChange}
                    />
                  </div>
                </React.Fragment> }

              </TabPane>
              <TabPane className="c7n-deploy-tabpane" tab="应用市场" key="2">
                {this.state.view === 'list' && this.getMarketTable()}
                {this.state.view === 'card' && <React.Fragment>
                  <div className="c7n-store-search">
                    <Input
                      placeholder="搜索应用"
                      value={this.state.val}
                      prefix={prefix}
                      suffix={suffix}
                      onChange={this.handleSearch}
                      onPressEnter={this.handleSearch}
                      // eslint-disable-next-line no-return-assign
                      ref={node => this.searchInput = node}
                    />
                  </div>
                  <div>
                    {dataSource.length >= 1 && dataSource.map(card => (
                      <div
                        key={card.id}
                        role="none"
                        className={`c7n-store-card ${this.state.app && this.state.app.id === card.id && 'c7n-card-active'}`}
                        onClick={this.hanldeSelectApp.bind(this, card)}
                      >
                        {this.state.app && this.state.app.id === card.id && <span className="span-icon-check" ><i className="icon icon-check " /></span> }
                        {card.imgUrl ? <div className="c7n-store-card-icon" style={{ backgroundImage: `url(${card.imgUrl}` }} />
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
                      total={pageInfo.total}
                      current={pageInfo.current}
                      pageSize={pageInfo.pageSize}
                      showSizeChanger
                      onChange={this.onPageChange}
                      onShowSizeChange={this.onPageChange}
                    />
                  </div>
                </React.Fragment> }
              </TabPane>
            </Tabs>
          </div>
        </div>
      </SideBar>);
  }
}

export default withRouter(DeployAppHome);
