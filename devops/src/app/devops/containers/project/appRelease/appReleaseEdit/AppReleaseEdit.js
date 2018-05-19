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
class AppReleaseEdit extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      id: props.match.params.id || '',
      projectId: menu.id,
      show: false,
    };
  }
  componentDidMount() {
    const { store, id, visible } = this.props;
  }
  getTable =() => {
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
    return <Table columns={columns} dataSource={data} />;
  };
  /**
   * 检查域名是否符合规则
   * @type {Function}
   */
  checkDomain =_.debounce((rule, value, callback) => {
    const p = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*/;
    if (p.test(value)) {
      callback();
    } else {
      callback('域名只能包含字母，数字、"-"、"."');
    }
  }, 500);
  /**
   * 提交数据
   * @param e
   */
  handleSubmit =(e) => {
    e.preventDefault();
    const { store, id, type } = this.props;
    const { projectId } = this.state;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const keys = Object.keys(data);
        const postData = { domain: data.domain, name: data.name, envId: data.envId };
        const devopsDomainAttrDTOS = [];
        keys.map((k) => {
          if (k.includes('path')) {
            const index = parseInt(k.split('-')[1], 10);
            devopsDomainAttrDTOS.push({ path: `${data[k]}`, serviceDeployId: data[`network-${index}`] });
          }
          return devopsDomainAttrDTOS;
        });
        postData.devopsDomainAttrDTOS = devopsDomainAttrDTOS;
        // window.console.log(postData);
        if (type === 'create') {
          this.setState({ submitting: true });
          store.addData(projectId, postData)
            .then(() => {
              this.setState({ submitting: false });
              this.handleClose();
            }).catch(() => {
              this.setState({ submitting: false });
              Choerodon.prompt(err.response.data.message);
            });
        } else {
          postData.domainId = id;
          this.setState({ submitting: true });
          store.updateData(projectId, id, postData)
            .then(() => {
              this.setState({ submitting: false });
              this.handleClose();
            }).catch(() => {
              this.setState({ submitting: false });
              Choerodon.prompt(err.response.data.message);
            });
        }
      }
    });
  };


  render() {
    const { store } = this.props;
    const { getFieldDecorator } = this.props.form;
    const menu = this.props.AppState.currentMenuType;
    const env = [];
    const fileProps = {
      name: 'file',
      action: '//jsonplaceholder.typicode.com/posts/',
      headers: {
        authorization: 'authorization-text',
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          // console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          // message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          // message.error(`${info.file.name} file upload failed.`);
        }
      },
    };
    const form = this.props.form;
    const { SingleData } = this.state;
    const title = this.state.id ? '修改应用发布' : '创建应用发布';
    const content = this.state.id ? '这些权限会影响此项目及其所有资源修改应用发布' : '这些权限会影响此项目及其所有资源创建应用发布';
    const contentDom = (<div className="c7n-region c7n-domainCreate-wrapper">
      <h2 className="c7n-space-first">在项目&quot;{menu.name}&quot;{title}</h2>
      <p>
        {content}
        <a href="http://choerodon.io/zh/docs/user-guide/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
          <span className="c7n-external-link-content">
              了解详情
          </span>
          <span className="icon-open_in_new" />
        </a>
      </p>
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('appId', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              transform: value => value.toString(),
            }, {
              // validator: this.checkCode,
            }],
            initialValue: SingleData ? SingleData.envId : undefined,
          })(
            <Select
              className="c7n-sidebar-form"
              filter
              // onSelect={this.selectEnv}
              showSearch
              label="选择应用"
              optionFilterProp="children"
              // onChange={handleChange}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {env.length && env.map(v => (
                <Option value={v.id} key={`${v.id}-app`}>
                  <Tooltip title={v.code} placement="right" trigger="hover">
                    {v.name}
                  </Tooltip>
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('level', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              transform: value => value.toString(),
            }, {
              // validator: this.checkCode,
            }],
            initialValue: SingleData ? SingleData.envId : undefined,
          })(
            <RadioGroup name="level" defaultValue="organization">
              <Radio value="organization">本组织</Radio>
              <Radio value="site">全平台</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <span className="c7n-appRelease-span-title">应用信息</span><span className="icon-help help-icon" />
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkName,
            }],
            initialValue: SingleData ? SingleData.name : '',
          })(
            <Input
              label={Choerodon.getMessage('应用名称', 'name')}
              size="default"
              // placeholder={Choerodon.getMessage('域名', 'domain')}
            />,
          )}
        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('creator', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.domain : '',
          })(
            <Input
              label={Choerodon.getMessage('贡献者', 'creator')}
              size="default"
              // placeholder={Choerodon.getMessage('域名路径', 'domain path')}
            />,
          )}
        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('type', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.domain : '',
          })(
            <Select
              disabled={!this.state.versionId}
              label={Choerodon.getMessage('分类', 'type')}
              showSearch
              // notFoundContent="该版本下还没有实例"
              mode="multiple"
              dropdownMatchSelectWidth
              size="default"
              optionFilterProp="children"
              optionLabelProp="children"
              filterOption={
                (input, option) =>
                  option.props.children.props.children.props.children
                    .toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {env.length && env.map(v => (
                <Option value={v.id} key={`${v.id}-app`}>
                  <Tooltip title={v.code} placement="right" trigger="hover">
                    {v.name}
                  </Tooltip>
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('description', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.domain : '',
          })(
            <TextArea
              label={Choerodon.languageChange('template.description')}
              autosize={{ minRows: 2, maxRows: 6 }}
            />,
          )}
        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          <Button onClick={this.handleSelectVersion}>添加版本</Button>

        </FormItem>
        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {this.getTable()}
        </FormItem>

        <FormItem
          className="c7n-sidebar-form"
          {...formItemLayout}
        >
          {getFieldDecorator('description', {
            rules: [{
              required: true,
              whitespace: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.domain : '',
          })(
            <Upload {...fileProps}>
              <Button>
                <Icon type="file_upload" /> Click to Upload
              </Button>
            </Upload>,
          )}
        </FormItem>
      </Form>
    </div>);
    return (
      <div className="c7n-region page-container">
        <PageHeader title="创建应用发布">
          <Button
            className="header-btn headRightBtn leftBtn2"
            ghost
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh" />
            <span className="icon-space">刷新</span>
          </Button>
        </PageHeader>
        <div className="page-content c7n-appRelease-wrapper">
          <Sidebar
            cancelText="取消"
            visible
            title="创建应用发布"
            onCancel={this.handleClose}
            onOk={this.handleSubmit}
            className="c7n-podLog-content"
            confirmloading={this.state.submitting}
          >
            {contentDom}
          </Sidebar>
        </div>
        { this.state.show && (<Sidebar
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
        </Sidebar>) }
      </div>
    );
  }
}

export default Form.create({})(withRouter(AppReleaseEdit));
