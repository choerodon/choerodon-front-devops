/* eslint-disable no-console */
import React, { Component } from 'react';
import { Table, Button, Modal, Tooltip, Popover } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { fromJS, is } from 'immutable';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import _ from 'lodash';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import LoadingBar from '../../../../components/loadingBar';
import './ContainerHome.scss';
import '../../../main.scss';

import MouserOverWrapper from '../../../../components/MouseOverWrapper';

const Sidebar = Modal.Sidebar;
const { AppState } = stores;

@commonComponent('ContainerStore')
@observer
class ContainerHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      id: '',
      show: false,
      name: '',
      log: [],
    };
  }

  componentDidMount() {
    this.loadAllData(this.state.page);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  };

  componentWillUnmount() {
    if (this.state.ws) {
      this.closeSidebar();
    }
  }

  /**
   * 获取行
   *
   */
  getColumn = () => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    return [{
      title: <FormattedMessage id={'container.status'} />,
      dataIndex: 'status',
      key: 'status',
      width: 110,
      sorter: true,
      render: (text, record) => {
        let dom = null;
        switch (record.status) {
          case 'Completed':
            dom = (<div>
              <MouserOverWrapper text={record.status} width={0.073}>
                <span className="icon icon-check_circle c7n-icon-success" />
                <span className="c7n-container-title">{record.status}</span>
              </MouserOverWrapper>
            </div>);
            break;
          case 'Running':
            dom = (<div>
              <span className="icon icon-check_circle c7n-icon-running" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Error':
            dom = (<div>
              <span className="icon icon-cancel c7n-icon-failed" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          case 'Pending':
            dom = (<div>
              <span className="icon icon-timelapse c7n-icon-pending" />
              <span className="c7n-container-title">{record.status}</span>
            </div>);
            break;
          default:
            dom = (<div>
              <MouserOverWrapper text={record.status} width={0.073}>
                <span className="icon icon-help c7n-icon-help" />
                <span className="c7n-container-title">{record.status}</span>
              </MouserOverWrapper>
            </div>);
        }
        return dom;
      },
    }, {
      title: <FormattedMessage id={'container.name'} />,
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      filters: [],
      filterMultiple: false,
      render: (test, record) => (<MouserOverWrapper text={record.name} width={0.3}>
        {record.name}
      </MouserOverWrapper>),
    }, {
      title: <FormattedMessage id={'container.app'} />,
      dataIndex: 'app',
      key: 'app',
      filters: [],
      filterMultiple: false,
      render: (text, record) => (<div>
        <div className="c7n-container-col-inside">
          {record.projectId === projectId ? <Tooltip title={<FormattedMessage id={'project'} />}><span className="icon icon-project c7n-icon-publish" /></Tooltip> : <Tooltip title={<FormattedMessage id={'market'} />}><span className="icon icon-apps c7n-icon-publish" /></Tooltip>}
          <span>{record.appName}</span>
        </div>
        <div>
          <MouserOverWrapper text={record.appVersion} width={0.2}>
            <span className="c7n-deploy-text_gray">{record.appVersion}</span>
          </MouserOverWrapper>
        </div>
      </div>),
    }, {
      title: <FormattedMessage id="deploy.env" />,
      key: 'envCode',
      filters: [],
      render: record => (
        <div>
          <div className="c7n-deploy-col-inside">
            {record.connect ? <Tooltip title={<FormattedMessage id="connect" />}><span className="c7n-ist-status_on" /></Tooltip> : <Tooltip title={<FormattedMessage id="disconnect" />}><span className="c7n-ist-status_off" /></Tooltip>}
            <span>{record.envName}</span>
          </div>
          <div>
            <span className="c7n-deploy-text_gray">{record.envCode}</span>
          </div>
        </div>
      ),
    }, {
      title: <FormattedMessage id={'container.ip'} />,
      dataIndex: 'ip',
      key: 'ip',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      width: 58,
      title: <FormattedMessage id={'container.usable'} />,
      dataIndex: 'ready',
      key: 'ready',
      filters: [{
        text: this.props.intl.formatMessage({ id: 'container.usable' }),
        value: '1',
      }, {
        text: this.props.intl.formatMessage({ id: 'container.disable' }),
        value: '0',
      }],
      filterMultiple: false,
      render: (text, record) => (<div className="c7n-container-table">
        {record.ready ? <span className="icon icon-done" /> : <span className="icon icon-close" />}
      </div>),
    }, {
      width: 93,
      title: <FormattedMessage id={'container.createTime'} />,
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }, {
      width: 56,
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.devops-env-pod-container.queryLogByPod']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Popover placement="bottom" content={<div><FormattedMessage id={'container.log'} /></div>}>
              <Button
                size="small"
                shape="circle"
                onClick={this.showLog.bind(this, record)}
              >
                <span className="icon icon-insert_drive_file" />
              </Button>
            </Popover>
          </Permission>
        </div>
      ),
    }];
  };

  loadLog = () => {
    const authToken = document.cookie.split('=')[1];
    const logs = [];
    const ws = new WebSocket(`POD_WEBSOCKET_URL/ws/log?key=env:${this.state.namespace}.envId:${this.state.envId}.log:${this.state.logId}&podName=${this.state.podName}&containerName=${this.state.containerName}&logId=${this.state.logId}&token=${authToken}`);
    // eslint-disable-next-line react/no-string-refs
    const editor = this.refs.editorLog.getCodeMirror();
    this.setState({
      ws,
    });
    editor.setValue('No Logs.');
    ws.onopen = () => {
      console.log('open.........');
    };
    ws.onmessage = (e) => {
      const reader = new FileReader();
      reader.readAsText(e.data, 'utf-8');
      reader.onload = () => {
        logs.push(reader.result);
        if (logs.length > 0) {
          const logString = _.join(logs, '');
          editor.setValue(logString);
          editor.execCommand('goDocEnd');
        } else {
          editor.setValue('No Logs.');
        }
      };
    };
  };

  /**
   * 显示日志
   * @param record 容器record
   */
  showLog =(record) => {
    const { ContainerStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    ContainerStore.loadPodParam(projectId, record.id)
      .then((data) => {
        this.setState({
          envId: record.envId,
          namespace: record.namespace,
          podName: data.podName,
          containerName: data.containerName,
          logId: data.logId,
        });
        this.loadLog();
      });
    ContainerStore.changeShow(true);
  };

  /**
   * 关闭日志
   */
  closeSidebar = () => {
    const { ContainerStore } = this.props;
    if (this.state.ws) {
      this.state.ws.close();
      this.state.ws.onclose = () => {
        console.log('Connection instanceInfo Close ...');
      };
    }
    // eslint-disable-next-line react/no-string-refs
    const editor = this.refs.editorLog.getCodeMirror();
    this.loadAllData(this.state.page);
    ContainerStore.changeShow(false);
    editor.setValue('No Logs.');
  };

  render() {
    const { ContainerStore } = this.props;
    const { containerName } = this.state;
    const serviceData = ContainerStore.getAllData.slice();
    const projectName = AppState.currentMenuType.name;
    const contentDom = ContainerStore.isRefresh ? <LoadingBar display /> : (<React.Fragment>
      <Header title={<FormattedMessage id={'container.header.title'} />} >
        <Button
          onClick={this.handleRefresh}
        >
          <span className="icon-refresh icon" />
          <span>{<FormattedMessage id={'refresh'} />}</span>
        </Button>
      </Header>
      <Content className="page-content" code={'container'} values={{ name: projectName }}>
        <Table
          filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
          loading={ContainerStore.loading}
          pagination={ContainerStore.pageInfo}
          columns={this.getColumn()}
          dataSource={serviceData}
          rowKey={record => record.id}
          onChange={this.tableChange}
        />
      </Content>
    </React.Fragment>);

    const options = {
      readOnly: true,
      lineNumbers: true,
      autofocus: true,
      theme: 'base16-dark',
    };

    return (
      <Page
        className="c7n-region"
        service={[
          'devops-service.devops-env-pod.pageByOptions',
          'devops-service.devops-env-pod-container.queryLogByPod',
        ]}
      >
        {contentDom}
        <Sidebar
          visible={ContainerStore.show}
          title={<FormattedMessage id={'container.log.header.title'} />}
          onOk={this.closeSidebar}
          className="c7n-podLog-content c7n-region"
          okText={<FormattedMessage id={'cancel'} />}
          okCancel={false}
        >
          <Content className="sidebar-content" code={'container.log'} values={{ name: containerName }}>
            <section className="c7n-podLog-section">
              <CodeMirror
                // eslint-disable-next-line react/no-string-refs
                ref="editorLog"
                value="No Logs"
                className="c7n-podLog-editor"
                onChange={code => this.props.ChangeCode(code)}
                options={options}
              />
            </section>
          </Content>
        </Sidebar>
      </Page>
    );
  }
}

export default withRouter(injectIntl(ContainerHome));
