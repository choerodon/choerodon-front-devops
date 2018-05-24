import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Icon, Pagination } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import _ from 'lodash';
import './AppStore.scss';
import '../../../main.scss';

@inject('AppState')
@observer
class AppStoreHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val: null,
      pageSize: 20,
      page: 0,
    };
  }

  componentDidMount() {
    this.loadAppCards();
  }

  /**
   * 搜索函数
   */
  onSearch = () => {
    const { page, pageSize, val } = this.state;
    this.searchInput.focus();
    const pagination = {
      current: page + 1, pageSize,
    };
    this.tableChange(pagination, null, null, val);
  };

  /**
   * 搜索输入赋值
   * @param e
   */
  onChangeSearch = (e) => {
    this.setState({ val: e.target.value });
  };

  /**
   * 清除输入
   */
  emitEmpty = () => {
    this.searchInput.focus();
    this.setState({ val: '' });
  };

  /**
   * 加载应用卡片
   */
  loadAppCards = () => {
    const { AppStoreStore, AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    AppStoreStore.loadApps(projectId);
  };

  /**
   * 跳转应用详情
   */
  appDetail = (id) => {
    const { AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const projectName = AppState.currentMenuType.name;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/appstore/${id}/app?type=${type}&id=${projectId}&name=${projectName}`);
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
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   * @param param 搜索
   */
  tableChange =(pagination, filters, sorter, param) => {
    const { AppStoreStore, AppState } = this.props;
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


  render() {
    const { AppStoreStore, AppState } = this.props;
    const pageInfo = AppStoreStore.getPageInfo;
    const appCards = AppStoreStore.getAppCards;

    const prefix = <Icon type="search" onClick={this.onSearch} />;
    const suffix = this.state.val ? <Icon type="close" onClick={this.emitEmpty} /> : null;
    const appCardsDom = appCards.length ? _.map(appCards, card => (
      <div
        role="none"
        className="c7n-store-card"
        onClick={this.appDetail.bind(this, card.id)}
      >
        <div className="c7n-store-card-icon" />
        <div className="c7n-store-card-name">
          {card.name}
        </div>
        <div className="c7n-store-card-source">
          {card.category}
        </div>
        <div className="c7n-store-card-des">
          {card.description}
        </div>
      </div>)) : (<span className="c7n-none-des">暂无已发布应用</span>);

    return (
      <div className="c7n-region page-container">
        <PageHeader title={Choerodon.languageChange('appstore.title')}>
          <Button
            className="leftBtn"
            funcType="flat"
            onClick={this.reload}
          >
            <span className="icon-refresh page-head-icon" />
            <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
          </Button>
        </PageHeader>
        <div className="c7n-store-content">
          <h2 className="c7n-space-first">应用市场</h2>
          <p>
            这里是应用市场的描述。
            <a href="http://c7n.saas.hand-china.com/docs/devops/develop/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
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
          {appCardsDom}
          <div className="c7n-store-pagination">
            <Pagination
              total={pageInfo.total}
              current={pageInfo.current}
              pageSize={pageInfo.pageSize}
              onChange={this.tableChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(AppStoreHome);
