import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Button, Select, Modal, Form, Icon, Collapse, Avatar, Pagination, Tooltip, Menu, Dropdown } from 'choerodon-ui';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
import moment from 'moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import LoadingBar from '../../../../components/loadingBar';
import TimePopover from '../../../../components/timePopover/index';
import CreateTag from '../../appTag/createTag';
import EditTag from '../../appTag/editTag';
import '../../../main.scss';
import '../../appTag/appTagHome/AppTagHome.scss';
import '../../branch/commom.scss';
import './DevConsole.scss';
import DevPipelineStore from '../../../../stores/project/devPipeline';
import AppTagStore from '../../../../stores/project/appTag';
import BranchStore from '../../../../stores/project/branchManage';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import EditBranch from '../../branch/editBranch';
import CreateBranch from '../../branch/CreateBranch';
import MergeRequestStore from '../../../../stores/project/mergeRequest';
import StatusTags from '../../../../components/StatusTags';
import ReportsStore from '../../../../stores/project/reports/ReportsStore';
import DepPipelineEmpty from "../../../../components/DepPipelineEmpty/DepPipelineEmpty";

const { AppState } = stores;
const { Option, OptGroup } = Select;
const { Panel } = Collapse;
const START = moment().subtract(7, 'days').format().split('T')[0].replace(/-/g, '/');
const END = moment().format().split('T')[0].replace(/-/g, '/');

