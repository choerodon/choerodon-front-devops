import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Button, Table, Tooltip, Modal, Spin } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import ElementsCreate from '../elementsCreate';
import { handleCheckerProptError } from '../../../../utils';
import { SORTER_MAP } from '../../../../common/Constant';

import './Element.scss';

const { AppState } = stores;
const EDIT_MODE = true;

@injectIntl
@withRouter
@observer
class Elements extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCreation: false,
      showDelete: false,
      deleteId: null,
      deleteName: '',
      deleteLoading: false,
      editMode: false,
      eleIdForEdit: undefined,
      param: '',
      filters: {},
      sorter: {
        columnKey: 'id',
        order: 'descend',
      },
      enableDeleteLoading: false,
      enableDelete: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  handleRefresh = (e, page) => {
    const { ElementsStore } = this.props;
    const { current, pageSize } = ElementsStore.getPageInfo;
    const { param, filters, sorter } = this.state;

    const currentPage = (page || page === 0) ? page : current - 1;
    const sort = { field: 'id', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      sort.order = SORTER_MAP[sorter.order];
    }

    const postData = {
      searchParam: filters,
      param: param.toString(),
    };

    this.loadData(currentPage, pageSize, sort, postData);
  };

  /**
   * 表格变化
   * @param pagination
   * @param filters 指定列字段搜索
   * @param sorter
   * @param param 模糊搜索
   */
  tableChange = (pagination, filters, sorter, param) => {
    const page = pagination.current - 1;
    const pageSize = pagination.pageSize;
    const sort = { field: 'id', order: 'desc' };
    const postData = {
      searchParam: filters,
      param: param.toString(),
    };

    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      sort.order = SORTER_MAP[sorter.order];
    }

    this.setState({ param, filters, sorter });
    this.loadData(page, pageSize, sort, postData);
  };

  loadData = (page = 0, size = 10, sort = { field: 'id', order: 'desc' }, filter = { searchParam: {}, param: '' }) => {
    const { ElementsStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    ElementsStore.loadListData(projectId, page, size, sort, filter);
  };

  /**
   * 打开侧边栏
   * @param e
   * @param editMode 侧边栏功能“创建OR编辑”
   * @param eleIdForEdit
   */
  handleCreateClick = (e, editMode = false, eleIdForEdit) => {
    const { ElementsStore } = this.props;
    this.setState({ showCreation: true, editMode, eleIdForEdit });
    ElementsStore.setTestResult('');
    ElementsStore.setConfig({});
  };

  handleCloseClick = (flag, isEdit) => {
    if (flag) {
      if (isEdit) {
        this.handleRefresh();
      } else {
        this.loadData();
      }
    }
    this.setState({ showCreation: false, editMode: false, eleIdForEdit: undefined });
  };

  async openRemove(id, name) {
    const { ElementsStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    this.setState({
      showDelete: true,
      enableDeleteLoading: true,
      enableDelete: false,
      deleteName: name,
    });
    // 检测组件配置是否为可删除的
    const result = await ElementsStore.deleteConfirm(projectId, id).catch(e => {
      this.setState({ enableDeleteLoading: false, enableDelete: false });
    });
    if (result) {
      this.setState({
        deleteId: id,
        enableDeleteLoading: false,
        enableDelete: true,
      });
    } else {
      this.setState({
        enableDeleteLoading: false,
        enableDelete: false,
      });
    }
  }

  closeRemove = () => {
    this.setState({ deleteId: null, deleteName: '', showDelete: false });
  };

  handleDelete = async () => {
    const { ElementsStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { deleteId } = this.state;
    try {
      this.setState({ deleteLoading: true });
      const response = await ElementsStore.deleteConfig(projectId, deleteId);
      const result = handleCheckerProptError(response);
      if (result) {
        this.closeRemove();
        this.handleRefresh(null, 0);
      }
      this.setState({ deleteLoading: false });
    } catch (e) {
      this.setState({ deleteLoading: false });
      Choerodon.handleResponseError(e);
    }
  };

  get getColumns() {
    const { intl: { formatMessage } } = this.props;
    const { filters, sorter: { columnKey, order } } = this.state;
    const {
      type,
      id: projectId,
      organizationId,
    } = AppState.currentMenuType;
    const _renderName = record => (<FormattedMessage id={`elements.type.${record.type}`} />);
    const _renderOrigin = record => (<FormattedMessage id={`elements.origin.${record.origin}`} />);
    const _renderAction = (record) => {
      return record.origin === 'project' ? (<Permission
        service={[
          'devops-service.devops-project-config.update',
          'devops-service.devops-project-config.deleteByProjectConfigId',
        ]}
        type={type}
        projectId={projectId}
        organizationId={organizationId}
      >
        <Tooltip
          trigger="hover"
          placement="bottom"
          title={formatMessage({ id: 'edit' })}
        >
          <Button
            shape="circle"
            size="small"
            funcType="flat"
            icon="mode_edit"
            onClick={e => this.handleCreateClick(e, EDIT_MODE, record.id)}
          />
        </Tooltip>
        <Tooltip
          trigger="hover"
          placement="bottom"
          title={formatMessage({ id: 'delete' })}
        >
          <Button
            shape="circle"
            size="small"
            funcType="flat"
            icon="delete_forever"
            onClick={() => this.openRemove(record.id, record.name)}
          />
        </Tooltip>
      </Permission>) : null;
    };
    return [{
      title: <FormattedMessage id="elements.type.columns" />,
      key: 'type',
      sorter: true,
      sortOrder: columnKey === 'type' && order,
      render: _renderName,
    }, {
      title: <FormattedMessage id="elements.name" />,
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      sortOrder: columnKey === 'name' && order,
      filters: [],
      filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="elements.url" />,
      key: 'url',
      dataIndex: 'url',
      filters: [],
      filteredValue: filters.url || [],
    }, {
      title: <FormattedMessage id="elements.origin" />,
      key: 'origin',
      sorter: true,
      sortOrder: columnKey === 'origin' && order,
      render: _renderOrigin,
    }, {
      key: 'action',
      align: 'right',
      render: _renderAction,
    }];
  };

  render() {
    const {
      intl: { formatMessage },
      ElementsStore,
      ElementsStore: {
        getLoading,
        getPageInfo,
        getListData,
      },
    } = this.props;
    const {
      type,
      id: projectId,
      organizationId,
      name,
    } = AppState.currentMenuType;
    const {
      showCreation,
      editMode,
      eleIdForEdit,
      param,
      showDelete,
      deleteLoading,
      deleteName,
      enableDeleteLoading,
      enableDelete,
    } = this.state;

    return (
      <Page
        className="c7n-region"
        service={[
          'devops-service.devops-project-config.pageByOptions',
          'devops-service.devops-project-config.update',
          'devops-service.devops-project-config.create',
          'devops-service.devops-project-config.checkName',
          'devops-service.application.checkHarbor',
          'devops-service.application.checkChart',
          'devops-service.devops-project-config.queryByPrimaryKey',
          'devops-service.devops-project-config.deleteByProjectConfigId',
          'devops-service.devops-project-config.checkIsUsed',
        ]}
      >
        <Header title={<FormattedMessage id="elements.head" />}>

          <Permission
            service={['devops-service.devops-project-config.create']}
            type={type}
            projectId={projectId}
            organizationId={organizationId}
          >
            <Button
              funcType="flat"
              icon="playlist_add"
              onClick={this.handleCreateClick}
            >
              <FormattedMessage id="elements.header.create" />
            </Button>
          </Permission>
          <Button
            icon='refresh'
            onClick={this.handleRefresh}
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="elements" values={{ name }}>
          <Table
            filterBarPlaceholder={formatMessage({ id: 'filter' })}
            loading={getLoading}
            filters={param || []}
            onChange={this.tableChange}
            columns={this.getColumns}
            pagination={getPageInfo}
            dataSource={getListData}
            rowKey={record => record.id}
          />
        </Content>
        {showCreation && <ElementsCreate
          id={eleIdForEdit}
          isEditMode={editMode}
          visible={showCreation}
          store={ElementsStore}
          onClose={this.handleCloseClick}
        />}
        {showDelete && (<Modal
          visible={showDelete}
          title={`${formatMessage({ id: 'elements.delete' })}“${deleteName}”`}
          closable={false}
          footer={!enableDeleteLoading ? [
            <Button key="back" onClick={this.closeRemove} disabled={deleteLoading}>
              {<FormattedMessage id="cancel" />}
            </Button>,
            <Button
              key="submit"
              type="danger"
              onClick={enableDelete ? this.handleDelete : this.closeRemove}
              loading={deleteLoading}
            >
              {formatMessage({ id: enableDelete ? 'delete' : 'close' })}
            </Button>,
          ] : null}
        >
          {enableDeleteLoading
            ? <div className="c7ncd-elements-spin">
              <Spin />
            </div>
            : <div className="c7n-padding-top_8">
              {formatMessage({ id: `elements.delete.${enableDelete ? 'enable' : 'disable'}` })}
            </div>
          }
        </Modal>)}
      </Page>
    );
  }
}

export default Elements;
