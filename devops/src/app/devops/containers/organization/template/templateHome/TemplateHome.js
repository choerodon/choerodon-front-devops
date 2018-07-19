import React, { Component } from 'react';
import { Table, Button, Input, Form, Tooltip, Select, Modal, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import { commonComponent } from '../../../../components/commonFunction';
import LoadingBar from '../../../../components/loadingBar';
import './TemplateHome.scss';
import '../../../main.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const { AppState } = stores;
const Option = Select.Option;
const Sidebar = Modal.Sidebar;
const FormItem = Form.Item;
const { TextArea } = Input;
const Debounce = require('lodash.debounce');

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

@commonComponent('TemplateStore')
@observer
class TemplateHome extends Component {
  constructor(props) {
    super(props);
    const menu = AppState.currentMenuType;
    this.state = {
      id: '',
      organizationId: menu.id,
      openRemove: false,
      show: false,
      submitting: false,
      pageSize: 10,
    };
  }

  componentDidMount() {
    this.loadAllData();
  }

  // shouldComponentUpdate = (nextProps, nextState) => {
  //   if (this.props.form.isFieldsTouched()) {
  //     return true;
  //   }
  //   const thisProps = fromJS(this.props || {});
  //   const thisState = fromJS(this.state || {});
  //   const nextStates = fromJS(nextState || {});
  //   if (thisProps.size !== nextProps.size ||
  //     thisState.size !== nextState.size) {
  //     return true;
  //   }
  //   if (is(thisState, nextStates)) {
  //     return false;
  //   }
  //   return true;
  // };

  /**
   * 获取行
   * @returns {[null,null,null,null,null,null]}
   */
  getColumn = () => {
    const { intl } = this.props;
    const menu = AppState.currentMenuType;
    const { type, id: orgId } = menu;
    return [{
      title: <FormattedMessage id="template.name" />,
      key: 'name',
      sorter: true,
      filters: [],
      dataIndex: 'name',
      render: (test, record) => (<MouserOverWrapper text={record.name} width={0.15}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="template.code" />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
      render: (test, record) => (<MouserOverWrapper text={record.code} width={0.15}>
        {record.code}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="template.des" />,
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      filters: [],
      render: (test, record) => (<MouserOverWrapper text={record.description} width={0.2}>
        {record.description}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="template.url" />,
      dataIndex: 'repoUrl',
      key: 'repoUrl',
      render: (test, record) => (
        <MouserOverWrapper text={record.repoUrl} width={0.1}>
          <div className="c7n-template-table">
            <a href={record.repoUrl} rel="nofollow me noopener noreferrer" target="_blank">../{record.repoUrl.split('/')[record.repoUrl.split('/').length - 1]}</a>
          </div>
        </MouserOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="template.type" />,
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      filters: [{
        text: intl.formatMessage({ id: 'template.preDefine' }),
        value: 1,
      }, {
        text: intl.formatMessage({ id: 'template.perDefine' }),
        value: 0,
      }],
      render: (text, record) => (
        record.type ? <React.Fragment><Icon type="brightness_high" /> <span className="c7n-template-column-text"><FormattedMessage id="template.preDefine" /></span> </React.Fragment>
          : <React.Fragment><Icon type="av_timer" /><span className="c7n-template-column-text"><FormattedMessage id="template.perDefine" /></span> </React.Fragment>
      ),
    }, {
      width: 80,
      key: 'action',
      render: (test, record) => (
        !record.type &&
        <div>
          <Permission type={type} organizationId={orgId} service={['devops-service.application-template.update']} >
            <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="edit" />}>
              <Button shape="circle" size={'small'} onClick={this.showSideBar.bind(this, 'edit', record.id)}>
                <span className="icon icon-mode_edit" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission type={type} organizationId={orgId} service={['devops-service.application-template.delete']} >
            <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="delete" />}>
              <Button shape="circle" size={'small'} funcType="flat" onClick={this.openRemove.bind(this, record.id)}>
                <span className="icon icon-delete_forever" />
              </Button>
            </Tooltip>
          </Permission>
        </div>
      ),
    }];
  } ;

  /**
   * 检查编码是否合法
   * @param rule
   * @param value
   * @param callback
   */
  checkCode = Debounce((rule, value, callback) => {
    const { TemplateStore, intl } = this.props;
    // eslint-disable-next-line no-useless-escape
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      TemplateStore.checkCode(this.state.organizationId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(intl.formatMessage({ id: 'template.checkCode' }));
          }
        }).catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
    } else {
      callback(intl.formatMessage({ id: 'template.checkCodeReg' }));
    }
  }, 1000);
  /**
   * 检查名称唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = Debounce((rule, value, callback) => {
    const { TemplateStore, intl } = this.props;
    const singleData = TemplateStore.singleData;
    if (singleData && value !== singleData.name) {
      TemplateStore.checkName(this.state.organizationId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(intl.formatMessage({ id: 'template.checkName' }));
          }
        }).catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
    } else if (!singleData) {
      TemplateStore.checkName(this.state.organizationId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(intl.formatMessage({ id: 'template.checkName' }));
          }
        }).catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
    } else {
      callback();
    }
  }, 1000);

  /**
   * 提交数据
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { TemplateStore } = this.props;
    const { organizationId, id, type, page, copyFrom } = this.state;
    if (type === 'create') {
      this.props.form.validateFieldsAndScroll((err, data) => {
        if (!err) {
          const postData = data;
          postData.organizationId = organizationId;
          this.setState({
            submitting: true,
          });
          TemplateStore.addData(organizationId, postData)
            .then((res) => {
              if (res) {
                this.loadAllData();
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
          formData.objectVersionNumber = TemplateStore.singleData.objectVersionNumber;
          this.setState({
            submitting: true,
          });
          TemplateStore.updateData(organizationId, formData)
            .then((res) => {
              if (res) {
                this.loadAllData();
                this.setState({ isLoading: false, show: false });
                this.setState({
                  submitting: false,
                });
              }
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
   * 关闭滑块
   */
  hideSidebar = () => {
    this.setState({ show: false });
    this.loadAllData();
    this.props.form.resetFields();
  };

  /**
   * 展开、收起操作面板
   * @param type 操作类型
   * @param id
   */
  showSideBar =(type = 'create', id = '') => {
    this.props.form.resetFields();
    const { TemplateStore } = this.props;
    const { organizationId } = this.state;
    if (type === 'create') {
      TemplateStore.loadSelectData(organizationId);
      TemplateStore.setSingleData(null);
      this.setState({ show: true, type });
    } else {
      TemplateStore.loadDataById(organizationId, id);
      this.setState({ show: true, type, id });
    }
  };

  render() {
    const { TemplateStore, intl } = this.props;
    const { getFieldDecorator } = this.props.form;
    const serviceData = TemplateStore.getAllData;
    const { singleData, selectData } = TemplateStore;
    const menu = AppState.currentMenuType;
    const { type, id: orgId } = menu;
    const formContent = (<div className="c7n-region">
      {this.state.type === 'create' ? <div>
        <h2 className="c7n-space-first">
          <FormattedMessage
            id="template.createHead"
            values={{
              name: `${menu.name}`,
            }}
          />
        </h2>
        <p>
          <FormattedMessage id="template.createDescription" />
          <a href={intl.formatMessage({ id: 'template.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
              <FormattedMessage id="learnmore" />
            </span>
            <span className="icon icon-open_in_new" />
          </a>
        </p>
      </div> : <div>
        <h2 className="c7n-space-first">
          <FormattedMessage
            id="template.edit"
            values={{
              name: `${singleData ? singleData.code : ''}`,
            }}
          />
        </h2>
        <p>
          <FormattedMessage id="template.editDescription" />
          <a href={intl.formatMessage({ id: 'template.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
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
              required: this.state.type === 'create',
              whitespace: true,
              message: intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkCode,
            }],
          })(
            <Input
              autoFocus
              maxLength={20}
              label={<FormattedMessage id="template.code" />}
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
              maxLength={20}
              label={<FormattedMessage id="template.name" />}
              size="default"
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('description', {
            rules: [{
              required: true,
              whitespace: true,
              message: intl.formatMessage({ id: 'required' }),
            }],
            initialValue: singleData ? singleData.description : '',
          })(
            <TextArea
              maxLength={50}
              label={<FormattedMessage id="template.des" />}
              autosize={{ minRows: 2, maxRows: 6 }}
            />,
          )}
        </FormItem>
        {this.state.type === 'create' && <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('copyFrom', {
            rules: [{
              transform: (value) => {
                if (value) {
                  return value.toString();
                }
                return value;
              },
            }],
          })(
            <Select
              label={<FormattedMessage id="template.copy" />}
              allowClear
              key="service"
              filter
              dropdownMatchSelectWidth
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
                  key={s.id.toString()}
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
        loading={TemplateStore.loading}
        pagination={TemplateStore.getPageInfo}
        columns={this.getColumn()}
        dataSource={serviceData}
        rowKey={record => record.id}
        onChange={this.tableChange}
      />);
    return (
      <Page
        service={[
          'devops-service.application-template.create',
          'devops-service.application-template.update',
          'devops-service.application-template.delete',
          'devops-service.application-template.checkCode',
          'devops-service.application-template.checkName',
          'devops-service.application-template.listByOptions',
          'devops-service.application-template.listByOrgId',
          'devops-service.application-template.queryByAppTemplateId',
        ]}
        className="c7n-region c7n-template-wrapper"
      >
        {TemplateStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <Header title={<FormattedMessage id="template.title" />}>
            <Permission
              service={['devops-service.application-template.create']}
              type={type}
              organizationId={orgId}
            >
              <Button
                funcType="flat"
                onClick={this.showSideBar.bind(this, 'create')}
              >
                <span className="icon-playlist_add icon" />
                <FormattedMessage id="template.create" />
              </Button>
            </Permission>
            <Permission
              service={['devops-service.application-template.listByOptions']}
              type={type}
              organizationId={orgId}
            >
              <Button
                funcType="flat"
                onClick={this.handleRefresh}
              >
                <span className="icon-refresh icon" />
                <FormattedMessage id="refresh" />
              </Button>
            </Permission>
          </Header>
          <Content>
            <h2 className="c7n-space-first">
              <FormattedMessage
                id="template.head"
                values={{
                  name: `${menu.name}`,
                }}
              />
            </h2>
            <p>
              <FormattedMessage id="template.description" />
              <a href={intl.formatMessage({ id: 'template.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  <FormattedMessage id="learnmore" />
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            {this.state.show && <Sidebar
              okText={<FormattedMessage id={this.state.type === 'create' ? 'create' : 'save'} />}
              cancelText={<FormattedMessage id="cancel" />}
              title={<FormattedMessage id={this.state.type === 'create' ? 'template.create' : 'template.create'} />}
              visible={this.state.show}
              onOk={this.handleSubmit}
              onCancel={this.hideSidebar}
              confirmLoading={this.state.submitting}
            >
              {formContent}
            </Sidebar> }
            {contentDom}
          </Content>
        </React.Fragment>}
        <Modal
          visible={this.state.openRemove}
          title={<FormattedMessage id="template.del" />}
          footer={[
            <Button key="back" onClick={this.closeRemove}><FormattedMessage id="cancel" /></Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete}>
              <FormattedMessage id="delete" />
            </Button>,
          ]}
        >
          <p>
            <FormattedMessage id="template.delDescription" />
          </p>
        </Modal>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(TemplateHome)));
