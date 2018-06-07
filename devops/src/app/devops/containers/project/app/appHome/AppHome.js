import React, { Component } from 'react';
import { Table, Tootip, Button, Spin, message, Radio, Input, Form, Modal, Tooltip, Select, Pagination } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Permission from 'PerComponent';
import PageHeader from 'PageHeader';
import _ from 'lodash';
import { fromJS, is } from 'immutable';
import { commonComponent } from '../../../../components/commonFunction';
import LoadingBar from '../../../../components/loadingBar';
import './AppHome.scss';
import '../../../main.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const Sidebar = Modal.Sidebar;
const Option = Select.Option;
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


@inject('AppState')
@commonComponent('AppStore')
@observer
class AppHome extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      page: 0,
      id: '',
      projectId: menu.id,
      openRemove: false,
      show: false,
      submitting: false,
      pageSize: 10,
    };
  }

  componentDidMount() {
    const { projectId } = this.state;
    this.loadAllData(this.state.page);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (this.props.form.isFieldsTouched()) {
      return true;
    }
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  };

  getColumn = () => {
    const menu = this.props.AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return [{
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }, {
      title: Choerodon.languageChange('app.url'),
      dataIndex: 'repoUrl',
      key: 'repoUrl',
      render: (test, record) => (<MouserOverWrapper text={record.repoUrl} width={480}>
        <a href={record.repoUrl} rel="nofollow me noopener noreferrer" target="_blank">{record.repoUrl}</a>
      </MouserOverWrapper>),
    }, {
      title: Choerodon.languageChange('app.active'),
      dataIndex: 'active',
      key: 'active',
      filters: [{
        text: '停用',
        value: 0,
      }, {
        text: '启用',
        value: 1,
      }, {
        text: '创建中',
        value: -1,
      }],
      render: (test, record) => (
        <React.Fragment>
          {record.synchro && <span>{record.active ? '启用' : '停用'}</span>}
          {(!record.synchro) && <span>创建中</span>}
        </React.Fragment>
      ),
    }, {
      width: '128px',
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.git-flow.listByAppId', 'devops-service.git-flow.queryTags']} >
            <Tooltip placement="bottom" title={<div>{!record.synchro ? <span>应用同步中</span> : <React.Fragment>{record.active ? <span>分支管理</span> : <span>请先启用应用</span>}</React.Fragment> }</div>}>
              {record.active && record.synchro ? <Button shape="circle" onClick={this.linkToBranch.bind(this, record.id, record.name)}>
                <span className="icon-branch" />
              </Button> : <span className="icon-branch c7n-app-icon-disabled" /> }
            </Tooltip>
          </Permission>
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.application.update']} >
            <Tooltip placement="bottom" title={<div>{!record.synchro ? <span>应用同步中</span> : <React.Fragment>{record.active ? <span>修改</span> : <span>请先启用应用</span>}</React.Fragment> }</div>}>
              {record.active && record.synchro ? <Button shape="circle" onClick={this.showSideBar.bind(this, 'edit', record.id)}>
                <span className="icon-mode_edit" />
              </Button> : <span className="icon-mode_edit c7n-app-icon-disabled" /> }
            </Tooltip>
          </Permission>
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.application.queryByAppIdAndActive']} >
            <Tooltip placement="bottom" title={<div>{!record.synchro ? <span>应用同步中</span> : <React.Fragment>{record.active ? <span>停用</span> : <span>启用</span>}</React.Fragment> }</div>}>
              {record.synchro ? <Button shape="circle" onClick={this.changeAppStatus.bind(this, record.id, record.active)}>
                {record.active ? <span className="icon-remove_circle_outline" /> : <span className="icon-finished" />}
              </Button> : <React.Fragment>
                {record.active ? <span className="icon-remove_circle_outline c7n-app-icon-disabled" /> : <span className="icon-finished c7n-app-icon-disabled" />}
              </React.Fragment> }
              
            </Tooltip>
          </Permission>
        </div>
      ),
    }];
  } ;

  /**
   * 打开分支
   * @param id 应用id
   */
  linkToBranch =(id, name) => {
    const menu = this.props.AppState.currentMenuType;
    this.linkToChange(`/devops/app/${name}/${id}/branch?type=project&id=${menu.id}&name=${menu.name}&organizationId=${menu.organizationId}`);
  };

  /**
   * 切换应用id
   * @param id 应用id
   * @param status 状态
   */
  changeAppStatus =(id, status) => {
    const { AppStore } = this.props;
    const { projectId } = this.state;
    AppStore.changeAppStatus(projectId, id, !status)
      .then((data) => {
        if (data) {
          this.loadAllData(this.state.page);
        }
      });
  };

  /**
   * 校验应用的唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = (rule, value, callback) => {
    const { AppStore } = this.props;
    const singleData = AppStore.singleData;
    if (singleData && value !== singleData.name) {
      this.postName(this.state.projectId, value, callback);
    } else if (!singleData) {
      this.postName(this.state.projectId, value, callback);
    } else {
      callback();
    }
  };
  /**
   *
   * @type 隔断时间提交验证数据
   */
  postName =_.debounce((projectId, value, callback) => {
    const { AppStore } = this.props;
    AppStore.checkName(projectId, value)
      .then((data) => {
        if (data) {
          callback();
        } else {
          callback('名称已存在');
        }
      });
  }, 1000);
  /**
   * 校验应用编码规则
   * @param rule
   * @param value
   * @param callback
   */
  checkCode =_.debounce((rule, value, callback) => {
    // eslint-disable-next-line no-useless-escape
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      const { AppStore } = this.props;
      AppStore.checkCode(this.state.projectId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback('编码已存在');
          }
        });
    } else {
      callback('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾');
    }
  }, 1000);
  /**
   * 提交数据
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { AppStore } = this.props;
    const { projectId, id, type, page, copyFrom } = this.state;
    if (type === 'create') {
      this.setState({
        submitting: true,
      });
      this.props.form.validateFieldsAndScroll((err, data) => {
        if (!err) {
          const postData = data;
          postData.projectId = projectId;
          // postData.applictionTemplateId = copyFrom;
          AppStore.addData(projectId, postData)
            .then((res) => {
              if (res) {
                this.loadAllData(page);
                this.setState({ type: false, show: false });
              }
              this.setState({
                submitting: false,
              });
            }).catch((error) => {
              Choerodon.prompt(error.response.data.message);
              this.setState({
                submitting: false,
              });
            });
        }
      });
    } else if (type === 'edit') {
      this.props.form.validateFieldsAndScroll((err, data) => {
        if (!err) {
          const formData = data;
          formData.id = id;
          this.setState({
            submitting: true,
          });
          AppStore.updateData(projectId, formData)
            .then((res) => {
              if (res) {
                this.loadAllData(this.state.page);
                this.setState({ isLoading: false, show: false });
              }
              this.setState({
                submitting: false,
              });
            }).catch((error) => {
              Choerodon.prompt(error.response.data.message);
              this.setState({
                submitting: false,
              });
            });
        }
      });
    }
  };
  /**
   * 关闭操作框
   */
  hideSidebar = () => {
    this.setState({ show: false });
    this.loadAllData();
    this.props.form.resetFields();
  };
  /**
   * 打开操作面板
   * @param type 操作类型
   * @param id 操作应用
   */
  showSideBar =(type, id = '') => {
    this.props.form.resetFields();
    const { AppStore } = this.props;
    const { projectId } = this.state;
    const menu = this.props.AppState.currentMenuType;
    const organizationId = menu.id;
    if (type === 'create') {
      AppStore.setSingleData(null);
      AppStore.loadSelectData(organizationId);
      this.setState({ show: true, type });
    } else {
      AppStore.loadDataById(projectId, id);
      this.setState({ show: true, type, id });
    }
  };
  selectTemplate =(value, option) => {
    this.setState({ copyFrom: option.key });
  };
  render() {
    const { AppStore } = this.props;
    const { getFieldDecorator } = this.props.form;
    const serviceData = AppStore.getAllData;
    const { singleData, selectData } = AppStore;
    const menu = this.props.AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const formContent = (<div className="c7n-region">
      {this.state.type === 'create' ? <div>
        <h2 className="c7n-space-first">在项目&quot;{menu.name}&quot;中创建应用</h2>
        <p>
          请在下面输入应用编码及名称，也可以选择某个应用模板，快速创建应用。平台会为您自动创建对应的git库以便管理该应用代码。
          <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/application-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
            了解详情
            </span>
            <span className="icon-open_in_new" />
          </a>
        </p>
      </div> : <div>
        <h2 className="c7n-space-first">对&quot;{singleData ? singleData.code : ''}&quot;进行修改</h2>
        <p>
          您可在此修改应用名称。
          <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/application-management/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
            了解详情
            </span>
            <span className="icon-open_in_new" />
          </a>
        </p>
      </div>}
      <Form layout="vertical" className="c7n-sidebar-form">
        {this.state.type === 'create' && <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('code', {
            rules: [{
              required: true,
              whitespace: true,
              max: 47,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkCode,
            }],
          })(
            <Input
              autoFocus
              maxLength={20}
              label={Choerodon.languageChange('app.code')}
              size="default"
            />,
          )}
        </FormItem> }
        <FormItem
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
            initialValue: singleData ? singleData.name : '',
          })(
            <Input
              maxLength={20}
              label={Choerodon.languageChange('app.name')}
              size="default"
            />,
          )}
        </FormItem>
        {this.state.type === 'create' && <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('applictionTemplateId', {
            rules: [{
              // required: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              transform: (value) => {
                if (value) {
                  return value.toString();
                }
                return value;
              },
            }],
          })(
            <Select
              key="service"
              allowClear
              label={Choerodon.getMessage('选择应用模板', 'choose template')}
              // showSearch
              filter
              // getPopupContainer={triggerNode => triggerNode.parentNode}
              dropdownMatchSelectWidth
              onSelect={this.selectTemplate}
              size="default"
              optionFilterProp="children"
              // optionLabelProp="value"
              filterOption={
                (input, option) =>
                  option.props.children.props.children.props.children
                    .toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {selectData && selectData.length > 0 && selectData.map(s => (
                <Option
                  value={s.id}
                  key={s.id}
                >
                  <Tooltip
                    placement="right"
                    trigger="hover"
                    title={<p>{s.description}</p>}
                  >
                    <span style={{ display: 'inline-block', width: '100%' }}>{s.name}</span>
                  </Tooltip>
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>}
      </Form>
    </div>);
    const contentDom = (
      <Table
        filterBarPlaceholder={'过滤表'}
        pagination={AppStore.getPageInfo}
        loading={AppStore.loading}
        columns={this.getColumn()}
        dataSource={serviceData}
        rowKey={record => record.id}
        onChange={this.tableChange}
      />);

    return (
      <div className="c7n-region page-container c7n-app-wrapper">
        { AppStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <PageHeader title={Choerodon.languageChange('app.title')}>
            <Permission
              service={['devops-service.application.create']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                onClick={this.showSideBar.bind(this, 'create')}
              >
                <span className="icon-playlist_add icon" />
                <span>{Choerodon.getMessage('创建应用', 'Create')}</span>
              </Button>
            </Permission>
            <Button
              onClick={this.handleRefresh}
            >
              <span className="icon-refresh icon" />
              <span>{Choerodon.languageChange('refresh')}</span>
            </Button>
          </PageHeader>
          <div className="page-content">
            <h2 className="c7n-space-first">项目&quot;{menu.name}&quot;的应用管理</h2>
            <p>
              应用是满足用户某些需求的程序代码的集合，可以是某个解耦的微服务或是某个单体应用。您可在此创建应用、修改应用名称、停用应用、启用应用及分支管理。
              <a className="c7n-external-link" href="http://choerodon.io/zh/docs/user-guide/assembly-line/application-management/" rel="nofollow me noopener noreferrer" target="_blank">
                <span className="c7n-external-link-content">
                  了解详情
                </span>
                <span className="icon-open_in_new" />
              </a>
            </p>
            {this.state.show && <Sidebar
              title={this.state.type === 'create' ? '创建应用' : '修改应用'}
              visible={this.state.show}
              onOk={this.handleSubmit}
              okText={this.state.type === 'create' ? '创建' : '保存'}
              cancelText="取消"
              confirmLoading={this.state.submitting}
              onCancel={this.hideSidebar}
            >
              {formContent}
            </Sidebar>}
            {contentDom}
          </div>
        </React.Fragment>}


      </div>
    );
  }
}

export default Form.create({})(withRouter(AppHome));
