import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Tooltip, Modal, Table, Popover, Progress, Select } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores, axios } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import '../../../main.scss';
import './BranchHome.scss';
import CreateBranch from '../CreateBranch';
import TimePopover from '../../../../components/timePopover';
import EditBranch from '../editBranch';
import IssueDetail from '../issueDetail';
import '../commom.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const { AppState } = stores;
const Option = Select.Option;

@observer
class BranchHome extends Component {
  constructor(props) {
    super(props);
    const menu = AppState.currentMenuType;
    this.state = {
      projectId: menu.id,
      appId: props.match.params.id,
      appName: props.match.params.name,
      page: 0,
      pageSize: 10,
      filters: {},
    };
  }

  componentDidMount() {
    const { BranchStore, intl } = this.props;
    BranchStore.loadApps();
    // this.loadData();
  }
  /**
   * 获取issue的options
   * @param s
   * @returns {*}
   */
  getOptionContent =(s) => {
    const { formatMessage } = this.props.intl;
    let mes = '';
    let icon = '';
    let color = '';
    switch (s.typeCode) {
      case 'story':
        mes = formatMessage({ id: 'branch.issue.story' });
        icon = 'turned_in';
        color = '#00bfa5';
        break;
      case 'bug':
        mes = formatMessage({ id: 'branch.issue.bug' });
        icon = 'bug_report';
        color = '#f44336';
        break;
      case 'issue_epic':
        mes = formatMessage({ id: 'branch.issue.epic' });
        icon = 'priority';
        color = '#743be7';
        break;
      case 'sub_task':
        mes = formatMessage({ id: 'branch.issue.subtask' });
        icon = 'relation';
        color = '#4d90fe';
        break;
      default:
        mes = formatMessage({ id: 'branch.issue.task' });
        icon = 'assignment';
        color = '#4d90fe';
    }
    return (<span>
      <Tooltip title={mes}>
        <div style={{ background: color }} className="branch-issue"><i className={`icon icon-${icon}`} /></div>
      </Tooltip>
      <Tooltip title={s.summary}>
        <span className="branch-issue-content"><span>{s.issueNum}</span></span>
      </Tooltip>
    </span>);
  };

  /**
   * 获取头像的首字母
   * @param name
   */
  getName = (name) => {
    const p = /[\u4e00-\u9fa5]/;
    const str = p.exec(name);
    let names = '';
    if (str) {
      names = str[0];
    } else {
      names = name.slice(0, 1);
    }
    return names;
  };
  /**
   * 获取列表的icon
   * @param type 分支类型
   * @returns {*}
   */
  getIcon =(name) => {
    let icon;
    let type;
    if (name) {
      type = name.split('-')[0];
    }
    switch (type) {
      case 'feature':
        icon = <span className="c7n-branch-icon icon-feature">F</span>;
        break;
      case 'bugfix':
        icon = <span className="c7n-branch-icon icon-develop">B</span>;
        break;
      case 'hotfix':
        icon = <span className="c7n-branch-icon icon-hotfix">H</span>;
        break;
      case 'master':
        icon = <span className="c7n-branch-icon icon-master">M</span>;
        break;
      case 'release':
        icon = <span className="c7n-branch-icon icon-release">R</span>;
        break;
      default:
        icon = <span className="c7n-branch-icon icon-custom">C</span>;
    }
    return icon;
  };

