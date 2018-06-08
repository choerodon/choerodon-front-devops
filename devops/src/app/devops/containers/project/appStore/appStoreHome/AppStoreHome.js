import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Icon, Pagination, Table, Popover } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import LoadingBar from '../../../../components/loadingBar';
import './AppStore.scss';
import '../../../main.scss';

const ButtonGroup = Button.Group;

const { AppState } = stores;

@observer
class AppStoreHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val: '',
      pageSize: 20,
      page: 0,
    };
  }

  componentDidMount() {
    this.loadAppCards();
  }

  /**
   * pageSize 变化的回调
   * @param current 当前页码
   * @param size 每页条数
   */
  onPageSizeChange = (current, size) => {
    const { val } = this.state;
    const pagination = {
      current, pageSize: size,
    };
    this.onChange(pagination, null, null, val);
  };

  /**
   * 页码改变的回调
   * @param page 改变后的页码
   * @param pageSize 每页条数
   */
  onPageChange = (page, pageSize) => {
    const { val } = this.state;
    const pagination = {
      current: page, pageSize,
    };
    this.onChange(pagination, null, null, val);
  };

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   * @param param 搜索
   */
  onChange = (pagination, filters, sorter, param) => {
    const { AppStoreStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const sort = {};
    const searchParam = {};
    const postData = {
      searchParam,
      param: param.toString(),
    };
    this.setState({ page: pagination.current - 1, pageSize: pagination.pageSize });
    AppStoreStore.loadApps(projectId, pagination.current - 1, pagination.pageSize, sort, postData);
  };

  /**
   * 搜索函数
   */
  onSearch = () => {
    const { page, pageSize, val } = this.state;
    this.searchInput.focus();
    const pagination = {
      current: page + 1, pageSize,
    };
    this.onChange(pagination, null, null, val);
  };

  /**
   * 搜索输入赋值
   * @param e
   */
  onChangeSearch = (e) => {
    this.setState({ val: e.target.value });
  };

  /**
   * 刷新函数
   */
  reload = () => {
    this.onSearch();
  };

  /**
   * 加载应用卡片
   */
  loadAppCards = () => {
    const { AppStoreStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppStoreStore.loadApps(projectId);
  };

  /**
   * 跳转应用详情
   * @param id 应用id
   */
  appDetail = (id) => {
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const projectName = AppState.currentMenuType.name;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/appstore/${id}/app?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`);
  };

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  /**
   * 清除输入
   */
  emitEmpty = () => {
    this.searchInput.focus();
    this.setState({ val: '' });
  };


  listViewChange = (view) => {
    const { AppStoreStore } = this.props;
    AppStoreStore.setListActive(view);
  };


  render() {
    const { AppStoreStore } = this.props;
    const pageInfo = AppStoreStore.getPageInfo;
    const appCards = AppStoreStore.getAppCards;
    const listActive = AppStoreStore.getListActive;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;

    const prefix = <Icon type="search" onClick={this.onSearch} />;
    const suffix = this.state.val ? <Icon type="close" onClick={this.emitEmpty} /> : null;

    const appCardsDom = appCards.length ? _.map(appCards, card => (
      <div
        role="none"
        className="c7n-store-card"
        onClick={this.appDetail.bind(this, card.id)}
      >
        {card.imgUrl ? <div className="c7n-store-card-icon" style={{ backgroundImage: `url(${card.imgUrl}` }} />
          : <div className="c7n-store-card-icon" />}
        <div title={card.name} className="c7n-store-card-name">
          {card.name}
        </div>
        <div className="c7n-store-card-source">
          {card.category}
        </div>
        <div title={card.description} className="c7n-store-card-des">
          {card.description}
        </div>
      </div>)) : (<span className="c7n-none-des">暂无已发布应用</span>);

    const columns = [{
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
    }, {
      title: Choerodon.getMessage('应用分类', 'Category'),
      dataIndex: 'category',
      key: 'category',
    }, {
      title: Choerodon.getMessage('描述', 'Description'),
      dataIndex: 'description',
      key: 'description',
    }, {
      width: 64,
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.devops-env-pod-container.queryLogByPod']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Popover placement="bottom" content={<div><span>应用详情</span></div>}>
              <Button
                shape="circle"
                onClick={this.appDetail.bind(this, record.id)}
              >
                <span className="icon icon-insert_drive_file" />
              </Button>
            </Popover>
          </Permission>
        </div>
      ),
    }];
    const appListDom = (<Table
      columns={columns}
      dataSource={appCards}
      filterBar={false}
      pagination={false}
      loading={AppStoreStore.isLoading}
      rowKey={record => record.id}
    />);

    return (
      <Page className="c7n-region page-container">
        <Header title={Choerodon.languageChange('appstore.title')}>
          <Button
            funcType="flat"
            onClick={this.reload}
          >
            <span className="icon-refresh icon" />
            <span>{Choerodon.languageChange('refresh')}</span>
          </Button>
        </Header>
        <div className="c7n-store-content">
          <h2 className="c7n-space-first">应用市场</h2>
          <p>
            您可以在此查看已发布的应用及其详细信息，并选择版本进行部署。
            <a href="http://choerodon.io/zh/docs/user-guide/deploy/application-deployment/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          <div className="c7n-store-search">
            <Input
              placeholder="搜索应用名称或类型"
              value={this.state.val}
              prefix={prefix}
              suffix={suffix}
              onChange={this.onChangeSearch}
              onPressEnter={this.onSearch}
              // eslint-disable-next-line no-return-assign
              ref={node => this.searchInput = node}
            />
          </div>
          <ButtonGroup>
            <div>
              <Button onClick={this.listViewChange.bind(this, 'list')} className={listActive === 'list' && 'c7n-tab-active'}><Icon type="format_list_bulleted" /></Button>
              <Button onClick={this.listViewChange.bind(this, 'card')} className={listActive === 'card' && 'c7n-tab-active'}><Icon type="dashboard" /></Button>
            </div>
          </ButtonGroup>
          {AppStoreStore.isLoading ? <LoadingBar display /> :
            (<div className="c7n-store-list-wrap">
              {listActive === 'card' ? appCardsDom : appListDom}
            </div>)}
          <div className="c7n-store-pagination">
            <Pagination
              total={pageInfo.total}
              current={pageInfo.current}
              pageSize={pageInfo.pageSize}
              showSizeChanger
              onChange={this.onPageChange}
              onShowSizeChange={this.onPageSizeChange}
            />
          </div>
        </div>
      </Page>
    );
  }
}

export default withRouter(AppStoreHome);
