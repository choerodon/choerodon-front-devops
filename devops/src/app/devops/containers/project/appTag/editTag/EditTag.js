
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Tooltip, Table, Select, Modal, Form, Input, Icon } from 'choerodon-ui';
import TimePopover from '../../../../components/timePopover/index';
import MouserOverWrapper from '../../../../components/MouseOverWrapper/index';
import '../../../main.scss';
import './AppTagHome.scss';

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
  checkTagName = _.debounce((rule, value, callback) => {
    const { AppTagStore, intl } = this.props;
    const { projectId, appId } = this.state;
    // eslint-disable-next-line no-useless-escape
    const pa = /^\d+(\.\d+){2}$/;
    if (value && pa.test(value)) {
      AppTagStore.checkTagName(projectId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(intl.formatMessage({ id: 'apptag.checkName' }));
          }
        });
    } else {
      callback(intl.formatMessage({ id: 'apptag.checkNameReg' }));
    }
  }, 1000);

  constructor(props) {
    super(props);
    const menu = AppState.currentMenuType;
    this.state = {
      projectId: menu.id,
      page: 0,
      pageSize: 10,
      appId: null,
      appName: null,
      showSide: false,
      submitting: false,
      deleteLoading: false,
      visible: false,
      tag: null,
      size: 3,
    };
  }

  componentDidMount() {
    this.loadInitData();
  }

  /**
   * 打开操作面板
   * @param type 操作类型
   * @param id 操作应用
   */
  showSideBar = () => {
    this.props.form.resetFields();
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    this.setState({
      showSide: true,
    });
    AppTagStore.queryBranchData({ projectId });
  };

  /**
   * 点击创建
   * @param e
   */
  handleOk = (e) => {
    e.preventDefault();
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    this.setState({ submitting: true });
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const { tag, ref } = data;
        AppTagStore.createTag(projectId, tag, ref).then((req) => {
          if (req && req.failed) {
            Choerodon.prompt(data.message);
            this.setState({ submitting: false });
          } else {
            this.loadTagData(projectId);
            this.setState({
              submitting: false,
              showSide: false,
              size: 3,
            });
          }
        }).catch((error) => {
          Choerodon.prompt(error.response.data.message);
          this.setState({
            submitting: false,
            size: 3,
          });
        });
      } else {
        this.setState({ submitting: false });
      }
    });
  };

  /**
   * 取消创建tag
   */
  handleCancel = () => {
    this.setState({
      showSide: false,
      size: 3,
    });
    this.props.form.resetFields();
  };

  /**
   * tag表格分页、排序、筛选等
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange = (pagination, filters, sorter, paras) => {
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    this.setState({ page: pagination.current - 1 });
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    if (paras.length) {
      searchParam = { tagName: [paras.toString()] };
    }
    const postData = {
      searchParam,
      param: '',
    };
    AppTagStore
      .queryTagData(projectId, pagination.current - 1, pagination.pageSize, postData);
  };

  /**
   * 通过下拉选择器选择应用时，获取应用id
   * @param id
   */
  handleSelect = (id, option) => {
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    this.setState({ appId: id, appName: option.props.children, page: 0, pageSize: 10 });
    AppTagStore.setSelectApp(id);
    this.loadTagData(projectId);
  };

  /**
   * 页面内刷新，选择器变回默认选项
   */
  handleRefresh = () => {
    const { page, pageSize } = this.state;
    this.loadTagData(this.state.projectId, page, pageSize);
  };

  /**
   * 加载应用信息
   */
  loadInitData = () => {
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    AppTagStore.queryAppData(projectId);
    this.setState({ appName: null, appId: null });
  };

  /**
   * 加载刷新tag列表信息
   * @param projectId
   * @param id
   * @param page
   * @param pageSize
   */
  loadTagData = (projectId, page = 0, pageSize = 10) => {
    const { AppTagStore } = this.props;
    AppTagStore
      .queryTagData(projectId, page, pageSize);
  };

  /**
   * 打开确认确认窗口
   * @param tag
   */
  openRemove = tag => this.setState({ visible: true, tag });

  /**
   * 删除标记
   * @param id
   */
  deleteTag = () => {
    const { AppTagStore } = this.props;
    const { projectId, tag } = this.state;
    this.setState({ deleteLoading: true });
    AppTagStore.deleteTag(projectId, tag).then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.setState({ deleteLoading: false, visible: false });
        this.loadTagData(projectId);
      }
    }).catch((error) => {
      this.setState({ deleteLoading: false });
      Choerodon.prompt(error);
    });
  };

  /**
   * 取消删除
   */
  closeRemove = () => this.setState({ visible: false });

  /**
   * 加载更多
   */
  changeSize =(e) => {
    e.stopPropagation();
    const { AppTagStore } = this.props;
    const { size, projectId, filter } = this.state;
    this.setState({ size: size + 10 });
    AppTagStore.queryBranchData({ projectId, size: size + 10, postData: { searchParam: { branchName: [filter] }, param: '' } });
  };

  /**
   * 搜索分支数据
   * @param input
   */
  searchBranch = (input) => {
    this.setState({ filter: input });
    const { AppTagStore } = this.props;
    AppTagStore.queryBranchData({ projectId: this.state.projectId, size: this.state.size, postData: { searchParam: { branchName: [input] }, param: '' } });
  };

  render() {
    const { intl, AppTagStore, form } = this.props;
    const { getFieldDecorator } = form;
    const { showSide, appName, submitting, deleteLoading, visible } = this.state;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const currentAppName = appName || AppTagStore.getDefaultAppName;
    const appData = AppTagStore.getAppData;
    const tagColumns = [
      {
        title: <FormattedMessage id="apptag.tag" />,
        dataIndex: 'tagName',
        filters: [],
        render: (text, record) => (<span>{record.tagName}</span>),
      },
      {
        title: <FormattedMessage id="apptag.code" />,
        dataIndex: 'commit.id',
        render: (text, record) => (<a href={record.commit.url} rel="nofollow me noopener noreferrer" target="_blank">{record.commit.id.slice(0, 8)}</a>),
      },
      {
        title: <FormattedMessage id="apptag.des" />,
        dataIndex: 'commit.message',
        render: (text, record) => (<MouserOverWrapper text={record.commit.message} width={0.5}>
          {record.commit.message}</MouserOverWrapper>),
      }, {
        title: <FormattedMessage id="apptag.owner" />,
        dataIndex: 'commit.authorName',
        render: (text, record) => (<div>
          {record.commitUserImage
            ? <img className="apptag-commit-img" src={record.commitUserImage} alt="avatar" />
            : <span className="apptag-commit apptag-commit-avatar">{text.toString().substr(0, 1)}</span>}
          <span className="apptag-commit">{text}</span>
        </div>),
      },
      {
        title: <FormattedMessage id="apptag.time" />,
        dataIndex: 'commit.committedDate',
        render: (text, record) => <TimePopover content={record.commit.committedDate} />,
      }, {
        align: 'right',
        width: 60,
        key: 'action',
        render: (text, record) => (
          <Permission
            type={type}
            projectId={projectId}
            organizationId={orgId}
            service={[
              'devops-service.devops-git.deleteTag',
            ]}
          >
            <Tooltip
              placement="bottom"
              title={<FormattedMessage id="delete" />}
            >
              <Button
                shape="circle"
                size="small"
                onClick={this.openRemove.bind(this, record.tagName)}
              >
                <Icon type="delete_forever" />
              </Button>
            </Tooltip>
          </Permission>
        ),
      },
    ];
    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.application.listByActive',
          'devops-service.devops-git.getTagByPage',
          'devops-service.devops-git.listByAppId',
          'devops-service.devops-git.createTag',
          'devops-service.devops-git.checkTag',
          'devops-service.devops-git.deleteTag',
        ]}
      >
        <Modal
          confirmLoading={deleteLoading}
          visible={visible}
          title={<FormattedMessage id="apptag.action.delete" />}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove}>{<FormattedMessage id="cancel" />}</Button>,
            <Button key="submit" type="danger" onClick={this.deleteTag} loading={deleteLoading}>
              {this.props.intl.formatMessage({ id: 'delete' })}
            </Button>,
          ]}
        >
          <p>{this.props.intl.formatMessage({ id: 'apptag.delete.tooltip' })}</p>
        </Modal>
        <Header title={<FormattedMessage id="apptag.head" />}>
          {appData && appData.length ? (
            <Permission
              service={[
                'devops-service.devops-git.createTag',
              ]}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                onClick={this.showSideBar}
              >
                <i className="icon-playlist_add icon" />
                <FormattedMessage id="apptag.create" />
              </Button>
            </Permission>
          ) : null}
          <Button
            onClick={this.handleRefresh}
          >
            <i className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="apptag" value={{ name }}>
          <Select
            className="c7n-select_512"
            value={AppTagStore.getSelectApp}
            label={this.props.intl.formatMessage({ id: 'chooseApp' })}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
            onChange={(value, option) => this.handleSelect(value, option)}
          >
            {
              _.map(appData, app => <Option key={app.id} value={app.id}>{app.name}</Option>)
            }
          </Select>
          <h4 className="c7n-tag-table"><FormattedMessage id="apptag.table" /></h4>
          <Table
            onChange={this.tableChange}
            pagination={AppTagStore.pageInfo}
            columns={tagColumns}
            loading={AppTagStore.getLoading}
            dataSource={AppTagStore.getTagData}
            rowKey={record => record.tagName}
          />
          <Sidebar
            title={<FormattedMessage id="apptag.create" />}
            visible={showSide}
            onOk={this.handleOk}
            okText={<FormattedMessage id="create" />}
            cancelText={<FormattedMessage id="cancel" />}
            confirmLoading={submitting}
            onCancel={this.handleCancel}
          >
            <div className="c7n-region">
              <h2 className="c7n-space-first">
                <FormattedMessage
                  id="apptag.createTag"
                  values={{
                    name: `${currentAppName}`,
                  }}
                />
              </h2>
              <p>
                <FormattedMessage id="apptag.createDescription" />
                <a href={intl.formatMessage({ id: 'apptag.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                  <span className="c7n-external-link-content">
                    <FormattedMessage id="learnmore" />
                  </span>
                  <i className="icon icon-open_in_new" />
                </a>
              </p>
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
                        // whitespace: true,
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
            </div>
          </Sidebar>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(AppTagHome)));
