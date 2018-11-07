import React, { Component } from 'react';
import { Table, Button, Input, Form, Tooltip, Select, Modal, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import { commonComponent } from '../../../../components/commonFunction';
import LoadingBar from '../../../../components/loadingBar';
import './Cluster.scss';
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

@commonComponent('ClusterStore')
@observer
class Cluster extends Component {
  /**
   * 检查编码是否合法
   * @param rule
   * @param value
   * @param callback
   */
  checkCode = Debounce((rule, value, callback) => {
    const { TemplateStore, intl: { formatMessage } } = this.props;
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      TemplateStore.checkCode(this.state.organizationId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(formatMessage({ id: 'template.checkCode' }));
          }
        }).catch((error) => {
        Choerodon.prompt(error.response.data.message);
      });
    } else {
      callback(formatMessage({ id: 'template.checkCodeReg' }));
    }
  }, 1000);

  /**
   * 检查名称唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = Debounce((rule, value, callback) => {
    const { TemplateStore: { checkName, singleData }, intl: { formatMessage } } = this.props;
    const { organizationId } = this.state;
    if ((singleData && value !== singleData.name) || !singleData) {
      checkName(organizationId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(formatMessage({ id: 'template.checkName' }));
          }
        }).catch((error) => {
        Choerodon.prompt(error.response.data.message);
      });
    } else {
      callback();
    }
  }, 600);

  constructor(props) {
    super(props);
    const { organizationId } = AppState.currentMenuType;
    this.state = {
      id: '',
      organizationId,
      openRemove: false,
      show: false,
      submitting: false,
    };
  }

  componentDidMount() {
    // this.loadAllData();
  }

  /**
   * 获取行
   */
  getColumn = () => {
    const { TemplateStore, intl } = this.props;
    const { type, organizationId } = AppState.currentMenuType;
    const { filters, sort: { columnKey, order } } = TemplateStore.getInfo;
    return [{
      title: <FormattedMessage id="template.name" />,
      key: 'name',
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filters: [],
      filteredValue: filters.name || [],
      dataIndex: 'name',
      render: text => (<MouserOverWrapper text={text} width={0.15}>
        {text}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="template.code" />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      sortOrder: columnKey === 'code' && order,
      filters: [],
      filteredValue: filters.code || [],
      render: text => (<MouserOverWrapper text={text} width={0.15}>
        {text}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="template.des" />,
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      sortOrder: columnKey === 'description' && order,
      filters: [],
      filteredValue: filters.description || [],
      render: text => (<MouserOverWrapper text={text} width={0.2}>
        {text}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="template.url" />,
      dataIndex: 'repoUrl',
      key: 'repoUrl',
      render: text => (
        <MouserOverWrapper text={text} width={0.1}>
          <div className="c7n-template-table">
            <a href={text} rel="nofollow me noopener noreferrer" target="_blank">../{text.split('/')[text.split('/').length - 1]}</a>
          </div>
        </MouserOverWrapper>
      ),
    }, {
      title: <FormattedMessage id="template.type" />,
      dataIndex: 'type',
      key: 'type',
      sorter: true,
      sortOrder: columnKey === 'type' && order,
      filters: [{
        text: intl.formatMessage({ id: 'template.preDefine' }),
        value: 1,
      }, {
        text: intl.formatMessage({ id: 'template.perDefine' }),
        value: 0,
      }],
      filteredValue: filters.type || [],
      render: text => (text ? <React.Fragment><Icon type="brightness_high" /> <span className="c7n-template-column-text"><FormattedMessage id="template.preDefine" /></span> </React.Fragment>
        : <React.Fragment><Icon type="av_timer" /><span className="c7n-template-column-text"><FormattedMessage id="template.perDefine" /></span> </React.Fragment>),
    }, {
      width: 80,
      key: 'action',
      render: record => (
        !record.type
        && <div>
          <Permission type={type} organizationId={organizationId} service={['devops-service.application-template.update']}>
            <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="edit" />}>
              <Button
                icon="mode_edit"
                shape="circle"
                size="small"
                onClick={this.showSideBar.bind(this, 'edit', record.id)}
              />
            </Tooltip>
          </Permission>
          <Permission type={type} organizationId={organizationId} service={['devops-service.application-template.delete']}>
            <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="delete" />}>
              <Button
                icon="delete_forever"
                shape="circle"
                size="small"
                funcType="flat"
                onClick={this.openRemove.bind(this, record.id, record.name)}
              />
            </Tooltip>
          </Permission>
        </div>
      ),
    }];
  } ;

  /**
   * 提交数据
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { TemplateStore } = this.props;
    const { organizationId, id, type, page, copyFrom } = this.state;
    TemplateStore.setInfo({ filters: {}, sort: { columnKey: 'id', order: 'descend' }, paras: [] });
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
                this.setState({ show: false });
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
    this.props.form.resetFields();
    this.setState({ show: false });
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
    TemplateStore.setSingleData(null);
    if (type === 'create') {
      TemplateStore.loadSelectData(organizationId);
      this.setState({ show: true, type });
    } else {
      TemplateStore.loadDataById(organizationId, id);
      this.setState({ show: true, type, id });
    }
  };

  render() {
    const { type, organizationId, name } = AppState.currentMenuType;
    const {
      ClusterStore: {
        // getAllData: serviceData,
        getInfo: { paras },
        isRefresh,
        loading,
        getPageInfo,
      },
      intl: { formatMessage },
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Page
        service={[
          'devops-service.application-template.create',
        ]}
        className="c7n-region"
      >
        {isRefresh ? <LoadingBar display /> : <React.Fragment>
          <Header title={<FormattedMessage id="cluster.head" />}>
            <Permission
              service={['devops-service.application-template.create']}
              type={type}
              organizationId={organizationId}
            >
              <Button
                icon="playlist_add"
                funcType="flat"
                onClick={this.showSideBar.bind(this, 'create')}
              >
                <FormattedMessage id="cluster.create" />
              </Button>
            </Permission>
            <Permission
              service={['devops-service.application-template.listByOptions']}
              type={type}
              organizationId={organizationId}
            >
              <Button
                icon="refresh"
                funcType="flat"
                onClick={this.handleRefresh}
              >
                <FormattedMessage id="refresh" />
              </Button>
            </Permission>
          </Header>
          <Content code="cluster" values={{ name }}>
            <p>This is cluster!</p>
          </Content>
        </React.Fragment>}
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(Cluster)));