  /**
   * 获取分支列表正文
   * @returns {*}
   */
  get tableBranch() {
    const { BranchStore, intl } = this.props;
    const menu = AppState.currentMenuType;
    const { type, organizationId: orgId } = menu;
    const branchColumns = [
      {
        title: <FormattedMessage id="branch.name" />,
        dataIndex: 'branchName',
        filters: [],
        filteredValue: this.state.filters.branchName,
        sorter: true,
        render: (text, record) => (<div>
          {this.getIcon(record.branchName)}
          <span>{record.branchName}</span>
        </div>),
      },
      {
        title: <FormattedMessage id="branch.commit" />,
        render: (text, record) => (<div>
          <div>
            <span className="icon icon-point branch-column-icon" />
            <a href={record.commitUrl} target="_blank" rel="nofollow me noopener noreferrer">
              <span>{record.sha && record.sha.slice(0, 8) }</span>
            </a>
            <span className="icon icon-schedule branch-col-icon branch-column-icon" style={{ paddingLeft: 16, fontSize: 16, marginBottom: 2 }} />
            <TimePopover content={record.commitDate} style={{ display: 'inline-block', color: 'rgba(0, 0, 0, 0.65)' }} />
          </div>
          {record.commitUserUrl && record.commitUserName ? <Tooltip title={record.commitUserName}>
            <div className="branch-user-img" style={{ backgroundImage: `url(${record.commitUserUrl})` }} />
          </Tooltip> : <Tooltip title={record.commitUserName}><div className="branch-user-img" >{record.commitUserName && record.commitUserName.slice(0, 1)}</div></Tooltip> }
          <MouserOverWrapper text={record.commitContent} width={0.2} className="branch-col-icon">
            {record.commitContent}
          </MouserOverWrapper>
        </div>),
      },
      {
        title: <FormattedMessage id="branch.time" />,
        dataIndex: 'commit.committedDate',
        render: (text, record) => (<div>
          {record.createUserName && record.createUserUrl ?
            <React.Fragment>
              <div className="branch-user-img" style={{ backgroundImage: `url(${record.createUserUrl})` }} />
              <div style={{ display: 'inline-block' }}>
                <span style={{ paddingRight: 5 }}>{record.createUserName}</span>
                {record.createUserName !== record.createUserRealName
                && <span>{record.createUserRealName}</span>}
              </div>
            </React.Fragment>
            : <React.Fragment>
              {record.createUserName ? <div>
                <div className="branch-user-img" >{record.createUserRealName && this.getName(record.createUserRealName)}</div>
                <div style={{ display: 'inline-block' }}>
                  <span style={{ paddingRight: 5 }}>{record.createUserName}</span>
                  {record.createUserName !== record.createUserRealName
                  && <span>{record.createUserRealName}</span>}
                </div>
              </div> : null}
            </React.Fragment> }
        </div>),
      },
      {
        title: <FormattedMessage id="branch.issue" />,
        dataIndex: 'commit.message',
        render: (text, record) => (<div>
          {record.typeCode ? this.getOptionContent(record) : null}
          <a onClick={this.showIssue.bind(this, record.issueId, record.branchName)} role={'none'}><Tooltip title={record.issueName}>{record.issueCode}</Tooltip></a>
        </div>),
      },
      {
        align: 'right',
        className: 'operateIcons',
        key: 'action',
        render: (test, record) => (
          <div>
            {record.branchName !== 'master' ?
              <React.Fragment>
                <Permission projectId={this.state.projectId} organizationId={orgId} type={type} service={['devops-service.devops-git.update']}>
                  <Tooltip
                    placement="bottom"
                    title={<FormattedMessage id="branch.edit" />}
                  >
                    <Button size={'small'} shape="circle" onClick={this.handleEdit.bind(this, record.branchName)}>
                      <span className="icon icon-mode_edit" />
                    </Button>
                  </Tooltip>
                </Permission>
                <Tooltip
                  placement="bottom"
                  title={<FormattedMessage id="branch.request" />}
                >
                  <a href={record.commitUrl && `${record.commitUrl.split('/commit')[0]}/merge_requests/new?change_branches=true&merge_request[source_branch]=${record.branchName}&merge_request[target_branch]=master`} target="_blank" rel="nofollow me noopener noreferrer">
                    <Button size={'small'} shape="circle">
                      <span className="icon icon-merge_request" />
                    </Button>
                  </a>
                </Tooltip>
                <Permission projectId={this.state.projectId} organizationId={orgId} type={type} service={['devops-service.devops-git.delete']}>
                  <Tooltip
                    placement="bottom"
                    title={<FormattedMessage id="delete" />}
                  >
                    <Button size={'small'} shape="circle" onClick={this.openRemove.bind(this, record.branchName)}>
                      <span className="icon icon-delete" />
                    </Button>
                  </Tooltip>
                </Permission>
              </React.Fragment>
              : null
            }
          </div>
        ),
      },
    ];
    const title = (<div className="c7n-header-table">
      <span>
        <FormattedMessage id="branch.list" />
      </span>
      <Popover
        // trigger={'click'}
        // getPopupContainer={triggerNode => triggerNode.parentNode}
        overlayClassName="branch-popover"
        placement="rightTop"
        content={<section>
          <div>
            <span className="branch-popover-span span-master" />
            <div className="branch-popover-content">
              <p className="branch-popover-p">
                <FormattedMessage id="branch.master" />
              </p>
              <p>
                <FormattedMessage id="branch.masterDes" />
              </p>
            </div>
          </div>
          <div className="c7n-branch-block">
            <span className="branch-popover-span span-feature" />
            <div className="branch-popover-content">
              <p className="branch-popover-p">
                <FormattedMessage id="branch.feature" />
              </p>
              <p>
                <FormattedMessage id="branch.featureDes" />
              </p>
            </div>
          </div>
          <div className="c7n-branch-block" >
            <span className="branch-popover-span span-bugfix" />
            <div className="branch-popover-content">
              <p className="branch-popover-p">
                <FormattedMessage id="branch.bugfix" />
              </p>
              <p>
                <FormattedMessage id="branch.bugfixDes" />
              </p>
            </div>
          </div>
          <div className="c7n-branch-block">
            <span className="branch-popover-span span-release" />
            <div className="branch-popover-content">
              <p className="branch-popover-p">
                <FormattedMessage id="branch.release" />
              </p>
              <p>
                <FormattedMessage id="branch.releaseDes" />
              </p>
            </div>
          </div>
          <div className="c7n-branch-block">
            <span className="branch-popover-span span-hotfix" />
            <div className="branch-popover-content">
              <p className="branch-popover-p">
                <FormattedMessage id="branch.hotfix" />
              </p>
              <p>
                <FormattedMessage id="branch.hotfixDes" />
              </p>
            </div>
          </div>
          <div className="c7n-branch-block">
            <span className="branch-popover-span span-custom" />
            <div className="branch-popover-content">
              <p className="branch-popover-p">
                <FormattedMessage id="branch.custom" />
              </p>
              <p>
                <FormattedMessage id="branch.customDes" />
              </p>
            </div>
          </div>
        </section>}
      >
        <span className="icon icon-help branch-icon-help" />
      </Popover>
    </div>);
    return (
      <div>
        {title}
        <Table
          filters={this.state.paras}
          filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
          loading={BranchStore.loading}
          className="c7n-branch-table"
          rowClassName="c7n-branch-tr"
          // title={() => title}
          pagination={BranchStore.getPageInfo}
          columns={branchColumns}
          dataSource={BranchStore.branchData.content.slice()}
          rowKey={record => record.branchName}
          onChange={this.tableChange}
        />
      </div>

    );
  }

