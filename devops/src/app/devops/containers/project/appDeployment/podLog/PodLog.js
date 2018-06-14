import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Modal } from 'choerodon-ui';
import TimePopover from '../../../../components/timePopover';
import Log from '../component/log';
import '../../../main.scss';
import './PodLog.scss';

const Sidebar = Modal.Sidebar;

@observer
class PodLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      log: '',
    };
  }

  render() {
    const { value } = this.props;
    const logs = value.toString();
    let dom = null;
    const data = { status: 'Running' };
    switch (data.status) {
      case 'Running':
        dom = (<div>
          <span className="icon-check_circle c7n-icon-finish c7n-podLog-icon-status " />
          <span className="c7n-container-title">{data.status}</span>
        </div>);
        break;
      case 'Pending':
        dom = (<div>
          <span className="icon-timelapse c7n-icon-timelapse c7n-podLog-icon-status " />
          <span className="c7n-container-title">{data.status}</span>
        </div>);
        break;
      default:
        dom = (<div>
          <span className="icon-help c7n-icon-help c7n-podLog-icon-status " />
        </div>);
    }
    return (
      <Sidebar
        visible={this.props.visible}
        title="查看容器日志"
        onOk={this.props.onClose}
        className="c7n-podLog-content"
        okText="取消"
        okCancel={false}
      >
        <h2 className="c7n-space-first">查看容器&quot;{this.props.name}&quot;的日志</h2>
        <p>
          这些权限会影响此项目及其所有资源。
          <a href="http://v0-5.choerodon.io/zh/docs/user-guide/deployment-pipeline/application-deployment/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <span className="c7n-external-link-content">
              了解详情
            </span>
          </a>
        </p>
        <header>
          <table className="c7n-podLog-table">
            <thead>
              <tr>
                <td className="c7n-podLog-column">
                  <span className="icon-restore c7n-podLog-icon" />
                  <span className="c7n-podLog-title">状态</span>
                </td>
                <td className="c7n-podLog-column">
                  <span className="icon-room c7n-podLog-icon" />
                  <span className="c7n-podLog-title">容器地址</span>
                </td>
                <td className="c7n-podLog-column">
                  <span className="icon-live_help c7n-podLog-icon" />
                  <span className="c7n-podLog-title">是否可用</span>
                </td>
                <td className="c7n-podLog-column">
                  <span className="icon-date_range c7n-podLog-icon" />
                  <span className="c7n-podLog-title">已创建</span>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="c7n-podLog-column">
                  {dom}
                </td>
                <td className="c7n-podLog-column">
                  <span className="c7n-podLog-text c7n-podLog-text-hasPadding ">10.211.10.78</span>
                </td>
                <td className="c7n-podLog-column">
                  <span className="c7n-podLog-text c7n-podLog-text-hasPadding ">可用</span>
                </td>
                <td className="c7n-podLog-column-text">
                  <TimePopover content="Wed Apr 18 2018 14:19:56 GMT+0800" className="c7n-podLog-text c7n-podLog-text-hasPadding" />
                </td>
              </tr>
            </tbody>
          </table>
        </header>
        <section className="c7n-podLog-section">
          <Log value={logs} />
        </section>
      </Sidebar>
    );
  }
}

export default withRouter(PodLog);
