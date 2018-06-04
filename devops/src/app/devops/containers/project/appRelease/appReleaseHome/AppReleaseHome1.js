import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Popover, Modal } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import Permission from 'Permission';
import Remove from 'Remove';
import _ from 'lodash';
import { commonComponent } from '../../../../components/commonFunction';
import '../../../main.scss';
import './AppRelease.scss';
import VersionTable from '../versionTable';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const Sidebar = Modal.Sidebar;

@inject('AppState')
@commonComponent ('AppReleaseStore')
@observer
class AppReleaseHome1 extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      openRemove: false,
      show: false,
      projectId: menu.id,
      upDown: [],
    };
  }
  componentDidMount() {
    const { projectId } = this.state;
    this.loadAllData(this.state.page);
  }

  getColumn = () => {
    const { type, id: orgId } = this.props.AppState.currentMenuType;
    const { upDown } = this.state;
    return [{
      width: '30%',
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      width: '30%',
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }, {
      // width: '410px',
      width: '25%',
      title: '发布层级',
      dataIndex: 'publishLevel',
      key: 'publishLevel',
      sorter: true,
      filters: [],
    }, {
      width: '138px',
      key: 'action',
      className: 'c7n-network-text_top',
      render: record => (
        <div>
          <Popover trigger="hover" placement="bottom" content={<div>修改</div>}>
            <Button shape="circle" funcType="flat" onClick={this.showSidebar.bind(this, record.id)}>
              <span className="icon-mode_edit" />
            </Button>
          </Popover>
          <Popover trigger="hover" placement="bottom" content={<div>版本控制</div>}>
            <Button shape="circle" funcType="flat" onClick={this.showVersions.bind(this, record.id)}>
              <span className="icon-mode_edit" />
            </Button>
          </Popover>
          <Popover trigger="hover" placement="bottom" content={<div>取消应用发布</div>}>
            <Button shape="circle" funcType="flat" onClick={this.openRemove.bind(this, record.id)}>
              <span className="icon-delete_forever" />
            </Button>
          </Popover>
        </div>
      ),
    }];
  } ;
  showSidebar = (ids) => {
    const { name, id, organizationId } = this.props.AppState.currentMenuType;
    if (ids) {
      this.props.history.push(`/devops/app-release/edit/${ids}?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
    } else {
      this.props.history.push(`/devops/app-release/add?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
    }
  };

  showVersions =() => {

  }


  render() {
    const { AppReleaseStore } = this.props;
    const data = AppReleaseStore.allData || [{
      name: 'yesy',
      code: 'yeysu',
      appVersions: [{ version: 'ttyy' }],
      publishLevel: '组织',
      id: 1,
    }];
    return (
      <div className="c7n-region page-container app-release-wrapper">
        <PageHeader title="应用发布">
          <Button
            className="header-btn headLeftBtn leftBtn"
            ghost
            onClick={this.showSidebar.bind(this, '')}
          >
            <span className="icon-playlist_add" />
            <span className="icon-space">创建</span>
          </Button>
          <Button
            className="header-btn headRightBtn leftBtn2"
            ghost
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh" />
            <span className="icon-space">刷新</span>
          </Button>
        </PageHeader>
        <div className="page-content">
          <h2 className="c7n-space-first">项目&quot;{this.props.AppState.currentMenuType.name}&quot;的应用发布 </h2>
          <p>
            这些权限会影响此项目及其所有资源。
            <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/application-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          <Table
            scroll={{ y: this.getHeight() }}
            // filters={['appCode', 'appName', 'version']}
            loading={AppReleaseStore.loading}
            pagination={AppReleaseStore.pageInfo}
            columns={this.getColumn()}
            dataSource={data}
            rowKey={record => record.id}
            onChange={this.tableChange}
          />
        </div>
        <Modal
          visible={this.state.openRemove}
          title="取消应用发布"
          footer={[
            <Button key="back" onClick={this.closeRemove}>取消</Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete}>
              确定
            </Button>,
          ]}
        >
          <p>取消应用发布可能导致某些实例不可用，确定要取消应用发布吗？</p>
        </Modal>
        { this.state.showVersion && <Sidebar
          okText="保存"
          cancelText="取消"
          visible={this.state.show}
          title="版本控制"
          onCancel={this.handleClose}
          onOk={this.handleAddVersion}
          confirmloading={this.state.submitting}
        >
          {'xjjj' && (<div className="c7n-region">
            <h2 className="c7n-space-first">{`对应用${this.props.AppState.currentMenuType.name}的版本控制`}</h2>
            <p>
              这些权限会影响此项目及其所有资源。
              <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/application-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  了解详情
                </span>
                <span className="icon-open_in_new" />
              </a>
            </p>
            <VersionTable appId={this.state.appId} store={AppReleaseStore} />
          </div>)}
        </Sidebar>}
      </div>

    );
  }
}

export default withRouter(AppReleaseHome1);
