import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Button, Select, Modal, Form, Icon, Collapse, Avatar, Pagination, Tooltip, Menu, Dropdown } from 'choerodon-ui';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import LoadingBar from '../../../../components/loadingBar';
import TimePopover from '../../../../components/timePopover/index';
import CreateTag from '../../appTag/createTag';
import EditTag from '../../appTag/editTag';
import '../../../main.scss';
import '../../appTag/appTagHome/AppTagHome.scss';
import './DevConsole.scss';
import DevPipelineStore from '../../../../stores/project/devPipeline';
import AppTagStore from '../../../../stores/project/appTag';

const { AppState } = stores;
const { Option, OptGroup } = Select;
const { Panel } = Collapse;

@observer
class DevConsole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageSize: 10,
      visible: false,
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
  };

  /**
   * 页面内刷新，选择器变回默认选项
   */
  handleRefresh = () => {
    const { page, pageSize } = this.state;
    this.loadTagData(page, pageSize);
  };

  /**
   * 加载应用信息
   */
  loadInitData = () => {
    DevPipelineStore.queryAppData(AppState.currentMenuType.id, 'all');
    this.setState({ appName: null });
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

  render() {
    const { intl: { formatMessage } } = this.props;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const { visible, deleteLoading, creationDisplay, appName, editDisplay, editTag, editRelease, tag } = this.state;
    const appData = DevPipelineStore.getAppData;
    const appId = DevPipelineStore.getSelectApp;
    const tagData = AppTagStore.getTagData;
    const loading = AppTagStore.getLoading;
    const currentAppName = appName || DevPipelineStore.getDefaultAppName;
    const { current, total, pageSize } = AppTagStore.pageInfo;
    const tagList = [];

    const titleName = _.find(appData, ['id', appId]) ? _.find(appData, ['id', appId]).name : name;
    const currentApp = _.find(appData, ['id', appId]);

    const menu = (
      <Menu className="c7n-envow-dropdown-link">
        <Menu.Item
          key="0"
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
              type="primary"
              funcType="flat"
              onClick={() => this.displayCreateModal(true)}
            >
              <FormattedMessage id="apptag.create" />
            </Button>
          </Permission>
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
        ]}
      >
        <Header title={<FormattedMessage id="devCs.head" />}>
          <Select
            filter
            className="c7n-header-select"
            dropdownClassName="c7n-header-select_drop"
            placeholder={formatMessage({ id: 'ist.noApp' })}
            value={DevPipelineStore.getSelectApp}
            disabled={appData.length === 0}
            filterOption={(input, option) => option.props.children.props.children.props.children
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={(value, option) => this.handleSelect(value, option)}
          >
            <OptGroup label={formatMessage({ id: 'recent' })} key="recent">
              {_.map(DevPipelineStore.getRecentApp, app => <Option key={`recent-${app.id}`} value={app.id}>
                <Tooltip title={app.code}><span className="c7n-ib-width_100">{app.name}</span></Tooltip>
              </Option>)}
            </OptGroup>
            <OptGroup label={formatMessage({ id: 'deploy.app' })} key="app">
              {
                _.map(appData, (app, index) => (
                  <Option value={app.id} key={index}>
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
          <div className="c7n-dc-content_1">
            <div className="page-content-header">
              <div className="title">{appData.length && appId ? `应用"${titleName}"的开发控制台` : `项目"${titleName}"的开发控制台`}</div>
              {appData && appData.length ? <Fragment>
                <div>
                  <FormattedMessage id="ciPipeline.appCode" />：{currentApp ? currentApp.code : ''}
                  {currentApp && currentApp.sonarUrl ? <Tooltip title={<FormattedMessage id="repository.quality" />} placement="bottom">
                    <a className="repo-copy-btn" href={currentApp.sonarUrl} rel="nofollow me noopener noreferrer" target="_blank">
                      <Button shape="circle" size="small" icon="quality" />
                    </a>
                  </Tooltip> : null }
                </div>
                <div className="c7n-dc-url-wrap">
                  <FormattedMessage id="app.url" />：{currentApp ? currentApp.repUrl : ''}
                  {currentApp && currentApp.sonarUrl ? <Tooltip title={<FormattedMessage id="repository.copyUrl" />} placement="bottom">
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
                184
            </div>
          </div>
          <div className="c7n-dc-content_1">
            <div className="c7n-dc-card-wrap c7n-dc-card-branch">
              <div className="c7n-dc-card-title">
                <Icon type="branch" />
                <FormattedMessage id="branch.branch" />
              </div>
            </div>
            <div className="c7n-dc-card-wrap c7n-dc-card-merge">
              <div className="c7n-dc-card-title">
                <Icon type="merge_request" />
                <FormattedMessage id="merge.head" />
              </div>
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
        {creationDisplay ? <CreateTag
          app={currentAppName}
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
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(DevConsole)));
