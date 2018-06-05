import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Select, Button, Spin, Radio, Card, Steps, Form, Tabs, Icon, Modal, Input, Table, Pagination } from 'choerodon-ui';
import ReactLoading from 'react-loading';
import axios from 'Axios';
import _ from 'lodash';
import CodeMirror from 'react-codemirror';
import PageHeader from 'PageHeader';
import yaml from 'js-yaml';
import '../../../main.scss';
import './SelectApp.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import DeploymentAppStore from '../../../../stores/project/deploymentApp';
import AceForYaml from '../../../../components/yamlAce';
import SelectAppStore from '../../../../stores/project/deploymentApp/SelectAppStore';

const beautify = require('json-beautify');
require('codemirror/lib/codemirror.css');
require('codemirror/mode/javascript/javascript');

const Option = Select.Option;
const Step = Steps.step;
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;
const SideBar = Modal.Sidebar;
@inject('AppState')
@observer
class DeployAppHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
      projectId: this.props.AppState.currentMenuType.id,
      view: 'card',
    };
  }

  componentDidMount() {
    SelectAppStore.loadData({ projectId: this.state.projectId });
    // 初始化页面，获取应用信息
    // DeploymentAppStore.loadInitData(this.state.appId, this.state.verId, this.state.envId);
  }
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
  getProjectTable = () => {
    const dataSource = SelectAppStore.getAllData || [{
      name: 'test',
      code: '123',
      id: 2,
    }];
    const column = [{
      key: 'check',
      width: '50px',
      render: record => (
        this.state.app && record.id === this.state.app.id && <span className="icon-check icon-select" />
      ),

    }, {
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
      render: (test, record) => (<MouserOverWrapper text={record.name} width={120}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
      render: (test, record) => (<MouserOverWrapper text={record.code} width={120}>
        {record.code}
      </MouserOverWrapper>),
    }];
    return (<Table
      onRow={(record) => {
        const { isClick } = this.state;
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

  getMarketTable = () => {
    const dataSource = SelectAppStore.allData;
    const column = [{
      key: 'check',
      width: '50px',
      render: record => (
        this.state.app && record.id === this.state.app.id && <span className="icon-check icon-select" />
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
        const { isClick } = this.state;
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
  };

  changeView =(view) => {
    this.setState({ view });
  };

  handleSearch =(e) => {
    this.setState({ val: e.target.value });
    SelectAppStore.loadData({
      projectId: this.state.projectId, postData: { param: e.target.value, searchParam: {} } });
  }
  clearInputValue = () => {
    this.setState({ val: '' });
    SelectAppStore.loadData({
      projectId: this.state.projectId, postData: { param: '', searchParam: {} } });
  }

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
    const store = SelectAppStore;
    const key = this.state.activeTab;
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
    if (key === '1') {
      SelectAppStore.loadData({
        projectId: organizationId,
        page: pagination.current - 1,
        size: pagination.pageSize,
        sorter: sort,
        postData,
      });
    } else {
      SelectAppStore.loadApp({
        projectId: organizationId,
        page: pagination.current - 1,
        size: pagination.pageSize,
        sorter: sort,
        postData,
      });
    }
    store
      .loadData();
  };

  changeTab =(key) => {
    if (key === '1') {
      SelectAppStore.loadData({
        projectId: this.state.projectId });
    } else {
      SelectAppStore.loadApps({
        projectId: this.state.projectId });
    }
    this.setState({ activeTab: key });
  }
  handleOk =() => {
    this.props.handleOk(this.state.app, this.state.activeTab);
  }

  render() {
    const dataSource = SelectAppStore.getAllData;
    const { AppState } = this.props;
    const pageInfo = SelectAppStore.pageInfo;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
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
              <a href="http://choerodon.io/zh/docs/user-guide/deploy/application-deployment/" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  了解详情
                </span>
                <span className="icon-open_in_new" />
              </a>
            </p>
            <Tabs
              tabBarExtraContent={<ButtonGroup>
                <Button onClick={this.changeView.bind(this, 'list')} className={this.state.view === 'list' && 'c7n-tab-active'}><Icon type="format_list_bulleted" /></Button>
                <Button onClick={this.changeView.bind(this, 'card')} className={this.state.view === 'card' && 'c7n-tab-active'}><Icon type="dashboard" /></Button>
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
                        role="none"
                        className={`c7n-store-card ${this.state.app && this.state.app.id === card.id && 'c7n-card-active'}`}
                        onClick={this.hanldeSelectApp.bind(this, card)}
                      >
                        {this.state.app && this.state.app.id === card.id && <span className="span-icon-check" ><i className="icon-check" /></span> }
                        {card.imgUrl ? <div className="c7n-store-card-icon" style={{ backgroundImage: `url(${card.imgUrl}` }} />
                          : <div className="c7n-store-card-icon" />}
                        <div className="c7n-store-card-name">
                          {card.name}
                        </div>
                        <div className="c7n-store-card-source">
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
                        role="none"
                        className={`c7n-store-card ${this.state.app && this.state.app.id === card.id && 'c7n-card-active'}`}
                        onClick={this.hanldeSelectApp.bind(this, card)}
                      >
                        {this.state.app && this.state.app.id === card.id && <span className="span-icon-check" ><i className="icon-check" /></span> }
                        {card.imgUrl ? <div className="c7n-store-card-icon" style={{ backgroundImage: `url(${card.imgUrl}` }} />
                          : <div className="c7n-store-card-icon" />}
                        <div className="c7n-store-card-name">
                          {card.name}
                        </div>
                        <div className="c7n-store-card-source">
                          {card.category}
                        </div>
                        <div className="c7n-store-card-des">
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
