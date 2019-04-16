import React, { Component, Fragment } from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { injectIntl, FormattedMessage } from "react-intl";
import {
  Table,
  Button,
  Modal,
  Tooltip,
  Avatar,
} from "choerodon-ui";
import {
  Content,
  Header,
  Page,
  Permission,
  stores,
} from "choerodon-front-boot";
import TimePopover from "../../../../components/timePopover";
import '../../../main.scss';
import './DeploymentConfig.scss';
import EnvFlag from "../../../../components/envFlag";
import DeploymentConfigCreate from "../deploymentConfigCreate";

const { AppState } = stores;
const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

@observer
class DeploymentConfig extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      sidebarType: null,
      id: null,
      name: null,
      deleteLoading: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    const { projectId } = AppState.currentMenuType;
    const { DeploymentConfigStore } = this.props;
    DeploymentConfigStore.loadAllData(projectId, 0, HEIGHT < 900 ? 10 : 15);
  };

  /**
   * 处理刷新函数
   */
  handleRefresh = () => {
    const { DeploymentConfigStore } = this.props;
    const pageInfo = DeploymentConfigStore.getPageInfo;
    const { filters, sort, paras } = DeploymentConfigStore.getInfo;
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
    const { DeploymentConfigStore } = this.props;
    const {
      projectId,
    } = AppState.currentMenuType;
    DeploymentConfigStore.setInfo({ filters, sort: sorter, paras });
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
    DeploymentConfigStore.loadAllData(
      projectId,
      pagination.current - 1,
      pagination.pageSize,
      sort,
      postData,
    );
  };

  /**
   * 获取表格行
   */
  getColumns = () => {
    const {
      DeploymentConfigStore,
      intl: { formatMessage },
    } = this.props;
    const {
      type,
      projectId,
      organizationId,
    } = AppState.currentMenuType;
    const {
      filters,
      sort: { columnKey, order },
    } = DeploymentConfigStore.getInfo;
    return [
      {
        title: formatMessage({ id: "app.name" }),
        key: "name",
        dataIndex: "name",
        sorter: true,
        sortOrder: columnKey === "name" && order,
        filters: [],
        filteredValue: filters.name || [],
      },
      {
        title: formatMessage({ id: "template.des" }),
        key: "description",
        dataIndex: "description",
        sorter: true,
        sortOrder: columnKey === "description" && order,
        filters: [],
        filteredValue: filters.description || [],
      },
      {
        title: formatMessage({ id: "deploy.app" }),
        key: "appName",
        dataIndex: "appName",
      },
      {
        title: formatMessage({ id: "deploy.env" }),
        key: "envName",
        render: record => (
          <EnvFlag status={record.envStatus} name={record.envName} />
        ),
      },
      {
        title: formatMessage({ id: "app.creator" }),
        key: "creator",
        render: record => {
          const { createUserUrl, createUserRealName, createUserName } = record;
          return (<div>
            {createUserUrl ? (
              <Avatar src={createUserUrl} size={18} />
            ) : (
              <Avatar size={18}>{createUserRealName ? createUserRealName.toString().slice(0, 1).toUpperCase() : '?'}</Avatar>
            )}
            <span className="c7n-mg-left-8">{createUserName}&nbsp;{createUserRealName}</span>
          </div>)
        },
      },
      {
        title: <FormattedMessage id="ist.expand.date" />,
        dataIndex: "lastUpdateDate",
        key: "lastUpdateDate",
        render: text => <TimePopover content={text} />,
      },
      {
        key: "action",
        render: (test, record) => (
          <div>
            <Permission
              type={type}
              projectId={projectId}
              organizationId={organizationId}
              service={["devops-service.pipeline-value.createOrUpdate"]}
            >
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
              service={["devops-service.pipeline-value.delete"]}
            >
              <Tooltip
                placement="bottom"
                title={<FormattedMessage id="delete" />}
              >
                <Button
                  icon="delete_forever"
                  shape="circle"
                  size="small"
                  onClick={this.showSidebar.bind(this, 'delete', record.id, record.name)}
                />
              </Tooltip>
            </Permission>
          </div>
        ),
      },
    ];
  };


  /**
   * 展开弹窗
   */
  showSidebar = (sidebarType, id = null, name = null) => {
    this.setState({ sidebarType, id, name });
  };

  /**
   * 关闭弹窗
   */
  handClose = (flag) => {
    if (flag) {
      const { DeploymentConfigStore } = this.props;
      DeploymentConfigStore.setInfo({
        filters: {},
        sort: { columnKey: "id", order: "descend" },
        paras: [],
      });
      this.loadData();
    }
    this.setState({ sidebarType: null, id: null, name: null });
  };

  /**
   * 删除部署配置
   */
  handleDelete = () => {
    const { DeploymentConfigStore, intl: { formatMessage } } = this.props;
    const { projectId } = AppState.currentMenuType;
    const { id } = this.state;
    this.setState({ deleteLoading: true });
    DeploymentConfigStore.deleteData(projectId, id)
      .then(data => {
        if (data) {
          if (data.failed) {
            Choerodon.prompt(data.message);
          } else {
            this.handClose(true);
          }
        } else {
          Choerodon.prompt(formatMessage({ id: "deployment.delete.unable" }));
        }
        this.setState({ deleteLoading: false })
      })
      .catch(error => {
        this.setState({ deleteLoading: false });
        Choerodon.handleResponseError(error);
      });
  };

  render() {
    const {
      DeploymentConfigStore,
      intl: { formatMessage },
    } = this.props;
    const {
      type,
      projectId,
      organizationId: orgId,
      name,
    } = AppState.currentMenuType;
    const {
      sidebarType,
      name: configName,
      id,
      deleteLoading,
    } = this.state;

    const { loading, pageInfo } = DeploymentConfigStore;

    const data = DeploymentConfigStore.getConfigList;
    const {
      paras,
    } = DeploymentConfigStore.getInfo;

    return (
      <Page
        className="c7n-region c7n-deploymentConfig-wrapper"
        service={[
          "devops-service.pipeline-value.listByOptions",
          "devops-service.pipeline-value.queryById",
          "devops-service.pipeline-value.createOrUpdate",
          "devops-service.pipeline-value.delete",
        ]}
      >
        <Header title={formatMessage({ id: "deploymentConfig.header" })}>
          <Permission
            service={["devops-service.pipeline-value.createOrUpdate"]}
            organizationId={orgId}
            projectId={projectId}
            type={type}
          >
            <Button
              onClick={this.showSidebar.bind(this, 'create')}
              icon="playlist_add"
            >
              <FormattedMessage id="deploymentConfig.create.header" />
            </Button>
          </Permission>
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="deploymentConfig" values={{ name }}>
          <Table
            filterBarPlaceholder={formatMessage({ id: "filter" })}
            loading={loading}
            onChange={this.tableChange}
            pagination={pageInfo}
            columns={this.getColumns()}
            dataSource={data}
            rowKey={record => record.id}
            filters={paras.slice()}
          />
        </Content>
        {(sidebarType === 'create' || sidebarType === 'edit') &&
          <DeploymentConfigCreate
            sidebarType={sidebarType}
            store={DeploymentConfigStore}
            onClose={this.handClose}
            id={id}
          />
        }
        <Modal
          confirmLoading={deleteLoading}
          visible={sidebarType === 'delete'}
          title={`${formatMessage({ id: "deploymentConfig.delete" })}“${configName}”`}
          closable={false}
          onOk={this.handleDelete}
          onCancel={this.handClose.bind(this, false)}
          okText={formatMessage({ id: "delete" })}
          okType="danger"
        >
          <div className="c7n-padding-top_8">
            <FormattedMessage id="pipelineRecord.check.des" />
          </div>
        </Modal>
      </Page>
    );
  }
}

export default withRouter(injectIntl(DeploymentConfig));
