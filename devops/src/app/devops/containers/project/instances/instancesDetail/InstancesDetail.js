import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { observer, inject } from "mobx-react";
import {
  Button,
  Steps,
  Tabs,
  Tooltip,
  Icon,
  Popover,
  Modal,
  Progress,
} from "choerodon-ui";
import { Content, Header, Page, stores } from "choerodon-front-boot";
import classnames from "classnames";
import { injectIntl, FormattedMessage } from "react-intl";
import CodeMirror from "react-codemirror";
import _ from "lodash";
import TimePopover from "../../../../components/timePopover";
import LoadingBar from "../../../../components/loadingBar";
import Ace from "../../../../components/yamlAce";
import "../../../main.scss";
import "./index.scss";
import "../../container/containerHome/ContainerHome.scss";

const Step = Steps.Step;
const TabPane = Tabs.TabPane;
const Sidebar = Modal.Sidebar;

const { AppState } = stores;

require("codemirror/lib/codemirror.css");
require("codemirror/mode/yaml/yaml");
require("codemirror/mode/textile/textile");
require("codemirror/theme/base16-light.css");
require("codemirror/theme/base16-dark.css");

const ICONS_TYPE = {
  failed: {
    icon: "cancel",
    color: "#f44336",
    mes: "failed",
  },
  operating: {
    icon: "timelapse",
    color: "#4d90fe",
    mes: "operating",
  },
  pod_running: {
    color: "#3f51b5",
  },
  pod_fail: {
    color: "#f44336",
  },
  pod_success: {
    color: "#00bfa5",
  },
  success: {
    icon: "check_circle",
    color: "#00bfa5",
    mes: "success",
  },
  "": {
    icon: "check-circle",
    color: "#00bfa5",
    mes: "success",
  },
};

