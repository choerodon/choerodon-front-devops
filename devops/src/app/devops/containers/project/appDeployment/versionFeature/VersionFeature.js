import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Modal } from 'choerodon-ui';
import LoadingBar from '../../../../components/loadingBar';
import SideBar from '../../../../components/Sidebar';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
import './VersionFeature.scss';

const Sidebar = Modal.Sidebar;

@observer
class VersionFeature extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible,
      loading: false,
      data: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id) {
      const { store, id } = nextProps;
      const menu = JSON.parse(sessionStorage.selectData);
      const projectId = menu.id;
      const type = store.alertType;
      this.setState({ loading: true });
      if (type === 'versionFeature') {
        store.loadVersionFeature(projectId, id)
          .then((data) => {
            this.setState({
              data,
              loading: false,
            });
          }).catch((error) => {
            Choerodon.handleResponseError(error);
          });
      }
    }
  }

  getColumn = () => {
    const menu = '';
    return [{
      title: Choerodon.languageChange('version.feature'),
      dataIndex: 'title',
      key: 'title',
      className: 'c7n-feature-column',
      sorter: (a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN', { sensitivity: 'accent' }),
      render: (text, record) => (<div>
        <span className="c7n-feature-circle" />
        <span className="c7n-feature-title">{record.title}</span>
      </div>),
    }, {
      title: Choerodon.languageChange('version.commit'),
      dataIndex: 'commit',
      key: 'commit',
      className: 'c7n-feature-column',
    }, {
      title: Choerodon.languageChange('version.creator'),
      dataIndex: 'user',
      key: 'user',
      className: 'c7n-feature-column',
      render: (test, record) => (<div>
        <img
          className="c7n-avatar mr7"
          alt="commitUser"
          src={record.imageUrl || 'https://secure.gravatar.com/avatar/0f656b0b09d16bafa95064e7e9bd83bc?s=72&d=identicon'}
        />
        <span>{record.commitUser}</span>
      </div>),
    }, {
      title: Choerodon.languageChange('version.createTime'),
      className: 'c7n-feature-column',
      render: (test, record) => (
        <TimePopover content={record.createdAt}>{record.createdAt}</TimePopover>
      ),
    }];
  } ;


  render() {
    const detailDom = this.state.loading ? <LoadingBar display /> : (<Table
      className="c7n-feature-table"
      pagination={false}
      filterBar={false}
      columns={this.getColumn()}
      dataSource={this.state.data}
      rowKey={record => record.commit}
    />);
    return (
      <Sidebar
        visible={this.props.visible}
        title="查看版本特性"
        okText="取消"
        okCancel={false}
        onOk={this.props.onClose}
        className="c7n-feature-content"
      >
        <div className="c7n-region c7n-feature-wrapper" >
          <h2 className="c7n-space-first">查看版本&quot;{this.props.version}&quot;的特性</h2>
          <p>
            这些权限会影响此项目及其所有资源。
            <a href="http://choerodon.io/zh/docs/user-guide/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">了解详情</span>
            </a>
          </p>
          {detailDom}
        </div>
      </Sidebar>);
  }
}

export default withRouter(VersionFeature);
