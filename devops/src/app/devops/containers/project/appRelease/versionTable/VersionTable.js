import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Form, Select, Input, Tooltip, Modal, Icon, Upload, Radio } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import _ from 'lodash';
import TimePopover from '../../../../components/timePopover';
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
const ButtonGroup = Button.Group;

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
    const { projectId } = this.props;
    this.props.store.loadAllVersion(projectId, this.props.appId);
  }

  getSidebarTable =() => {
    const { EditReleaseStore } = this.props;
    const data = EditReleaseStore.getVersionData || [{
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
      // getCheckboxProps: record => ({
      //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
      //   name: record.name,
      // }),
      // selections: true,
    };
    return (<Table
      loading={EditReleaseStore.loading}
      pagination={EditReleaseStore.versionPage}
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      rowKey={record => record.id}
    />);
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
    const contentDom = (<div className="c7n-region version-wrapper">
      <h2 className="c7n-space-first">在应用&quot;{this.props.appName}&quot;中的版本信息</h2>
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
      <div className="version-tab">
        <span>查看方式：</span>
        <ButtonGroup>
          <Button
            funcType="flat"
            onClick={this.changeTabs.bind(this, 'instance')}
          >
            仅标记
          </Button>
          <Button
            funcType="flat"
            onClick={this.changeTabs.bind(this, 'singleEnv')}
          >
            全部版本
          </Button>
        </ButtonGroup>
      </div>
      {this.getSidebarTable()}
      <div className="version-selection">
        <div className="version-selection-selected">
          <h2 className="c7n-space-first">已选择的版本</h2>
          <p>sjjjd</p>
        </div>
        <div className="version-selection-selected">
          <h2 className="c7n-space-first">取消的版本</h2>
          <p>kkskkd</p>
        </div>
      </div>
    </div>);
    return (
      contentDom
    );
  }
}

export default withRouter(VersionTable);