@observer
class DevConsole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageSize: 10,
      visible: false,
      visibleBranch: false,
      deleteLoading: false,
      tag: null,
      editTag: null,
      editRelease: null,
      creationDisplay: false,
      editDisplay: false,
      appName: null,
    };
  }

  componentDidMount() {
    AppTagStore.setLoading(null);
    AppTagStore.setTagData([]);
    this.loadInitData();
  }

  componentWillUnmount() {
    const { DevConsoleStore } = this.props;
    DevConsoleStore.setBranchList([]);
    ReportsStore.setCommits({});
    MergeRequestStore.setMerge([], 'opened');
    MergeRequestStore.setMerge([], 'merged');
  }


  /**
   * 通过下拉选择器选择应用时，获取应用id
   * @param id
   * @param option
   */
  handleSelect = (id, option) => {
    this.setState({ page: 0, pageSize: 10, appName: option.props.children });
    DevPipelineStore.setSelectApp(id);
    DevPipelineStore.setRecentApp(id);
    this.loadTagData();
    this.loadBranchData();
    this.loadMergeData();
    this.loadCommitData();
  };

  /**
   * 页面内刷新，选择器变回默认选项
   */
  handleRefresh = () => {
    const { page, pageSize } = this.state;
    this.loadTagData(page, pageSize);
    this.loadBranchData();
    this.loadMergeData();
    this.loadCommitData();
  };

  /**
   * 加载应用信息
   */
  loadInitData = () => {
    DevPipelineStore.queryAppData(AppState.currentMenuType.id, 'all');
    this.setState({ appName: null });
  };

  /**
   * 加载分支信息
   */
  loadBranchData = () => {
    const { DevConsoleStore } = this.props;
    const { projectId } = AppState.currentMenuType;
    DevConsoleStore.loadBranchList(projectId, DevPipelineStore.getSelectApp);
  };

  /**
   * 加载合并请求信息
   */
  loadMergeData = () => {
    MergeRequestStore.loadMergeRquest(DevPipelineStore.getSelectApp, 'opened', 0, 5);
    MergeRequestStore.loadMergeRquest(DevPipelineStore.getSelectApp, 'merged', 0, 5);
  };

  /**
   * 加载提交记录
   */
  loadCommitData = () => {
    const { projectId } = AppState.currentMenuType;
    ReportsStore.loadCommits(projectId, START, END, [DevPipelineStore.getSelectApp]);
  };

  /**
   * 加载刷新tag列表信息
   * @param page
   * @param pageSize
   */
  loadTagData = (page = 0, pageSize = 10) => {
    const { projectId } = AppState.currentMenuType;
    AppTagStore.queryTagData(projectId, page, pageSize);
  };

  /**
   * 分页器
   * @param current
   * @param size
   */
  handlePaginChange = (current, size) => {
    this.setState({ page: current - 1, pageSize: size });
    this.loadTagData(current - 1, size);
  };

  /**
   * 打开删除确认框
   * @param tag
   */
  openRemove = (e, tag) => {
    e.stopPropagation();
    this.setState({ visible: true, tag });
  };

  /**
   * 关闭删除确认框
   */
  closeRemove = () => this.setState({ visible: false });

  /**
   * 删除tag
   */
  deleteTag = () => {
    const { projectId } = AppState.currentMenuType;
    const { tag } = this.state;
    this.setState({ deleteLoading: true });
    AppTagStore.deleteTag(projectId, tag).then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.loadTagData();
      }
      this.setState({ deleteLoading: false, visible: false });
    }).catch((error) => {
      this.setState({ deleteLoading: false });
      Choerodon.handleResponseError(error);
    });
  };

  /**
   * 控制创建窗口显隐
   * @param flag
   */
  displayCreateModal = flag => this.setState({ creationDisplay: flag });

  /**
   * 控制编辑窗口
   * @param flag 显隐
   * @param tag tag名称
   * @param res release内容
   * @param e
   */
  displayEditModal = (flag, tag, res, e) => {
    let editTag = null;
    let editRelease = null;
    if (tag) {
      e.stopPropagation();
      editTag = tag;
      editRelease = res;
    }
    this.setState({ editDisplay: flag, editTag, editRelease });
  };

  /**
   * 点击复制代码成功回调
   * @returns {*|string}
   */
  handleCopy = () => Choerodon.prompt('复制成功');

  /**
   * 获取列表的icon
   * @param name 分支名称
   * @returns {*}
   */
  getIcon =(name) => {
    const nameArr = ['feature', 'release', 'bugfix', 'hotfix'];
    let type = '';
    if (name.includes('-') && nameArr.includes(name.split('-')[0])) {
      type = name.split('-')[0];
    } else if (name === 'master') {
      type = name;
    } else {
      type = 'custom';
    }
    return <span className={`c7n-branch-icon icon-${type}`}>{type.slice(0, 1).toUpperCase()}</span>;
  };

  /**
   * 获取issue的options
   * @param typeCode
   * @param issueCode
   * @param issueName
   */
  getIssue =(typeCode, issueCode, issueName) => {
    const { formatMessage } = this.props.intl;
    let mes = '';
    let icon = '';
    let color = '';
    switch (typeCode) {
      case 'story':
        mes = formatMessage({ id: 'branch.issue.story' });
        icon = 'agile_story';
        color = '#00bfa5';
        break;
      case 'bug':
        mes = formatMessage({ id: 'branch.issue.bug' });
        icon = 'agile_fault';
        color = '#f44336';
        break;
      case 'issue_epic':
        mes = formatMessage({ id: 'branch.issue.epic' });
        icon = 'agile_epic';
        color = '#743be7';
        break;
      case 'sub_task':
        mes = formatMessage({ id: 'branch.issue.subtask' });
        icon = 'agile_subtask';
        color = '#4d90fe';
        break;
      default:
        mes = formatMessage({ id: 'branch.issue.task' });
        icon = 'agile_task';
        color = '#4d90fe';
    }
    return (<span className="c7n-branch-issue">
      <Tooltip title={mes}>
        <div style={{ color }} className="c7n-issue-type"><i className={`icon icon-${icon}`} /></div>
      </Tooltip>
      <Tooltip title={issueName}>
        <span className="branch-issue-content"><span>{issueCode}</span></span>
      </Tooltip>
    </span>);
  };

  /**
   * 修改相关联问题
   * @param branchName
   */
  openEditBranch = (branchName) => {
    const { projectId } = AppState.currentMenuType;
    this.setState({ branchName, editBranch: true });
    BranchStore.loadBranchByName(projectId, DevPipelineStore.selectedApp, branchName);
    BranchStore.setCreateBranchShow('edit');
  };

  /**
   * 关闭分支关联问题弹窗
   */
  closeEditBranch = () => {
    this.setState({ branchName: '', editBranch: false });
    BranchStore.setCreateBranchShow(false);
  };

  /**
   * 打开创建分支弹框
   */
  openCreateBranch = (branchName) => {
    const { projectId } = AppState.currentMenuType;
    this.setState({ branchName, createBranch: true });
    BranchStore.loadTagData(projectId);
    BranchStore.loadBranchData({
      projectId,
      size: 3,
    });
    BranchStore.setCreateBranchShow('create');
  };

  /**
   * 关闭创建分支弹窗
   */
  closeCreateBranch = () => {
    this.setState({ branchName: '', createBranch: false });
    BranchStore.setCreateBranchShow(false);
  };

  /**
   * 打开删除分支确认框
   */
  openDeleteBranch = (e, branchName) => {
    e.stopPropagation();
    this.setState({ visibleBranch: true, branchName });
  };

  /**
   * 关闭删除分支确认框
   */
  closeDeleteBranch = () => this.setState({ visibleBranch: false });

  /**
   * 删除分支
   */
  deleteBranch = () => {
    const { branchName } = this.state;
    const { projectId } = AppState.currentMenuType;
    this.setState({ deleteLoading: true });
    BranchStore.deleteData(projectId, DevPipelineStore.getSelectApp, branchName)
      .then((res) => {
        if (res) {
          this.loadBranchData();
          this.closeDeleteBranch();
        }
        this.setState({ deleteLoading: false });
      });
  };

  /**
   * 获取分支内容
   */
  getBranch = () => {
    const { DevConsoleStore } = this.props;
    const branchList = DevConsoleStore.getBranchList;
    let list = [];
    if (branchList && branchList.length) {
      list = branchList.map((item) => {
        const { branchName, commitUserName, commitDate, commitUserUrl, commitUrl, issueCode, typeCode, sha, commitContent, issueName } = item;
        const { type, projectId, organizationId: orgId } = AppState.currentMenuType;
        return (<div className="c7n-dc-branch-content" key={branchName}>
          <div className="branch-content-title">
            {this.getIcon(branchName)}
            <div className="branch-name" title={branchName}>{branchName}</div>
            {typeCode ? this.getIssue(typeCode, issueCode, issueName) : null}
            {branchName !== 'master' ? <div className="c7n-branch-action">
              <Permission
                projectId={projectId}
                organizationId={orgId}
                type={type}
                service={['devops-service.devops-git.update']}
              >
                <Tooltip title={<FormattedMessage id="branch.edit" />}>
                  <Button size="small" shape="circle" icon="mode_edit" onClick={this.openEditBranch.bind(this, branchName)} />
                </Tooltip>
              </Permission>
              <Tooltip title={<FormattedMessage id="branch.request" />}>
                <a
                  href={commitUrl && `${commitUrl.split('/commit')[0]}/merge_requests/new?change_branches=true&merge_request[source_branch]=${branchName}&merge_request[target_branch]=master`}
                  target="_blank"
                  rel="nofollow me noopener noreferrer"
                >
                  <Button size="small" shape="circle" icon="merge_request" />
                </a>
              </Tooltip>
              <Permission
                projectId={projectId}
                organizationId={orgId}
                type={type}
                service={['devops-service.devops-git.delete']}
              >
                <Tooltip title={<FormattedMessage id="delete" />}>
                  <Button size="small" shape="circle" icon="delete_forever" onClick={e => this.openDeleteBranch(e, branchName)} />
                </Tooltip>
              </Permission>
            </div> : null}
          </div>
          <div className="c7n-branch-commit">
            <i className="icon icon-point branch-column-icon" />
            <a href={commitUrl} target="_blank" rel="nofollow me noopener noreferrer" className="branch-sha">
              <span>{sha && sha.slice(0, 8) }</span>
            </a>
            <i className="icon icon-schedule branch-col-icon branch-column-icon" />
            <div className="c7n-branch-time"><TimePopover content={commitDate} /></div>
            <Tooltip title={commitUserName}>
              {commitUserUrl
                ? <Avatar size="small" src={commitUserUrl} className="c7n-branch-avatar" />
                : <Avatar size="small" className="c7n-branch-avatar">{commitUserName ? commitUserName.toString().slice(0, 1).toUpperCase() : '?'}</Avatar>
              }
            </Tooltip>
            <MouserOverWrapper text={commitContent} width={0.3}>{commitContent}</MouserOverWrapper>
          </div>
        </div>);
      });
    }
    return <div className="c7n-dc-branch">{list}</div>;
  };

  /**
   * 查看合并请求详情
   */
  linkToMerge = (iid) => {
    let url = '';
    if (iid) {
      url = `${MergeRequestStore.getUrl}/merge_requests/${iid}`;
    } else {
      url = `${MergeRequestStore.getUrl}/merge_requests/new`;
    }
    window.open(url);
  };

  /**
   * 获取合并请求内容
   */
  getMergeRequest = () => {
    const appData = DevPipelineStore.getAppData;
    const { opened, merged } = MergeRequestStore.getMerge;
    const mergeList = opened.concat(merged).slice(0, 5);
    let list = [];
    if (mergeList && mergeList.length) {
      list = mergeList.map((item) => {
        const { iid, sourceBranch, targetBranch, title, state } = item;
        const { type, projectId, organizationId: orgId } = AppState.currentMenuType;
        return (<div className="c7n-dc-branch-content" key={iid}>
          <div className="branch-content-title">
            <StatusTags name={state} colorCode={state} />
            <span className="c7n-merge-title">!{iid}</span>
            <MouserOverWrapper text={title} width={0.25}>{title}</MouserOverWrapper>
          </div>
          <div className="c7n-merge-branch">
            <Icon type="branch" className="c7n-merge-icon" />
            <MouserOverWrapper text={sourceBranch} width={0.12}>{sourceBranch}</MouserOverWrapper>
            <span><Icon type="keyboard_backspace" className="c7n-merge-icon-arrow" /></span>
            <Icon type="branch" className="c7n-merge-icon" />
            <MouserOverWrapper text={targetBranch} width={0.12}>{targetBranch}</MouserOverWrapper>
            <div className="c7n-merge-action">
              <Permission
                service={['devops-service.devops-git.getMergeRequestList']}
                organizationId={orgId}
                projectId={projectId}
                type={type}
              >
                <Tooltip title={<FormattedMessage id="merge.detail" />}>
                  <Button
                    size="small"
                    shape="circle"
                    icon="find_in_page"
                    onClick={this.linkToMerge.bind(this, iid)}
                  />
                </Tooltip>
              </Permission>
            </div>
          </div>
        </div>);
      });
    } else if (appData && appData.length) {
      list = (<div className="c7n-devCs-nomerge"><FormattedMessage id="devCs.nomerge" /></div>);
    }
    return <div>{list}</div>;
  };

  render() {
    const { intl: { formatMessage } } = this.props;
    const { type, projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const { visible, deleteLoading, creationDisplay, appName, editDisplay, editTag, editRelease, tag, branchName, editBranch, createBranch, visibleBranch } = this.state;
    const appData = DevPipelineStore.getAppData;
    const appId = DevPipelineStore.getSelectApp;
    const tagData = AppTagStore.getTagData;
    const loading = AppTagStore.getLoading;
    const currentAppName = appName || DevPipelineStore.getDefaultAppName;
    const { current, total, pageSize } = AppTagStore.pageInfo;
    const tagList = [];
    const { DevConsoleStore } = this.props;
    const branchList = DevConsoleStore.getBranchList;
    const { totalCommitsDate } = ReportsStore.getCommits;
    const branchLoading = DevConsoleStore.getBranchLoading;
    const { loading: mergeLoading, getCount: { totalCount } } = MergeRequestStore;

    const titleName = _.find(appData, ['id', appId]) ? _.find(appData, ['id', appId]).name : name;
    const currentApp = _.find(appData, ['id', appId]);

    const numberData = [
      {
        name: 'branch',
        number: branchList.length,
        message: 'devCs.branch.number',
        icon: 'branch',
      },
      {
        name: 'merge-request',
        number: totalCount,
        message: 'devCs.merge.number',
        icon: 'merge_request',
      },
      {
        name: 'tag',
        number: total,
        message: 'devCs.tag.number',
        icon: 'local_offer',
      },
    ];

    const menu = (
      <Menu className="c7n-envow-dropdown-link">
        <Menu.Item
          key="0"
        >
          <Permission
            service={['devops-service.devops-git.createBranch']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Button
              funcType="flat"
              onClick={this.openCreateBranch.bind(this, branchName)}
            >
              <FormattedMessage id="branch.create" />
            </Button>
          </Permission>
        </Menu.Item>
        <Menu.Item
          key="1"
        >
          <Permission
            service={[
              'devops-service.devops-git.createTag',
            ]}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Button
              funcType="flat"
              onClick={() => this.displayCreateModal(true)}
            >
              <FormattedMessage id="apptag.create" />
            </Button>
          </Permission>
        </Menu.Item>
        <Menu.Item
          key="2"
        >
          <Button
            funcType="flat"
            onClick={this.linkToMerge.bind(this, false)}
          >
            <FormattedMessage id="merge.createMerge" />
          </Button>
        </Menu.Item>
      </Menu>
    );

    _.forEach(tagData, (item) => {
      const {
        commit: {
          authorName,
          committedDate,
          message: commitMsg,
          shortId,
          url,
        },
        commitUserImage,
        tagName,
        release,
      } = item;
      const header = (<div className="c7n-tag-panel">
        <div className="c7n-tag-panel-info">
          <div className="c7n-tag-panel-name">
            <Icon type="local_offer" />
            <span>{tagName}</span>
          </div>
          <div className="c7n-tag-panel-detail">
            <Icon className="c7n-tag-icon-point" type="point" />
            <a href={url} rel="nofollow me noopener noreferrer" target="_blank">{shortId}</a>
            <span className="c7n-divide-point">&bull;</span>
            <span className="c7n-tag-msg">{commitMsg}</span>
            <span className="c7n-divide-point">&bull;</span>
            <span className="c7n-tag-panel-person">
              {commitUserImage
                ? <Avatar className="c7n-tag-commit-img" src={commitUserImage} />
                : <span className="c7n-tag-commit c7n-tag-commit-avatar">{authorName.toString().substr(0, 1)}</span>}
              <span className="c7n-tag-commit">{authorName}</span>
            </span>
            <span className="c7n-divide-point">&bull;</span>
            <div className="c7n-tag-time"><TimePopover content={committedDate} /></div>
          </div>
        </div>
        <div className="c7n-tag-panel-opera">
          <Permission
            service={[
              'devops-service.devops-git.updateTagRelease',
            ]}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Tooltip
              placement="bottom"
              title={<FormattedMessage id="edit" />}
            >
              <Button
                shape="circle"
                size="small"
                icon="mode_edit"
                onClick={e => this.displayEditModal(true, tagName, release, e)}
              />
            </Tooltip>
          </Permission>
          <Permission
            type={type}
            projectId={projectId}
            organizationId={orgId}
            service={[
              'devops-service.devops-git.deleteTag',
            ]}
          >
            <Tooltip
              placement="bottom"
              title={<FormattedMessage id="delete" />}
            >
              <Button
                shape="circle"
                size="small"
                icon="delete_forever"
                onClick={e => this.openRemove(e, tagName)}
              />
            </Tooltip>
          </Permission>
        </div>
      </div>);
      tagList.push(<Panel
        header={header}
        key={tagName}
      >
        <div className="c7n-tag-release">{release ? <div className="c7n-md-parse">
          <ReactMarkdown
            source={release.description !== 'empty' ? release.description : formatMessage({ id: 'apptag.release.empty' })}
            skipHtml={false}
            escapeHtml={false}
          />
        </div> : formatMessage({ id: 'apptag.release.empty' })}</div>
      </Panel>);
    });
    const empty = appData && appData.length ? 'tag' : 'app';
    const noRepoUrl = formatMessage({ id: 'repository.noUrl' });

    return (
      <Page
        className="c7n-tag-wrapper"
        service={[
          'devops-service.application.listByActive',
          'devops-service.devops-git.getTagByPage',
          'devops-service.devops-git.listByAppId',
          'devops-service.devops-git.updateTagRelease',
          'devops-service.devops-git.createTag',
          'devops-service.devops-git.checkTag',
          'devops-service.devops-git.deleteTag',
          'devops-service.devops-git.listByAppId',
          'devops-service.devops-git.createBranch',
          'devops-service.devops-git.update',
          'devops-service.devops-git.delete',
          'devops-service.devops-git.getMergeRequestList',
        ]}
      >
        {appData && appData.length ? <Fragment><Header title={<FormattedMessage id="devCs.head" />}>
          <Select
            filter
            className="c7n-header-select"
            dropdownClassName="c7n-header-select_drop"
            placeholder={formatMessage({ id: 'ist.noApp' })}
            value={appData && appData.length ? DevPipelineStore.getSelectApp : undefined}
            disabled={appData.length === 0}
            filterOption={(input, option) => option.props.children.props.children.props.children
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={(value, option) => this.handleSelect(value, option)}
          >
            <OptGroup label={formatMessage({ id: 'recent' })} key="recent">
              {_.map(DevPipelineStore.getRecentApp, app => <Option key={`recent-${app.id}`} value={app.id} title={app.name}>
                <Tooltip title={app.code}><span className="c7n-ib-width_100">{app.name}</span></Tooltip>
              </Option>)}
            </OptGroup>
            <OptGroup label={formatMessage({ id: 'deploy.app' })} key="app">
              {
                _.map(appData, (app, index) => (
                  <Option value={app.id} key={index} title={app.name}>
                    <Tooltip title={app.code}><span className="c7n-ib-width_100">{app.name}</span></Tooltip>
                  </Option>))
              }
            </OptGroup>
          </Select>
          {appData && appData.length ? (<div className="c7n-dc-create-select">
            <Dropdown overlay={menu} trigger={['click']}>
              <a href="#">
                <Icon type="playlist_add" />
                {formatMessage({ id: 'create' })}
                <Icon type="arrow_drop_down" />
              </a>
            </Dropdown>
          </div>) : null}
          <Button
            type="primary"
            funcType="flat"
            icon="refresh"
            onClick={this.handleRefresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          <div className="c7n-dc-content_1 mb25">
            <div className="page-content-header">
              <div className="title">{appData.length && appId ? `应用"${titleName}"的开发控制台` : `项目"${titleName}"的开发控制台`}</div>
              {appData && appData.length ? <Fragment>
                <div className="c7n-dc-app-code">
                  <FormattedMessage id="ciPipeline.appCode" />：{currentApp ? currentApp.code : ''}
                  {currentApp && currentApp.sonarUrl ? <Tooltip title={<FormattedMessage id="repository.quality" />} placement="bottom">
                    <a className="repo-copy-btn" href={currentApp.sonarUrl} rel="nofollow me noopener noreferrer" target="_blank">
                      <Button shape="circle" size="small" icon="quality" />
                    </a>
                  </Tooltip> : null }
                </div>
                <div className="c7n-dc-url-wrap">
                  <FormattedMessage id="app.url" />：
                  {currentApp && currentApp.repoUrl ? (<a href={currentApp.repoUrl || null} rel="nofollow me noopener noreferrer" target="_blank">
                    <Tooltip title={currentApp.repoUrl}>
                      {`../${currentApp.repoUrl.split('/')[currentApp.repoUrl.split('/').length - 1]}`}
                    </Tooltip>
                  </a>) : ''}
                  {currentApp && currentApp.repoUrl ? <Tooltip title={<FormattedMessage id="repository.copyUrl" />} placement="bottom">
                    <CopyToClipboard
                      text={currentApp.repoUrl || noRepoUrl}
                      onCopy={this.handleCopy}
                    >
                      <Button shape="circle" size="small">
                        <i className="icon icon-library_books" />
                      </Button>
                    </CopyToClipboard>
                  </Tooltip> : null}
                </div>
              </Fragment> : <div className="c7n-tag-empty">
                <Icon type="info" className="c7n-tag-empty-icon" />
                <span className="c7n-tag-empty-text">{formatMessage({ id: `apptag.${empty}.empty` })}</span>
              </div>}
            </div>
            <div className="c7n-dc-data-wrap">
              <div className="commit-number">
                <Link
                  to={{
                    pathname: `/devops/reports/submission`,
                    search: `?type=${type}&id=${projectId}&name=${encodeURIComponent(name)}&organizationId=${orgId}`,
                    state: {
                      backPath: `/devops/dev-console?type=${type}&id=${projectId}&name=${name}&organizationId=${orgId}`,
                      appId: appData && appData.length ? [DevPipelineStore.getSelectApp] : [] },
                  }}
                >
                  { totalCommitsDate ? totalCommitsDate.length : 0}
                </Link>
              </div>
              <div className="c7n-commit-title"><FormattedMessage id="devCs.commit.number" /></div>
            </div>
            <div className="c7n-dc-data-wrap">
              {
                _.map(numberData, item => (<tr className="c7n-data-number" key={item.name}>
                  <td className="c7n-data-number_link">
                    <Link
                      to={{
                        pathname: `/devops/${item.name}`,
                        search: `?type=${type}&id=${projectId}&name=${encodeURIComponent(name)}&organizationId=${orgId}`,
                        state: { backPath: `/devops/dev-console?type=${type}&id=${projectId}&name=${name}&organizationId=${orgId}` },
                      }}
                    >
                      {item.number}
                    </Link>
                  </td>
                  <td>
                    <Icon type={item.icon} />
                    <span><FormattedMessage id={item.message} /></span>
                  </td>
                </tr>))
              }
            </div>
          </div>
          <div className="c7n-dc-content_1 mb16">
            <div className="c7n-dc-card-wrap c7n-dc-card-branch">
              <div className="c7n-dc-card-title">
                <Icon type="branch" />
                <FormattedMessage id="app.branchManage" />
              </div>
              {branchLoading ? <LoadingBar display /> : (this.getBranch())}
            </div>
            <div className="c7n-dc-card-wrap c7n-dc-card-merge">
              <div className="c7n-dc-card-title">
                <Icon type="merge_request" />
                <FormattedMessage id="merge.head" />
              </div>
              {mergeLoading ? <LoadingBar display /> : this.getMergeRequest()}
            </div>
          </div>
          <div className="c7n-dc-card-wrap">
            <div className="c7n-dc-card-title">
              <Icon type="local_offer" />
              <FormattedMessage id="apptag.head" />
            </div>
            {loading || _.isNull(loading) ? <LoadingBar display /> : <Fragment>
              {tagList.length ? <Fragment>
                <Collapse className="c7n-dc-collapse-padding" bordered={false}>{tagList}</Collapse>
                <div className="c7n-tag-pagin">
                  <Pagination
                    total={total}
                    current={current}
                    pageSize={pageSize}
                    onChange={this.handlePaginChange}
                    onShowSizeChange={this.handlePaginChange}
                  />
                </div>
              </Fragment> : (<Fragment>
                {empty === 'tag' ? (
                  <div className="c7n-tag-empty">
                    <Icon type="info" className="c7n-tag-empty-icon" />
                    <span className="c7n-tag-empty-text">{formatMessage({ id: `apptag.${empty}.empty` })}</span>
                    <Button
                      type="primary"
                      funcType="raised"
                      onClick={() => this.displayCreateModal(true, empty)}
                    >
                      <FormattedMessage id="apptag.create" />
                    </Button>
                  </div>
                ) : null}
              </Fragment>)}
            </Fragment>}
          </div>
        </Content>
        <Modal
          confirmLoading={deleteLoading}
          visible={visible}
          title={`${formatMessage({ id: 'apptag.action.delete' })}“${tag}”`}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove} disabled={deleteLoading}>{<FormattedMessage id="cancel" />}</Button>,
            <Button key="submit" type="danger" onClick={this.deleteTag} loading={deleteLoading}>
              {formatMessage({ id: 'delete' })}
            </Button>,
          ]}
        ><p>{formatMessage({ id: 'apptag.delete.tooltip' })}</p></Modal>
        <Modal
          confirmLoading={deleteLoading}
          visible={visibleBranch}
          title={`${formatMessage({ id: 'branch.action.delete' })}“${branchName}”`}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeDeleteBranch} disabled={deleteLoading}>{<FormattedMessage id="cancel" />}</Button>,
            <Button key="submit" type="danger" onClick={this.deleteBranch} loading={deleteLoading}>
              {formatMessage({ id: 'delete' })}
            </Button>,
          ]}
        >
          <p>{formatMessage({ id: 'branch.delete.tooltip' })}</p>
        </Modal>
        {creationDisplay ? <CreateTag
          app={titleName}
          store={AppTagStore}
          show={creationDisplay}
          close={this.displayCreateModal}
        /> : null}
        {editDisplay ? <EditTag
          app={currentAppName}
          store={AppTagStore}
          tag={editTag}
          release={editRelease}
          show={editDisplay}
          close={this.displayEditModal}
        /> : null}
        {createBranch ? <CreateBranch
          name={titleName}
          appId={DevPipelineStore.selectedApp}
          store={BranchStore}
          visible={createBranch}
          onClose={this.closeCreateBranch}
          isDevConsole
        /> : null}
        {editBranch ? <EditBranch
          name={branchName}
          appId={DevPipelineStore.selectedApp}
          store={BranchStore}
          visible={editBranch}
          onClose={this.closeEditBranch}
          isDevConsole
        /> : null}</Fragment> : <DepPipelineEmpty title={<FormattedMessage id="devCs.head" />} type="app" />}
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(DevConsole)));
