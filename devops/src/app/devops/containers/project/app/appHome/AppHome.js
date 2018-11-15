import React, { Component, Fragment } from 'react';
import { Table, Button, Input, Form, Modal, Tooltip, Select, Icon, Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { injectIntl, FormattedMessage } from 'react-intl';
import { commonComponent } from '../../../../components/commonFunction';
import LoadingBar from '../../../../components/loadingBar';
import './AppHome.scss';
import '../../../main.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import DepPipelineEmpty from '../../../../components/DepPipelineEmpty/DepPipelineEmpty';
import DeploymentPipelineStore from '../../../../stores/project/deploymentPipeline';
import AppVersionStore from  '../../../../stores/project/applicationVersion';
import { getSelectTip } from '../../../../utils';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
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
  }, 600);

  /**
   * 校验应用编码规则
   * @param rule
   * @param value
   * @param callback
   */
  checkCode =_.debounce((rule, value, callback) => {
    const { AppStore, intl: { formatMessage } } = this.props;
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      AppStore.checkCode(this.state.projectId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(formatMessage({ id: 'template.checkCode' }));
          }
        });
    } else {
      callback(formatMessage({ id: 'template.checkCodeReg' }));
    }
  }, 600);

  constructor(props) {
    const menu = AppState.currentMenuType;
    const { location: { state } } = props.history;
    super(props);
    this.state = {
      page: 0,
      id: '',
      projectId: menu.id,
      show: state && state.show,
      type: state && state.modeType,
      submitting: false,
    };
  }

  componentDidMount() {
    const { projectId } = AppState.currentMenuType;
    AppVersionStore.queryAppData(projectId);
    this.loadAllData(this.state.page);
  }

  getColumn = () => {
    const { AppStore, intl: { formatMessage } } = this.props;
    const { type, id: projectId, organizationId: orgId } = AppState.currentMenuType;
    const { filters, sort: { columnKey, order } } = AppStore.getInfo;
    return [{
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filters: [],
      filteredValue: filters.name || [],
      render: text => (<MouserOverWrapper text={text} width={0.2}>
        {text}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="app.code" />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      sortOrder: columnKey === 'code' && order,
      filters: [],
      filteredValue: filters.code || [],
      render: text => (<MouserOverWrapper text={text} width={0.25}>
        {text}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="app.url" />,
      dataIndex: 'repoUrl',
      key: 'repoUrl',
      render: text => (<MouserOverWrapper text={text} width={0.25}>
        <a href={text} rel="nofollow me noopener noreferrer" target="_blank">{text ? `../${text.split('/')[text.split('/').length - 1]}` : ''}</a>
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="app.active" />,
      dataIndex: 'active',
      key: 'active',
      filters: [{
        text: formatMessage({ id: 'app.stop' }),
        value: 0,
      }, {
        text: formatMessage({ id: 'app.run' }),
        value: 1,
      }, {
        text: formatMessage({ id: 'app.failed' }),
        value: -1,
      }, {
        text: formatMessage({ id: 'app.creating' }),
        value: 2,
      }],
      filteredValue: filters.active || [],
      render: this.getAppStatus,
    }, {
      align: 'right',
      width: 104,
      key: 'action',
      render: record => (
        <Fragment>
          {record.sonarUrl ? <Tooltip title={<FormattedMessage id="app.quality" />} placement="bottom">
            <a href={record.sonarUrl} rel="nofollow me noopener noreferrer" target="_blank">
              <Button icon="quality" shape="circle" size="small" />
            </a>
          </Tooltip> : null }
          {!record.fail ? <Fragment><Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.application.update']}>
            <Tooltip placement="bottom" title={<div>{!record.synchro ? <FormattedMessage id="app.synch" /> : <Fragment>{record.active ? <FormattedMessage id="edit" /> : <FormattedMessage id="app.start" />}</Fragment>}</div>}>
              {record.active && record.synchro
                ? <Button
                  icon="mode_edit"
                  shape="circle"
                  size="small"
                  onClick={this.showSideBar.bind(this, 'edit', record.id)}
                />
                : <Icon type="mode_edit" className="c7n-app-icon-disabled" /> }
            </Tooltip>
          </Permission>
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.application.queryByAppIdAndActive']}>
            <Tooltip
              placement="bottom"
              title={!record.synchro
                ? <FormattedMessage id="app.synch" />
                : <Fragment>{record.active ? <FormattedMessage id="app.stop" /> : <FormattedMessage id="app.run" />}</Fragment>}
            >
              {record.synchro
                ? <Button shape="circle" size="small" onClick={this.changeAppStatus.bind(this, record.id, record.active)}>
                  {record.active
                    ? <Icon type="remove_circle_outline" />
                    : <Icon type="finished" />}
                </Button>
                : <Fragment>
                  {record.active
                    ? <Icon type="remove_circle_outline" className="c7n-app-icon-disabled" />
                    : <Icon type="finished" className="c7n-app-icon-disabled" />}
                </Fragment> }
            </Tooltip>
          </Permission></Fragment>
          : <Permission type={type} projectId={projectId} organizationId={orgId} service={['devops-service.application.deleteByAppId']}>
            <Tooltip
              placement="bottom"
              title={<FormattedMessage id="delete" />}
            >
              <Button
                icon="delete_forever"
                shape="circle"
                size="small"
                onClick={this.openRemove.bind(this, record.id, record.name)}
              />
            </Tooltip>
          </Permission>}
        </Fragment>
      ),
    }];
  };

  /**
   * 获取状态
   * @param text
   * @param record 表格中一个项目的记录
   * @returns {*}
   */
  getAppStatus = (text, record) => {
    const style = {
      fontSize: 18,
      marginRight: 6,
    };
    let icon = '';
    let msg = '';
    let color = '';
    if (record.fail) {
      icon = 'cancel';
      msg = 'failed';
      color = '#f44336';
    } else if (record.synchro && text) {
      icon = 'check_circle';
      msg = 'run';
      color = '#00bf96';
    } else if (text) {
      icon = 'timelapse';
      msg = 'creating';
      color = '#4d90fe';
    } else {
      icon = 'remove_circle';
      msg = 'stop';
      color = '#d3d3d3';
    }
    return (<span><Icon style={{ color, ...style }} type={icon} /><FormattedMessage id={`app.${msg}`} /></span>);
  };

  /**
   * 打开分支
   * @param id 应用id
   * @param name
   */
  linkToBranch =(id, name) => {
    const { id: projectId, name: menuName, organizationId } = AppState.currentMenuType;
    this.linkToChange(`/devops/app/${name}/${id}/branch?type=project&id=${projectId}&name=${menuName}&organizationId=${organizationId}`);
  };

  /**
   * 切换应用id
   * @param id 应用id
   * @param status 状态
   */
  changeAppStatus = (id, status) => {
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
   * 删除应用
   * @param id
   */
  deleteApp = (id) => {
    const { AppStore } = this.props;
    const { projectId } = this.state;
    this.setState({ submitting: true });
    AppStore.deleteApps(projectId, id)
      .then(() => {
        this.loadAllData(this.state.page);
        this.setState({
          submitting: false,
          openRemove: false,
        });
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
    if ((singleData && value !== singleData.name) || !singleData) {
      this.postName(this.state.projectId, value, callback);
    } else {
      callback();
    }
  };

  /**
   * 提交数据
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { AppStore } = this.props;
    const { projectId, id, type, page, copyFrom } = this.state;
    AppStore.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
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
                this.setState({ show: false });
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
    const { AppStore } = this.props;
    AppStore.setSingleData(null);
    this.setState({ show: false });
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
    if (type === 'create') {
      AppStore.setSingleData(null);
      AppStore.loadSelectData(projectId);
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
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const {
      AppStore: {
        singleData,
        selectData,
        getAllData: serviceData,
        getInfo: { paras },
        isRefresh,
        loading,
        getPageInfo,
      },
      intl: { formatMessage },
      form: { getFieldDecorator },
    } = this.props;
    const { type: modeType, show, submitting, openRemove, name: appName, id } = this.state;
    const { app } = DeploymentPipelineStore.getProRole;
    const appData = AppVersionStore.getAppData;
    const formContent = (<Form layout="vertical" className="c7n-sidebar-form">
      {modeType === 'create' && <FormItem
        {...formItemLayout}
      >
        {getFieldDecorator('code', {
          rules: [{
            required: true,
            whitespace: true,
            max: 47,
            message: formatMessage({ id: 'required' }),
          }, {
            validator: this.checkCode,
          }],
        })(
          <Input
            autoFocus
            maxLength={30}
            label={<FormattedMessage id="app.code" />}
            size="default"
            suffix={getSelectTip('app.code.tooltip')}
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
            message: formatMessage({ id: 'required' }),
          }, {
            validator: this.checkName,
          }],
          initialValue: singleData ? singleData.name : '',
        })(
          <Input
            maxLength={20}
            label={<FormattedMessage id="app.name" />}
            size="default"
          />,
        )}
      </FormItem>
      {modeType === 'create' && <div className="c7ncd-sidebar-select">
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('applictionTemplateId', {
            rules: [{
              message: formatMessage({ id: 'required' }),
              transform: (value) => {
                if (value) {
                  return value.toString();
                }
                return value;
              },
            }],
          })(<Select
              key="service"
              allowClear
              label={<FormattedMessage id="app.chooseTem" />}
              filter
              dropdownMatchSelectWidth
              onSelect={this.selectTemplate}
              size="default"
              optionFilterProp="children"
              filterOption={
                (input, option) => option.props.children.props.children.props.children
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
            </Select>
          )}
        </FormItem>
        {getSelectTip('app.chooseTem.tip')}
      </div>}
    </Form>);

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
          'devops-service.application.queryByAppId',
        ]}
      >
        { isRefresh ? <LoadingBar display /> : ((appData && appData.length) || app === 'owner' ? <Fragment>
          <Header title={<FormattedMessage id="app.head" />}>
            <Permission
              service={['devops-service.application.create']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                icon="playlist_add"
                onClick={this.showSideBar.bind(this, 'create')}
              >
                <FormattedMessage id="app.create" />
              </Button>
            </Permission>
            <Button
              icon="refresh"
              onClick={this.handleRefresh}
            >
              <FormattedMessage id="refresh" />
            </Button>
          </Header>
          <Content code="app" values={{ name }}>
            {show && <Sidebar
              title={<FormattedMessage id={modeType === 'create' ? 'app.create' : 'app.edit'} />}
              visible={show}
              onOk={this.handleSubmit}
              okText={<FormattedMessage id={modeType === 'create' ? 'create' : 'save'} />}
              cancelText={<FormattedMessage id="cancel" />}
              confirmLoading={submitting}
              onCancel={this.hideSidebar}
              className="c7n-create-sidebar-tooltip"
            >
              <Content code={`app.${modeType}`} values={{ name }} className="sidebar-content">
                {formContent}
              </Content>
            </Sidebar>}
            <Table
              filterBarPlaceholder={formatMessage({ id: 'filter' })}
              pagination={getPageInfo}
              loading={loading}
              onChange={this.tableChange}
              columns={this.getColumn()}
              dataSource={serviceData}
              rowKey={record => record.id}
              filters={paras.slice()}
            />
          </Content>
        </Fragment> : <DepPipelineEmpty title={<FormattedMessage id="app.head" />} type="app" />)}
        <Modal
          confirmLoading={submitting}
          visible={openRemove}
          title={`${formatMessage({ id: 'app.delete' })}“${appName}”`}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove} disabled={submitting}>{<FormattedMessage id="cancel" />}</Button>,
            <Button key="submit" type="danger" onClick={this.deleteApp.bind(this, id)} loading={submitting}>
              {formatMessage({ id: 'delete' })}
            </Button>,
          ]}
        >
          <p>{formatMessage({ id: 'app.delete.tooltip' })}</p>
        </Modal>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(AppHome)));
