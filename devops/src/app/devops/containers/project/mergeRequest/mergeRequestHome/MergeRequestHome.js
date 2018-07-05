import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Tabs, Icon, Select, Table, Tooltip, Popover } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import TimeAgo from 'timeago-react';
import _ from 'lodash';
import './MergeRequestHome.scss';
import '../../../main.scss';

const { AppState } = stores;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

@observer
class MergeRequestHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val: '',
      pageSize: 20,
      page: 0,
      tabKey: 'opened',
    };
  }

  componentDidMount() {
    const { MergeRequestStore } = this.props;
    MergeRequestStore.loadInitData();
  }

  componentWillUnmount() {
    const { MergeRequestStore } = this.props;
    MergeRequestStore.setCurrentApp({});
  }


  /**
   * 刷新函数
   */
  reload = () => {
    this.setState({
      param: [],
    });
    const { MergeRequestStore } = this.props;
    MergeRequestStore.setLoading(true);
    MergeRequestStore.loadMergeRquest(
      MergeRequestStore.currentApp.id,
      this.state.tabKey,
      MergeRequestStore.pageInfo.current - 1,
      MergeRequestStore.pageInfo.pageSize);
  };

  handleChange(id) {
    this.setState({
      id,
    });
    const { MergeRequestStore } = this.props;
    const currentApp = MergeRequestStore.apps.find(app => app.id === id);
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    MergeRequestStore.setCurrentApp(currentApp);
    MergeRequestStore.loadMergeRquest(id, this.state.tabKey);
    MergeRequestStore.loadUrl(projectId, id);
  }

  tabChange = (key) => {
    this.setState({
      tabKey: key,
    });
    const { MergeRequestStore } = this.props;
    MergeRequestStore.loadMergeRquest(MergeRequestStore.currentApp.id, key);
  };

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   * @param param 搜索
   */
  tableChange =(pagination, filters, sorter, param) => {
    const { MergeRequestStore } = this.props;
    this.setState({ param });
    MergeRequestStore.setLoading(true);
    MergeRequestStore.loadMergeRquest(
      MergeRequestStore.currentApp.id,
      this.state.tabKey,
      pagination.current - 1,
      pagination.pageSize);
  };

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  linkToMerge = (url) => {
    window.open(url);
  };

  linkToNewMerge = () => {
    const { MergeRequestStore } = this.props;
    const url = `${MergeRequestStore.getUrl}/merge_requests/new`;
    window.open(url);
  };

  render() {
    const { MergeRequestStore, intl } = this.props;
    const { param } = this.state;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const pageInfo = MergeRequestStore.getPageInfo;
    const menu = AppState.currentMenuType;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    const appData = MergeRequestStore.getApps;
    const data = MergeRequestStore.getMerge;

    const columnsAll = [{
      title: <FormattedMessage id="app.code" />,
      dataIndex: 'iid',
      key: 'iid',
    }, {
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'title',
      key: 'title',
    }, {
      title: <FormattedMessage id="app.branch" />,
      key: 'targetBranch',
      render: record => (
        <div className="c7n-merge-branches">
          <Icon type="branch" />
          <span>{record.sourceBranch}</span>
          <Icon type="keyboard_backspace" className="c7n-merge-right" />
          <Icon type="branch" />
          <span>{record.targetBranch}</span>
        </div>
      ),
    }, {
      title: <FormattedMessage id="merge.state" />,
      dataIndex: 'state',
      key: 'state',
    }, {
      title: <FormattedMessage id="create" />,
      key: 'createdAt',
      render: record => (
        <div>
          <Tooltip title={record.author.name}>
            <img src={record.author.avatarUrl} alt="avatar" className="c7n-merge-avatar" />
          </Tooltip>
          <Popover
            rowKey="creationDate"
            title={<FormattedMessage id="ciPipeline.createdAt" />}
            content={record.createdAt}
            placement="left"
          >
            <TimeAgo
              datetime={record.createdAt}
              locale={this.props.intl.formatMessage({ id: 'language' })}
            />
          </Popover>
        </div>),
    }, {
      title: <FormattedMessage id="merge.commit" />,
      key: 'commits',
      render: record => (
        <div>
          {record.commits.length ? `${record.commits.length} commits` : '0 commit'}
        </div>),
    }, {
      title: <FormattedMessage id="merge.upDate" />,
      key: 'updatedAt',
      render: record => (
        <div>
          <Popover
            rowKey="creationDate"
            title={<FormattedMessage id="merge.upDate" />}
            content={record.updatedAt}
            placement="left"
          >
            <TimeAgo
              datetime={record.updatedAt}
              locale={this.props.intl.formatMessage({ id: 'language' })}
            />
          </Popover>
        </div>),
    }, {
      width: 56,
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.devops-git.getMergeRequestList']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Tooltip placement="bottom" title={<FormattedMessage id="merge.detail" />}>
              <Button
                size="small"
                shape="circle"
                onClick={this.linkToMerge.bind(this, record.webUrl)}
              >
                <span className="icon icon-find_in_page" />
              </Button>
            </Tooltip>
          </Permission>
        </div>
      ),
    }];

    const columns = [{
      title: <FormattedMessage id="app.code" />,
      dataIndex: 'iid',
      key: 'iid',
    }, {
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'title',
      key: 'title',
    }, {
      title: <FormattedMessage id="app.branch" />,
      key: 'targetBranch',
      render: record => (
        <div className="c7n-merge-branches">
          <Icon type="branch" />
          <span>{record.sourceBranch}</span>
          <Icon type="keyboard_backspace" className="c7n-merge-right" />
          <Icon type="branch" />
          <span>{record.targetBranch}</span>
        </div>
      ),
    }, {
      title: <FormattedMessage id="create" />,
      key: 'createdAt',
      render: record => (
        <div>
          <Tooltip title={record.author.name}>
            <img src={record.author.avatarUrl} alt="avatar" className="c7n-merge-avatar" />
          </Tooltip>
          <Popover
            rowKey="creationDate"
            title={<FormattedMessage id="ciPipeline.createdAt" />}
            content={record.createdAt}
            placement="left"
          >
            <TimeAgo
              datetime={record.createdAt}
              locale={this.props.intl.formatMessage({ id: 'language' })}
            />
          </Popover>
        </div>),
    }, {
      title: <FormattedMessage id="merge.commit" />,
      key: 'commits',
      render: record => (
        <div>
          {record.commits.length ? `${record.commits.length} commits` : '0 commit'}
        </div>),
    }, {
      title: <FormattedMessage id="merge.upDate" />,
      key: 'updatedAt',
      render: record => (
        <div>
          <Popover
            rowKey="creationDate"
            title={<FormattedMessage id="merge.upDate" />}
            content={record.updatedAt}
            placement="left"
          >
            <TimeAgo
              datetime={record.updatedAt}
              locale={this.props.intl.formatMessage({ id: 'language' })}
            />
          </Popover>
        </div>),
    }, {
      width: 56,
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.devops-git.getMergeRequestList']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Tooltip placement="bottom" title={<FormattedMessage id="merge.detail" />}>
              <Button
                size="small"
                shape="circle"
                onClick={this.linkToMerge.bind(this, record.webUrl)}
              >
                <span className="icon icon-find_in_page" />
              </Button>
            </Tooltip>
          </Permission>
        </div>
      ),
    }];

    return (
      <Page
        className="c7n-region page-container"
        service={[
          'devops-service.application.listByActive',
          'devops-service.devops-git.getMergeRequestList',
          'devops-service.devops-git.getUrl',
        ]}
      >
        <Header title={<FormattedMessage id="merge.head" />}>
          <Button
            funcType="flat"
            onClick={this.linkToNewMerge}
          >
            <span className="icon-playlist_add icon" />
            <FormattedMessage id="merge.createMerge" />
          </Button>
          <Button
            funcType="flat"
            onClick={this.reload}
          >
            <span className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          <h2 className="c7n-space-first">
            <FormattedMessage
              id="merge.title"
              values={{
                name: `${menu.name}`,
              }}
            />
          </h2>
          <p>
            <FormattedMessage id="merge.description" />
            <a href={intl.formatMessage({ id: 'appstore.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                <FormattedMessage id="learnmore" />
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          <Select
            className="c7n-app-select_512"
            value={MergeRequestStore.currentApp.id}
            label={intl.formatMessage({ id: 'deploy.step.one.app' })}
            filterOption={(input, option) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
            onChange={this.handleChange.bind(this)}
          >
            {
              _.map(appData, (app, index) =>
                <Option key={index} value={app.id}>{app.name}</Option>,
              )
            }
          </Select>
          <Tabs defaultActiveKey="open" onChange={this.tabChange}>
            <TabPane tab={`${intl.formatMessage({ id: 'merge.tab1' })}(${data.openCount || 0})`} key="opened">
              <Table
                filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
                onChange={this.tableChange}
                loading={MergeRequestStore.getIsLoading}
                columns={columns}
                pagination={pageInfo}
                filters={param || []}
                dataSource={data.pageResult ? data.pageResult.content : null}
                rowKey={record => record.id}
              />
            </TabPane>
            <TabPane tab={`${intl.formatMessage({ id: 'merge.tab2' })}(${data.mergeCount || 0})`} key="merged">
              <Table
                filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
                onChange={this.tableChange}
                loading={MergeRequestStore.getIsLoading}
                columns={columns}
                pagination={pageInfo}
                filters={param || []}
                dataSource={data.pageResult ? data.pageResult.content : null}
                rowKey={record => record.id}
              />
            </TabPane>
            <TabPane tab={`${intl.formatMessage({ id: 'merge.tab3' })}(${data.closeCcount || 0})`} key="closed">
              <Table
                filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
                onChange={this.tableChange}
                loading={MergeRequestStore.getIsLoading}
                columns={columns}
                pagination={pageInfo}
                filters={param || []}
                dataSource={data.pageResult ? data.pageResult.content : null}
                rowKey={record => record.id}
              />
            </TabPane>
            <TabPane tab={`${intl.formatMessage({ id: 'merge.tab4' })}(${data.totalCount || 0})`} key="all">
              <Table
                filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
                onChange={this.tableChange}
                loading={MergeRequestStore.getIsLoading}
                columns={columnsAll}
                pagination={pageInfo}
                filters={param || []}
                dataSource={data.pageResult ? data.pageResult.content : null}
                rowKey={record => record.id}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(MergeRequestHome));