@observer
class InstancesDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.match.params.id,
      status: props.match.params.status,
      overview: props.location.search.indexOf("overview") > 0,
      expand: false,
      visible: false,
      time: "",
      sideType: "log",
      podEvent: [],
      activeKey: [],
      log: null,
      current: false,
    };
  }

  componentDidMount() {
    this.loadAllData();
  }

  loadAllData = () => {
    const { InstanceDetailStore } = this.props;
    const { id } = this.state;
    const projectId = AppState.currentMenuType.id;
    InstanceDetailStore.loadAllData(projectId, id);
  };

  handleClose = () => {
    const { InstanceDetailStore } = this.props;
    InstanceDetailStore.changeLogVisible(false);
  };

  showMore = eName => {
    let time = this.state.time;
    if (this.state.time === "") {
      const { InstanceDetailStore } = this.props;
      const event = InstanceDetailStore.getIstEvent;
      time = event[0].createTime;
      this.setState({ time });
    }
    let activeKey = this.state.activeKey;
    activeKey = [...activeKey];
    const index = activeKey.indexOf(`${time}-${eName}`);
    const isActive = index > -1;
    if (isActive) {
      // remove active state
      activeKey.splice(index, 1);
    } else {
      activeKey.push(`${time}-${eName}`);
    }
    this.setState({ activeKey });
  };

  loadEvent = e => {
    this.setState({ time: e.createTime, podEvent: e.podEventDTO });
  };

  handleCancelFun = () => {
    this.setState({
      visible: false,
    });
  };

  /**
   * 根据type显示右侧框标题
   * @returns {*}
   */
  showTitle = sideType => {
    if (sideType === "log") {
      return <FormattedMessage id="ist.log" />;
    } else if (sideType === "deployInfo") {
      return <FormattedMessage id="ist.deployInfo" />;
    }
  };

  /**
   * 弹出侧边栏
   * @param sideType
   * @param name
   * @param log
   */
  showSideBar = (sideType, name, log) => {
    const {
      intl,
      history: {
        location: { state },
      },
    } = this.props;
    if (sideType === "log") {
      this.setState({ visible: true, sidebarName: name, log }, () => {
        if (this.editorLog) {
          const editor = this.editorLog.getCodeMirror();
          editor.setValue(log || intl.formatMessage({ id: "ist.nolog" }));
        }
      });
    } else if (sideType === "deployInfo") {
      this.setState({
        sidebarName: state
          ? state.code
          : `${name.split("-")[0]}-${name.split("-")[1]}`,
      });
    }
    this.setState({ sideType, visible: true });
  };

  istTimeDom = () => {
    const { InstanceDetailStore } = this.props;
    const event = InstanceDetailStore.getIstEvent;
    let istDom = [];
    let time = event.length ? event[0].createTime : null;
    if (this.state.time !== "") {
      time = this.state.time;
    }
    _.map(event, e => {
      const content = (
        <table className="c7n-event-ist-popover">
          <tbody>
            <tr>
              <td>
                <FormattedMessage id="ist.deploy.result" />
                ：&nbsp;
              </td>
              <td>
                <Icon
                  style={{
                    color: ICONS_TYPE[e.status]
                      ? ICONS_TYPE[e.status].color
                      : "#00bfa5",
                  }}
                  type={
                    ICONS_TYPE[e.status]
                      ? ICONS_TYPE[e.status].icon
                      : "check-circle"
                  }
                />
                <FormattedMessage
                  id={
                    ICONS_TYPE[e.status] ? ICONS_TYPE[e.status].mes : "success"
                  }
                />
              </td>
            </tr>
            <tr>
              <td>
                <FormattedMessage id="report.deploy-duration.time" />
                ：&nbsp;
              </td>
              <td>{e.createTime}</td>
            </tr>
            <tr>
              <td>
                <FormattedMessage id="ist.deploy.mbr" />
                ：&nbsp;
              </td>
              <td>
                {e.userImage ? (
                  <img src={e.userImage} alt={e.realName} />
                ) : (
                  <span className="c7n-event-avatar">
                    {e.realName ? e.realName.slice(0, 1) : "无"}
                  </span>
                )}
                {e.loginName}&nbsp;{e.realName}
              </td>
            </tr>
          </tbody>
        </table>
      );
      istDom.push(
        <Popover content={content} key={e.createTime} placement="bottomRight">
          <div
            className={`c7n-event-ist-card ${
              e.createTime === time ? "c7n-ist-checked" : ""
            }`}
            onClick={this.loadEvent.bind(this, e)}
          >
            <Icon
              style={{
                color: ICONS_TYPE[e.status]
                  ? ICONS_TYPE[e.status].color
                  : "#00bfa5",
              }}
              type={
                ICONS_TYPE[e.status]
                  ? ICONS_TYPE[e.status].icon
                  : "check-circle"
              }
            />
            {e.createTime}
          </div>
        </Popover>
      );
    });
    return istDom;
  };

  currentChange = key => {
    this.setState({ current: key });
  };

  render() {
    const {
      name: projectName,
      organizationId,
      id: projectId,
      type,
    } = AppState.currentMenuType;
    const {
      InstanceDetailStore,
      intl,
      history: {
        location: { state },
      },
    } = this.props;
    const {
      expand,
      log,
      overview,
      activeKey,
      sideType,
      visible,
      sidebarName,
      podEvent,
      current,
      time,
    } = this.state;
    const valueStyle = classnames({
      "c7n-deployDetail-show": expand,
      "c7n-deployDetail-hidden": !expand,
    });
    const resource = InstanceDetailStore.getResource;
    const event = InstanceDetailStore.getIstEvent;
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

    const istEventDom = event.length
      ? _.map(podEvent.length ? podEvent : event[0].podEventDTO, e => (
          <Step
            key={e.name}
            title={
              <React.Fragment>
                {e.name} &nbsp;&nbsp;
                {e.log ? (
                  <Tooltip
                    title={intl.formatMessage({ id: "ist.log" })}
                    placement="bottom"
                  >
                    <Icon
                      onClick={this.showSideBar.bind(
                        this,
                        "log",
                        e.name,
                        e.log
                      )}
                      type="find_in_page"
                    />
                  </Tooltip>
                ) : null}
              </React.Fragment>
            }
            description={
              <React.Fragment>
                <pre
                  className={`${
                    activeKey.indexOf(`${time}-${e.name}`) > -1
                      ? ""
                      : "c7n-event-hidden"
                  }`}
                >
                  {e.event}
                </pre>
                {e.event && e.event.split("\n").length > 4 && (
                  <a onClick={this.showMore.bind(this, e.name)}>
                    {activeKey.indexOf(`${time}-${e.name}`) > -1
                      ? intl.formatMessage({ id: "shrink" })
                      : intl.formatMessage({ id: "expand" })}
                  </a>
                )}
              </React.Fragment>
            }
            icon={
              e.jobPodStatus === "running" ? (
                <Progress strokeWidth={10} width={13} type="loading" />
              ) : (
                <Icon
                  style={{
                    color: ICONS_TYPE[`pod_${e.jobPodStatus}`]
                      ? ICONS_TYPE[`pod_${e.jobPodStatus}`].color
                      : "#3f51b5",
                  }}
                  type="wait_circle"
                />
              )
            }
          />
        ))
      : null;

    const options = {
      theme: "neat",
      mode: "yaml",
      readOnly: "nocursor",
      lineNumbers: true,
    };
    const logOptions = {
      theme: "base16-dark",
      mode: "textile",
      readOnly: true,
      lineNumbers: true,
    };

    const currentKey = current || (this.state.status === "running" ? "1" : "2");

    const sidebarContent =
      sideType === "deployInfo" ? (
        <div className={valueStyle}>
          {InstanceDetailStore.getValue && (
            <Ace
              options={options}
              ref={instance => {
                this.codeEditor = instance;
              }}
              value={InstanceDetailStore.getValue.yaml}
            />
          )}
        </div>
      ) : (
        <CodeMirror
          className="c7n-deployDetail-pre1"
          value={log}
          options={logOptions}
          ref={editor => {
            this.editorLog = editor;
          }}
        />
      );

    return (
      <Page
        className="c7n-region c7n-deployDetail-wrapper"
        service={[
          "devops-service.application-instance.listEvents",
          "devops-service.application-instance.queryValues",
          "devops-service.application-instance.listResources",
        ]}
      >
        <Header
          title={<FormattedMessage id="ist.detail" />}
          backPath={
            overview
              ? `/devops/env-overview?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`
              : `/devops/instance?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`
          }
        >
          <Button icon="refresh" onClick={this.loadAllData} funcType="flat">
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code="ist.detail"
          values={{ name: state ? state.code : projectName }}
          className="page-content"
        >
          {InstanceDetailStore.isLoading ? (
            <LoadingBar display />
          ) : (
            <Tabs
              className="c7n-deployDetail-tab"
              onChange={this.currentChange}
              activeKey={currentKey}
            >
              {this.state.status === "running" && (
                <TabPane
                  tab={intl.formatMessage({ id: "ist.runDetial" })}
                  key="1"
                >
                  <div className="c7n-deployDetail-card c7n-deployDetail-card-content ">
                    <h2 className="c7n-space-first">Resources</h2>
                    {podDTO.length >= 1 && (
                      <div className="c7n-deployDetail-table-header header-first">
                        <span className="c7n-deployDetail-table-title">
                          Pod
                        </span>
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
                            {podDTO.map(pod => (
                              <tr key={Math.random()}>
                                <td>{pod.name}</td>
                                <td>{pod.ready}</td>
                                <td>{pod.status}</td>
                                <td>{pod.restarts}</td>
                                <td>
                                  <TimePopover content={pod.age} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {serviceDTO.length >= 1 && (
                      <div className="c7n-deployDetail-table-header">
                        <span className="c7n-deployDetail-table-title">
                          Service
                        </span>
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
                            {serviceDTO.map(service => (
                              <tr key={Math.random()}>
                                <td>{service.name}</td>
                                <td>{service.type}</td>
                                <td>{service.clusterIp}</td>
                                <td>{service.externalIp}</td>
                                <td>{service.port}</td>
                                <td>
                                  <TimePopover content={service.age} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {depDTO.length >= 1 && (
                      <div className="c7n-deployDetail-table-header">
                        <span className="c7n-deployDetail-table-title">
                          Deployment
                        </span>
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
                                <td>
                                  {dep.available
                                    ? intl.formatMessage({ id: "ist.y" })
                                    : intl.formatMessage({ id: "ist.n" })}
                                </td>
                                <td>
                                  <TimePopover content={dep.age} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {ingressDTO.length >= 1 && (
                      <div className="c7n-deployDetail-table-header">
                        <span className="c7n-deployDetail-table-title">
                          Ingress
                        </span>
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
                                <td>
                                  <TimePopover content={dep.age} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {rsDTO.length >= 1 && (
                      <div className="c7n-deployDetail-table-header">
                        <span className="c7n-deployDetail-table-title">
                          ReplicaSet
                        </span>
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
                                <td>
                                  <TimePopover content={dep.age} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </TabPane>
              )}
              <TabPane
                tab={intl.formatMessage({ id: "deploy.ist.event" })}
                key="2"
              >
                <div className="c7n-deployDetail-versions-wrap">
                  <FormattedMessage id="report.deploy-duration.time" />
                  {this.istTimeDom()}
                  <div
                    className="c7n-event-deploy-info"
                    onClick={this.showSideBar.bind(
                      this,
                      "deployInfo",
                      event.length ? event[0].podEventDTO[0].name : undefined
                    )}
                  >
                    <Icon type="find_in_page" />
                    {intl.formatMessage({ id: "deploy.detail" })}
                  </div>
                </div>
                {event.length ? (
                  <div className="c7n-deployDetail-card c7n-deployDetail-card-content ">
                    <Steps
                      direction="vertical"
                      size="small"
                      className="c7n-deployDetail-ist-step"
                    >
                      {istEventDom}
                    </Steps>
                  </div>
                ) : (
                  <div className="c7n-event-empty">
                    <div>
                      <Icon type="info" className="c7n-tag-empty-icon" />
                      <span className="c7n-tag-empty-text">
                        {intl.formatMessage({ id: "deploy.ist.event.empty" })}
                      </span>
                    </div>
                  </div>
                )}
              </TabPane>
            </Tabs>
          )}
          <Sidebar
            title={this.showTitle(sideType)}
            visible={visible}
            onOk={this.handleCancelFun.bind(this)}
            okText={<FormattedMessage id="close" />}
            okCancel={false}
          >
            <Content
              code={sideType}
              values={{ sidebarName }}
              className="sidebar-content"
            >
              {sidebarContent}
            </Content>
          </Sidebar>
        </Content>
      </Page>
    );
  }
}
export default withRouter(injectIntl(InstancesDetail));
