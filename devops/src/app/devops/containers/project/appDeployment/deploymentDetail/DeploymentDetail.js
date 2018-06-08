import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Button, Steps, Tabs, Tooltip, Icon } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import classnames from 'classnames';
import TimePopover from '../../../../components/timePopover';
import '../../../main.scss';
import './Deploydetail.scss';
import '../../container/containerHome/ContainerHome.scss';
import Log from '../../appDeployment/component/log';
import LoadingBar from '../../../../components/loadingBar';
import Ace from '../../../../components/yamlAce';

const Step = Steps.Step;
const TabPane = Tabs.TabPane;

const { AppState } = stores;

@observer
class DeploymentDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.match.params.id,
      status: props.match.params.status,
      expand: false,
      current: 1,
    };
  }

  componentDidMount() {
    const { DeployDetailStore } = this.props;
    const { id } = this.state;
    const projectId = AppState.currentMenuType.id;
    DeployDetailStore.getInstanceValue(projectId, id);
    DeployDetailStore.getResourceData(projectId, id);
    DeployDetailStore.getStageData(projectId, id);
  }

  /**
   * 获取pipe的icon
   * @param status 数据状态
   * @param index 遍历的索引
   */
  getIcon =(status, index) => {
    const { current } = this.state;
    let icon = (current === index) ? 'album' : 'cancle_a';
    let iconStyle = 'stage-icon';
    const indexArr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];// icon的类名设计
    switch (status) {
      case 'Created':
        icon = (current === index) ? `icon-wait_${indexArr[index]}_b` : `icon-wait_${indexArr[index]}_a`;
        break;
      case 'success':
        icon = (current === index) ? 'check_circle' : 'finished';
        iconStyle = 'stage-icon icon-success';
        break;
      case 'Failed':
        icon = (current === index) ? 'icon-cancel' : 'icon-highlight_off';
        break;
      case 'Running':
        icon = (current === index) ? 'watch_later' : 'schedule';
        break;
      case 'Skipped':
        icon = (current === index) ? 'icon-skipped_b ' : 'icon-skipped_a';
        break;
      default:
        icon = (current === index) ? 'error' : 'error_outline';
        iconStyle = 'stage-icon icon-error';
    }
    return <Icon type={icon} className={iconStyle} />;
  };

  /**
   * 拼接返回的时间
   * @param time
   * @returns {*}
   */

  getTime =(time) => {
    let times;
    if (time && time.length) {
      if (time[3]) {
        times = `${time[3]}秒`;
      } else if (time[2]) {
        times = `${time[2]}分${time[3]}秒`;
      } else if (time[1]) {
        times = `${time[1]}时${time[2]}分${time[3]}秒`;
      } else if (time[0]) {
        times = `${time[0]}天${time[1]}时${time[2]}分${time[3]}秒`;
      }
    }
    return times;
  };

  loadAllData =() => {
    const { DeployDetailStore } = this.props;
    const { id } = this.state;
    const projectId = AppState.currentMenuType.id;
    DeployDetailStore.loadAllData(projectId, id);
  };

  changeStage =(index) => {
    const { DeployDetailStore } = this.props;
    const data = DeployDetailStore.getStage;
    this.setState({ current: index + 1, log: data[index].log || '' });
  };

  changeStatus =() => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  };

  handleClose =() => {
    const { DeployDetailStore } = this.props;
    DeployDetailStore.changeLogVisible(false);
  };

  render() {
    const { DeployDetailStore } = this.props;
    const { expand } = this.state;
    const valueStyle = classnames({
      'c7n-deployDetail-show': expand,
      'c7n-deployDetail-hidden': !expand,
    });
    const resource = DeployDetailStore.getResource;
    const projectName = AppState.currentMenuType.name;
    const organizationId = AppState.currentMenuType.organizationId;
    const projectId = AppState.currentMenuType.id;
    const type = AppState.currentMenuType.type;
    let serviceDTO = [];
    let podDTO = [];
    let depDTO = [];
    let rsDTO = [];
    let ingressDTO = [];
    if (resource) {
      serviceDTO = resource.serviceDTOS;
      podDTO = resource.podDTOS;
      depDTO = resource.deploymentDTOS;
      rsDTO = resource.replicaSetDTOS;
      ingressDTO = resource.ingressDTOS;
    }

    const stageData = DeployDetailStore.getStage || [];
    const log = stageData.length && stageData[0].log ? stageData[0].log : '没有日志信息';
    const dom = [];
    if (stageData.length) {
      stageData.map((step, index) => {
        const title = (<div>
          <div className={`${index}-stage-title stage-title-text`}>{step.stageName}</div>
          {step.stageTime && <span className="c7n-stage-time">时间:{this.getTime(step.stageTime)}</span>}
        </div>);
        dom.push(<Step
          key={step.weight}
          icon={step.status ? <Tooltip trigger="hover" placement="top" title={step.status}>
            {this.getIcon(step.status, index + 1)}
          </Tooltip> : <span>{this.getIcon(step.status, index + 1)}</span>}
          onClick={this.changeStage.bind(this, index)}
          title={title}
        />);
        return dom;
      });
    }
    const a = DeployDetailStore.getValue;

    return (
      <Page className="c7n-region c7n-deployDetail-wrapper">
        <Header title={Choerodon.getMessage('查看实例详情', ' Instance Detail')} backPath={`/devops/instance?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`}>
          <Button
            onClick={this.loadAllData}
            funcType="flat"
          >
            <span className="icon-refresh icon" />
            <span>{Choerodon.languageChange('refresh')}</span>
          </Button>
        </Header>
        { DeployDetailStore.isLoading ? <LoadingBar display /> : <Content className="page-content">
          <h2 className="c7n-space-first">查看应用&quot;{projectName}&quot;的实例详情</h2>
          <p>
            您可在此查看该实例的运行详情及部署详情。运行详情包括各资源对象的基本信息；部署详情包括配置信息及部署阶段及日志。
            <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/instance/" className="c7n-external-link">
              <span className="c7n-external-link-content">了解详情</span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          <Tabs
            className="c7n-deployDetail-tab"
            defaultActiveKey={this.state.status === 'running' ? '1' : '2'}
          >
            {this.state.status === 'running' && <TabPane tab="运行详情" key="1">
              <div className="c7n-deployDetail-card c7n-deployDetail-card-content ">
                <h2 className="c7n-space-first">Resources</h2>
                {podDTO.length >= 1 && <div className="c7n-deployDetail-table-header header-first">
                  <span className="c7n-deployDetail-table-title">Pod</span>
                  <table className="c7n-deployDetail-table">
                    <thead>
                      <tr>
                        <td>NAME</td>
                        <td>READY</td>
                        <td>STATUS</td>
                        <td>RESTARTS</td>
                        <td>AGE</td>
                      </tr>
                    </thead>
                    <tbody>
                      {podDTO.map(pod => (<tr key={Math.random()}>
                        <td>{pod.name}</td>
                        <td>{pod.ready}</td>
                        <td>{pod.status}</td>
                        <td>{pod.restarts}</td>
                        <td><TimePopover content={pod.age} /></td>
                      </tr>))}
                    </tbody>
                  </table>
                </div> }
                { serviceDTO.length >= 1 && <div className="c7n-deployDetail-table-header">
                  <span className="c7n-deployDetail-table-title">Service</span>
                  <table className="c7n-deployDetail-table">
                    <thead>
                      <tr>
                        <td>NAME</td>
                        <td>TYPE</td>
                        <td>CLUSTER-IP</td>
                        <td>EXTERNAL-IP</td>
                        <td>PORT(S)</td>
                        <td>AGE</td>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceDTO.map(service => (<tr key={Math.random()}>
                        <td>{service.name}</td>
                        <td>{service.type}</td>
                        <td>{service.clusterIp}</td>
                        <td>{service.externalIp}</td>
                        <td>{service.port}</td>
                        <td><TimePopover content={service.age} /></td>
                      </tr>))}
                    </tbody>
                  </table>
                </div> }
                { depDTO.length >= 1 && <div className="c7n-deployDetail-table-header">
                  <span className="c7n-deployDetail-table-title">Deployment</span>
                  <table className="c7n-deployDetail-table">
                    <thead>
                      <tr>
                        <td>NAME</td>
                        <td>DESIRED</td>
                        <td>CURRENT</td>
                        <td>UP-TO-DATE</td>
                        <td>AVAILABLE</td>
                        <td>AGE</td>
                      </tr>
                    </thead>
                    <tbody>
                      {depDTO.map(dep => (
                        <tr key={Math.random()}>
                          <td>{dep.name}</td>
                          <td>{dep.desired}</td>
                          <td>{dep.current}</td>
                          <td>{dep.upToDate}</td>
                          <td>{dep.available ? '可用' : '不可用'}</td>
                          <td><TimePopover content={dep.age} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div> }
                { ingressDTO.length >= 1 && <div className="c7n-deployDetail-table-header">
                  <span className="c7n-deployDetail-table-title">Ingress</span>
                  <table className="c7n-deployDetail-table">
                    <thead>
                      <tr>
                        <td>NAME</td>
                        <td>HOSTS</td>
                        <td>ADDRESS</td>
                        <td>PORTS</td>
                        <td>AGE</td>
                      </tr>
                    </thead>
                    <tbody>
                      {ingressDTO.map(dep => (
                        <tr key={Math.random()}>
                          <td>{dep.name}</td>
                          <td>{dep.hosts}</td>
                          <td>{dep.address}</td>
                          <td>{dep.port}</td>
                          <td><TimePopover content={dep.age} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div> }
                { rsDTO.length >= 1 && <div className="c7n-deployDetail-table-header">
                  <span className="c7n-deployDetail-table-title">ReplicaSet</span>
                  <table className="c7n-deployDetail-table">
                    <thead>
                      <tr>
                        <td>NAME</td>
                        <td>DESIRED</td>
                        <td>CURRENT</td>
                        <td>READY</td>
                        <td>AGE</td>
                      </tr>
                    </thead>
                    <tbody>
                      {rsDTO.map(dep => (
                        <tr key={Math.random()}>
                          <td>{dep.name}</td>
                          <td>{dep.desired}</td>
                          <td>{dep.current}</td>
                          <td>{dep.ready}</td>
                          <td><TimePopover content={dep.age} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div> }
              </div>
            </TabPane> }
            <TabPane tab="部署详情" key="2">
              <div className="c7n-deployDetail-card c7n-deployDetail-card-content " style={{ display: 'none' }}>
                <h2 className="c7n-space-first c7n-h2-inline c7n-deployDetail-title">实例运行报错的信息</h2>
                <p>这事就是测试，实例报错了，不知道什么原因总之就是报错了</p>
              </div>
              <div className="c7n-deployDetail-card c7n-deployDetail-card-content ">
                <h2 className="c7n-space-first c7n-h2-inline c7n-deployDetail-title">配置信息</h2>
                <div role="none" className="c7n-deployDetail-expand" onClick={this.changeStatus}>
                  <Button shape="circle">
                    {this.state.expand ?
                      <span className="icon icon-expand_more" />
                      : <span className="icon icon-expand_less" />
                    }
                  </Button>
                </div>
                <div className={valueStyle}>
                  {DeployDetailStore.getValue
                  && <Ace
                    readOnly
                    totalLine={DeployDetailStore.getValue.totalLine}
                    value={DeployDetailStore.getValue.yaml}
                  />}

                </div>
              </div>
              {stageData.length >= 1 && <div className="c7n-deployDetail-card-content">
                <h2 className="c7n-space-first c7n-deployDetail-title">阶段及日志</h2>
                <Steps current={this.state.current} className="c7n-deployDetail-steps">
                  {dom}
                </Steps>
                <Log className="c7n-deployDetail-pre1" value={this.state.log || log} />
              </div>
              }
            </TabPane>
          </Tabs>
        </Content>}
      </Page>);
  }
}
export default withRouter(DeploymentDetail);
