import React, { Component } from 'react';
import { Table, Button, Input, Form, Tooltip, Select, Modal, Icon } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { fromJS, is } from 'immutable';
import { Obversable } from 'rxjs';

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

  /**
   * 获取行
   * @returns {[null,null,null,null,null,null]}
   */
  getColumn = () => {
    const menu = AppState.currentMenuType;
    const { type, id: orgId } = menu;
    return [{
      title: Choerodon.languageChange('template.name'),
      key: 'name',
      sorter: true,
      filters: [],
      // width: '14%',
      render: (test, record) => (<MouserOverWrapper text={record.name} width={108}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: Choerodon.languageChange('template.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
      render: (test, record) => (<MouserOverWrapper text={record.code} width={108}>
        {record.code}
      </MouserOverWrapper>),
      // width: '14%',
    }, {
      title: Choerodon.languageChange('template.description'),
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      filters: [],
      render: (test, record) => (<MouserOverWrapper text={record.description} width={150}>
        {record.description}
      </MouserOverWrapper>),
      // width: '14%',
    }, {
      // width: '30%',
      title: Choerodon.languageChange('template.url'),
      dataIndex: 'repoUrl',
      key: 'repoUrl',
      // sorter: true,
      render: (test, record) => (
        <Tooltip trigger="hover" placement="bottom" title={record.repoUrl}>
          <div className="c7n-template-table">
            <a href={record.repoUrl} rel="nofollow me noopener noreferrer" target="_blank">{record.repoUrl}</a>
          </div>
        </Tooltip>

      ),
    }, {
      title: Choerodon.languageChange('template.type'),
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      // width: '15%',
      filters: [{
        text: '预定义',
        value: 1,
      }, {
        text: '自定义',
        value: 0,
      }],
      render: (text, record) => (
        record.type ? <React.Fragment><Icon type="brightness_high" /> <span className="c7n-template-column-text">预定义</span> </React.Fragment>
          : <React.Fragment><Icon type="av_timer" /><span className="c7n-template-column-text">自定义</span> </React.Fragment>
      ),
    }, {
      width: '100px',
      // className: 'operateIcons',
      key: 'action',
      render: (test, record) => (
        !record.type &&
        <div>
          <Permission type={type} organizationId={orgId} service={['devops-service.application-template.update']} >
            <Tooltip trigger="hover" placement="bottom" title={<div>修改</div>}>
              <Button shape="circle" onClick={this.showSideBar.bind(this, 'edit', record.id)}>
                <span className="icon icon-mode_edit" />
              </Button>
            </Tooltip>
          </Permission>
          <Permission type={type} organizationId={orgId} service={['devops-service.application-template.delete']} >
            <Tooltip trigger="hover" placement="bottom" title={<div>删除</div>}>
              <Button shape="circle" funcType="flat" onClick={this.openRemove.bind(this, record.id)}>
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
  checkCode = _.debounce((rule, value, callback) => {
    // eslint-disable-next-line no-useless-escape
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      const { TemplateStore } = this.props;
      TemplateStore.checkCode(this.state.organizationId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback('编码已存在');
          }
        }).catch((error) => {
          Choerodon.prompt(error.response.data.message);
        });
    } else {
      callback('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾');
    }
  }, 1000);
  /**
   * 检查名称唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = _.debounce((rule, value, callback) => {
    const { TemplateStore } = this.props;
    const singleData = TemplateStore.singleData;
    if (singleData && value !== singleData.name) {
      TemplateStore.checkName(this.state.organizationId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback('名称已存在');
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
            callback('名称已存在');
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
          // postData.copyFrom = copyFrom;
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
      this.props.form.validateFieldsAndScroll((err, data) => {
        if (!err) {
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
  /**
   * 选择模板
   * @param value 模板id
   * @param option
   */
  selectTemplate =(value, option) => {
    this.setState({ copyFrom: option.key });
  };
  render() {
    const { TemplateStore } = this.props;
    const { getFieldDecorator } = this.props.form;
    const serviceData = TemplateStore.getAllData;
    const { singleData, selectData } = TemplateStore;
    const menu = AppState.currentMenuType;
    const { type, id: orgId } = menu;
    const formContent = (<div className="c7n-region">
      {this.state.type === 'create' ? <div>
        <h2 className="c7n-space-first">{`在组织"${menu.name}"中创建应用模板`}</h2>
        <p>
          请在下面输入应用模板编码、名称、描述，创建默认空白模板。您也可以通过复制于现有模板，以便节省部分操作，提升效率。
          <a href="http://choerodon.io/zh/docs/user-guide/development-pipeline/application-template/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
            了解详情
            </span>
            <span className="icon icon-open_in_new" />
          </a>
        </p>
      </div> : <div>
        <h2 className="c7n-space-first">对应用模板&quot;{singleData ? singleData.code : ''}&quot;进行修改</h2>
        <p>
          您可在此修改应用名称及描述。
          <a href="http://choerodon.io/zh/docs/user-guide/development-pipeline/application-template/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
                  了解详情
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
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkCode,
            }],
          })(
            <Input
              autoFocus
              maxLength={20}
              label={Choerodon.languageChange('template.code')}
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
              label={Choerodon.languageChange('template.name')}
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
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              // validator: this.checkName,
            }],
            initialValue: singleData ? singleData.description : '',
          })(
            <TextArea
              maxLength={50}
              label={Choerodon.languageChange('template.description')}
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
              label={'复制于'}
              allowClear
              key="service"
              // showSearch
              filter
              dropdownMatchSelectWidth
              // onSelect={this.selectTemplate}
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
        filterBarPlaceholder={'过滤表'}
        loading={TemplateStore.loading}
        pagination={TemplateStore.getPageInfo}
        columns={this.getColumn()}
        dataSource={serviceData}
        rowKey={record => record.id}
        onChange={this.tableChange}
      />);
    return (
      <Page className="c7n-region page-container c7n-template-wrapper">
        {TemplateStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <Header title={Choerodon.languageChange('template.title')}>
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
                <span>{Choerodon.getMessage('创建应用模板', 'Create')}</span>
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
                <span className="con-refresh icon" />
                <span>{Choerodon.languageChange('refresh')}</span>
              </Button>
            </Permission>
          </Header>
          <Content>
            <h2 className="c7n-space-first">组织&quot;{menu.name}&quot;的应用模板</h2>
            <p>
              应用模板是将同类型应用的代码库结构整理成模板，用于创建应用时能引用相应模板快速创建初始代码库。您也可以根据实际情况自定义应用模板。
              <a href="http://choerodon.io/zh/docs/user-guide/development-pipeline/application-template/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                了解详情
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            {this.state.show && <Sidebar
              okText={this.state.type === 'create' ? '创建' : '保存'}
              cancelText="取消"
              title={this.state.type === 'create' ? '创建应用模板' : '修改应用模板'}
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
          title="删除模板"
          footer={[
            <Button key="back" onClick={this.closeRemove}>取消</Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete}>
              删除
            </Button>,
          ]}
        >
          <p>确定要删除该应用模板吗？</p>
        </Modal>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(TemplateHome));
