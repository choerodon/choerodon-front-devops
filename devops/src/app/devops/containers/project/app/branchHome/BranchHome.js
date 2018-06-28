import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Tooltip, Modal, Table, Popover, Progress } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import classnames from 'classnames';
import { injectIntl, FormattedMessage } from 'react-intl';
import '../../../main.scss';
import './BranchHome.scss';
import CreateBranch from '../component/CreateBranch';
import TimePopover from '../../../../components/timePopover';
import Loadingbar from '../../../../components/loadingBar';

const { AppState } = stores;

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
    };
  }

  componentDidMount() {
    this.loadData();
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  /**
   * 获取列表的icon
   * @param type 分支类型
   * @returns {*}
   */
  getIcon =(type) => {
    let icon;
    switch (type) {
      case 'feature分支':
        icon = <span className="c7n-branch-icon icon-feature">F</span>;
        break;
      case '开发分支':
        icon = <span className="c7n-branch-icon icon-develop">D</span>;
        break;
      case 'hotfix分支':
        icon = <span className="c7n-branch-icon icon-hotfix">H</span>;
        break;
      case '主分支':
        icon = <span className="c7n-branch-icon icon-master">M</span>;
        break;
      default:
        icon = <span className="c7n-branch-icon icon-release">R</span>;
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
        dataIndex: 'name',
        render: (text, record) => (<div>
          {this.getIcon(record.type)}
          <span>{record.name}</span>
        </div>),
      },
      {
        title: <FormattedMessage id="branch.type" />,
        dataIndex: 'type',
      },
      {
        title: <FormattedMessage id="branch.code" />,
        dataIndex: 'commit.id',
        render: (text, record) => (<Tooltip title={record.commit.id} trigger="hover" placement="bottom">
          <a href={record.commit.url} rel="nofollow me noopener noreferrer" target="_blank">{record.commit.id.slice(0, 8)}</a></Tooltip>),
      },
      {
        title: <FormattedMessage id="branch.des" />,
        dataIndex: 'commit.message',
        render: (text, record) => <Tooltip title={record.commit.message} trigger="hover" placement="bottom"><div className="c7n-table-column">{record.commit.message}</div></Tooltip>,
      },
      {
        title: <FormattedMessage id="branch.owner" />,
        dataIndex: 'commit.authorName',
        render: (text, record) => <Tooltip title={record.commit.authorName} trigger="hover" placement="bottom"><div className="c7n-table-column">{record.commit.authorName}</div></Tooltip>,
      },
      {
        title: <FormattedMessage id="branch.time" />,
        dataIndex: 'commit.committedDate',
        render: (text, record) => <TimePopover content={record.commit.committedDate} />,
      },
      {
        align: 'right',
        className: 'operateIcons',
        key: 'action',
        render: (test, record) => (
          <div>
            {record.type !== '开发分支' && record.type !== '主分支' ?
              <Permission projectId={this.state.projectId} organizationId={orgId} type={type} service={record.type === 'feature分支' ? ['devops-service.git-flow.finishFeatureEvent'] : ['devops-service.git-flow.finishEvent']}>
                <Tooltip
                  placement="bottom"
                  title={<FormattedMessage id="branch.over" />}
                >
                  <Button size={'small'} shape="circle" onClick={this.confirm.bind(this, record.name, record.type)}>
                    <span className="icon icon-power_settings_new" />
                  </Button>
                </Tooltip>
              </Permission>
              : null
            }
          </div>
        ),
      },
    ];
    return (
      <Table
        filterBar={false}
        className="c7n-branch-table"
        rowClassName="c7n-branch-tr"
        title={() => (<div>
          <span className="c7n-header-table">
            <FormattedMessage id="branch.list" />
          </span>
          <Popover
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
              <div className="c7n-branch-block" >
                <span className="branch-popover-span span-develop" />
                <div className="branch-popover-content">
                  <p className="branch-popover-p">
                    <FormattedMessage id="branch.develop" />
                  </p>
                  <p>
                    <FormattedMessage id="branch.developDes" />
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
            </section>}
          >
            <span className="icon icon-help branch-icon-help" />
          </Popover>
        </div>)}
        pagination={false}
        columns={branchColumns}
        dataSource={BranchStore.getBranchData}
        rowKey={record => record.name}
      />
    );
  }
  /**
   * 获取屏幕的高度
   * @returns {number}
   */
  getHeight = () => {
    const screenHeight = window.screen.height;
    let height = 310;
    if (screenHeight <= 800) {
      height = 310;
    } else if (screenHeight > 800 && screenHeight <= 900) {
      height = 450;
    } else if (screenHeight > 900 && screenHeight <= 1050) {
      height = 600;
    } else {
      height = 630;
    }
    return height;
  };

  /**
   * 获取标记列表
   * @returns {*}
   */
  get tableTag() {
    const { BranchStore } = this.props;
    const tagColumns = [
      {
        title: <FormattedMessage id="branch.tag" />,
        dataIndex: 'name',
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
      <Table
        onChange={this.tableChange}
        pagination={BranchStore.pageInfo}
        filterBar={false}
        title={() => <span className="c7n-header-table"><FormattedMessage id="branch.tagList" /></span>}
        columns={tagColumns}
        dataSource={BranchStore.getTagData}
        rowKey={record => record.id}
      />
    );
  }

  /**
   * 获取结束分支的提示内容
   * @param name 分支名
   * @param type 分支类型
   */
  getContent =(name, type) => {
    const { BranchStore, intl } = this.props;
    const { projectId, appId } = this.state;
    let content = intl.formatMessage({ id: 'branch.mergeDev' }, {
      name: `${name}`,
    });
    if (type === 'hotfix分支') {
      BranchStore.getLatestHotfixVersion(projectId, appId, name)
        .then((version) => {
          if (version !== false) {
            content =
              intl.formatMessage({ id: 'branch.mergeDevMas' }, {
                name: `${name}`,
                version: `${version}`,
              });
            this.setState({ content });
          }
        });
    } else if (type === 'release分支') {
      BranchStore.getLatestReleaseVersion(projectId, appId, name)
        .then((version) => {
          if (version !== false) {
            content =
              intl.formatMessage({ id: 'branch.mergeDevMas' }, {
                name: `${name}`,
                version: `${version}`,
              });
            this.setState({ content });
          }
        });
    } else {
      this.setState({ content });
    }
  };
  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  tableChange =(pagination, filters, sorter) => {
    const { BranchStore } = this.props;
    const { projectId, appId } = this.state;
    this.setState({ page: pagination.current });
    BranchStore
      .loadTagData(projectId, appId, pagination.current - 1, pagination.pageSize);
  };
  /**
   * 获取分支和标记列表
   */
  loadData = () => {
    const { appId, projectId } = this.state;
    const { BranchStore } = this.props;
    BranchStore.loadAllData(projectId, appId, 0);
  };

  /**
   * 结束分支确认框
   * @param name 分支名
   * @param type 分支类型
   */
  confirm = (name, type) => {
    this.setState({ name, type });
    this.getContent(name, type);
    this.setState({ visible: true });
  };
  /**
   * 获取分支可合并的状态
   */
  checkBranchStatus =() => {
    const { BranchStore } = this.props;
    const { appId, projectId, statusMessage, name, type } = this.state;
    // 无提交
    if (statusMessage && statusMessage.indexOf('conflict') === -1) {
      this.finishBranch(name, type);
    }
    this.setState({ submitting: true });
    BranchStore.getBranchMergeStaus(projectId, appId, name)
      .then((mes) => {
        this.setState({
          statusMessage: mes,
          submitting: false,
        });
        // 有提交没冲突
        if (mes && mes.indexOf('conflict') === -1 && mes !== 'no_commit' && mes !== 'both_no_commit') {
          this.finishBranch(name, type);
        } else {
          this.changeModalContent(mes, name, type);
        }
      }).catch((error) => {
        this.setState({ submitting: false });
      });
  };
  /**
   * 结束分支弹框的内容
   * @param mes 内容
   * @param name 分支名
   * @param type 分支类型
   */
  changeModalContent =(mes, name, type) => {
    const { intl } = this.props;
    let message = '';
    if (mes === 'no_commit' || mes === 'both_no_commit') {
      message = (type === 'feature分支') ? intl.formatMessage({ id: 'branch.noCommitDev' }, {
        name: `${name}`,
      }) :
        intl.formatMessage({ id: 'branch.noCommit' }, {
          name: `${name}`,
        });
    } else if (mes && mes.indexOf('dev_conflict') > -1) {
      message = intl.formatMessage({ id: 'branch.devConflictMes' }, {
        name: `${name}`,
      });
    } else if (mes && mes.indexOf('master_conflict') > -1) {
      message = intl.formatMessage({ id: 'branch.devConflictMes' }, {
        name: `${name}`,
      });
    } else if (mes === 'both_conflict') {
      message = intl.formatMessage({ id: 'branch.bothConflictMes' }, {
        name: `${name}`,
      });
    }
    this.setState({
      content: message,
    });
  };
  /**
   * 结束分支
   * @param name 分支名
   * @param type 分支类型
   */
  finishBranch =(name, type) => {
    const { BranchStore } = this.props;
    const { appId, projectId } = this.state;
    this.setState({ submitting: true });
    if (type === 'feature分支') {
      BranchStore.finishFeature(projectId, appId, name)
        .then((d) => {
          if (d !== false) {
            this.setState({ visible: false, content: null, statusMessage: null });
            this.timer = setTimeout(
              () => this.loadData(),
              1500);
          }
          this.setState({ submitting: false });
          // this.loadData();
        }).catch((error) => {
          this.setState({ submitting: false, statusMessage: null });
        });
    } else {
      BranchStore.finishBranch(projectId, appId, name)
        .then((datas) => {
          this.setState({ visible: false, content: null, statusMessage: null });
          if (datas) {
            this.timer = setTimeout(
              () => this.loadData(),
              1500);
          }
          this.setState({ submitting: false });
        }).catch((error) => {
          this.setState({ submitting: false, statusMessage: null });
        });
    }
  };
  /**
   * 刷新
   */
  handleRefresh =() => {
    this.loadData();
  };
  /**
   * 关闭弹框
   */
  handleCancel =() => {
    this.setState({ visible: false, name: null, type: null, content: null, statusMessage: null });
  };

  /**
   * 创建分支的弹框
   */
  showSidebar = () => {
    const { BranchStore } = this.props;
    const { projectId, appId } = this.state;
    BranchStore.getLatestReleaseVersion(projectId, appId);
    BranchStore.setCreateBranchShow(true);
  };

  /**
   * 关闭sidebar
   */
  hideSidebar = () => {
    const { BranchStore } = this.props;
    BranchStore.setCreateBranchShow(false);
    this.loadData();
  };

  render() {
    const { BranchStore, intl } = this.props;
    const menu = AppState.currentMenuType;
    const content = (<Content className="page-content">
      <h2 className="c7n-space-first">
        <FormattedMessage
          id="branch.head"
          values={{
            name: `${this.state.appName}`,
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
      {this.tableBranch}
      {this.tableTag}
    </Content>);
    return (
      <Page
        className="c7n-region c7n-branch"
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
        { BranchStore.loading ? <Loadingbar display /> : (<React.Fragment>
          <Header
            title={<FormattedMessage id="branch.title" />}
            backPath={`/devops/app?type=project&id=${menu.id}&name=${menu.name}&organizationId=${menu.organizationId}`}
          >
            {BranchStore.getBranchData.length ? <Permission
              service={['devops-service.git-flow.start']}
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
            <Permission
              service={['devops-service.git-flow.listByAppId']}
            >
              <Button
                funcType="flat"
                ghost="true"
                onClick={this.handleRefresh}
              >
                <span className="icon icon-refresh" />
                <FormattedMessage id="refresh" />
              </Button>
            </Permission>
          </Header>
          {content}
        </React.Fragment>) }
        <Modal
          wrapClassName={classnames({
            'c7n-branch-modal': !this.state.content,
          })}
          maskClosable={false}
          closable={false}
          title={this.state.content && <span style={{ color: 'rgba(0, 0, 0, 0.85)', fontWeight: 500 }}><FormattedMessage id="branch.over" /></span>}
          confirmLoading={this.state.submitting}
          visible={this.state.visible}
          onOk={this.checkBranchStatus}
          onCancel={this.handleCancel}
          okText={<FormattedMessage id="finish" />}
          cancelText={<FormattedMessage id="cancel" />}
          footer={this.state.content
            ? [<Button disabled={this.state.submitting} onClick={this.handleCancel}>{intl.formatMessage({ id: 'cancel' })}</Button>,
              <Button
                onClick={this.checkBranchStatus}
                type="primary"
                loading={this.state.submitting}
              >
                {intl.formatMessage({ id: 'finish' })}
              </Button>]
            : null}
        >
          <p style={{ whiteSpace: 'pre-wrap',
            lineHeight: '20px' }}
          >
            {this.state.content || <Progress type="loading" className="c7n-branch-progress" />}
          </p>
        </Modal>
        {BranchStore.createBranchShow && <CreateBranch
          name={this.state.appName}
          appId={this.state.appId}
          store={BranchStore}
          visible={BranchStore.createBranchShow}
          onClose={this.hideSidebar}
        /> }
      </Page>
    );
  }
}

export default withRouter(injectIntl(BranchHome));
