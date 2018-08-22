import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Table, Icon, Select, Button, Popover, Tooltip, Modal } from 'choerodon-ui';
import _ from 'lodash';
import '../../../main.scss';
import './CertificateHome.scss';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import CreateCert from '../createCert';

const { AppState } = stores;
const { Option } = Select;
const { Sidebar } = Modal;
@observer
class CertificateHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteCert: null,
      page: 0,
      pageSize: 10,
      param: [],
      filters: {},
      sort: {
        columnKey: 'id',
        order: 'desc',
      },
      deleteStatus: false,
      removeDisplay: false,
      createDisplay: false,
    };
  }

  componentDidMount() {
    const { CertificateStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    CertificateStore.loadEnvData(projectId);
  }

  /**
   * 创建证书侧边栏
   */
  openCreateModal = () => this.setState({ createDisplay: true });

  closeCreateModal = () => {
    this.setState({ createDisplay: false });
  };

  /**
   * 删除证书
   */
  handleDelete = () => {
    const { CertificateStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { deleteCert } = this.state;
    this.setState({ deleteStatus: true });
    CertificateStore.deleteCertById(projectId, deleteCert).then(() => {
      const { page, pageSize } = this.state;
      this.loadCertData(page, pageSize);
      this.setState({ deleteStatus: false, removeDisplay: false });
    }).catch((err) => {
      this.setState({ deleteStatus: false });
      Choerodon.handleResponseError(err);
    });
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
    const { page, pageSize } = this.state;
    this.loadCertData(page, pageSize);
  };

  /**
   * 加载数据
   * @param page
   * @param pageSize
   */
  loadCertData = (page, pageSize) => {
    const { CertificateStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    CertificateStore.loadCertData({ projectId, page, pageSize });
  };

  /**
   * 显示删除确认框
   */
  openRemoveModal = id => this.setState({
    removeDisplay: true,
    deleteCert: id,
  });

  closeRemoveModal = () => this.setState({ removeDisplay: false });

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
        content={<div className="c7n-overlay-content">
          <div className="c7n-overlay-item">
            <p className="c7n-ctf-detail">CommonName</p>
            <p className="c7n-ctf-detail">DNSNames</p>
          </div>
          <div className="c7n-overlay-item">{_.map(domains, item => <p key={item} className="c7n-ctf-detail">{item}</p>)}</div>
        </div>}
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
            onClick={this.openRemoveModal.bind(this, id)}
          />
        </Tooltip>
      </Permission>
    </Fragment>);
  };

  render() {
    const { intl, CertificateStore } = this.props;
    const {
      param,
      filters,
      sort: { columnKey, order },
      removeDisplay,
      deleteStatus,
      createDisplay,
    } = this.state;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const columns = [{
      title: <FormattedMessage id="ctf.column.name" />,
      key: 'certName',
      dataIndex: 'certName',
      filters: [],
      sortOrder: columnKey === 'certName' && order,
      filteredValue: filters.certName || [],
      render: (text, record) => (<MouserOverWrapper text={text || ''} width={0.25}>
        {text}</MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="ctf.column.ingress" />,
      key: 'commonName',
      dataIndex: 'commonName',
      filters: [],
      sortOrder: columnKey === 'commonName' && order,
      filteredValue: filters.commonName || [],
      render: (text, record) => (<MouserOverWrapper text={text || ''} width={0.25}>
        {text}</MouserOverWrapper>),
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
        {createDisplay && <CreateCert
          visible={createDisplay}
          store={CertificateStore}
          handleClose={this.closeCreateModal}
        />}
        <Modal
          confirmLoading={deleteStatus}
          visible={removeDisplay}
          title={<FormattedMessage id="ctf.delete" />}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemoveModal}><FormattedMessage id="cancel" /></Button>,
            <Button key="submit" loading={deleteStatus} type="danger" onClick={this.handleDelete}>
              <FormattedMessage id="delete" />
            </Button>,
          ]}
        >
          <p><FormattedMessage id="ctf.delete.tooltip" /></p>
        </Modal>
      </Page>
    );
  }
}

export default withRouter(injectIntl(CertificateHome));