  /**
   * 获取分支和标记列表
   */
  loadData = (value) => {
    const { projectId } = this.state;
    const { BranchStore } = this.props;
    BranchStore.setApp(value);
    BranchStore.setBranchData({ content: [] });
    BranchStore.loadBranchData({ projectId });
  };
  /**
   * 修改相关联问题
   * @param name
   */
  handleEdit =(name) => {
    const { BranchStore } = this.props;
    BranchStore.loadBranchByName(this.state.projectId, BranchStore.app, name);
    BranchStore.setCreateBranchShow('edit');
  };

  /**
   * 刷新
   */
  handleRefresh =() => {
    const { BranchStore } = this.props;
    this.loadData(BranchStore.app);
  };

  /**
   * 创建分支的弹框
   */
  showSidebar = () => {
    const { BranchStore } = this.props;
    BranchStore.loadTagData(this.state.projectId);
    BranchStore.loadBranchData({
      projectId: this.state.projectId,
      size: 3,
    });
    BranchStore.setCreateBranchShow('create');
  };

  showIssue =(id, name) => {
    const { BranchStore } = this.props;
    this.setState({ name });
    BranchStore.loadIssueById(this.state.projectId, id);
    BranchStore.loadIssueTimeById(this.state.projectId, id);
    BranchStore.setCreateBranchShow('detail');
  };

  /**
   * 关闭sidebar
   */
  hideSidebar = () => {
    const { BranchStore } = this.props;
    BranchStore.setCreateBranchShow(false);
    // this.loadData(BranchStore.app);
  };
  /**
   * 打开删除框
   * @param name
   */
  openRemove = (name) => {
    this.setState({ visible: true, name });
  };
  /**
   * 关闭删除框
   */
  closeRemove = () => {
    this.setState({ visible: false });
  };

