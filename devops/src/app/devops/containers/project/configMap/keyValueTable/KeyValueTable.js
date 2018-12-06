import React, { Component, Fragment } from "react";
import { observer } from "mobx-react";
import { injectIntl, FormattedMessage } from "react-intl";
import { Table, Button, Tooltip, Modal } from "choerodon-ui";
import { Permission, stores } from "choerodon-front-boot";
import MouserOverWrapper from "../../../../components/MouseOverWrapper";
import TimePopover from '../../../../components/timePopover';
import StatusTags from '../../../../components/StatusTags';
import EnvOverviewStore from "../../../../stores/project/envOverview";

const { AppState } = stores;
const HEIGHT =
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

@observer
class KeyValueTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteStatus: false,
      removeDisplay: false,
      delName: '',
      delId: false,
    };
  }

  componentWillUnmount() {
    const { store } = this.props;
    store.setData([]);
    store.setPageInfo({
      current: 0,
      total: 0,
      pageSize: HEIGHT <= 900 ? 10 : 15,
    });
  }

  /**
   * 删除
   */
  deleteConfigMap = () => {
    const { store, envId } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { delId } = this.state;
    const configMaps = store.getData;
    this.setState({ deleteStatus: true });
    store
      .deleteConfigMap(projectId, delId)
      .then((data) => {
        const pagination = store.getPageInfo;
        let page = pagination.current - 1;
        if (data && data.failed) {
          Choerodon.prompt(data.message);
          this.setState({
            deleteStatus: false,
          })
        } else {
          this.setState({
            delId: null,
            removeDisplay: false,
            deleteStatus: false,
          }, () => {
            if (configMaps.length % this.state.size === 1) {
              store.loadConfigMap(projectId, envId, page - 1, pagination.pageSize);
            } else {
              store.loadConfigMap(projectId, envId, page, pagination.pageSize);
            }
          })
        }
      })
  };

  /**
   * 表格筛选排序等
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange = (pagination, filters, sorter, paras) => {
    const { store, envId } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    store.setInfo({ filters, sort: sorter, paras });
    let sort = { field: '', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      if(sorter.order === 'ascend') {
        sort.order = 'asc';
      } else if(sorter.order === 'descend'){
        sort.order = 'desc';
      }
    }
    let page = pagination.current - 1;
    let searchParam = {};
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    store.loadConfigMap(projectId, envId, page, pagination.pageSize, sort, postData);
  };

  /**
   * 显示删除确认框
   * @param id
   * @param name
   */
  openRemove = (id, name) => {
    this.setState({
      removeDisplay: true,
      delId: id,
      delName: name,
    });
  };

  closeRemoveModal = () => this.setState({ removeDisplay: false });


  render() {
    const {
      intl: { formatMessage },
      store,
      envId,
    } = this.props;
    const { removeDisplay, deleteStatus, delName } = this.state;
    const { filters, sort: { columnKey, order }, paras } = store.getInfo;
    const {
      type,
      id: projectId,
      organizationId,
    } = AppState.currentMenuType;
    const data = store.getData;
    const envData = EnvOverviewStore.getEnvcard;
    const envState = envData.length
      ? envData.filter(d => d.id === Number(envId))[0]
      : { connect: false };

    const columns = [
      {
        title: <FormattedMessage id="app.active" />,
        key: 'status',
        render: record => <StatusTags name={formatMessage({ id: record.commandStatus })} colorCode={record.commandStatus} />,
      },{
        title: <FormattedMessage id="app.name" />,
        key: 'name',
        sorter: true,
        sortOrder: columnKey === 'name' && order,
        filters: [],
        filteredValue: filters.name || [],
        render: record => (<Tooltip placement="bottom" title={`${formatMessage({ id: "ist.des" })}${record.description}`}>
            {record.name}
        </Tooltip>),
      }, {
        title: <FormattedMessage id="configMap.key" />,
        dataIndex: 'key',
        key: 'key',
        render: text => (<MouserOverWrapper text={text.join(',')} width={0.25}>
          {text.join(',')}
        </MouserOverWrapper>),
      }, {
        title: <FormattedMessage id="ciPipeline.createdAt" />,
        dataIndex: 'lastUpdateDate',
        key: 'createdAt',
        render: text => <TimePopover content={text} />,
      }, {
        align: 'right',
        width: 104,
        key: 'action',
        render: record => (
          <Fragment>
            <Permission type={type} projectId={projectId} organizationId={organizationId} service={['devops-service.devops-config-map.create']}>
              <Tooltip
                placement="bottom"
                title={envState && !envState.connect ? <FormattedMessage id="envoverview.envinfo" /> : <FormattedMessage id="edit" />}
              >
                <Button
                  disabled={record.commandStatus === 'operating' || (envState && !envState.connect)}
                  icon="mode_edit"
                  shape="circle"
                  size="small"
                  onClick={this.props.editOpen.bind(this, record.id)}
                />
              </Tooltip>
            </Permission>
            <Permission type={type} projectId={projectId} organizationId={organizationId} service={['devops-service.devops-config-map.delete']}>
              <Tooltip
                placement="bottom"
                title={envState && !envState.connect ? <FormattedMessage id="envoverview.envinfo" /> : <FormattedMessage id="delete" />}
              >
                <Button
                  disabled={record.commandStatus === 'operating' || (envState && !envState.connect)}
                  icon="delete_forever"
                  shape="circle"
                  size="small"
                  onClick={this.openRemove.bind(this, record.id, record.name)}
                />
              </Tooltip>
            </Permission>
          </Fragment>
        ),
      }];

    return (
      <Fragment>
        <Table
          filterBarPlaceholder={formatMessage({ id: 'filter' })}
          loading={store.loading}
          pagination={store.getPageInfo}
          columns={columns}
          filters={paras.slice()}
          dataSource={data}
          rowKey={record => record.id}
          onChange={this.tableChange}
        />
        <Modal
          confirmLoading={deleteStatus}
          visible={removeDisplay}
          title={`${formatMessage({ id: "configMap.del" })}“${delName}”`}
          closable={false}
          footer={[
            <Button
              key="back"
              onClick={this.closeRemoveModal}
              disabled={deleteStatus}
            >
              <FormattedMessage id="cancel" />
            </Button>,
            <Button
              key="submit"
              loading={deleteStatus}
              type="danger"
              onClick={this.deleteConfigMap}
            >
              <FormattedMessage id="delete" />
            </Button>,
          ]}
        >
          <div className="c7n-padding-top_8">
            <FormattedMessage id="configMap.del.tooltip" />
          </div>
        </Modal>
      </Fragment>
    );
  }
}

export default injectIntl(KeyValueTable);
