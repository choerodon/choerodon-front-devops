import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Tooltip, Table, Select, Modal, Form, Input, Icon, Avatar } from 'choerodon-ui';
import TimePopover from '../../../components/timePopover';
import '../../main.scss';
import './AppTag.scss';

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
class AppTag extends Component {
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
    AppTagStore.queryBranchData(projectId);
  };

  /**
   * 点击创建
   * @param e
   */
  handleOk = (e) => {
    e.preventDefault();
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        this.setState({
          submitting: true,
        });
        const { tag, ref } = data;
        AppTagStore.createTag(projectId, tag, ref).then((req) => {
          if (req && req.failed) {
            Choerodon.prompt(data.message);
            this.setState({
              submitting: false,
            });
          } else {
            this.loadTagData(projectId);
            this.setState({
              submitting: false,
              showSide: false,
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
  };

  handleCancel = () => {
    this.setState({
      showSide: false,
    });
    this.props.form.resetFields();
  };

  tableChange = (pagination, filters, sorter) => {
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    this.setState({ page: pagination.current - 1 });
    this.loadTagData(projectId, pagination.current - 1, pagination.pageSize);
  };

  /**
   * 通过下拉选择器选择应用时，获取应用id
   * @param id
   */
  handleSelect = (id, option) => {
    const { AppTagStore } = this.props;
    const { projectId, page, pageSize } = this.state;
    this.setState({ appId: id, appName: option.props.children });
    AppTagStore.setSelectApp(id);
    this.loadTagData(projectId, page, pageSize);
  };

  /**
   * 页面内刷新，选择器变回默认选项
   */
  handleRefresh = () => this.loadInitData();

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

  /**
   * 删除标记
   * @param id
   */
  deleteTag = (tag) => {
    const { AppTagStore } = this.props;
    const { projectId } = this.state;
    this.setState({ deleteLoading: true });
    AppTagStore.deleteTag(projectId, tag.name).then((data) => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else {
        this.loadTagData(projectId);
      }
      this.setState({ deleteLoading: false });
    }).catch((error) => {
      this.setState({ deleteLoading: false });
      Choerodon.prompt(error);
    });
  };

  render() {
    const { intl, AppTagStore, form } = this.props;
    const { getFieldDecorator } = form;
    const { showSide, appName, submitting, deleteLoading } = this.state;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const currentAppName = appName || AppTagStore.getDefaultAppName;
    const tagColumns = [
      {
        title: <FormattedMessage id="apptag.tag" />,
        dataIndex: 'name',
      },
      {
        title: <FormattedMessage id="apptag.code" />,
        dataIndex: 'commit.id',
        render: (text, record) => (<a href={record.commit.url} rel="nofollow me noopener noreferrer" target="_blank">{record.commit.id.slice(0, 8)}</a>),
      },
      {
        title: <FormattedMessage id="apptag.des" />,
        dataIndex: 'commit.message',
        render: (text, record) => <Tooltip title={record.commit.message} trigger="hover" placement="bottom"><div className="c7n-table-column">{record.commit.message}</div></Tooltip>,
      }, {
        title: <FormattedMessage id="apptag.owner" />,
        dataIndex: 'commit.authorName',
        render: (text, record) => (<div>
          {record.commit.author && record.commit.author.avatarUrl
            ? <img className="apptag-commit-img" src={record.commit.author.avatarUrl} alt="avatar" />
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
        render: text => (
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
                size={'small'}
                onClick={this.deleteTag.bind(this, text)}
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
          'devops-service.devops-git.getTag',
          'devops-service.devops-git.listByAppId',
          'devops-service.devops-git.createTag',
          'devops-service.devops-git.checkTag',
          'devops-service.devops-git.deleteTag',
        ]}
      >
        <React.Fragment>
          <Header title={<FormattedMessage id="apptag.title" />}>
            <Permission
              service={[
                'devops-service.devops-git.start',
              ]}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                onClick={this.showSideBar}
              >
                <span className="icon-playlist_add icon" />
                <FormattedMessage id="apptag.create" />
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
                id="apptag.head"
                values={{
                  name: `${menu.name}`,
                }}
              />
            </h2>
            <p>
              <FormattedMessage id="apptag.description" />
              <a className="c7n-external-link" href={intl.formatMessage({ id: 'apptag.link' })} rel="nofollow me noopener noreferrer" target="_blank">
                <span className="c7n-external-link-content">
                  <FormattedMessage id="learnmore" />
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            <Select
              className="c7n-select_512"
              value={AppTagStore.getSelectApp}
              label={this.props.intl.formatMessage({ id: 'deploy.step.one.app' })}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              filter
              onChange={(value, option) => this.handleSelect(value, option)}
            >
              {
                _.map(AppTagStore.getAppData, (app, index) =>
                  <Option key={index} value={app.id}>{app.name}</Option>,
                )
              }
            </Select>
            <h4 className="c7n-tag-table"><FormattedMessage id="apptag.table" /></h4>
            <Table
              onChange={this.tableChange}
              pagination={AppTagStore.pageInfo}
              filterBar={false}
              columns={tagColumns}
              loading={AppTagStore.getLoading || deleteLoading}
              dataSource={AppTagStore.getTagData}
              rowKey={record => record.name}
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
                    <span className="icon icon-open_in_new" />
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
                          allowClear
                          label={<FormattedMessage id="apptag.ref" />}
                          filter
                          dropdownMatchSelectWidth
                          size="default"
                          filterOption={(input, option) =>
                            option.props.children[1]
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0}
                        >
                          <OptGroup label={<FormattedMessage id="apptag.branch" />}>
                            {
                              _.map(AppTagStore.getBranchData, item =>
                                <Option key={item.name} value={item.name}><Icon className="apptag-branch-icon" type="branch" />{item.name}</Option>,
                              )
                            }
                          </OptGroup>
                        </Select>,
                      )}
                    </FormItem>
                  </div>
                </Form>
              </div>
            </Sidebar>
          </Content>
        </React.Fragment>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(AppTag)));
