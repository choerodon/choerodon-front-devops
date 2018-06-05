import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Form, Select, Input, Tooltip, Modal, Icon, Upload, Radio, Tabs } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import _ from 'lodash';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
// import './CreateDomain.scss';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 26 },
  },
};
const { TextArea } = Input;
const ButtonGroup = Button.Group;
const Sidebar = Modal.Sidebar;
@inject('AppState')
@observer
class VersionTable extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      id: props.match.params.id || '',
      projectId: menu.id,
      show: false,
      selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const { projectId } = this.state;
    const app = this.props.store.app;
    this.handleSelectData();
    this.props.store.loadAllVersion({ projectId, appId: app.id });
  }


  /**
   * 获取未发布版本
   * @returns {*}
   */
  getSidebarTable =() => {
    const { store } = this.props;
    const data = store.getVersionData || [{
      id: 1,
      appName: 'ssd',
      creationDate: '2018-05-22 11:19:41',
    }, {
      id: 2,
      appName: 'ssdeee',
      creationDate: '2018-05-22 11:19:41',
    }];
    const columns = [{
      title: '版本',
      dataIndex: 'version',
    }, {
      title: '生成时间',
      // dataIndex: 'creationDate',
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys || [],
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows, selectedRowKeys });
      },
    };
    return (<Table
      loading={store.loading}
      pagination={store.versionPage}
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      rowKey={record => record.id}
    />);
  };
  handleSelectData =() => {
    const selectData = _.map(this.props.store.selectData, 'id') || [];
    this.setState({ selectedRowKeys: selectData });
  }
  handleClose = () => {
    this.props.store.changeShow(false);
  }
  /**
   * 切换tabs
   * @param value
   */
  changeTabs = (value) => {
    this.setState({ key: value });
    this.props.store
      .loadAllVersion({ projectId: this.state.projectId, appId: this.props.appId, key: value });
  }

  handleAddVersion = () => {
    const { selectedRows } = this.state;
    this.props.store.setSelectData(selectedRows);
    this.props.store.changeShow(false);
  };

  render() {
    const { store } = this.props;
    const menu = this.props.AppState.currentMenuType;
    const content = '您可以在此查看未发布及已发布的版本，且可以发布未发布的版本。';
    const contentDom = (<div className="c7n-region version-wrapper">
      <h2 className="c7n-space-first">添加应用&quot;{store.app && store.app.name}&quot;发布的版本</h2>
      <p>
        {content}
        <a
          href="http://c7n.saas.hand-china.com/docs/devops/develop/"
          rel="nofollow me noopener noreferrer"
          target="_blank"
          className="c7n-external-link"
        >
          <span className="c7n-external-link-content">
              了解详情
          </span>
          <span className="icon-open_in_new" />
        </a>
      </p>
      {this.getSidebarTable()}
    </div>);
    return (
      <Sidebar
        okText="添加"
        cancelText="取消"
        visible={this.props.show}
        title="添加应用版本"
        onCancel={this.handleClose}
        onOk={this.handleAddVersion}
      >
        {contentDom}
      </Sidebar>
    );
  }
}

export default withRouter(VersionTable);
