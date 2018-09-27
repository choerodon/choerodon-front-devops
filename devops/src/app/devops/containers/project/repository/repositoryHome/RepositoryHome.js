import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Select, Icon, Button, Table, Tooltip } from 'choerodon-ui';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MouserOverWrapper from '../../../../components/MouseOverWrapper/index';
import '../../../main.scss';
import './RepositoryHome.scss';

const { AppState } = stores;
const { Option, OptGroup } = Select;
const repoColor = [
  '#45A3FC',
  '#FFB100',
  '#F44336',
  '#00BFA5',
  '#AF4CFF',
  '#F953BA',
];

@observer
class RepositoryHome extends Component {
  constructor(props) {
    super(props);
    const menu = AppState.currentMenuType;
    this.state = {
      projectId: menu.id,
      param: [],
      filters: {},
      sort: {
        columnKey: 'id',
        order: 'descend',
      },
    };
  }

  componentDidMount() {
    this.loadRepoData();
  }

  /**
   * @param id
   * @returns {string}
   */
  getRepoColor = (id) => {
    const idMode = id % 6;
    return repoColor[idMode];
  };

  /**
   * 表格切换页码和搜索排序时触发
   * @param pagination
   * @param filters
   * @param sorter
   * @param param
   */
  tableChange = (pagination, filters, sorter, param) => {
    const search = {
      searchParam: filters,
      param: param[0],
    };
    this.setState({ param, filters, sort: sorter });
    this.loadRepoData(pagination.current - 1, pagination.pageSize, sorter, search);
  };

  /**
   * 分页加载所有仓库数据
   * @param page
   * @param pageSize
   * @param sorter
   * @param search
   */
  loadRepoData = (page = 0, pageSize, sorter = {}, search = { searchParam: {}, param: '' }) => {
    const { RepositoryStore } = this.props;
    const { projectId } = this.state;
    RepositoryStore.queryRepoData(projectId, page, pageSize, sorter, search);
  };

  /**
   * 页面刷新
   */
  handleRefresh = () => {
    // this.setState({
    //   param: [],
    //   sort: {
    //     columnKey: 'id',
    //     order: 'desc',
    //   },
    //   filters: {},
    // });
    const { RepositoryStore } = this.props;
    const { param, sort, filters } = this.state;
    const pageInfos = RepositoryStore.getPageInfo;
    this.tableChange(pageInfos, filters, sort, param);
  };

  /**
   * 点击复制代码成功回调
   * @returns {*|string}
   */
  handleCopy = () => Choerodon.prompt('复制成功');

  render() {
    const { intl, RepositoryStore } = this.props;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const { param, filters, sort: { columnKey, order } } = this.state;
    const pageInfos = RepositoryStore.getPageInfo;
    const noRepoUrl = intl.formatMessage({ id: 'repository.noUrl' });
    const columns = [{
      title: <FormattedMessage id="repository.repository" />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
      sortOrder: columnKey === 'code' && order,
      filteredValue: filters.code || [],
      render: (text, record) => (<div>
        <span className="repo-commit-avatar" style={{ color: this.getRepoColor(record.id) }}>{text.toString().substr(0, 1).toUpperCase()}</span>
        <span>{text}</span>
      </div>),
    }, {
      title: <FormattedMessage id="repository.url" />,
      dataIndex: 'repoUrl',
      key: 'repoUrl',
      render: (text, record) => (<a href={record.repoUrl || null} rel="nofollow me noopener noreferrer" target="_blank">
        <MouserOverWrapper text={record.repoUrl} width={0.25}>
          {record.repoUrl ? `../${record.repoUrl.split('/')[record.repoUrl.split('/').length - 1]}` : ''}
        </MouserOverWrapper>
      </a>),
    }, {
      title: <FormattedMessage id="repository.application" />,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
      sortOrder: columnKey === 'name' && order,
      filteredValue: filters.name || [],
    }, {
      align: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <div>
          {record.sonarUrl ? <Tooltip title={<FormattedMessage id="repository.quality" />} placement="bottom">
            <a href={record.sonarUrl} rel="nofollow me noopener noreferrer" target="_blank">
              <Button shape="circle" size="small">
                <i className="icon icon-quality" />
              </Button>
            </a>
          </Tooltip> : null }
          <Tooltip title={<FormattedMessage id="repository.copyUrl" />} placement="bottom">
            <CopyToClipboard
              text={record.repoUrl || noRepoUrl}
              onCopy={this.handleCopy}
            >
              <Button className="repo-copy-btn" shape="circle" size="small">
                <i className="icon icon-library_books" />
              </Button>
            </CopyToClipboard>
          </Tooltip>
        </div>) }];
    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.application.listCodeRepository',
        ]}
      >
        <Header title={<FormattedMessage id="repository.head" />}>
          <Button
            onClick={this.handleRefresh}
          >
            <i className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="repository" value={{ name }}>
          <Table
            filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
            loading={RepositoryStore.loading}
            onChange={this.tableChange}
            pagination={RepositoryStore.getPageInfo}
            columns={columns}
            filters={param || []}
            dataSource={RepositoryStore.getRepoData}
            rowKey={record => record.id}
          />
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(RepositoryHome));
