import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Button, Table, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import ElementsCreate from '../elementsCreate';

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
      editMode: false,
      eleIdForEdit: undefined,
    };
  }

  getColumns = () => {
    const { intl: { formatMessage } } = this.props;
    const {
      type,
      id: projectId,
      organizationId,
    } = AppState.currentMenuType;
    const renderAction = (record) => {
      return (<Permission
        service={['devops-service.application.listByActive']}
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
            // onClick={this.openRemove.bind(this, record.id, record.name)}
          />
        </Tooltip>
      </Permission>);
    };
    return [{
      title: <FormattedMessage id="elements.type.columns" />,
      key: 'type',
      dataIndex: 'type',
      sorter: true,
      // sortOrder: columnKey === 'name' && order,
      filters: [],
      // filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="elements.name" />,
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      // sortOrder: columnKey === 'name' && order,
      filters: [],
      // filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="elements.url" />,
      key: 'url',
      dataIndex: 'url',
      sorter: true,
      // sortOrder: columnKey === 'name' && order,
      filters: [],
      // filteredValue: filters.name || [],
    }, {
      title: <FormattedMessage id="elements.resource" />,
      key: 'resource',
      dataIndex: 'resource',
      sorter: true,
      // sortOrder: columnKey === 'name' && order,
      filters: [],
      // filteredValue: filters.name || [],
    }, {
      key: 'action',
      align: 'right',
      render: renderAction,
    }];
  };

  handleRefresh = () => {
  };

  tableChange = (pagination, filters, sorter, paras) => {

  };

  loadData = () => {
  };

  /**
   * 打开侧边栏
   * @param e
   * @param editMode 侧边栏功能“创建OR编辑”
   * @param eleIdForEdit
   */
  handleCreateClick = (e, editMode = false, eleIdForEdit) => {
    this.setState({ showCreation: true, editMode, eleIdForEdit });
  };

  handleCloseClick = () => {
    this.setState({ showCreation: false, editMode: false, eleIdForEdit: undefined });
  };

  render() {
    const { intl: { formatMessage } } = this.props;
    const {
      type,
      id: projectId,
      organizationId,
      name,
    } = AppState.currentMenuType;

    const { showCreation, editMode, eleIdForEdit } = this.state;

    const data = [{
      id: 1,
      type: 'Helm仓库',
      name: 'Helm_server',
      url: 'https://choerodon.com.cn',
      resource: '自定义',
    }];

    return (
      <Page
        className="c7n-region"
        service={['devops-service.application.listByActive']}
      >
        <Header title={<FormattedMessage id="elements.head" />}>

          <Permission
            service={['devops-service.application.listByActive']}
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
          <Permission
            service={['devops-service.application.listByActive']}
            type={type}
            projectId={projectId}
            organizationId={organizationId}
          >
            <Button
              icon='refresh'
              onClick={this.handleRefresh}
            >
              <FormattedMessage id="refresh" />
            </Button>
          </Permission>
        </Header>
        <Content code="elements" values={{ name }}>
          <Table
            filterBarPlaceholder={formatMessage({ id: 'filter' })}
            onChange={this.tableChange}
            columns={this.getColumns()}
            dataSource={data}
            rowKey={record => record.id}
          />
        </Content>
        {showCreation && <ElementsCreate
          id={eleIdForEdit}
          isEditMode={editMode}
          visible={showCreation}
          onClose={this.handleCloseClick}
        />}
      </Page>
    );
  }
}

export default Elements;
