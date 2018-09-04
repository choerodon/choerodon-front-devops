import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Tooltip, Table, Select, Modal, Form, Input, Icon } from 'choerodon-ui';
// import TimePopover from '../../../../components/timePopover/index';
// import MouserOverWrapper from '../../../../components/MouseOverWrapper/index';
import '../../../main.scss';

const { AppState } = stores;
const { Option, OptGroup } = Select;
const { Sidebar } = Modal;
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

@observer
class AppTagHome extends Component {
  /**
   * 标记名称的校验规则：\d+(\.\d+){2}
   */
  // checkTagName = _.debounce((rule, value, callback) => {
  //   const { AppTagStore, intl } = this.props;
  //   const { projectId, appId } = this.state;
  //   // eslint-disable-next-line no-useless-escape
  //   const pa = /^\d+(\.\d+){2}$/;
  //   if (value && pa.test(value)) {
  //     AppTagStore.checkTagName(projectId, value)
  //       .then((data) => {
  //         if (data) {
  //           callback();
  //         } else {
  //           callback(intl.formatMessage({ id: 'apptag.checkName' }));
  //         }
  //       });
  //   } else {
  //     callback(intl.formatMessage({ id: 'apptag.checkNameReg' }));
  //   }
  // }, 1000);
  //
  constructor(props) {
    super(props);
    const menu = AppState.currentMenuType;
    this.state = {
      projectId: menu.id,
      page: 0,
      pageSize: 10,
      appId: null,
      submitting: false,
      tag: null,
      size: 3,
    };
  }
  //
  // componentDidMount() {
  //   this.loadInitData();
  // }
  //
  // /**
  //  * 打开操作面板
  //  * @param type 操作类型
  //  * @param id 操作应用
  //  */
  // showSideBar = () => {
  //   this.props.form.resetFields();
  //   const { AppTagStore } = this.props;
  //   const { projectId } = this.state;
  //   this.setState({
  //     showSide: true,
  //   });
  //   AppTagStore.queryBranchData({ projectId });
  // };
  //
  // /**
  //  * 点击创建
  //  * @param e
  //  */
  // handleOk = (e) => {
  //   e.preventDefault();
  //   const { AppTagStore } = this.props;
  //   const { projectId } = this.state;
  //   this.setState({ submitting: true });
  //   this.props.form.validateFieldsAndScroll((err, data) => {
  //     if (!err) {
  //       const { tag, ref } = data;
  //       AppTagStore.createTag(projectId, tag, ref).then((req) => {
  //         if (req && req.failed) {
  //           Choerodon.prompt(data.message);
  //           this.setState({ submitting: false });
  //         } else {
  //           this.loadTagData(projectId);
  //           this.setState({
  //             submitting: false,
  //             showSide: false,
  //             size: 3,
  //           });
  //         }
  //       }).catch((error) => {
  //         Choerodon.prompt(error.response.data.message);
  //         this.setState({
  //           submitting: false,
  //           size: 3,
  //         });
  //       });
  //     } else {
  //       this.setState({ submitting: false });
  //     }
  //   });
  // };
  //
  /**
   * 取消创建tag
   */
  handleCancel = () => {
    const { form: { resetFields }, close } = this.props;
    resetFields();
    close();
  };
  //
  // /**
  //  * tag表格分页、排序、筛选等
  //  * @param pagination
  //  * @param filters
  //  * @param sorter
  //  * @param paras
  //  */
  // tableChange = (pagination, filters, sorter, paras) => {
  //   const { AppTagStore } = this.props;
  //   const { projectId } = this.state;
  //   this.setState({ page: pagination.current - 1 });
  //   let searchParam = {};
  //   if (Object.keys(filters).length) {
  //     searchParam = filters;
  //   }
  //   if (paras.length) {
  //     searchParam = { tagName: [paras.toString()] };
  //   }
  //   const postData = {
  //     searchParam,
  //     param: '',
  //   };
  //   AppTagStore
  //     .queryTagData(projectId, pagination.current - 1, pagination.pageSize, postData);
  // };
  //
  // /**
  //  * 通过下拉选择器选择应用时，获取应用id
  //  * @param id
  //  */
  // handleSelect = (id, option) => {
  //   const { AppTagStore } = this.props;
  //   const { projectId } = this.state;
  //   this.setState({ appId: id, appName: option.props.children, page: 0, pageSize: 10 });
  //   AppTagStore.setSelectApp(id);
  //   this.loadTagData(projectId);
  // };
  //
  // /**
  //  * 页面内刷新，选择器变回默认选项
  //  */
  // handleRefresh = () => {
  //   const { page, pageSize } = this.state;
  //   this.loadTagData(this.state.projectId, page, pageSize);
  // };
  //
  // /**
  //  * 加载应用信息
  //  */
  // loadInitData = () => {
  //   const { AppTagStore } = this.props;
  //   const { projectId } = this.state;
  //   AppTagStore.queryAppData(projectId);
  //   this.setState({ appName: null, appId: null });
  // };
  //
  // /**
  //  * 加载刷新tag列表信息
  //  * @param projectId
  //  * @param id
  //  * @param page
  //  * @param pageSize
  //  */
  // loadTagData = (projectId, page = 0, pageSize = 10) => {
  //   const { AppTagStore } = this.props;
  //   AppTagStore
  //     .queryTagData(projectId, page, pageSize);
  // };
  //
  // /**
  //  * 打开确认确认窗口
  //  * @param tag
  //  */
  // openRemove = tag => this.setState({ visible: true, tag });
  //
  // /**
  //  * 删除标记
  //  * @param id
  //  */
  // deleteTag = () => {
  //   const { AppTagStore } = this.props;
  //   const { projectId, tag } = this.state;
  //   this.setState({ deleteLoading: true });
  //   AppTagStore.deleteTag(projectId, tag).then((data) => {
  //     if (data && data.failed) {
  //       Choerodon.prompt(data.message);
  //     } else {
  //       this.setState({ deleteLoading: false, visible: false });
  //       this.loadTagData(projectId);
  //     }
  //   }).catch((error) => {
  //     this.setState({ deleteLoading: false });
  //     Choerodon.prompt(error);
  //   });
  // };
  //
  // /**
  //  * 取消删除
  //  */
  // closeRemove = () => this.setState({ visible: false });
  //
  // /**
  //  * 加载更多
  //  */
  // changeSize =(e) => {
  //   e.stopPropagation();
  //   const { AppTagStore } = this.props;
  //   const { size, projectId, filter } = this.state;
  //   this.setState({ size: size + 10 });
  //   AppTagStore.queryBranchData({ projectId, size: size + 10, postData: { searchParam: { branchName: [filter] }, param: '' } });
  // };
  //
  // /**
  //  * 搜索分支数据
  //  * @param input
  //  */
  // searchBranch = (input) => {
  //   this.setState({ filter: input });
  //   const { AppTagStore } = this.props;
  //   AppTagStore.queryBranchData({ projectId: this.state.projectId, size: this.state.size, postData: { searchParam: { branchName: [input] }, param: '' } });
  // };

