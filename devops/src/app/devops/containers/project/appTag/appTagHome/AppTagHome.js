import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Button, Select, Modal, Form, Icon, Collapse, Avatar, Pagination, Tooltip } from 'choerodon-ui';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
import LoadingBar from '../../../../components/loadingBar';
import TimePopover from '../../../../components/timePopover/index';
import CreateTag from '../createTag/CreateTag';
import EditTag from '../editTag/EditTag';
import '../../../main.scss';
import './AppTagHome.scss';

const { AppState } = stores;
const { Option, OptGroup } = Select;
const { Panel } = Collapse;

@observer
class AppTagHome extends Component {
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
    const { AppTagStore } = this.props;
    AppTagStore.setSelectApp(null);
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
    const { AppTagStore } = this.props;
    this.setState({ page: 0, pageSize: 10, appName: option.props.children });
    AppTagStore.setSelectApp(id);
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
    const { AppTagStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    AppTagStore.queryAppData(projectId);
    this.setState({ appName: null });
  };

  /**
   * 加载刷新tag列表信息
   * @param page
   * @param pageSize
   */
  loadTagData = (page = 0, pageSize = 10) => {
    const { AppTagStore } = this.props;
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
  }

  /**
   * 关闭删除确认框
   */
  closeRemove = () => this.setState({ visible: false });

  /**
   * 删除tag
   */
  deleteTag = () => {
    const { AppTagStore } = this.props;
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
    const { intl: { formatMessage }, AppTagStore, form } = this.props;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const { visible, deleteLoading, creationDisplay, appName, editDisplay, editTag, editRelease } = this.state;
    const appData = AppTagStore.getAppData;
    const tagData = AppTagStore.getTagData;
    const loading = AppTagStore.getLoading;
    const currentAppName = appName || AppTagStore.getDefaultAppName;
    const { current, total, pageSize } = AppTagStore.pageInfo;
    const tagList = [];
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
    const noTag = (<div className="c7n-tag-empty">
      <div>
        <Icon type="info" className="c7n-tag-empty-icon" />
        <span className="c7n-tag-empty-text">{formatMessage({ id: 'apptag.empty' })}</span>
      </div>
      <Button
        type="primary"
        funcType="raised"
        onClick={() => this.displayCreateModal(true)}
      >
        <FormattedMessage id="apptag.create" />
      </Button>
    </div>);
    return (
      <Page
        className="c7n-tag-wrapper"
        service={[
          'devops-service.application.listByActive',
          'devops-service.devops-git.getTagByPage',
          'devops-service.devops-git.listByAppId',
          'devops-service.devops-git.createTag',
          'devops-service.devops-git.checkTag',
          'devops-service.devops-git.deleteTag',
        ]}
      >
        <Header title={<FormattedMessage id="apptag.head" />}>
          {appData && appData.length ? (
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
                icon="playlist_add"
                onClick={() => this.displayCreateModal(true)}
              >
                <FormattedMessage id="apptag.create" />
              </Button>
            </Permission>
          ) : null}
          <Button
            type="primary"
            funcType="flat"
            icon="refresh"
            onClick={this.handleRefresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="apptag" value={{ name }}>
          <Select
            filter
            className="c7n-select_512"
            value={AppTagStore.getSelectApp}
            label={formatMessage({ id: 'chooseApp' })}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={(value, option) => this.handleSelect(value, option)}
          >
            {
              _.map(appData, app => <Option key={app.id} value={app.id}>{app.name}</Option>)
            }
          </Select>
          <h4 className="c7n-tag-table"><FormattedMessage id="apptag.table" /></h4>
          {loading || _.isNull(loading) ? <LoadingBar display /> : <Fragment>
            {tagList.length ? <Fragment>
              <Collapse bordered={false}>{tagList}</Collapse>
              <div className="c7n-tag-pagin">
                <Pagination
                  total={total}
                  current={current}
                  pageSize={pageSize}
                  onChange={this.handlePaginChange}
                  onShowSizeChange={this.handlePaginChange}
                />
              </div>
            </Fragment> : noTag}
          </Fragment>}
        </Content>
        <Modal
          confirmLoading={deleteLoading}
          visible={visible}
          title={<FormattedMessage id="apptag.action.delete" />}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove}>{<FormattedMessage id="cancel" />}</Button>,
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

export default Form.create({})(withRouter(injectIntl(AppTagHome)));
