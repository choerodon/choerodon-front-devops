import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Form, Select, Input, Tooltip, Modal, Icon, Upload, Radio } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import _ from 'lodash';
import '../../../main.scss';
import './AppReleaseEdit.scss';
// import './CreateDomain.scss';

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
    const { store, id, visible } = this.props;
  }

  onSelectChange = (selectedRowKeys) => {
    // window.console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };


  /**
   * 关闭弹框
   */
  handleClose =() => {
    const { store } = this.props;
    this.setState({ show: false });
    store.setEnv([]);
    this.props.onClose();
  };


  render() {
    const { store } = this.props;
    const menu = this.props.AppState.currentMenuType;
    const data = [];
    const columns = [{
      title: 'Name',
      dataIndex: 'name',
    }, {
      title: 'Age',
      dataIndex: 'age',
    }, {
      title: 'Address',
      dataIndex: 'address',
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const title = this.state.id ? '修改应用发布' : '创建应用发布';
    const content = this.state.id ? '这些权限会影响此项目及其所有资源修改应用发布' : '这些权限会影响此项目及其所有资源创建应用发布';
    const contentDom = (<div className="c7n-region c7n-domainCreate-wrapper">
      <h2 className="c7n-space-first">在项目&quot;{menu.name}&quot;{title}</h2>
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
      <Table
        scroll={{ y: window.screen.height <= 900 ? 350 : 600 }}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
      />
    </div>);
    return (
      <div className="c7n-region page-container">
        <Sidebar
          okText={this.props.type === 'create' ? '创建' : '保存'}
          cancelText="取消"
          visible={this.props.visible}
          title={this.props.title}
          onCancel={this.handleClose}
          onOk={this.handleSubmit}
          className="c7n-podLog-content"
          confirmloading={this.state.submitting}
        >
          {this.props.visible ? contentDom : null}
        </Sidebar>
      </div>
    );
  }
}

export default withRouter(VersionTable);
