import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Table, Icon, Select, Button, Popover, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import '../../../main.scss';
import './CertificateHome.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const { AppState } = stores;
const { Option } = Select;
@observer
class CertificateHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectEnv: null,
      page: 0,
      pageSize: 10,
      param: [],
      filters: {},
      sort: {
        columnKey: 'id',
        order: 'desc',
      },
    };
  }

  componentDidMount() {
    const { CertificateStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    CertificateStore.loadEnvData(projectId);
  }

  openCreateModal =() => {};

  /**
   * 选择环境，加载环境下证书
   * @param e
   */
  handleEnvSelect = (e) => {
    if (!e) return;
    const { CertificateStore } = this.props;
    this.setState({ selectEnv: e });
    this.loadCertData(e, 0, 10);
  };

  handleDelete = (id) => {
    window.console.log(id);
  };

  /**
   * 表格筛选排序等
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange = (pagination, filters, sorter, paras) => {
    const { CertificateStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    this.setState({ page: pagination.current - 1, pageSize: pagination.pageSize });
    let searchParam = {};
    let param = '';
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    if (paras.length) {
      param = paras[0].toString();
    }
    const postData = {
      searchParam,
      param,
    };
    CertificateStore
      .loadCertData(projectId, pagination.current - 1, pagination.pageSize, postData);
  };

  /**
   * 刷新
   */
  reload = () => {
    const { selectEnv, page, pageSize } = this.state;
    this.loadCertData(selectEnv, page, pageSize);
  };

  /**
   * 加载数据
   * @param selectEnv
   * @param page
   * @param pageSize
   */
  loadCertData = (selectEnv, page, pageSize) => {
    const { CertificateStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    CertificateStore.loadCertData({ projectId, envId: selectEnv, page, pageSize });
  };

  /**
   * 操作列
   * @param record
   * @param type
   * @param projectId
   * @param orgId
   */
  opColumn = (record, type, projectId, orgId) => {
    const { id, domains } = record;
    const { intl } = this.props;
    return (<Fragment>
      <Popover
        overlayClassName="c7n-ctf-overlay"
        arrowPointAtCenter
        title={intl.formatMessage({ id: 'ctf.cert.detail' })}
        content={_.map(domains, item => <p key={item} className="c7n-ctf-detail">{item}</p>)}
        getPopupContainer={triggerNode => triggerNode.parentNode}
        trigger="hover"
        placement="bottomRight"
      >
        <Icon type="find_in_page" className="c7n-ctf-detail-icon" />
      </Popover>
      <Permission
        service={['devops-service.devops-environment.listByProjectIdAndActive']}
        type={type}
        projectId={projectId}
        organizationId={orgId}
      >
        <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id="delete" />}>
          <Button
            icon="delete_forever"
            shape="circle"
            size="small"
            funcType="flat"
            onClick={this.handleDelete.bind(this, id)}
          />
        </Tooltip>
      </Permission>
    </Fragment>);
  };

  render() {
    const { intl, CertificateStore } = this.props;
    const { selectEnv, param, filters, sort: { columnKey, order } } = this.state;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const envData = CertificateStore.getEnvData;
    const options = envData ? _.map(envData, (item) => {
      const { id, name: envName, connect } = item;
      return (<Option key={id} value={id}>
        {connect ? <span className="env-status-success" /> : <span className="env-status-error" />}
        {envName}</Option>);
    }) : [];
    const columns = [{
      title: <FormattedMessage id="ctf.column.name" />,
      key: 'certName',
      dataIndex: 'certName',
      filters: [],
      sortOrder: columnKey === 'certName' && order,
      filteredValue: filters.certName || [],
      render: (text, record) => (<MouserOverWrapper text={text || ''} width={0.12}>
        {text}</MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="ctf.column.ingress" />,
      key: 'commonName',
      dataIndex: 'commonName',
      filters: [],
      sortOrder: columnKey === 'commonName' && order,
      filteredValue: filters.commonName || [],
    }, {
      title: <FormattedMessage id="ctf.column.env" />,
      key: 'envName',
      dataIndex: 'envName',
      filters: [],
      sortOrder: columnKey === 'envName' && order,
      filteredValue: filters.envName || [],
    }, {
      title: <FormattedMessage id="ctf.column.status" />,
      key: 'status',
      dataIndex: 'status',
      sorter: true,
      filters: [],
      sortOrder: columnKey === 'status' && order,
      filteredValue: filters.status || [],
      render: (text, record) => (<div className={`c7n-ctf-status c7n-ctf-${record.status}`}><FormattedMessage id={`ctf.column.${record.status}`} /></div>),
    }, {
      align: 'right',
      width: 100,
      key: 'action',
      render: record => this.opColumn(record, type, projectId, orgId),
    }];
    return (
      <Page
        className="c7n-region c7n-ctf-wrapper"
        service={['devops-service.devops-environment.listByProjectIdAndActive']}
      >
        <Header title={<FormattedMessage id="ctf.head" />}>
          <Permission
            type={type}
            projectId={projectId}
            organizationId={orgId}
            service={['devops-service.devops-environment.listByProjectIdAndActive']}
          >
            <Button
              funcType="flat"
              onClick={this.openCreateModal}
              icon="playlist_add"
            >
              <FormattedMessage id="ctf.create" />
            </Button>
          </Permission>
          <Button
            funcType="flat"
            onClick={this.reload}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          className="page-content"
          code="ctf"
          value={{ name }}
        >
          <Select
            value={selectEnv || (envData.length && envData[0].id) || ''}
            label={intl.formatMessage({ id: 'ctf.envName' })}
            className="c7n-select_512 c7n-ctf-select"
            onSelect={this.handleEnvSelect}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children[1]
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            getPopupContainer={triggerNode => triggerNode.parentNode}
            filter
            showSearch
          >
            {options}
          </Select>
          <Table
            filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
            onChange={this.tableChange}
            loading={CertificateStore.getCertLoading}
            pagination={CertificateStore.getPageInfo}
            filters={param || []}
            columns={columns}
            dataSource={CertificateStore.getCertData}
            rowKey={record => record.id}
          />
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(CertificateHome));
