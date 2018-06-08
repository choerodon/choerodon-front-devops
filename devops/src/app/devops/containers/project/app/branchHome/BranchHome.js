import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Tooltip, Modal, Table, Popover, Progress } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import classnames from 'classnames';
import '../../../main.scss';
import './BranchHome.scss';
import CreateBranch from '../component/CreateBranch';
import TimePopover from '../../../../components/timePopover';
import Loadingbar from '../../../../components/loadingBar';
import { devConflictMessage, masterConflictMessage, bothConflictMessage } from './CommonConst';

// import BranchStore from '../../../../stores/project/app/branchManage';
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
    const { BranchStore } = this.props;
    const menu = AppState.currentMenuType;
    const { type, organizationId: orgId } = menu;
    const branchColumns = [
      {
        title: Choerodon.languageChange('branch.name'),
        dataIndex: 'name',
        // sorter: (a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'accent' }),
        render: (text, record) => (<div>
          {this.getIcon(record.type)}
          <span>{record.name}</span>
        </div>),
      },
      {
        title: Choerodon.languageChange('branch.type'),
        dataIndex: 'type',
      },
      {
        title: Choerodon.languageChange('branch.code'),
        // width: '25%',
        dataIndex: 'commit.id',
        render: (text, record) => (<Tooltip title={record.commit.id} trigger="hover" placement="bottom">
          <a href={record.commit.url} rel="nofollow me noopener noreferrer" target="_blank">{record.commit.id.slice(0, 8)}</a></Tooltip>),
      },
      {
        title: Choerodon.languageChange('branch.des'),
        // width: '25%',
        dataIndex: 'commit.message',
        render: (text, record) => <Tooltip title={record.commit.message} trigger="hover" placement="bottom"><div className="c7n-table-column">{record.commit.message}</div></Tooltip>,
      },
      {
        title: Choerodon.languageChange('branch.owner'),
        dataIndex: 'commit.authorName',
        render: (text, record) => <Tooltip title={record.commit.authorName} trigger="hover" placement="bottom"><div className="c7n-table-column">{record.commit.authorName}</div></Tooltip>,
      },
      {
        title: Choerodon.languageChange('branch.time'),
        dataIndex: 'commit.committedDate',
        render: (text, record) => <TimePopover content={record.commit.committedDate} />,
      },
      {
        width: 64,
        className: 'operateIcons',
        key: 'action',
        render: (test, record) => (
          <div>
            {record.type !== '开发分支' && record.type !== '主分支' ?
              <Permission projectId={this.state.projectId} organizationId={orgId} type={type} service={record.type === 'feature分支' ? ['devops-service.git-flow.finishFeatureEvent'] : ['devops-service.git-flow.finishEvent']}>
                <Tooltip
                  placement="bottom"
                  title={'结束分支'}
                >
                  <Button shape="circle" onClick={this.confirm.bind(this, record.name, record.type)}>
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
          <span className="c7n-header-table">分支列表</span>
          <Popover
            // trigger="click"
            overlayClassName="branch-popover"
            placement="rightTop"
            content={<section>
              <div>
                <span className="branch-popover-span span-master" />
                <div className="branch-popover-content">
                  <p className="branch-popover-p">
                    master分支
                  </p>
                  <p>
                    即主分支，用于版本持续发布。在开发的整个阶段一直存在，平时不在此分支开发，因此代码比较稳定
                  </p>
                </div>
              </div>
              <div className="c7n-branch-block" >
                <span className="branch-popover-span span-develop" />
                <div className="branch-popover-content">
                  <p className="branch-popover-p">
                    develop分支
                  </p>
                  <p>
                    即开发分支，用于日常开发持续集成。在开发的整个阶段一直存在，在feature分支、release分支和hotfix分支开发后都会将代码合并到此分支上。
                  </p>
                </div>
              </div>
              <div className="c7n-branch-block">
                <span className="branch-popover-span span-feature" />
                <div className="branch-popover-content">
                  <p className="branch-popover-p">
                    feature分支
                  </p>
                  <p>
                    即特性分支，用于日常开发时切出分支进行单功能开发。基于develop分支创建，结束分支时合并至develop分支。
                  </p>
                </div>
              </div>
              <div className="c7n-branch-block">
                <span className="branch-popover-span span-release" />
                <div className="branch-popover-content">
                  <p className="branch-popover-p">
                    release分支
                  </p>
                  <p>
                    即发布分支，用于产品发布、产品迭代。基于develop分支创建，结束分支时合并到develop分支和master分支。
                  </p>
                </div>
              </div>
              <div className="c7n-branch-block">
                <span className="branch-popover-span span-hotfix" />
                <div className="branch-popover-content">
                  <p className="branch-popover-p">
                    hotfix分支
                  </p>
                  <p>
                    即热修分支，用于产品发布后修复缺陷。基于master分支创建，结束分支时合并到master分支和develop分支。
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
        title: Choerodon.languageChange('branch.tag'),
        dataIndex: 'name',
      },
      {
        title: Choerodon.languageChange('branch.code'),
        dataIndex: 'commit.id',
        render: (text, record) => (<a href={record.commit.url} rel="nofollow me noopener noreferrer" target="_blank">{record.commit.id.slice(0, 8)}</a>),
      },
      {
        title: Choerodon.languageChange('branch.des'),
        dataIndex: 'commit.message',
        render: (text, record) => <Tooltip title={record.commit.message} trigger="hover" placement="bottom"><div className="c7n-table-column">{record.commit.message}</div></Tooltip>,
      }, {
        title: Choerodon.languageChange('branch.owner'),
        dataIndex: 'commit.authorName',
      },
      {
        title: Choerodon.languageChange('branch.time'),
        dataIndex: 'commit.committedDate',
        render: (text, record) => <TimePopover content={record.commit.committedDate} />,

      },
    ];
    return (
      <Table
        onChange={this.tableChange}
        pagination={BranchStore.pageInfo}
        filterBar={false}
        title={() => <span className="c7n-header-table">标记列表</span>}
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
    const { BranchStore } = this.props;
    const { projectId, appId } = this.state;
    let content = `是否将分支${name}合并到develop分支？`;
    if (type === 'hotfix分支') {
      BranchStore.getLatestHotfixVersion(projectId, appId, name)
        .then((version) => {
          if (version !== false) {
            content = `是否将分支${name}合并到master，develop分支，并以${version}为版本号？`;
            this.setState({ content });
          }
        });
    } else if (type === 'release分支') {
      BranchStore.getLatestReleaseVersion(projectId, appId, name)
        .then((version) => {
          if (version !== false) {
            content = `是否将分支${name}合并到master，develop分支，并以${version}为版本号？`;
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
    const { appId, projectId, page } = this.state;
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
    let message = '';
    if (mes === 'no_commit' || mes === 'both_no_commit') {
      message = (type === 'feature分支') ? Choerodon.getMessage(`${name}分支无提交，是否删除？`, `${name} branch without commit, whether to delete?`) :
        Choerodon.getMessage(`${name}分支无提交，不生成版本号，是否删除？`, `${name} branch without commit, no version number, whether to delete?`);
    } else if (mes && mes.indexOf('dev_conflict') > -1) {
      message = devConflictMessage(name);
    } else if (mes && mes.indexOf('master_conflict') > -1) {
      message = masterConflictMessage(name);
    } else if (mes === 'both_conflict') {
      message = bothConflictMessage(name);
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
    this.setState({ visible: false, name: null, type: null, content: null });
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
    const { BranchStore } = this.props;
    const menu = AppState.currentMenuType;
    const content = (<Content className="page-content">
      <h2 className="c7n-space-first">应用&quot;{this.state.appName}&quot;的分支管理</h2>
      <p>
        分支是将您的工作从开发主线上分离开来，以免影响开发主线。
        平台采用gitflow分支模型，您可以在此创建分支，然后将代码拉至本地开发后提交代码，再结束分支，平台会为您合并代码并触发相应的持续集成流水线。
        <a href="http://choerodon.io/zh/docs/user-guide/development-pipeline/branch-management/" rel="nofollow me noopener noreferrer" className="c7n-external-link">
          <span className="c7n-external-link-content">
            了解详情
          </span>
          <span className="icon icon-open_in_new" />
        </a>
      </p>
      {this.tableBranch}
      {this.tableTag}
    </Content>);
    return (
      <Page className="c7n-region c7n-branch page-container">
        { BranchStore.loading ? <Loadingbar display /> : (<React.Fragment>
          <Header title={Choerodon.languageChange('branch.title')} backPath={`/devops/app?type=project&id=${menu.id}&name=${menu.name}&organizationId=${menu.organizationId}`}>
            <Permission
              service={['devops-service.git-flow.start']}
            >
              <Tooltip
                title={<div>
                  采用gitflow分支模型，可创建feature、release、hotfix等分支，结束分支时自动触发分支合并和特有的持续集成流水线。
                </div>}
                placement="rightTop"
              >
                <Button
                  ghost
                  onClick={this.showSidebar}
                >
                  <span className="icon icon-playlist_add" />
                  <span>{Choerodon.languageChange('branch.create')}</span>
                </Button>
              </Tooltip>
            </Permission>

            <Permission
              service={['devops-service.git-flow.listByAppId']}
            >
              <Button
                funcType="flat"
                ghost="true"
                onClick={this.handleRefresh}
              >
                <span className="icon icon-refresh" />
                <span>{Choerodon.languageChange('refresh')}</span>
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
          title={this.state.content && <span style={{ color: 'rgba(0, 0, 0, 0.85)', fontWeight: 500 }}>结束分支</span>}
          confirmLoading={this.state.submitting}
          visible={this.state.visible}
          onOk={this.checkBranchStatus}
          onCancel={this.handleCancel}
          okText="确认"
          cancelText="取消"
          footer={this.state.content
            ? [<Button disabled={this.state.submitting} onClick={this.handleCancel}>取消</Button>,
              <Button
                onClick={this.checkBranchStatus}
                type="primary"
                loading={this.state.submitting}
              >确定</Button>]
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

export default withRouter(BranchHome);
