import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Form, Select, Input, Tooltip, Modal, Icon, Upload, Radio, Tabs } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import Permission from 'PerComponent';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
import './EditVersion.scss';

const TabPane = Tabs.TabPane;
@inject('AppState')
@observer
class EditVersion extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      name: props.match.params.name || '',
      id: props.match.params.id || '',
      projectId: menu.id,
      show: false,
      selectedRowKeys: [],
      key: '1',
    };
  }

  componentDidMount() {
    const { projectId } = this.state;
    const { EditVersionStore } = this.props;
    EditVersionStore.loadData({ projectId, id: this.state.id });
  }

  /**
   * 获取未发布版本
   * @returns {*}
   */
  getSidebarTable =() => {
    const { EditVersionStore } = this.props;
    const data = EditVersionStore.allData;
    const columns = [{
      title: '版本',
      dataIndex: 'version',
    }, {
      title: '生成时间',
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys || [],
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows, selectedRowKeys });
      },
    };
    return (<Table
      loading={EditVersionStore.loading}
      pagination={EditVersionStore.pageInfo}
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      rowKey={record => record.id}
    />);
  };
  /**
   * 获取已发布版本
   * @returns {*}
   */
  getPublishTable = () => {
    const { EditVersionStore } = this.props;
    const data = EditVersionStore.allData;
    const columns = [{
      title: '版本',
      dataIndex: 'version',
    }, {
      title: '生成时间',
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }];
    return (<Table
      loading={EditVersionStore.loading}
      pagination={EditVersionStore.pageInfo}
      columns={columns}
      dataSource={data}
      rowKey={record => record.id}
    />);
  }
  /**
   * 切换tabs
   * @param value
   */
  changeTabs = (value) => {
    const { EditVersionStore } = this.props;
    this.setState({ key: value });
    EditVersionStore
      .loadData({ projectId: this.state.projectId, id: this.state.id, key: value });
  }
  /**
   * 返回上一级目录
   */
  handleBack =() => {
    const menu = this.props.AppState.currentMenuType;
    const { id, name, organizationId } = menu;
    this.props.history.push(`/devops/app-release/2?type=project&id=${id}&name=${name}&organizationId=${organizationId}`);
  }
  /**
   * 发布应用版本
   */
  handleOk = () => {
    const { selectedRows, id } = this.state;
    const { EditVersionStore } = this.props;
    this.setState({ submitting: true });
    EditVersionStore.updateData(this.state.projectId, id, selectedRows)
      .then((data) => {
        if (data) {
          this.setState({ submitting: false });
          this.handleBack();
        }
      }).catch((err) => {
        this.setState({ submitting: false });
        Choerodon.prompt(err.response.message);
      });
  }
  render() {
    const menu = this.props.AppState.currentMenuType;
    const { key } = this.state;
    return (
      <div className="c7n-region page-container">
        <PageHeader title="查看应用版本" backPath={`/devops/app-release/2?type=${menu.type}&id=${menu.id}&name=${menu.name}&organizationId=${menu.organizationId}`} />
        <div className="page-content">
          <h2 className="c7n-space-first">查看应用&quot;{this.state.name}&quot;的版本 </h2>
          <p>
            您可以在此查看未发布及已发布的版本，且可以发布未发布的版本。
            <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/application-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          <Tabs defaultActiveKey={this.state.key || '1'} onChange={this.changeTabs}>
            <TabPane tab="未发布版本" key="1">
              <div className="version-table-wrap">
                {this.getSidebarTable()}
              </div>
            </TabPane>
            <TabPane tab="已发布版本" key="2">
              <div className="version-table-wrap">
                {this.getPublishTable()}
              </div>
            </TabPane>
          </Tabs>
          {key === '1' ? <React.Fragment>
            <div className="c7n-appRelease-hr" />
            <Permission service={['devops-service.application-market.updateVersions']}>
              <Button className="release-button-margin" type="primary" funcType="raised" onClick={this.handleOk}>发布</Button>
            </Permission>
            <Button funcType="raised" onClick={this.handleBack}>取消</Button>
          </React.Fragment> : null}
        </div>
      </div>
    );
  }
}

export default withRouter(EditVersion);
