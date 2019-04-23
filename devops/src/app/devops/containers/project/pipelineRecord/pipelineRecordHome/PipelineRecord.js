import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
  Table,
  Button,
  Modal,
  Tooltip,
  Select,
} from 'choerodon-ui';
import {
  Content,
  Header,
  Page,
  Permission,
} from 'choerodon-front-boot';
import _ from 'lodash';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
import './PipelineRecord.scss';
import StatusTags from '../../../../components/StatusTags/StatusTags';
import { HEIGHT } from '../../../../common/Constants';

const { Option } = Select;
const STATUS_COLOR = {
  success: '#00BFA5',
  running: '#4D90FE',
  failed: '#F44336',
  stop: '#FF7043',
  deleted: '#D3D3D3',
  pendingcheck: '#FFB100',
};

@injectIntl
@withRouter
@inject('AppState')
@observer
class PipelineRecord extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      pipelineId: null,
      id: null,
      name: null,
      checkData: {},
      show: false,
      showRetry: false,
      passLoading: false,
      stopLoading: false,
      submitting: false,
    };
  }

  componentDidMount() {
    const {
      PipelineRecordStore,
      AppState: { currentMenuType: { projectId } },
      location: { state },
    } = this.props;
    PipelineRecordStore.loadPipelineData(projectId);
    if (state && state.pipelineId) {
      this.setState({ pipelineId: state.pipelineId });
      PipelineRecordStore.loadRecordList(projectId, state.pipelineId, 0, HEIGHT < 900 ? 10 : 15);
    } else {
      PipelineRecordStore.loadRecordList(projectId, null, 0, HEIGHT < 900 ? 10 : 15);
    }
  }

  /**
   * 加载流水线执行总览列表
   */
  loadData = () => {
    const {
      PipelineRecordStore,
      AppState: { currentMenuType: { projectId } },
    } = this.props;
    const { pipelineId } = this.state;
    PipelineRecordStore.setInfo({
      filters: {},
      sort: { columnKey: 'id', order: 'descend' },
      paras: [],
    });
    PipelineRecordStore.loadRecordList(projectId, pipelineId, 0, HEIGHT < 900 ? 10 : 15);
  };

  /**
   * 处理刷新函数
   */
  handleRefresh = () => {
    const { PipelineRecordStore } = this.props;
    const pageInfo = PipelineRecordStore.getPageInfo;
    const { filters, sort, paras } = PipelineRecordStore.getInfo;
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
    const {
      PipelineRecordStore,
      AppState: { currentMenuType: { projectId } },
    } = this.props;
    const { pipelineId } = this.state;
    PipelineRecordStore.setInfo({ filters, sort: sorter, paras });
    const sort = { field: 'id', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      if (sorter.order === 'ascend') {
        sort.order = 'asc';
      } else if (sorter.order === 'descend') {
        sort.order = 'desc';
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
    PipelineRecordStore.loadRecordList(
      projectId,
      pipelineId,
      pagination.current - 1,
      pagination.pageSize,
      sort,
      postData,
    );
  };

  /**
   * 选择流水线
   */
  handleSelect = (value) => {
    const { PipelineRecordStore } = this.props;
    PipelineRecordStore.setInfo({
      filters: {},
      sort: { columnKey: 'id', order: 'descend' },
      paras: [],
    });
    this.setState({ pipelineId: value }, () => this.loadData());
  };

  /**
   * 获取表格行
   */
  getColumns = () => {
    const {
      PipelineRecordStore,
      intl: { formatMessage },
      AppState: {
        currentMenuType: {
          projectId,
          type,
          organizationId,
        },
      },
    } = this.props;
    const {
      filters,
      sort: { columnKey, order },
    } = PipelineRecordStore.getInfo;
    return [
      {
        title: formatMessage({ id: 'pipelineRecord.pipeline.status' }),
        key: 'status',
        dataIndex: 'status',
        sorter: true,
        sortOrder: columnKey === 'status' && order,
        filters: _.map(['success', 'failed', 'running', 'stop', 'pendingcheck', 'deleted'], item => (
          {
            text: formatMessage({ id: `pipelineRecord.status.${item}` }),
            value: item,
          }
        )),
        filteredValue: filters.status || [],
        render: text => (
          <StatusTags name={formatMessage({ id: `pipelineRecord.status.${text}` })} color={STATUS_COLOR[text]} />),
      },
      {
        title: formatMessage({ id: 'pipeline.trigger' }),
        key: 'triggerType',
        dataIndex: 'triggerType',
        sorter: true,
        sortOrder: columnKey === 'triggerType' && order,
        filters: [
          {
            text: formatMessage({ id: 'pipeline.trigger.auto' }),
            value: 'auto',
          },
          {
            text: formatMessage({ id: 'pipeline.trigger.manual' }),
            value: 'manual',
          },
        ],
        filteredValue: filters.triggerType || [],
        render: text => (<FormattedMessage id={`pipeline.trigger.${text}`} />),
      },
      {
        title: formatMessage({ id: 'pipelineRecord.pipeline.name' }),
        key: 'name',
        dataIndex: 'name',
      },
      {
        title: formatMessage({ id: 'pipelineRecord.process' }),
        key: 'stageDTOList',
        dataIndex: 'stageDTOList',
        render: this.getProcess,
      },
      {
        title: <FormattedMessage id="ist.expand.date" />,
        dataIndex: 'lastUpdateDate',
        key: 'lastUpdateDate',
        render: text => <TimePopover content={text} />,
      },
      {
        key: 'action',
        align: 'right',
        render: (text, record) => {
          const { status, type: checkType, id, name, stageName, stageRecordId, taskRecordId, pipelineId, index } = record;
          return (<div>
              {index && status === 'failed' && (
                <Permission
                  type={type}
                  projectId={projectId}
                  organizationId={organizationId}
                  service={['devops-service.pipeline.retry']}
                >
                  <Tooltip
                    placement="bottom"
                    title={<FormattedMessage id="pipelineRecord.retry" />}
                  >
                    <Button
                      icon="replay"
                      shape="circle"
                      size="small"
                      onClick={this.openRetry.bind(this, id, name)}
                    />
                  </Tooltip>
                </Permission>
              )}
              {index && status === 'pendingcheck' && (
                <Permission
                  type={type}
                  projectId={projectId}
                  organizationId={organizationId}
                  service={['devops-service.pipeline.audit']}
                >
                  <Tooltip
                    placement="bottom"
                    title={<FormattedMessage id="pipelineRecord.check.manual" />}
                  >
                    <Button
                      icon="authorize"
                      shape="circle"
                      size="small"
                      onClick={this.showSidebar.bind(this, id, checkType, name, stageName, stageRecordId, taskRecordId)}
                    />
                  </Tooltip>
                </Permission>
              )}
              <Permission
                type={type}
                projectId={projectId}
                organizationId={organizationId}
                service={['devops-service.pipeline.getRecordById']}
              >
                <Tooltip
                  placement="bottom"
                  title={<FormattedMessage id="pipelineRecord.detail" />}
                >
                  <Button
                    icon="find_in_page"
                    shape="circle"
                    size="small"
                    onClick={this.linkToDetail.bind(this, id, pipelineId, name)}
                  />
                </Tooltip>
              </Permission>
            </div>
          );
        },
      },
    ];
  };

  /**
   * 获取流程列
   * @param stageDTOList
   * @param record
   * @returns {*}
   */
  getProcess = (stageDTOList, record) => {
    const { type, stageRecordId, status: pipelineStatus } = record;
    return (
      <div className="c7n-pipelineRecord-process">
        {
          _.map(stageDTOList, ({ status, id }) => {
            return (<div key={id} className="c7n-process-content">
              <span className={`c7n-process-line ${stageRecordId === id && type === "stage" ? `c7n-process-line-${pipelineStatus}` : ""}`} />
              <span className={`c7n-process-status c7n-process-status-${status}`} />
            </div>);
          })
        }
      </div>
    );
  };

  /**
   * 跳转到流水线详情
   * @param recordId
   * @param pId
   * @param name
   */
  linkToDetail = (recordId, pId, name) => {
    const {
      match,
      history,
      location: {
        search,
        state,
      },
    } = this.props;
    const { pipelineId } = this.state;
    const { fromPipeline } = state || {};

    history.push({
      pathname: `/devops/pipeline/detail/${pipelineId}/${recordId}`,
      search,
      state: {
        recordId,
        name,
        pipelineId: pId,
        isFilter: !!pipelineId,
        fromPipeline,
      },
    });
  };

  /**
   * 处理重新执行操作
   */
  handleRetry = () => {
    const {
      PipelineRecordStore,
      AppState: { currentMenuType: { projectId } },
    } = this.props;
    const { id } = this.state;
    this.setState({ submitting: true });
    PipelineRecordStore.retry(projectId, id)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.setState({ showRetry: false, id: null });
          this.loadData();
        }
        this.setState({ submitting: false });
      });
  };

  /**
   * 中止或通过人工审核
   * @param flag 是否通过
   */
  handleSubmit = (flag) => {
    const {
      PipelineRecordStore,
      AppState: {
        currentMenuType: { projectId },
        userInfo: { id: userId },
      },
    } = this.props;
    const {
      id,
      checkData: {
        stageRecordId,
        taskRecordId,
        checkType,
      },
    } = this.state;
    const data = {
      pipelineRecordId: id,
      userId,
      isApprove: flag,
      type: checkType,
      stageRecordId,
      taskRecordId,
    };
    this.setState({ [flag ? 'passLoading' : 'stopLoading']: true });
    PipelineRecordStore.checkData(projectId, data)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.handClose(true);
        }
        this.setState({ [flag ? 'passLoading' : 'stopLoading']: false });
      });
  };

  /**
   * 展开重试弹窗
   * @param id 流水线执行记录id
   */
  openRetry = (id, name) => {
    this.setState({ showRetry: true, id, name });
  };

  /**
   * 关闭重试弹窗
   */
  closeRetry = () => {
    this.setState({ showRetry: false, id: null, name: null });
  };

  /**
   * 展开弹窗
   * @param checkType 阶段间或人工卡点时审核
   * @param id 流水线执行记录id
   * @param name 流水线名称
   * @param stageName 流阶段名称
   * @param stageRecordId 阶段id
   * @param taskRecordId 任务id
   */
  showSidebar = (id = null, checkType, name, stageName, stageRecordId = null, taskRecordId = null) => {
    this.setState({
      show: true,
      id,
      name,
      checkData: {
        checkType,
        stageName,
        stageRecordId,
        taskRecordId,
      },
    });
  };

  /**
   * 关闭弹窗
   * @param flag 是否重新加载列表数据
   */
  handClose = (flag) => {
    if (flag) {
      this.loadData();
    }
    this.setState({ show: false, id: null, name: null, checkData: {} });
  };

  render() {
    const {
      PipelineRecordStore,
      intl: { formatMessage },
      location: {
        state,
        search,
      },
      AppState: {
        currentMenuType: {
          name,
        },
      },
    } = this.props;
    const {
      pipelineId,
      show,
      passLoading,
      stopLoading,
      name: pipelineName,
      checkData: {
        stageName,
        checkType,
      },
      showRetry,
      submitting,
    } = this.state;

    const { loading, pageInfo } = PipelineRecordStore;
    const pipelineData = PipelineRecordStore.getPipelineData;
    const data = PipelineRecordStore.getRecordList;
    const { paras } = PipelineRecordStore.getInfo;

    const { fromPipeline } = state || {};
    const backPath = fromPipeline ? `/devops/pipeline${search}` : null;

    return (
      <Page
        className="c7n-region c7n-pipelineRecord-wrapper"
        service={[
          'devops-service.pipeline.listRecords',
          'devops-service.pipeline.listPipelineDTO',
          'devops-service.pipeline.getRecordById',
          'devops-service.pipeline.retry',
          'devops-service.pipeline.audit',
        ]}
      >
        <Header
          title={formatMessage({ id: 'pipelineRecord.header' })}
          backPath={backPath}
        >
          <Button
            onClick={this.handleRefresh}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="pipelineRecord" values={{ name }}>
          <Select
            label={formatMessage({ id: 'pipelineRecord.pipeline.name' })}
            className="c7n-pipelineRecord-select"
            optionFilterProp="children"
            onChange={this.handleSelect}
            value={pipelineId || undefined}
            filter
            allowClear
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {
              _.map(pipelineData, ({ id, name }) => (
                <Option
                  key={id}
                  value={id}
                >
                  {name}
                </Option>
              ))
            }
          </Select>
          <Table
            filterBarPlaceholder={formatMessage({ id: 'filter' })}
            loading={loading}
            onChange={this.tableChange}
            pagination={pageInfo}
            columns={this.getColumns()}
            dataSource={data}
            rowKey={record => record.id}
            filters={paras.slice()}
          />
        </Content>
        {showRetry && (
          <Modal
            confirmLoading={submitting}
            visible={showRetry}
            title={`${formatMessage({ id: 'pipelineRecord.retry.title' }, { name: pipelineName })}`}
            closable={false}
            onOk={this.handleRetry}
            onCancel={this.closeRetry}
          >
            <div className="c7n-padding-top_8">
              <FormattedMessage id="pipelineRecord.retry.des" />
            </div>
          </Modal>
        )}
        {show && (
          <Modal
            visible={show}
            title={formatMessage({ id: 'pipelineRecord.check.manual' })}
            closable={false}
            footer={[
              <Button
                key="back"
                onClick={this.handClose.bind(this, false)}
                disabled={stopLoading || passLoading}
              >
                <FormattedMessage id="pipelineRecord.check.cancel" />
              </Button>,
              <Button
                key="stop"
                loading={stopLoading}
                type="primary"
                onClick={this.handleSubmit.bind(this, false)}
                disabled={passLoading}
              >
                <FormattedMessage id="pipelineRecord.check.stop" />
              </Button>,
              <Button
                key="pass"
                loading={passLoading}
                type="primary"
                onClick={this.handleSubmit.bind(this, true)}
                disabled={stopLoading}
              >
                <FormattedMessage id="pipelineRecord.check.pass" />
              </Button>,
            ]}
          >
            <div className="c7n-padding-top_8">
              <FormattedMessage id={`pipelineRecord.check.${checkType}.des`}
                                values={{ name: pipelineName, stage: stageName }} />
            </div>
          </Modal>
        )}
      </Page>
    );
  }
}

export default PipelineRecord;