  render() {
    const { intl, AppTagStore, form, show, close } = this.props;
    const { getFieldDecorator } = form;
    const { submitting } = this.state;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    return (<div className="c7n-region">
      <Sidebar
        title={<FormattedMessage id="apptag.create" />}
        visible={show}
        // onOk={this.handleOk}
        okText={<FormattedMessage id="create" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={submitting}
        onCancel={this.handleCancel}
      >hello</Sidebar>
    </div>);
  }
}

export default Form.create({})(withRouter(injectIntl(AppTagHome)));

/*<Sidebar
        title={<FormattedMessage id="apptag.create" />}
        visible={showSide}
        onOk={this.handleOk}
        okText={<FormattedMessage id="create" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={submitting}
        onCancel={this.handleCancel}
      >
        <Content code="network.create" values={{ name }} className="c7n-network-create sidebar-content">
          <Form layout="vertical" className="c7n-sidebar-form">
            <div className="apptag-formitem">
              <Icon type="local_offer" className="c7n-apptag-icon" />
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('tag', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: intl.formatMessage({ id: 'required' }),
                  }, {
                    validator: this.checkTagName,
                  }],
                })(
                  <Input
                    autoFocus
                    label={<FormattedMessage id="apptag.name" />}
                    size="default"
                  />,
                )}
              </FormItem>
            </div>
            <div className="apptag-formitem">
              <Icon type="wrap_text" className="c7n-apptag-icon" />
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('ref', {
                  rules: [{
                    required: true,
                    message: intl.formatMessage({ id: 'required' }),
                  }],
                })(
                  <Select
                    onFilterChange={this.searchBranch}
                    allowClear
                    label={<FormattedMessage id="apptag.ref" />}
                    filter
                    dropdownMatchSelectWidth
                    notFoundContent={<FormattedMessage id="apptag.noRefBranch" />}
                    size="default"
                    filterOption={false}
                  >
                    <OptGroup label={<FormattedMessage id="apptag.branch" />}>
                      {
                        _.map(AppTagStore.getBranchData.content, item => <Option key={item.branchName} value={item.branchName}><Icon className="apptag-branch-icon" type="branch" />{item.branchName}</Option>)
                      }
                      {AppTagStore.getBranchData.totalElements > AppTagStore.getBranchData.numberOfElements && AppTagStore.getBranchData.numberOfElements > 0 ? <Option key="more">
                        <div role="none" onClick={this.changeSize} className="c7n-option-popover c7n-dom-more">
                          {intl.formatMessage({ id: 'ist.more' })}
                        </div>
                      </Option> : null }
                    </OptGroup>
                  </Select>,
                )}
              </FormItem>
            </div>
          </Form>
        </Content>
      </Sidebar>*/
