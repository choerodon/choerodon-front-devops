import React, { Component, Fragment } from "react";
import { observer } from "mobx-react";
import { withRouter, Link } from "react-router-dom";
import { injectIntl, FormattedMessage } from "react-intl";
import {
  Table,
  Button,
  Modal,
  Tooltip,
  Icon,
  Select,
} from "choerodon-ui";
import {
  Content,
  Header,
  Page,
  Permission,
  stores,
} from "choerodon-front-boot";
import _ from "lodash";
import TimePopover from "../../../../components/timePopover";
import '../../../main.scss';
import './AutoDeployHome.scss';
import CreateAutoDeploy from "../createAutoDeploy/CreateAutoDeploy";
import DepPipelineEmpty from "../../../../components/DepPipelineEmpty/DepPipelineEmpty";
import DeploymentPipelineStore from "../../../../stores/project/deploymentPipeline";

const { Option } = Select;
const { AppState } = stores;
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

@observer
class AutoDeployHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: null,
      envId: null,
      appId: null,
      id: null,
      name: null,
      deleteLoading: false,
      isEnabled: null,
      isEnabledLoading: false,
    };
  }

  componentDidMount() {
    const { AutoDeployStore } = this.props;
    const { projectId } = AppState.currentMenuType;
    DeploymentPipelineStore.loadActiveEnv(projectId);
    AutoDeployStore.loadAppData(projectId);
    AutoDeployStore.loadTaskList({ projectId });
  }

  componentWillUnmount() {

  }


  /**
   * 处理刷新函数
   */
  handleRefresh = () => {
    const { AutoDeployStore } = this.props;
    const { projectId } = AppState.currentMenuType;
    const pageInfo = AutoDeployStore.getPageInfo;
    const { filters, sort, paras } = AutoDeployStore.getInfo;
    DeploymentPipelineStore.loadActiveEnv(projectId);
    AutoDeployStore.loadAppData(projectId);
    this.tableChange(pageInfo, filters, sort, paras);
  };

  /**
   * 展开弹窗
   */
  showSidebar = (type, id = null, name = null, isEnabled = null) => {
    this.setState({ type, id, name, isEnabled });
  };

  /**
   * 关闭弹窗
   */
  handClose = (flag) => {
    if (flag) {
      const { AutoDeployStore } = this.props;
      const { projectId } = AppState.currentMenuType;
      const { envId, appId } = this.state;
      AutoDeployStore.setInfo({
        filters: {},
        sort: { columnKey: "", order: "descend" },
        paras: [],
      });
      AutoDeployStore.loadTaskList({ projectId, envId, appId });
    }
    this.setState({ type: null, id: null, name: null });
  };

  /**
   * 跳转到自动部署记录总览
   */
  linkToRecord = () => {
    const { history } = this.props;
    const {
      type,
      projectId,
      organizationId,
      name,
    } = AppState.currentMenuType;
    history.push(
      `/devops/auto-deploy/record?type=${type}&id=${projectId}&name=${name}&organizationId=${organizationId}`
    );
  };

  /**
   * table 操作
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange = (pagination, filters, sorter, paras) => {
    const { AutoDeployStore } = this.props;
    const {
      projectId,
    } = AppState.currentMenuType;
    const { appId, envId } = this.state;
    AutoDeployStore.setInfo({ filters, sort: sorter, paras });
    const sort = { field: "", order: "desc" };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      if (sorter.order === "ascend") {
        sort.order = "asc";
      } else if (sorter.order === "descend") {
        sort.order = "desc";
      }
    }
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    AutoDeployStore.loadTaskList({
      projectId,
      envId,
      appId,
      page: pagination.current - 1,
      size: pagination.pageSize,
      sort,
      postData,
    });
  };

  /**
   * 获取行
   */
  getColumn = () => {
    const {
      type,
      projectId,
      organizationId,
      name,
    } = AppState.currentMenuType;
    const {
      AutoDeployStore,
      intl: { formatMessage },
    } = this.props;
    const {
      filters,
      sort: { columnKey, order },
    } = AutoDeployStore.getInfo;
    return [
      {
        title: <FormattedMessage id="autoDeploy.task.name" />,
        key: "taskName",
        dataIndex: "taskName",
        sorter: true,
        sortOrder: columnKey === 'taskName' && order,
        filters: [],
        filteredValue: filters.taskName || [],
        render: (text, record) => {
          const { appId, envId, taskName } = record;
          return (
            <Link
              to={{
                pathname: `/devops/auto-deploy/record`,
                search: `?type=${type}&id=${projectId}&name=${name}&organizationId=${organizationId}`,
                state: { appId, envId, taskName },
              }}
            >
              <span>{text}</span>
            </Link>
          )
        },
      },
      {
        title: <FormattedMessage id="deploy.app" />,
        key: "appName",
        dataIndex: "appName",
      },
      {
        title: <FormattedMessage id="autoDeploy.version.type" />,
        key: "triggerVersion",
        dataIndex: "triggerVersion",
        filters: [],
        filteredValue: filters.triggerVersion || [],
        render: this.getVersionType,
      },
      {
        title: <FormattedMessage id="deploy.env" />,
        dataIndex: "envName",
        key: "envName",
        render: (text, record) => (
          <div>
            {record.envStatus ? (
              <span className="c7ncd-status c7ncd-status-success" />
            ) : (
              <span className="c7ncd-status c7ncd-status-disconnect" />
            )}
            {text}
          </div>
        ),
      },
      {
        title: <FormattedMessage id="ist.expand.date" />,
        dataIndex: "lastUpdateDate",
        key: "lastUpdateDate",
        render: text => <TimePopover content={text} />,
      },
      {
        width: 105,
        key: "action",
        render: (test, record) => (
          <div>
            <Permission
              type={type}
              projectId={projectId}
              organizationId={organizationId}
              service={['devops-service.devops-auto-deploy.create']}>
              <Tooltip
                placement="bottom"
                title={<FormattedMessage id="edit" />}
              >
                <Button
                  icon="mode_edit"
                  shape="circle"
                  size="small"
                  onClick={this.showSidebar.bind(this, 'edit', record.id)}
                />
              </Tooltip>
            </Permission>
            <Permission
              type={type}
              projectId={projectId}
              organizationId={organizationId}
              service={['devops-service.devops-auto-deploy.updateIsEnabled']}>
              <Tooltip
                placement="bottom"
                title={<FormattedMessage id={record.isEnabled ? "stop" : "active"} />}
              >
                <Button
                  icon={record.isEnabled ? "remove_circle_outline" : "finished"}
                  shape="circle"
                  size="small"
                  onClick={this.showSidebar.bind(this, 'isEnabled', record.id, record.taskName, record.isEnabled)}
                />
              </Tooltip>
            </Permission>
            {!record.isEnabled ? <Permission
              type={type}
              projectId={projectId}
              organizationId={organizationId}
              service={['devops-service.devops-auto-deploy.deleteById']}>
              <Tooltip
                placement="bottom"
                title={<FormattedMessage id="delete" />}
              >
                <Button
                  icon="delete_forever"
                  shape="circle"
                  size="small"
                  onClick={this.showSidebar.bind(this, 'delete', record.id, record.taskName)}
                />
              </Tooltip>
            </Permission> : null}
          </div>
        ),
      },
    ];
  };

  /**
   * 获取版本类型
   */
  getVersionType = (type) => {
    const list = [];
    if (type.length) {
      list.push(_.map(type, (item, index) => (
        <div className="c7n-autoDeploy-version-type" key={index}>
          <span>{item}</span>
        </div>
      )))
    }
    return <Fragment>{list}</Fragment>;
  };

  /**
   * 应用、环境选择回调
   * @param value
   * @param type
   */
  handleSelect = (value, type) => {
    const pageInfo = {
      current: 1,
      total: 0,
      pageSize: HEIGHT <= 900 ? 10 : 15,
    };
    const sort = { columnKey: "", order: "descend" };
    this.setState({ [type]: value }, () => this.tableChange(pageInfo, {}, sort, []) );
  };

  /**
   * 删除自动部署任务
   */
  handleDelete = () => {
    const { AutoDeployStore } = this.props;
    const { projectId } = AppState.currentMenuType;
    const { id, name } = this.state;
    this.setState({ deleteLoading: true });
    AutoDeployStore.deleteData(projectId, id, name)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handClose(true);
        }
        this.setState({ deleteLoading: false })
      })
      .catch(error => {
        this.setState({ deleteLoading: false });
        Choerodon.handleResponseError(error);
      });
  };

  /**
   * 启停用自动部署任务
   */
  handleIsEnabled = () => {
    const { isEnabled, id } = this.state;
    const { AutoDeployStore } = this.props;
    const { projectId } = AppState.currentMenuType;
    this.setState({ isEnabledLoading: true });
    AutoDeployStore.changeIsEnabled(projectId, id, isEnabled ? 0 : 1)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handClose(true);
        }
        this.setState({ isEnabledLoading: false })
      })
      .catch(error => {
        this.setState({ isEnabledLoading: false });
        Choerodon.handleResponseError(error);
      });
  };

  render() {
    const {
      type,
      projectId,
      organizationId: orgId,
      name,
    } = AppState.currentMenuType;
    const { intl: { formatMessage }, AutoDeployStore } = this.props;
    const {
      name: deleteName,
      deleteLoading,
      type: sidebarType,
      id,
      isEnabled,
      isEnabledLoading,
    } = this.state;
    const { loading, pageInfo, taskList } = AutoDeployStore;
    const { paras } = AutoDeployStore.getInfo;
    const envData = DeploymentPipelineStore.getEnvLine;
    const envNames = _.filter(envData, [
      "permission",
      true,
    ]);
    const appData = AutoDeployStore.getAppData;

    return (
      <Page
        className="c7n-region"
        service={[
          "devops-service.devops-auto-deploy.create",
          "devops-service.devops-auto-deploy.pageByOptions",
          "devops-service.devops-auto-deploy.deleteById",
          "devops-service.devops-environment.listByProjectIdAndActive",
          "devops-service.application.pageByOptions",
          "devops-service.devops-auto-deploy.queryById",
          "devops-service.devops-auto-deploy.checkName",
          "devops-service.application-version.queryByProjectId",
          "devops-service.devops-auto-deploy.updateIsEnabled",
        ]}
      >
        {envNames && envNames.length ? (<Fragment>
          <Header
            title={<FormattedMessage id="autoDeploy.header" />}
          >
            <Permission
              service={["devops-service.devops-auto-deploy.create"]}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                onClick={this.showSidebar.bind(this, 'create')}
                icon="playlist_add"
              >
                <FormattedMessage id="autoDeploy.create" />
              </Button>
            </Permission>
            <Button
              onClick={this.linkToRecord}
              icon="deploy_list"
            >
              <FormattedMessage id="autoDeploy.record" />
            </Button>
            <Button
              onClick={this.handleRefresh}
              icon="refresh"
            >
              <FormattedMessage id="refresh" />
            </Button>
          </Header>
          <Content
            className="page-content c7n-autoDeploy-wrapper"
            code="autoDeploy"
            values={{ name }}
          >
            <Select
              className="c7n-autoDeploy-select"
              label={formatMessage({ id: "chooseApp" })}
              optionFilterProp="children"
              onChange={ value => this.handleSelect(value, 'appId')}
              filter
              allowClear
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {
                _.map(appData, item => (
                  <Option key={item.id}>
                    {item.name}
                  </Option>
                ))
              }
            </Select>
            <Select
              className="c7n-autoDeploy-select"
              label={formatMessage({ id: "container.chooseEnv" })}
              optionFilterProp="children"
              onChange={value => this.handleSelect(value, 'envId')}
              filter
              allowClear
              filterOption={(input, option) =>
                option.props.children[1]
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {
                _.map(envData, item => (
                  <Option
                    key={item.id}
                    value={item.id}
                    disabled={!item.permission}
                  >
                    {item.connect ? (
                      <span className="c7ncd-status c7ncd-status-success" />
                    ) : (
                      <span className="c7ncd-status c7ncd-status-disconnect" />
                    )}
                    {item.name}
                  </Option>
                ))
              }
            </Select>
            <Table
              filterBarPlaceholder={formatMessage({ id: "filter" })}
              loading={loading}
              pagination={pageInfo}
              columns={this.getColumn()}
              dataSource={taskList.slice()}
              rowKey={record => record.id}
              onChange={this.tableChange}
              filters={paras.slice()}
            />
          </Content>
          <Modal
            confirmLoading={deleteLoading}
            visible={sidebarType === 'delete'}
            title={`${formatMessage({ id: "autoDeploy.delete" })}“${deleteName}”`}
            closable={false}
            onOk={this.handleDelete}
            onCancel={this.handClose.bind(this, false)}
            okText={formatMessage({ id: "delete" })}
            okType="danger"
          >
            <div className="c7n-padding-top_8">
              <FormattedMessage id="autoDeploy.delete.tooltip" />
            </div>
          </Modal>
          <Modal
            confirmLoading={isEnabledLoading}
            visible={sidebarType === 'isEnabled'}
            title={`${formatMessage({ id: isEnabled ? "stop" : "active" })}“${deleteName}”`}
            closable={false}
            onOk={this.handleIsEnabled}
            onCancel={this.handClose.bind(this, false)}
          >
            <div className="c7n-padding-top_8">
              <FormattedMessage id={`autoDeploy.${isEnabled ? "stop" : "active"}.tooltip`} />
            </div>
          </Modal>
        </Fragment>) : (
          <DepPipelineEmpty
            title={<FormattedMessage id="autoDeploy.header" />}
            type="env"
          />
        )}
        {(sidebarType === 'create' || sidebarType === 'edit') &&
          <CreateAutoDeploy
            sidebarType={sidebarType}
            store={AutoDeployStore}
            onClose={this.handClose}
            id={id}
          />
        }
      </Page>
    );
  }
}

export default withRouter(injectIntl(AutoDeployHome));
