import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Form, Select, Input, Tooltip, Modal, Icon, Upload, Radio, Tabs } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
import './EditVersion.scss';

const TabPane = Tabs.TabPane;
const { AppState } = stores;

@observer
class EditVersion extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
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
      filterBarPlaceholder={'过滤表'}
      onChange={this.versionTableChange}
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
    }, {
      title: '发布时间',
      render: (text, record) => <TimePopover content={record.updatedDate} />,
    }];
    return (<Table
      filterBarPlaceholder={'过滤表'}
      loading={EditVersionStore.loading}
      pagination={EditVersionStore.pageInfo}
      columns={columns}
      dataSource={data}
      onChange={this.versionTableChange}
      rowKey={record => record.id}
    />);
  }
  /**
   * table app表格搜索
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  versionTableChange =(pagination, filters, sorter, paras) => {
    const { EditVersionStore } = this.props;
    const menu = AppState.currentMenuType;
    const organizationId = menu.id;
    const sort = { field: 'id', order: 'desc' };
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
    let page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
      page = 0;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    EditVersionStore
      .loadData({
        page,
        size: pagination.pageSize,
        projectId: organizationId,
        sorter: sort,
        postData,
        key: this.state.key,
        id: this.state.id,
      });
  };
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
    const menu = AppState.currentMenuType;
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
  /**
   * 打开弹框
   */
  handleOpen = () => {
    this.setState({ visible: true });
  }
  /**
   * 关闭弹框
   */
  handleClose = () => {
    this.setState({ visible: false });
  }
  render() {
    const menu = AppState.currentMenuType;
    const { key } = this.state;
    return (
      <Page className="c7n-region">
        <Header title="查看应用版本" backPath={`/devops/app-release/2?type=${menu.type}&id=${menu.id}&name=${menu.name}&organizationId=${menu.organizationId}`} />
        <Content>
          <h2 className="c7n-space-first">查看应用&quot;{this.state.name}&quot;的版本 </h2>
          <p>
            您可以在此查看未发布及已发布的版本，且可以发布未发布的版本。
            <a href="http://choerodon.io/zh/docs/user-guide/development-pipeline/application-release/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon icon-open_in_new" />
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
              <Button className="release-button-margin" type="primary" funcType="raised" onClick={this.handleOpen}>发布</Button>
            </Permission>
            <Button funcType="raised" onClick={this.handleBack}>取消</Button>
          </React.Fragment> : null}
        </Content>
        <Modal
          visible={this.state.visible}
          title="确认发布版本"
          footer={[
            <Button key="back" disabled={this.state.submitting} onClick={this.handleClose}>取消</Button>,
            <Button key="submit" loading={this.state.submitting} type="primary" onClick={this.handleOk}>
              发布
            </Button>,
          ]}
        >
          <p>版本发布后不可取消，确定要发布吗？</p>
        </Modal>
      </Page>
    );
  }
}

export default withRouter(EditVersion);
