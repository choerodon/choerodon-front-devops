import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Button, Form, Tooltip, Modal, Progress } from 'choerodon-ui';
import { Permission, Content, Header, Page, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import CreateNetwork from '../createNetwork';
import './NetworkHome.scss';
import '../../../main.scss';
import LoadingBar from '../../../../components/loadingBar';
import EditNetwork from '../editNetwork';
import { commonComponent } from '../../../../components/commonFunction';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const { AppState } = stores;

@commonComponent('NetworkConfigStore')
@observer
class NetworkHome extends Component {
  constructor(props, context) {
    const menu = AppState.currentMenuType;
    super(props, context);
    this.state = {
      upDown: [],
      show: false,
      projectId: menu.id,
      openRemove: false,
    };
  }
  componentDidMount() {
    this.loadAllData();
  }
  /**
   * 展开/收起实例
   */
  showChange = (id, networkId, length) => {
    const { upDown } = this.state;
    const cols = document.getElementsByClassName(`col-${id}-${networkId}`);
    if (_.indexOf(upDown, id) === -1) {
      for (let i = 0; i < cols.length; i += 1) {
        cols[i].style.height = `${length * 31}px`;
      }
      upDown.push(id);
      this.setState({
        upDown,
      });
    } else {
      for (let i = 0; i < cols.length; i += 1) {
        cols[i].style.height = '31px';
      }
      _.pull(upDown, id);
      this.setState({
        upDown,
      });
    }
  };

  /**
   * 关闭侧边栏
   */
  handleCancelFun = () => {
    this.setState({ show: false, showEdit: false });
    this.loadAllData();
  };

  /**
   *
   */
  showSideBar =() => {
    const { NetworkConfigStore } = this.props;
    NetworkConfigStore.setInstance([]);
    NetworkConfigStore.setVersionDto([]);
    NetworkConfigStore.setApp([]);
    NetworkConfigStore.setVersions([]);
    NetworkConfigStore.setEnv([]);
    this.setState({ show: true });
  };

  /**
   * 打开编辑的操作框
   * @param id
   */
  editNetwork = (id) => {
    const { NetworkConfigStore } = this.props;
    NetworkConfigStore.setInstance([]);
    NetworkConfigStore.setVersionDto([]);
    NetworkConfigStore.setApp([]);
    NetworkConfigStore.setVersions([]);
    NetworkConfigStore.setEnv([]);
    this.setState({ showEdit: true, id });
  };
  render() {
    const { NetworkConfigStore, intl } = this.props;
    const menu = AppState.currentMenuType;
    const projectName = menu.name;
    const { upDown } = this.state;
    const data = NetworkConfigStore.getAllData;
    const { type, id: projectId, organizationId: orgId } = menu;
    const columns = [{
      title: <FormattedMessage id={'network.column.status'} />,
      key: 'status',
      width: 72,
      render: (record) => {
        let statusDom = null;
        switch (record.status) {
          case 'failed':
            statusDom = (<div className="c7n-network-status c7n-network-status-failed">
              <FormattedMessage id="network.failed" />
            </div>);
            break;
          case 'operating':
            statusDom = (<div className="c7n-network-status c7n-network-status-operating">
              <FormattedMessage id="operating" />
            </div>);
            break;
          default:
            statusDom = (<div className="c7n-network-status c7n-network-status-running">
              <FormattedMessage id="running" />
            </div>);
        }
        return (statusDom);
      },
    }, {
      title: <FormattedMessage id={'network.column.name'} />,
      key: 'name',
      sorter: true,
      filters: [],
      render: (record) => {
        let statusDom = null;
        switch (record.commandStatus) {
          case 'failed':
            statusDom = (<Tooltip title={record.error}>
              <span className="icon icon-error c7n-status-failed c7n-network-icon" />
            </Tooltip>);
            break;
          case 'doing':
            statusDom = (<Tooltip title={<FormattedMessage id={`ist_${record.commandType}`} />}>
              <Progress type="loading" width={15} className="c7n-network-icon" />
            </Tooltip>);
            break;
          default:
            statusDom = null;
        }
        return (<React.Fragment>
          <MouserOverWrapper text={record.name || ''} width={0.1} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            {record.name}</MouserOverWrapper>
          {statusDom}
        </React.Fragment>);
      },
    }, {
      title: <FormattedMessage id={'network.column.env'} />,
      key: 'envName',
      sorter: true,
      filters: [],
      render: record => (
        <React.Fragment>
          { record.envStatus ? <Tooltip title={<FormattedMessage id={'connect'} />}> <span className="env-status-success" /></Tooltip> : <Tooltip title={<FormattedMessage id={'disconnect'} />}>
            <span className="env-status-error" />
          </Tooltip> }
          {record.envName}
        </React.Fragment>
      ),
    }, {
      title: <FormattedMessage id={'network.column.env'} />,
      key: 'envName',
      sorter: true,
      filters: [],
      render: record => (
        <React.Fragment>
          { record.envStatus ? <Tooltip title={<FormattedMessage id={'connect'} />}> <span className="env-status-success" /></Tooltip> : <Tooltip title={<FormattedMessage id={'disconnect'} />}>
            <span className="env-status-error" />
          </Tooltip> }
          {record.envName}
        </React.Fragment>
      ),
    }, {
      title: <FormattedMessage id={'network.column.env'} />,
      key: 'envName',
      sorter: true,
      filters: [],
      render: record => (
        <React.Fragment>
          { record.envStatus ? <Tooltip title={<FormattedMessage id={'connect'} />}> <span className="env-status-success" /></Tooltip> : <Tooltip title={<FormattedMessage id={'disconnect'} />}>
            <span className="env-status-error" />
          </Tooltip> }
          {record.envName}
        </React.Fragment>
      ),
    }, {
      width: '96px',
      key: 'action',
      render: (record) => {
        let editDom = null;
        let deletDom = null;
        switch (record.status) {
          case 'operating':
            editDom = (<Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id={`network_${record.commandType}`} />}>
              <span className="icon icon-mode_edit c7n-app-icon-disabled" />
            </Tooltip>);
            deletDom = (<Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id={`network_${record.commandType}`} />}>
              <span className="icon icon-delete_forever c7n-app-icon-disabled" />
            </Tooltip>);
            break;
          default:
            editDom = (<React.Fragment>
              {record.envStatus ? <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id={'edit'} />}>
                <Button shape="circle" size={'small'} funcType="flat" onClick={this.editNetwork.bind(this, record.id)}>
                  <span className="icon icon-mode_edit" />
                </Button>
              </Tooltip> : <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id={'network.env.tooltip'} />}>
                <span className="icon icon-mode_edit c7n-app-icon-disabled" />
              </Tooltip>}
            </React.Fragment>);
            deletDom = (<React.Fragment>
              {record.envStatus ? <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id={'delete'} />}>
                <Button shape="circle" size={'small'} funcType="flat" onClick={this.openRemove.bind(this, record.id)}>
                  <span className="icon icon-delete_forever" />
                </Button>
              </Tooltip> : <Tooltip trigger="hover" placement="bottom" title={<FormattedMessage id={'network.env.tooltip'} />}>
                <span className="icon icon-delete_forever c7n-app-icon-disabled" />
              </Tooltip>}
            </React.Fragment>);
        }
        return (<div>
          <Permission
            service={['devops-service.devops-service.update']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            {editDom}
          </Permission>
          <Permission
            service={['devops-service.devops-service.delete']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            {deletDom}
          </Permission>
        </div>);
      },
    }];
    return (
      <Page
        service={[
          'devops-service.devops-service.create',
          'devops-service.devops-service.checkName',
          'devops-service.devops-service.pageByOptions',
          'devops-service.devops-service.query',
          'devops-service.devops-service.update',
          'devops-service.devops-service.delete',
          'devops-service.devops-service.listByEnvId',
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.application.listByEnvIdAndStatus',
          'devops-service.application-version.queryByAppIdAndEnvId',
          'devops-service.application-instance.listByAppVersionId',
        ]}
        className="c7n-region c7n-network-wrapper"
      >
        {NetworkConfigStore.isRefresh ? <LoadingBar display /> : <React.Fragment>
          <Header title={<FormattedMessage id={'network.header.title'} />}>
            <Permission
              service={['devops-service.devops-service.create']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                funcType="flat"
                onClick={this.showSideBar}
              >
                <span className="icon-playlist_add icon" />
                <span><FormattedMessage id={'network.header.create'} /></span>
              </Button>
            </Permission>
            <Permission
              service={['devops-service.devops-service.pageByOptions']}
              type={type}
              projectId={projectId}
              organizationId={orgId}
            >
              <Button
                funcType="flat"
                onClick={this.handleRefresh}
              >
                <span className="icon-refresh icon" />
                <span><FormattedMessage id={'refresh'} /></span>
              </Button>
            </Permission>
          </Header>
          <Content code="network" values={{ name: projectName }}>
            <Table
              filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
              loading={NetworkConfigStore.loading}
              pagination={NetworkConfigStore.getPageInfo}
              columns={columns}
              onChange={this.tableChange}
              dataSource={data}
              rowKey={record => record.id}
            />
          </Content>
        </React.Fragment>
        }

        {this.state.show && <CreateNetwork
          visible={this.state.show}
          store={NetworkConfigStore}
          onClose={this.handleCancelFun}
        /> }
        {this.state.showEdit && <EditNetwork
          id={this.state.id}
          visible={this.state.showEdit}
          store={NetworkConfigStore}
          onClose={this.handleCancelFun}
        /> }
        <Modal
          visible={this.state.openRemove}
          title={<FormattedMessage id={'network.delete'} />}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove}><FormattedMessage id={'cancel'} /></Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete}>
              <FormattedMessage id={'delete'} />
            </Button>,
          ]}
        >
          <p><FormattedMessage id={'network.delete.tooltip'} />？</p>
        </Modal>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(NetworkHome)));
