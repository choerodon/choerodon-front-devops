import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Icon, Button, Popover, Tooltip, Modal } from 'choerodon-ui';
import { Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import './CertTable.scss';

const { AppState } = stores;

@observer
class CertTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteCert: null,
      deleteStatus: false,
      removeDisplay: false,
      page: 0,
      pageSize: 10,
      param: [],
      filters: {},
      postData: { searchParam: {}, param: '' },
      sorter: {
        field: 'id',
        columnKey: 'id',
        order: 'descend',
      },
    };
  }

  /**
   * 删除证书
   */
  handleDelete = () => {
    const { store, envId } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { deleteCert } = this.state;
    this.setState({ deleteStatus: true });
    store.deleteCertById(projectId, deleteCert).then(() => {
      const { page, pageSize, sort, postData } = this.state;
      store.loadCertData(projectId, page, pageSize, sort, postData, envId);
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
    const { store, envId } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { current, pageSize } = pagination;
    const page = current - 1;
    const sort = _.isEmpty(sorter) ? {
      field: 'id',
      columnKey: 'id',
      order: 'descend',
    } : sorter;
    const searchParam = {};
    let param = '';
    if (!_.isEmpty(filters)) {
      _.forEach(filters, (value, key) => {
        if (!_.isEmpty(value)) {
          searchParam[key] = [String(value)];
        }
      });
    }
    if (paras.length) {
      param = paras[0].toString();
    }
    const postData = {
      searchParam,
      param,
    };
    this.setState({ page, pageSize, filters, postData, sorter: sort, param: paras });
    store.loadCertData(projectId, page, pageSize, sort, postData, envId);
  };

  /**
   * 显示删除确认框
   * @param id
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
    const { id, domains, validFrom, validUntil } = record;
    const { intl: { formatMessage } } = this.props;
    const detail = {
      CommonName: [domains[0]],
      DNSNames: domains.slice(1),
    };
    const content = (<Fragment>
      {_.map(detail, (value, key) => {
        if (value.length) {
          return (<div className="c7n-overlay-content" key={value}>
            <div className="c7n-overlay-item">
              <p className="c7n-overlay-title">{key}</p>
            </div>
            <div className="c7n-overlay-item">{_.map(value, item => <p key={item} className="c7n-overlay-detail">{item}</p>)}</div>
          </div>);
        }
        return null;
      })}
      {validFrom && validUntil ? (<div className="c7n-overlay-content">
        <div className="c7n-overlay-item">
          <p className="c7n-overlay-title">{formatMessage({ id: 'validDate' })}</p>
        </div>
        <div className="c7n-overlay-item">
          <p className="c7n-overlay-detail">{validFrom}</p>
          <p className="c7n-overlay-detail">{validUntil}</p>
        </div>
      </div>) : null}
    </Fragment>);
    return (<Fragment>
      <Popover
        overlayClassName="c7n-ctf-overlay"
        arrowPointAtCenter
        title={formatMessage({ id: 'ctf.cert.detail' })}
        content={content}
        getPopupContainer={triggerNode => triggerNode.parentNode}
        trigger="hover"
        placement="bottomRight"
      >
        <Icon type="find_in_page" className="c7n-ctf-detail-icon" />
      </Popover>
      <Permission
        service={['devops-service.certification.delete']}
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
    const { intl: { formatMessage }, store } = this.props;
    const {
      removeDisplay,
      deleteStatus,
      filters,
      sorter: {
        columnKey,
        order,
      },
      param,
    } = this.state;
    const {
      type,
      id: projectId,
      organizationId:
        orgId, name,
    } = AppState.currentMenuType;
    const columns = [{
      title: <FormattedMessage id="ctf.column.name" />,
      key: 'certName',
      dataIndex: 'certName',
      filters: [],
      filteredValue: filters.certName || [],
      render: (text, record) => (<MouserOverWrapper text={text || ''} width={0.25}>
        {text}</MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="ctf.column.ingress" />,
      key: 'domains',
      dataIndex: 'domains',
      filters: [],
      filteredValue: filters.domains || [],
      render: (text, record) => (<MouserOverWrapper text={text[0] || ''} width={0.25}>
        {text[0]}</MouserOverWrapper>),
    }, {
      title: <FormattedMessage id="ctf.column.env" />,
      key: 'envName',
      dataIndex: 'envName',
      sorter: true,
      filters: [],
      sortOrder: columnKey === 'envName' && order,
      filteredValue: filters.envName || [],
      render: (text, record) => (<React.Fragment>
        {record.envConnected ? <Tooltip title={<FormattedMessage id="connect" />}>
          <span className="env-status-success" />
        </Tooltip> : <Tooltip title={<FormattedMessage id="disconnect" />}>
          <span className="env-status-error" />
        </Tooltip>}
        {text}
      </React.Fragment>),
    }, {
      title: <FormattedMessage id="ctf.column.status" />,
      key: 'status',
      dataIndex: 'status',
      sorter: true,
      sortOrder: columnKey === 'status' && order,
      render: (text, record) => (<div className={`c7n-ctf-status c7n-ctf-${record.status}`}><FormattedMessage
        id={`ctf.column.${record.status}`}
      /></div>),
    }, {
      align: 'right',
      width: 100,
      key: 'action',
      render: record => this.opColumn(record, type, projectId, orgId),
    }];
    return (<Fragment>
      <Table
        filterBarPlaceholder={formatMessage({ id: 'filter' })}
        onChange={this.tableChange}
        loading={store.getCertLoading}
        pagination={store.getPageInfo}
        dataSource={store.getCertData}
        filters={param}
        columns={columns}
        rowKey={record => record.id}
      />
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
    </Fragment>);
  }
}

export default injectIntl(CertTable);
