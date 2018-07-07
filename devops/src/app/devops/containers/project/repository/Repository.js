import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Select, Icon, Button, Table, Tooltip } from 'choerodon-ui';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import MouserOverWrapper from '../../../components/MouseOverWrapper';
import '../../main.scss';

const { AppState } = stores;
const { Option, OptGroup } = Select;

@observer
class Repository extends Component {
  constructor(props) {
    super(props);
    const menu = AppState.currentMenuType;
    this.state = {
      projectId: menu.id,
      param: [],
      filters: {},
      sort: {
        columnKey: 'id',
        order: 'asc',
      },
    };
  }

  componentDidMount() {
    this.loadRepoData();
  }

  tableChange = (pagination, filters, sorter, param) => {
    // 分页 {size: 表格的尺寸, current: 当前所在页, pageSize: 每页条数}
    window.console.log(pagination);
    // 搜索条添加前置字段 {[列的dataIndex字段]: 输入的查询值}
    window.console.log(filters);
    // 排序 {column: 当前列, columnKey: 排序列的key, field: 排序字段, order: 升降序(asc,desc)}
    window.console.log(sorter);
    // 搜索条不添加前置字段 string
    window.console.log(param);
    const search = {
      searchParam: filters,
      param: param[0],
    };
    this.setState({ param, filters, sort: sorter });
    this.loadRepoData(pagination.current - 1, pagination.pageSize, sorter, search);
  };

  loadRepoData = (page = 0, pageSize = 10, sorter = {}, search = { searchParam: {}, param: '' }) => {
    const { RepositoryStore } = this.props;
    const { projectId } = this.state;
    RepositoryStore.queryRepoData(projectId, page, pageSize, sorter, search);
  };

  handleRefresh = () => {
    this.setState({
      param: [],
      sort: {
        columnKey: 'id',
        order: 'asc',
      },
      filters: {},
    });
    this.loadRepoData();
  };

  handleCopy = () => Choerodon.prompt('复制成功');

  render() {
    const { intl, RepositoryStore } = this.props;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const { param, filters, sort: { columnKey, order } } = this.state;
    const pageInfos = RepositoryStore.getPageInfo;
    const columns = [{
      title: <FormattedMessage id="repository.repository" />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
      sortOrder: columnKey === 'code' && order,
      filteredValue: filters.code || [],
    }, {
      title: <FormattedMessage id="repository.url" />,
      dataIndex: 'repoUrl',
      key: 'repoUrl',
      render: (text, record) => (<MouserOverWrapper text={record.repoUrl} width={250}>
        <a href={record.repoUrl} rel="nofollow me noopener noreferrer" target="_blank">{record.repoUrl ? `../${record.repoUrl.split('/')[record.repoUrl.split('/').length - 1]}` : ''}</a>
      </MouserOverWrapper>),
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
              <Button shape="circle" size={'small'}>
                <span className="icon icon-quality" />
              </Button>
            </a>
          </Tooltip> : null }
          <Tooltip title={<FormattedMessage id="repository.copyUrl" />} placement="bottom">
            <CopyToClipboard
              text={`${record.repoUrl}`}
              onCopy={this.handleCopy}
            >
              <Button shape="circle" size={'small'}>
                <span className="icon icon-baseline-file_copy" />
              </Button>
            </CopyToClipboard>
          </Tooltip>
        </div>) }];
    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.application.listByActive',
        ]}
      >
        <React.Fragment>
          <Header title={<FormattedMessage id="apptag.title" />}>
            <Button
              onClick={this.handleRefresh}
            >
              <span className="icon-refresh icon" />
              <FormattedMessage id="refresh" />
            </Button>
          </Header>
          <Content code="repository" value={{ name }}>
            <Table
              filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
              loading={RepositoryStore.loading}
              onChange={this.tableChange}
              pagination={RepositoryStore.getPageInfo}
              columns={columns}
              filters={param || []}
              dataSource={RepositoryStore.getRepoData}
              rowKey={record => record.id}
            />
          </Content>
        </React.Fragment>
      </Page>
    );
  }
}

export default withRouter(injectIntl(Repository));
