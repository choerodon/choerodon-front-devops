import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Tooltip, Table, Select } from 'choerodon-ui';
import TimePopover from '../../../components/timePopover';
import '../../main.scss';
import './AppTag.scss';

const { AppState } = stores;
const Option = Select.Option;

@observer
class AppTag extends Component {
  constructor(props) {
    super(props);
    const menu = AppState.currentMenuType;
    this.state = {
      projectId: menu.id,
      page: 0,
      pageSize: 10,
      appId: null,
    };
  }

  componentDidMount() {
    this.loadInitData();
  }

  /**
   * 打开操作面板
   * @param type 操作类型
   * @param id 操作应用
   */
  showSideBar =(type, id = '') => {
    this.props.form.resetFields();
    // const { AppStore } = this.props;
    // const menu = AppState.currentMenuType;
    // const { projectId, organizationId } = menu;
    // if (type === 'create') {
    //   AppStore.setSingleData(null);
    //   AppStore.loadSelectData(organizationId);
    //   this.setState({ show: true, type });
    // } else {
    //   AppStore.loadDataById(projectId, id);
    //   this.setState({ show: true, type, id });
    // }
  };

  tableChange = (pagination, filters, sorter) => {
    const { AppTagStore } = this.props;
    const { projectId, appId } = this.state;
    const selectedApp = appId || AppTagStore.getDefaultApp;
    this.setState({ page: pagination.current });
    AppTagStore
      .queryTagData(projectId, selectedApp, pagination.current - 1, pagination.pageSize);
  };

  /**
   * 通过下拉选择器选择应用时，获取应用id
   * @param id
   */
  handleSelect = (id) => {
    const { AppTagStore } = this.props;
    const { projectId, page, pageSize } = this.state;
    this.setState({ appId: id });
    AppTagStore.setDefaultApp(id);
    AppTagStore.queryTagData(projectId, id, page, pageSize);
  };

  /**
   * 页面内刷新，选择器变回默认选项
   */
  handleRefresh = () => this.loadInitData();

  /**
   * 加载应用信息
   */
  loadInitData = () => {
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    AppTagStore.queryAppData(projectId);
  }

  render() {
    const { intl, AppTagStore } = this.props;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const tagColumns = [
      {
        title: <FormattedMessage id="branch.tag" />,
        dataIndex: 'name',
        sorter: true,
      },
      {
        title: <FormattedMessage id="branch.code" />,
        dataIndex: 'commit.id',
        render: (text, record) => (<a href={record.commit.url} rel="nofollow me noopener noreferrer" target="_blank">{record.commit.id.slice(0, 8)}</a>),
      },
      {
        title: <FormattedMessage id="branch.des" />,
        dataIndex: 'commit.message',
        render: (text, record) => <Tooltip title={record.commit.message} trigger="hover" placement="bottom"><div className="c7n-table-column">{record.commit.message}</div></Tooltip>,
      }, {
        title: <FormattedMessage id="branch.owner" />,
        dataIndex: 'commit.authorName',
      },
      {
        title: <FormattedMessage id="branch.time" />,
        dataIndex: 'commit.committedDate',
        render: (text, record) => <TimePopover content={record.commit.committedDate} />,
      },
    ];
    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.git-flow.listByAppId',
          'devops-service.git-flow.finishEvent',
          'devops-service.git-flow.finishFeatureEvent',
          'devops-service.git-flow.start',
          'devops-service.git-flow.queryTags',
          'devops-service.git-flow.queryHotfixNumber',
          'devops-service.git-flow.queryReleaseNumber',
          'devops-service.git-flow.finish',
        ]}
      >
        <React.Fragment>
          <Header title={<FormattedMessage id="apptag.title" />}>
            <Permission
              service={['devops-service.application.create']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                onClick={this.showSideBar.bind(this, 'create')}
              >
                <span className="icon-playlist_add icon" />
                <FormattedMessage id="app.create" />
              </Button>
            </Permission>
            <Button
              onClick={this.handleRefresh}
            >
              <span className="icon-refresh icon" />
              <FormattedMessage id="refresh" />
            </Button>
          </Header>
          <Content>
            <h2 className="c7n-space-first">
              <FormattedMessage
                id="apptag.head"
                values={{
                  name: `${menu.name}`,
                }}
              />
            </h2>
            <p>
              <FormattedMessage id="apptag.description" />
              <a className="c7n-external-link" href={intl.formatMessage({ id: 'apptag.link' })} rel="nofollow me noopener noreferrer" target="_blank">
                <span className="c7n-external-link-content">
                  <FormattedMessage id="learnmore" />
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            <Select
              className="c7n-select_512"
              value={AppTagStore.getDefaultApp}
              label={this.props.intl.formatMessage({ id: 'deploy.step.one.app' })}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              filter
              onChange={this.handleSelect}
            >
              {
                _.map(AppTagStore.getAppData, (app, index) =>
                  <Option key={index} value={app.id}>{app.name}</Option>,
                )
              }
            </Select>
            <h4 className="c7n-tag-table"><FormattedMessage id="apptag.table" /></h4>
            <Table
              onChange={this.tableChange}
              pagination={AppTagStore.pageInfo}
              filterBar={false}
              columns={tagColumns}
              loading={AppTagStore.getLoading}
              dataSource={AppTagStore.getTagData}
              rowKey={record => record.name}
            />
          </Content>
        </React.Fragment>
      </Page>
    );
  }
}

export default withRouter(injectIntl(AppTag));
