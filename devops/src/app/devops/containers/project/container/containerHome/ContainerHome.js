import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Table, Button, Modal, Tooltip, Popover } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import CodeMirror from 'react-codemirror';
import _ from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import LoadingBar from '../../../../components/loadingBar';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import '../../../main.scss';
import './ContainerHome.scss';

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
      showSide: false,
    };
    this.timer = null;
  }

  componentDidMount() {
    this.loadAllData(this.state.page);
  }

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
    let oldLogs = [];
    const { namespace, envId, logId, podName, containerName } = this.state;
    const ws = new WebSocket('wss://devops.service.choerodon.com.cn/ws/log?key=env:c7ncd-staging.envId:54.log:fc1ee7a0-2fea-4269-87db-2d3b197f1f3d&podName=devops-service-ed8ad-7cf8f76cfc-5zpd7&containerName=devops-service-ed8ad&logId=fc1ee7a0-2fea-4269-87db-2d3b197f1f3d&token=35ac7d17-0af1-411f-8d18-65c917a25233;%20token_type');
    const editor = this.editorLog.getCodeMirror();
    this.setState({ ws });
    editor.setValue('Loading...');
    ws.onmessage = (e) => {
      if (e.data.size) {
        const reader = new FileReader();
        reader.readAsText(e.data, 'utf-8');
        reader.onload = () => {
          if (reader.result !== '') {
            logs.push(reader.result);
          }
        };
      }
    };
    if (logs.length > 0) {
      const logString = _.join(logs, '');
      editor.setValue(logString);
    }
    this.timer = setInterval(() => {
      if (logs.length > 0) {
        if (!_.isEqual(logs, oldLogs)) {
          const logString = _.join(logs, '');
          editor.setValue(logString);
          editor.execCommand('goDocEnd');
          // 如果没有返回数据，则不进行重新赋值给编辑器
          oldLogs = _.cloneDeep(logs);
        }
      } else {
        editor.setValue('Loading...');
      }
    }, 1000);
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
          showSide: true,
        });
        this.loadLog();
      });
  };

  /**
   * 关闭日志
   */
  closeSidebar = () => {
    clearInterval(this.timer);
    this.timer = null;
    const { ContainerStore } = this.props;
    const { ws, page } = this.state;
    if (ws) {
      ws.close();
    }
    const editor = this.editorLog.getCodeMirror();
    this.setState({ showSide: false }, () => {
      editor.setValue('');
    });
    this.loadAllData(page);
  };

  render() {
    const { ContainerStore } = this.props;
    const { containerName, showSide } = this.state;
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
          visible={showSide}
          title={<FormattedMessage id={'container.log.header.title'} />}
          onOk={this.closeSidebar}
          className="c7n-podLog-content c7n-region"
          okText={<FormattedMessage id={'cancel'} />}
          okCancel={false}
          destroyOnClose
        >
          <Content className="sidebar-content" code={'container.log'} values={{ name: containerName }}>
            <section className="c7n-podLog-section">
              <CodeMirror
                ref={(editor) => { this.editorLog = editor; }}
                value="Loading..."
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