  /**
   * 删除数据
   */
  handleDelete = () => {
    const { BranchStore } = this.props;
    const { name } = this.state;
    const menu = AppState.currentMenuType;
    const organizationId = menu.id;
    this.setState({ submitting: true });
    BranchStore.deleteData(organizationId, BranchStore.app, name).then((data) => {
      this.setState({ submitting: false });
      this.loadData(BranchStore.app);
      this.closeRemove();
    }).catch((error) => {
      this.setState({ submitting: false });
      Choerodon.handleResponseError(error);
    });
  };
  /**
   * table筛选
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange =(pagination, filters, sorter, paras) => {
    const { BranchStore } = this.props;
    const menu = AppState.currentMenuType;
    const organizationId = menu.id;
    this.setState({ filters, paras });
    const sort = { field: 'creationDate', order: 'desc' };
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
      searchParam = filters;
      // page = 0;
    }
    if (paras.length) {
      searchParam = { branchName: [paras.toString()] };
    }
    const postData = {
      searchParam,
      param: '',
    };
    BranchStore
      .loadBranchData({
        projectId: organizationId,
        size: pagination.pageSize,
        sort,
        postData,
      });
  };

  render() {
    const { BranchStore, intl } = this.props;
    const menu = AppState.currentMenuType;
    const apps = BranchStore.apps.slice();
    return (
      <Page
        className="c7n-region c7n-branch"
        service={[
          'devops-service.application.listByActive',
          'devops-service.devops-git.createBranch',
          'devops-service.devops-git.queryByAppId',
          'devops-service.devops-git.delete',
          'devops-service.devops-git.listByAppId',
          'devops-service.devops-git.getTagList',
          'devops-service.devops-git.update',
          'agile-service.issue.queryIssueByOption',
          'agile-service.issue.queryIssue',
          'agile-service.work-log.queryWorkLogListByIssueId',
        ]}
      >
        <Header title={<FormattedMessage id="branch.title" />}>
          {BranchStore.branchData.content.length && BranchStore.app ? <Permission
            service={['devops-service.devops-git.createBranch']}
          >
            <Tooltip
              title={<FormattedMessage id="branch.createTip" />}
              placement="rightTop"
            >
              <Button
                ghost
                onClick={this.showSidebar}
              >
                <span className="icon icon-playlist_add" />
                <FormattedMessage id="branch.create" />
              </Button>
            </Tooltip>
          </Permission> : null}
          <Button
            funcType="flat"
            ghost="true"
            onClick={this.handleRefresh}
          >
            <span className="icon icon-refresh" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content className="page-content">
          <h2 className="c7n-space-first">
            <FormattedMessage
              id="branch.head"
              values={{
                name: `${menu.name}`,
              }}
            />
          </h2>
          <p>
            <FormattedMessage id="branch.description" />
            <a href={intl.formatMessage({ id: 'branch.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                <FormattedMessage id="learnmore" />
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          <Select
            onChange={this.loadData}
            value={BranchStore.app ? BranchStore.app : undefined}
            className="branch-select_512"
            label={this.props.intl.formatMessage({ id: 'deploy.step.one.app' })}
            filterOption={(input, option) =>
              option.props.children.props.children.props.children
                .toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filter
          >
            {
              _.map(apps, (app, index) =>
                (
                  <Option value={app.id} key={index}>
                    <Tooltip title={app.code}>
                      <span style={{ width: '100%', display: 'inline-block' }}>
                        {app.name}
                      </span>
                    </Tooltip>
                  </Option>),
              )
            }
          </Select>
          {this.tableBranch}
        </Content>
        {BranchStore.createBranchShow === 'create' && <CreateBranch
          name={_.filter(apps, app => app.id === BranchStore.app)[0].name}
          appId={BranchStore.app}
          store={BranchStore}
          visible={BranchStore.createBranchShow === 'create'}
          onClose={this.hideSidebar}
        /> }
        {BranchStore.createBranchShow === 'edit' && <EditBranch
          appId={BranchStore.app}
          store={BranchStore}
          visible={BranchStore.createBranchShow === 'edit'}
          onClose={this.hideSidebar}
        /> }
        {BranchStore.createBranchShow === 'detail' && <IssueDetail
          name={this.state.name}
          store={BranchStore}
          visible={BranchStore.createBranchShow === 'detail'}
          onClose={this.hideSidebar}
        /> }
        <Modal
          confirmLoading={this.state.submitting}
          visible={this.state.visible}
          title={<FormattedMessage id={'branch.action.delete'} />}
          footer={[
            <Button key="back" onClick={this.closeRemove}>{<FormattedMessage id={'cancel'} />}</Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete} loading={this.state.submitting}>
              {this.props.intl.formatMessage({ id: 'delete' })}
            </Button>,
          ]}
        >
          <p>{this.props.intl.formatMessage({ id: 'branch.delete.tooltip' })}</p>
        </Modal>
      </Page>
    );
  }
}

export default withRouter(injectIntl(BranchHome));
