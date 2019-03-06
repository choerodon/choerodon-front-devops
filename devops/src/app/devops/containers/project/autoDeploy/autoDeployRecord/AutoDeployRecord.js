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
import '../autoDeployHome/AutoDeployHome.scss';
import StatusTags from "../../../../components/StatusTags/StatusTags";

const { Option } = Select;
const { AppState } = stores;
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

@observer
class AutoDeployRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      envId: null,
      appId: null,
      taskName: null,
    };
  }

  componentDidMount() {
    const {
      AutoDeployStore,
      history: { location: { state }},
    } = this.props;
    const { projectId } = AppState.currentMenuType;
    const envId = state ? state.envId : null;
    const appId = state ? state.appId : null;
    const taskName = state ? state.taskName : null;
    AutoDeployStore.loadEnvData(projectId);
    AutoDeployStore.loadAppData(projectId);
    AutoDeployStore.loadAllTask(projectId);
    this.setState({ envId, appId, taskName });
    AutoDeployStore.loadRecord({ projectId, envId, appId, taskName });
  }

  componentWillUnmount() {

  }

  /**
   * 处理刷新函数
   */
  handleRefresh = () => {
    const { AutoDeployStore } = this.props;
    const { projectId } = AppState.currentMenuType;
    const pageInfo = AutoDeployStore.getRecordPageInfo;
    const { filters, sort, paras } = AutoDeployStore.getRecordInfo;
    AutoDeployStore.loadEnvData(projectId);
    AutoDeployStore.loadAppData(projectId);
    AutoDeployStore.loadAllTask(projectId);
    this.tableChange(pageInfo, filters, sort, paras);
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
    const { appId, envId, taskName } = this.state;
    AutoDeployStore.setRecordInfo({ filters, sort: sorter, paras });
    const sort = { field: "id", order: "desc" };
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
    AutoDeployStore.loadRecord({
      projectId,
      envId,
      appId,
      taskName,
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
    } = AutoDeployStore.getRecordInfo;
    return [
      {
        title: <FormattedMessage id="autoDeploy.task.name" />,
        key: "taskName",
        dataIndex: "taskName",
        sorter: true,
        sortOrder: columnKey === 'taskName' && order,
        filters: [],
        filteredValue: filters.taskName || [],
      },
      {
        title: <FormattedMessage id="status" />,
        key: "status",
        dataIndex: "status",
        render: text => (
          <StatusTags
            name={formatMessage({ id : `autoDeploy.status.${text}`})}
            colorCode={text === "running" ? "operating" : text}
          />
        ),
      },
      {
        title: <FormattedMessage id="deploy.app" />,
        key: "appName",
        dataIndex: "appName",
      },
      {
        title: <FormattedMessage id="deploy.ver" />,
        key: "version",
        dataIndex: "version",
        filters: [],
        filteredValue: filters.version || [],
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
        title: <FormattedMessage id="autoDeploy.record.instance" />,
        dataIndex: "instanceName",
        key: "instanceName",
        render: (text, record) => {
          const { appId, envId, instanceStatus } = record;
          return (instanceStatus === "deleted" ? (
            <div className="c7n-autodDeploy-record-deleted">
              <FormattedMessage id="deleted" />
            </div>
          ) : (
            <Link
              to={{
                pathname: `/devops/instance`,
                search: `?type=${type}&id=${projectId}&name=${name}&organizationId=${organizationId}`,
                state: { appId, envId },
              }}
            >
              <span>{text}</span>
            </Link>
          ))
        },
      },
      {
        title: <FormattedMessage id="autoDeploy.execute.date" />,
        dataIndex: "lastUpdateDate",
        key: "lastUpdateDate",
        render: text => <TimePopover content={text} />,
      },
    ];
  };

  /**
   * 选择应用、环境、任务
   * @param value
   * @param type
   */
  handleSelect = (value, type) => {
    const pageInfo = {
      current: 1,
      total: 0,
      pageSize: HEIGHT <= 900 ? 10 : 15,
    };
    const sort = { columnKey: "id", order: "descend" };
    this.setState({ [type]: value }, () => this.tableChange(pageInfo, {}, sort, []) );
  };

  render() {
    const {
      type,
      projectId,
      organizationId,
      name,
    } = AppState.currentMenuType;
    const { intl: { formatMessage }, AutoDeployStore } = this.props;
    const {
      envId,
      appId,
      taskName,
    } = this.state;
    const { recordLoading, recordPageInfo, recordList } = AutoDeployStore;
    const { paras } = AutoDeployStore.getRecordInfo;
    const envData = AutoDeployStore.getEnvData;
    const appData = AutoDeployStore.getAppData;
    const allTask = AutoDeployStore.getAllTask;

    return (
      <Page
        className="c7n-region"
        service={[
          "devops-service.devops-environment.listByProjectIdAndActive",
          "devops-service.application.pageByOptions",
          "devops-service.devops-auto-deploy.queryRecord",
          "devops-service.devops-auto-deploy.queryByProjectId",
        ]}
      >
        <Header
          title={<FormattedMessage id="autoDeploy.record.header" />}
          backPath={
            `/devops/auto-deploy?type=${type}&id=${projectId}&name=${name}&organizationId=${organizationId}`
          }
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          className="page-content c7n-autoDeploy-record-wrapper"
          code="autoDeploy.record"
          values={{ name }}
        >
          <Select
            className="c7n-autoDeploy-select"
            label={formatMessage({ id: "chooseApp" })}
            value={appId || undefined}
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
                <Option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </Option>
              ))
            }
          </Select>
          <Select
            className="c7n-autoDeploy-select"
            label={formatMessage({ id: "container.chooseEnv" })}
            value={envId || undefined}
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
          <Select
            className="c7n-autoDeploy-select"
            label={formatMessage({ id: "autoDeploy.chooseTask" })}
            value={taskName || undefined}
            optionFilterProp="children"
            onChange={value => this.handleSelect(value, 'taskName')}
            filter
            allowClear
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {
              _.map(allTask, item => (
                <Option
                  key={item.taskName}
                  value={item.taskName}
                >
                  {item.taskName}
                </Option>
              ))
            }
          </Select>
          <Table
            filterBarPlaceholder={formatMessage({ id: "filter" })}
            loading={recordLoading}
            pagination={recordPageInfo}
            columns={this.getColumn()}
            dataSource={recordList.slice()}
            rowKey={record => record.id}
            onChange={this.tableChange}
            filters={paras.slice()}
          />
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(AutoDeployRecord));
