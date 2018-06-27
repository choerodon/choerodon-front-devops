import React, { Component } from 'react';
import { Table, Tootip, Button, Input, Form, Modal, Tooltip, Select } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { fromJS, is } from 'immutable';
import { injectIntl, FormattedMessage } from 'react-intl';
import { commonComponent } from '../../../../components/commonFunction';
import LoadingBar from '../../../../components/loadingBar';
import './AppHome.scss';
import '../../../main.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const { AppState } = stores;
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

@commonComponent('AppStore')
@observer
class AppHome extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
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
    const { intl } = this.props;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return [{
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
      render: (test, record) => (<MouserOverWrapper text={record.name} width={95}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="app.code" />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
      render: (test, record) => (<MouserOverWrapper text={record.code} width={145}>
        {record.code}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="app.url" />,
      dataIndex: 'repoUrl',
      key: 'repoUrl',
      render: (test, record) => (<MouserOverWrapper text={record.repoUrl} width={100}>
        <a href={record.repoUrl} rel="nofollow me noopener noreferrer" target="_blank">{record.repoUrl ? `../${record.repoUrl.split('/')[record.repoUrl.split('/').length - 1]}` : ''}</a>
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="app.active" />,
      dataIndex: 'active',
      key: 'active',
      filters: [{
        text: intl.formatMessage({ id: 'app.stop' }),
        value: 0,
      }, {
        text: intl.formatMessage({ id: 'app.run' }),
        value: 1,
      }, {
        text: intl.formatMessage({ id: 'app.creating' }),
        value: -1,
      }],
      render: (test, record) => (
        <React.Fragment>
          {record.synchro && <span>{record.active ? intl.formatMessage({ id: 'app.run' }) : intl.formatMessage({ id: 'app.stop' })}</span>}
          {(!record.synchro) && <FormattedMessage id="app.creating" />}
        </React.Fragment>
      ),
    }, {
      align: 'right',
      width: 104,
      key: 'action',
      render: (test, record) => (
        <div>
          {record.repoUrl ? <Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.git-flow.listByAppId', 'devops-service.git-flow.queryTags']} >
            <Tooltip placement="bottom" title={<div>{!record.synchro ? <FormattedMessage id="app.synch" /> : <React.Fragment>{record.active ? <FormattedMessage id="app.branchManage" /> : <FormattedMessage id="app.start" />}</React.Fragment>}</div>}>
              {record.active && record.synchro && record.repoUrl !== null ? <Button shape="circle" size={'small'} onClick={this.linkToBranch.bind(this, record.id, record.name)}>
                <span className="icon icon-branch" />
              </Button> : <span className="icon icon-branch c7n-app-icon-disabled" /> }
            </Tooltip>
          </Permission> : null }
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.application.update']} >
            <Tooltip placement="bottom" title={<div>{!record.synchro ? <FormattedMessage id="app.synch" /> : <React.Fragment>{record.active ? <FormattedMessage id="edit" /> : <FormattedMessage id="app.start" />}</React.Fragment>}</div>}>
              {record.active && record.synchro ? <Button shape="circle" size={'small'} onClick={this.showSideBar.bind(this, 'edit', record.id)}>
                <span className="icon icon-mode_edit" />
              </Button> : <span className="icon icon-mode_edit c7n-app-icon-disabled" /> }
            </Tooltip>
          </Permission>
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.application.queryByAppIdAndActive']} >
            <Tooltip placement="bottom" title={<div>{!record.synchro ? <FormattedMessage id="app.synch" /> : <React.Fragment>{record.active ? <FormattedMessage id="app.stop" /> : <FormattedMessage id="app.run" />}</React.Fragment>}</div>}>
              {record.synchro ? <Button shape="circle" size={'small'} onClick={this.changeAppStatus.bind(this, record.id, record.active)}>
                {record.active ? <span className="icon icon-remove_circle_outline" /> : <span className="icon icon-finished" />}
              </Button> : <React.Fragment>
                {record.active ? <span className="icon icon-remove_circle_outline c7n-app-icon-disabled" /> : <span className="icon icon-finished c7n-app-icon-disabled" />}
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
    const menu = AppState.currentMenuType;
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
    const { AppStore, intl } = this.props;
    AppStore.checkName(projectId, value)
      .then((data) => {
        if (data) {
          callback();
        } else {
          callback(intl.formatMessage({ id: 'template.checkName' }));
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
    const { AppStore, intl } = this.props;
    // eslint-disable-next-line no-useless-escape
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      AppStore.checkCode(this.state.projectId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(intl.formatMessage({ id: 'template.checkCode' }));
          }
        });
    } else {
      callback(intl.formatMessage({ id: 'template.checkCodeReg' }));
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
      this.props.form.validateFieldsAndScroll((err, data) => {
        if (!err) {
          const postData = data;
          postData.projectId = projectId;
          this.setState({
            submitting: true,
          });
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
      this.props.form.validateFieldsAndScroll((err, data, modify) => {
        if (!err && modify) {
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
        } else if (!modify) {
          this.setState({ show: false });
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
    const menu = AppState.currentMenuType;
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
    const { AppStore, intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const serviceData = AppStore.getAllData;
    const { singleData, selectData } = AppStore;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const formContent = (<div className="c7n-region">
      {this.state.type === 'create' ? <div>
        <h2 className="c7n-space-first">
          <FormattedMessage
            id="app.createApp"
            values={{
              name: `${menu.name}`,
            }}
          />
        </h2>
        <p>
          <FormattedMessage id="app.createDescription" />
          <a href={intl.formatMessage({ id: 'app.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
              <FormattedMessage id="learnmore" />
            </span>
            <span className="icon icon-open_in_new" />
          </a>
        </p>
      </div> : <div>
        <h2 className="c7n-space-first">
          <FormattedMessage
            id="app.editApp"
            values={{
              name: `${singleData ? singleData.code : ''}`,
            }}
          />
        </h2>
        <p>
          <FormattedMessage id="app.editDescription" />
          <a href={intl.formatMessage({ id: 'app.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
              <FormattedMessage id="learnmore" />
            </span>
            <span className="icon icon-open_in_new" />
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
              message: intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkCode,
            }],
          })(
            <Input
              autoFocus
              maxLength={30}
              label={<FormattedMessage id="app.code" />}
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
              message: intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkName,
            }],
            initialValue: singleData ? singleData.name : '',
          })(
            <Input
              maxLength={10}
              label={<FormattedMessage id="app.name" />}
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
              message: intl.formatMessage({ id: 'required' }),
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
              label={<FormattedMessage id="app.chooseTem" />}
              filter
              dropdownMatchSelectWidth
              onSelect={this.selectTemplate}
              size="default"
              optionFilterProp="children"
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
        filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
        pagination={AppStore.getPageInfo}
        loading={AppStore.loading}
        columns={this.getColumn()}
        dataSource={serviceData}
        rowKey={record => record.id}
        onChange={this.tableChange}
      />);

    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.application.create',
          'devops-service.application.update',
          'devops-service.application.checkCode',
          'devops-service.application.checkName',
          'devops-service.application.pageByOptions',
          'devops-service.application.listTemplate',
          'devops-service.application.queryByAppIdAndActive',
          'devops-service.git-flow.listByAppId',
          'devops-service.git-flow.queryTags',
          'devops-service.application.queryByAppId',
        ]}
      >
        { AppStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <Header title={<FormattedMessage id="app.title" />}>
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
                <FormattedMessage id="app.create" />
              </Button>
            </Permission>
            <Button
              onClick={this.handleRefresh}
            >
              <span className="icon-refresh icon" />
              <FormattedMessage id="refresh" />
            </Button>
          </Header>
          <Content>
            <h2 className="c7n-space-first">
              <FormattedMessage
                id="app.head"
                values={{
                  name: `${menu.name}`,
                }}
              />
            </h2>
            <p>
              <FormattedMessage id="app.description" />
              <a className="c7n-external-link" href={intl.formatMessage({ id: 'app.link' })} rel="nofollow me noopener noreferrer" target="_blank">
                <span className="c7n-external-link-content">
                  <FormattedMessage id="learnmore" />
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            {this.state.show && <Sidebar
              title={<FormattedMessage id={this.state.type === 'create' ? 'app.create' : 'app.edit'} />}
              visible={this.state.show}
              onOk={this.handleSubmit}
              okText={<FormattedMessage id={this.state.type === 'create' ? 'create' : 'save'} />}
              cancelText={<FormattedMessage id="cancel" />}
              confirmLoading={this.state.submitting}
              onCancel={this.hideSidebar}
            >
              {formContent}
            </Sidebar>}
            {contentDom}
          </Content>
        </React.Fragment>}


      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(AppHome)));
