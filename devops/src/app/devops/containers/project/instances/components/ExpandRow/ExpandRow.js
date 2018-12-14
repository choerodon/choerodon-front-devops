import React, { Component, Fragment } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { observer, renderReporter } from "mobx-react";
import { withRouter, Link } from "react-router-dom";
import _ from "lodash";
import TimeAgo from "timeago-react";
import { stores, Content } from "choerodon-front-boot";
import { Tooltip, Button, Modal, Collapse, Table, Spin } from "choerodon-ui";
import { formatDate } from "../../../../../utils/index";
import DeploymentStore from "../../../../../stores/project/instances/DeploymentStore";
import "./index.scss";

const { AppState } = stores;
const { Sidebar } = Modal;
const { Panel } = Collapse;

const PANEL_TYPE = [
  "ports",
  "volume",
  "health",
  "security",
  "label",
  "variables",
];

@observer
class ExpandRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      sideName: "",
      activeKey: [],
    };
    this.renderPorts = this.renderPorts.bind(this);
    this.renderVolume = this.renderVolume.bind(this);
    this.renderHealth = this.renderHealth.bind(this);
    this.renderSecurity = this.renderSecurity.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
    this.renderVar = this.renderVar.bind(this);
  }

  /**
   * 打开Deployment详情侧边栏，并加载数据
   * @param {*} id
   * @param {*} name
   */
  handleClick(id, name) {
    const { id: projectId } = AppState.currentMenuType;
    this.setState({ visible: true, sideName: name });
    DeploymentStore.loadDeploymentsJson(projectId, id, name);
  }

  hideSidebar = () => {
    this.setState({ visible: false, activeKey: [] });
    DeploymentStore.setData([]);
  };

  handlePanelChange = key => {
    this.setState({ activeKey: key });
  };

  /**
   *
   * @param {object} item
   * @param {number} envId
   * @param {number} appId
   * @param {number} id 实例id
   * @param {string} status
   * @returns
   * @memberof ExpandRow
   */
  getContent(item, envId, appId, id, status) {
    const { name, available, age, devopsEnvPodDTOS, current, desired } = item;
    let correctCount = 0;
    let errorCount = 0;
    _.forEach(devopsEnvPodDTOS, p => {
      if (p.ready) {
        correctCount += 1;
      } else {
        errorCount += 1;
      }
    });
    const sum = correctCount + errorCount;
    const correct = sum > 0 ? (correctCount / sum) * (Math.PI * 2 * 30) : 0;
    const {
      id: projectId,
      name: projectName,
      organizationId,
      type,
    } = AppState.currentMenuType;
    const circle = (
      <svg width="70" height="70">
        <circle
          cx="35"
          cy="35"
          r="30"
          strokeWidth={sum === 0 || sum > correctCount ? 5 : 0}
          stroke={sum > 0 ? "#FFB100" : "#f3f3f3"}
          className="c7n-pod-circle-error"
        />
        <circle
          cx="35"
          cy="35"
          r="30"
          className="c7n-pod-circle"
          strokeDasharray={`${correct}, 10000`}
        />
        <text x="50%" y="32.5" className="c7n-pod-circle-num">
          {sum}
        </text>
        <text x="50%" y="50" className="c7n-pod-circle-text">
          {sum > 1 ? "pods" : "pod"}
        </text>
      </svg>
    );
    return (
      <div key={name} className="c7n-deploy-expanded-item">
        <ul className="c7n-deploy-expanded-text">
          <li className="c7n-deploy-expanded-lists">
            <span className="c7n-deploy-expanded-keys">
              <FormattedMessage id="ist.expand.name" />：
            </span>
            <span title={name} className="c7n-deploy-expanded-values">
              {name}
            </span>
          </li>
          <li className="c7n-deploy-expanded-lists">
            <span className="c7n-deploy-expanded-keys">ReplicaSet：</span>
            <span
              title={`${available || 0} available / ${current ||
                0} current / ${desired || 0} desired`}
              className="c7n-deploy-expanded-values"
            >{`${available || 0} available / ${current ||
              0} current / ${desired || 0} desired`}</span>
          </li>
          <li className="c7n-deploy-expanded-lists">
            <span className="c7n-deploy-expanded-keys">
              <FormattedMessage id="ist.expand.date" />：
            </span>
            <span className="c7n-deploy-expanded-values">
              <Tooltip title={formatDate(age)}>
                <TimeAgo
                  datetime={age}
                  locale={Choerodon.getMessage("zh_CN", "en")}
                />
              </Tooltip>
            </span>
          </li>
          <li className="c7n-deploy-expanded-lists">
            <Button
              className="c7ncd-detail-btn"
              onClick={this.handleClick.bind(this, id, name)}
            >
              <FormattedMessage id="detailMore" />
            </Button>
          </li>
        </ul>
        <div className="c7n-deploy-expanded-pod">
          {status === "running" ? (
            <Link
              to={{
                pathname: "/devops/container",
                search: `?type=${type}&id=${projectId}&name=${encodeURIComponent(
                  projectName
                )}&organizationId=${organizationId}`,
                state: { appId, envId },
              }}
            >
              <Tooltip title={<FormattedMessage id="ist.expand.link" />}>
                {circle}
              </Tooltip>
            </Link>
          ) : (
            circle
          )}
        </div>
      </div>
    );
  }

  renderPorts(containers, isLoading) {
    let portsContent = null;
    let hasPorts = false;

    if (containers && containers.length) {
      const colItems = ["name", "containerPort", "protocol", "hostPort"];

      const columns = _.map(colItems, item => ({
        title: <FormattedMessage id={`ist.deploy.ports.${item}`} />,
        key: item,
        dataIndex: item,
        render: _textOrNA,
        sorter: true,
      }));

      portsContent = _.map(containers, item => {
        const { name, ports } = item;
        if (ports && ports.length) {
          hasPorts = true;
        }
        return (
          <Fragment key={name}>
            <div className="c7ncd-deploy-container-title">
              <FormattedMessage id="ist.deploy.container" />
              <span className="c7ncd-deploy-container-name">{name}</span>
            </div>
            <Table
              filterBar={false}
              dataSource={ports && ports.slice()}
              columns={columns}
              pagination={false}
              rowKey={record => record.name}
            />
          </Fragment>
        );
      });
    } else {
      portsContent = (
        <div className="c7ncd-deploy-detail-empty">
          <FormattedMessage id="ist.deploy.ports.map" />
          <FormattedMessage id="ist.deploy.ports.empty" />
        </div>
      );
    }

    if (!hasPorts) {
      portsContent = (
        <div className="c7ncd-deploy-detail-empty">
          <FormattedMessage id="ist.deploy.ports.map" />
          <FormattedMessage id="ist.deploy.ports.empty" />
        </div>
      );
    }

    return isLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      portsContent
    );
  }

  renderHealth(containers, isLoading) {
    let healthContent = null;

    if (containers && containers.length) {
      healthContent = _.map(containers, item => {
        const { name } = item;
        const readinessProbe = item.readinessProbe || {};
        const livenessProbe = item.livenessProbe || {};

        const readDom = _returnHealthDom("readiness", readinessProbe);
        const liveDom = _returnHealthDom("liveness", livenessProbe);

        return (
          <div key={name} className="c7ncd-deploy-health-wrap">
            <div className="c7ncd-deploy-container-title">
              <FormattedMessage id="ist.deploy.container" />
              <span className="c7ncd-deploy-container-name">{name}</span>
            </div>
            <div className="c7ncd-deploy-health-content">
              {readDom}
              {liveDom}
            </div>
          </div>
        );
      });
    } else {
      healthContent = (
        <div className="c7ncd-deploy-detail-empty">
          <p>
            <FormattedMessage id="ist.deploy.health.readiness" />
          </p>
          <FormattedMessage id="ist.deploy.volume.type" />
          <span className="c7ncd-deploy-health-empty">
            <FormattedMessage id="ist.deploy.none" />
          </span>
        </div>
      );
    }

    return isLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      healthContent
    );
  }

  renderVar(containers, isLoading) {
    const columns = [
      {
        width: "50%",
        title: <FormattedMessage id="ist.deploy.variables.key" />,
        key: "name",
        dataIndex: "name",
      },
      {
        width: "50%",
        title: <FormattedMessage id="ist.deploy.variables.value" />,
        key: "value",
        dataIndex: "value",
      },
    ];

    let hasEnv = false;
    let envContent = _.map(containers, item => {
      const { name, env } = item;
      if (env && env.length) {
        hasEnv = true;
      }
      return (
        <Fragment key={name}>
          <div className="c7ncd-deploy-container-title">
            <FormattedMessage id="ist.deploy.container" />
            <span className="c7ncd-deploy-container-name">{name}</span>
          </div>
          <Table
            filterBar={false}
            dataSource={env && env.slice()}
            columns={columns}
            pagination={false}
            rowKey={record => record.name}
          />
        </Fragment>
      );
    });

    if (!hasEnv) {
      envContent = (
        <Table
          key="noDate"
          filterBar={false}
          pagination={false}
          dataSource={[]}
          columns={columns}
        />
      );
    }

    return isLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      envContent
    );
  }

  renderLabel(labels, annotations, isLoading) {
    /**
     * 表格数据
     * @param {object} obj
     * @param {array} col
     */
    function format(obj, col) {
      const arr = [];
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          arr.push({ key, value });
        }
      }
      return (
        <Table
          filterBar={false}
          pagination={false}
          dataSource={arr.length ? arr : []}
          columns={col}
        />
      );
    }

    const columns = [
      {
        width: "50%",
        title: <FormattedMessage id="ist.deploy.key" />,
        key: "key",
        dataIndex: "key",
      },
      {
        width: "50%",
        title: <FormattedMessage id="ist.deploy.value" />,
        key: "value",
        dataIndex: "value",
      },
    ];

    const labelContent = format(labels, columns);

    const annoContent = format(annotations, columns);

    return isLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      <Fragment>
        <div className="c7ncd-deploy-label">Labels</div>
        {labelContent}
        <div className="c7ncd-deploy-label">Annotations</div>
        {annoContent}
      </Fragment>
    );
  }

  renderVolume(containers, volumes, isLoading) {
    let volumeContent = null;

    const _volumeType = (vol, mounts) => {
      const vDom = _volumesTemplate(vol);
      const mountsArr = mounts.length ? mounts : [{}];
      const mDom = _.map(mountsArr, item => {
        const mount = {
          mountPath: item.mountPath,
          subPath: item.subPath,
          readOnly: item.readOnly,
        };
        return (
          <div className="c7ncd-deploy-volume-flex">
            {_.map(mount, (value, key) => (
              <div
                className={`c7ncd-deploy-volume-item${
                  key === "readOnly" ? "_short" : ""
                }`}
              >
                <p className="c7ncd-deploy-detail-label">
                  <FormattedMessage id={`ist.deploy.volume.${key}`} />
                </p>
                <p className="c7ncd-deploy-detail-text">
                  {_.isBoolean(value) ? value.toString() : value}
                </p>
              </div>
            ))}
          </div>
        );
      });

      return (
        <div key={vol.name} className="c7ncd-deploy-volume-wrap">
          {vDom}
          <hr className="c7ncd-deploy-volume-line" />
          {mDom}
        </div>
      );
    };

    if (volumes && volumes.length) {
      volumeContent = _.map(volumes, vol => {
        const { name } = vol;
        const mounts = [];
        _.forEach(containers, item => {
          const { volumeMounts } = item;
          const filterVol = _.filter(volumeMounts, m => m.name === name);
          mounts.push(...filterVol);
        });
        return _volumeType(vol, mounts);
      });
    } else {
      volumeContent = (
        <div className="c7ncd-deploy-detail-empty">
          <FormattedMessage id="ist.deploy.volume" />
          <FormattedMessage id="ist.deploy.volume.empty" />
        </div>
      );
    }

    return isLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      volumeContent
    );
  }

  renderSecurity(containers, hostIPC, hostNetwork, isLoading) {
    const containerArr = containers.length ? containers : [{}];
    const securityCtx = _.map(containerArr, item => {
      const { imagePullPolicy, name } = item;
      const securityContext = item.securityContext || {};
      const {
        privileged,
        allowPrivilegeEscalation,
        readOnlyRootFilesystem,
        runAsNonRoot,
        capabilities,
      } = securityContext;

      let capAdd = [];
      let capDrop = [];

      if (capabilities) {
        capAdd = capabilities.add;
        capDrop = capabilities.drop;
      }

      const addArr = capAdd.length ? (
        _.map(capAdd, item => (
          <p className="c7ncd-deploy-detail-text">{item}</p>
        ))
      ) : (
        <FormattedMessage id="ist.deploy.none" />
      );
      const dropArr = capDrop.length ? (
        _.map(capDrop, item => (
          <p className="c7ncd-deploy-detail-text">{item}</p>
        ))
      ) : (
        <FormattedMessage id="ist.deploy.none" />
      );

      return (
        <Fragment key={name}>
          <div className="c7ncd-deploy-container-title">
            <FormattedMessage id="ist.deploy.container" />
            <span className="c7ncd-deploy-container-name">{name}</span>
          </div>
          <div className="c7ncd-deploy-security-block">
            {_securityItem("imagePullPolicy", imagePullPolicy, "_flex")}
            {_securityItem("privileged", privileged, "_flex")}
            {_securityItem(
              "allowPrivilegeEscalation",
              allowPrivilegeEscalation,
              "_flex"
            )}
          </div>
          <div className="c7ncd-deploy-security-block">
            {_securityItem("runAsNonRoot", runAsNonRoot)}
            {_securityItem("readOnlyRootFilesystem", readOnlyRootFilesystem)}
          </div>
          <div className="c7ncd-deploy-security-block">
            {_securityItem("capabilities.add", addArr)}
            {_securityItem("capabilities.drop", dropArr)}
          </div>
        </Fragment>
      );
    });

    const securityContent = (
      <div className="c7ncd-deploy-security-wrap">
        <div className="c7ncd-deploy-security-block">
          {_securityItem("hostIPC", hostIPC)}
          {_securityItem("hostNetwork", hostNetwork)}
        </div>
        {securityCtx}
      </div>
    );

    return isLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      securityContent
    );
  }

  render() {
    const {
      record: { deploymentDTOS, envId, appId, status, id },
      url,
      intl: { formatMessage },
    } = this.props;

    const { visible, sideName, activeKey } = this.state;

    const deployContent = _.map(deploymentDTOS, item =>
      this.getContent(item, envId, appId, id, status)
    );

    const {
      getData: { detail },
      getLoading,
    } = DeploymentStore;

    let containers = [];
    let volumes = [];
    let hostIPC = null;
    let hostNetwork = null;
    let labels = [];
    let annotations = [];

    if (detail && detail.metadata) {
      labels = detail.metadata.labels;
      annotations = detail.metadata.annotations;
    }

    if (
      detail &&
      detail.spec &&
      detail.spec.template &&
      detail.spec.template.spec
    ) {
      containers = detail.spec.template.spec.containers;
      volumes = detail.spec.template.spec.volumes;
      hostIPC = detail.spec.template.spec.hostIPC;
      hostNetwork = detail.spec.template.spec.hostNetwork;
    }

    const renderFun = {
      ports: () => this.renderPorts(containers, getLoading),
      volume: () => this.renderVolume(containers, volumes, getLoading),
      health: () => this.renderHealth(containers, getLoading),
      variables: () => this.renderVar(containers, getLoading),
      security: () =>
        this.renderSecurity(containers, hostIPC, hostNetwork, getLoading),
      label: () => this.renderLabel(labels, annotations, getLoading),
    };

    return (
      <Fragment>
        {deploymentDTOS && deploymentDTOS.length ? (
          <div className="c7n-deploy-expanded">
            <div className="c7n-deploy-expanded-title">Deployments</div>
            {deployContent}
          </div>
        ) : (
          <div className="c7n-deploy-expanded-empty">
            <FormattedMessage id="ist.expand.empty" />
          </div>
        )}
        <Sidebar
          footer={[
            <Button
              type="primary"
              funcType="raised"
              key="close"
              onClick={this.hideSidebar}
            >
              <FormattedMessage id="close" />
            </Button>,
          ]}
          title={formatMessage({ id: "ist.deploy.detail" })}
          visible={visible}
        >
          <Content
            code="ist.deploy"
            values={{ name: sideName }}
            className="sidebar-content"
          >
            <Collapse
              bordered={false}
              activeKey={activeKey}
              onChange={this.handlePanelChange}
            >
              {_.map(PANEL_TYPE, item => (
                <Panel
                  key={item}
                  header={
                    <div className="c7ncd-deploy-panel-header">
                      <div className="c7ncd-deploy-panel-title">
                        <FormattedMessage id={`ist.deploy.${item}`} />
                      </div>
                      <div className="c7ncd-deploy-panel-text">
                        <FormattedMessage id={`ist.deploy.${item}.describe`} />
                      </div>
                    </div>
                  }
                  className="c7ncd-deploy-panel"
                >
                  {visible ? renderFun[item]() : null}
                </Panel>
              ))}
            </Collapse>
          </Content>
        </Sidebar>
      </Fragment>
    );
  }
}

/**
 * 内容为空时返回 n/a
 */
function _textOrNA(text) {
  if (!text && !_.isBoolean(text)) {
    return "n/a";
  }
  return String(text);
}

/**
 * 返回健康检查的DOM
 * @param {string} name
 * @param {obj} data
 */
function _returnHealthDom(name, data) {
  const items = [
    "failureThreshold",
    "initialDelaySeconds",
    "periodSeconds",
    "successThreshold",
    "timeoutSeconds",
  ];

  return (
    <div className="c7ncd-deploy-health-block">
      <div className="c7ncd-deploy-label">
        <FormattedMessage id={`ist.deploy.health.${name}`} />
      </div>
      <div className="c7ncd-deploy-health-main">
        {_.map(items, item => (
          <div className="c7ncd-deploy-health-item">
            <p className="c7ncd-deploy-detail-label">
              <FormattedMessage id={`ist.deploy.health.${item}`} />
            </p>
            <p className="c7ncd-deploy-detail-text">{_textOrNA(data[item])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 返回数据卷的项目DOM
 * @param {string} name
 * @param {string} data
 * @param {bool} isBool 该项是不是Bool类型
 */
function _volumesItem(name, data, isBool = false) {
  let value = data;
  if (isBool) {
    value = _.isBoolean(data) ? data.toString() : data;
  }
  return (
    <div className="c7ncd-deploy-volume-item">
      <p className="c7ncd-deploy-detail-label">
        <FormattedMessage id={`ist.deploy.volume.${name}`} />
      </p>
      <p className="c7ncd-deploy-detail-text">{value}</p>
    </div>
  );
}

function _volumesTemplate(data) {
  let template = null;
  const VOL_TYPE = ["configMap", "persistentVolumeClaim", "secret", "hostPath"];

  const { name } = data;
  const vKey = Object.keys(data);

  let type = _.toString(_.filter(VOL_TYPE, item => vKey.includes(item)));

  switch (type) {
    case "configMap":
    case "secret":
      const { defaultMode, items, optional, name, secretName } = data[type];
      let itemDom = null;
      if (items && items.length) {
        const columns = [
          {
            title: <FormattedMessage id="ist.deploy.volume.config.key" />,
            key: "key",
            dataIndex: "key",
          },
          {
            title: <FormattedMessage id="ist.deploy.volume.config.mode" />,
            key: "mode",
            dataIndex: "mode",
          },
          {
            title: <FormattedMessage id="ist.deploy.volume.config.path" />,
            key: "path",
            dataIndex: "path",
          },
        ];
        itemDom = (
          <Table
            filterBar={false}
            pagination={false}
            dataSource={items}
            columns={columns}
          />
        );
      } else {
        itemDom = (
          <p className="c7ncd-deploy-detail-text">
            {/* <FormattedMessage id="ist.deploy.none" /> */}
          </p>
        );
      }
      template = (
        <div className="c7ncd-deploy-volume-main">
          {_volumesItem("defaultMode", defaultMode)}
          {_volumesItem("optional", optional, true)}
          <div className={`c7ncd-deploy-volume-item${items ? "_full" : ""}`}>
            <p className="c7ncd-deploy-detail-label">
              <FormattedMessage id="ist.deploy.volume.item" />
            </p>
            {itemDom}
          </div>
        </div>
      );
      break;
    case "persistentVolumeClaim":
      const { claimName, readOnly } = data[type];
      template = (
        <div className="c7ncd-deploy-volume-main">
          {_volumesItem("claimName", claimName)}
          {_volumesItem("readOnly", readOnly, true)}
        </div>
      );
      break;
    case "hostPath":
      const { path, type: hostType } = data[type];
      template = (
        <div className="c7ncd-deploy-volume-main">
          {_volumesItem("path", path)}
          {_volumesItem("type", type)}
        </div>
      );
      break;

    default:
      type = "未知";
      break;
  }
  return (
    <Fragment>
      <div className="c7ncd-deploy-volume-main">
        {_volumesItem("name", name)}
        {_volumesItem("volume.type", type)}
      </div>
      {template}
    </Fragment>
  );
}

function _securityItem(name, data, type = "") {
  let content =
    _.isArray(data) || _.isObject(data) ? (
      data
    ) : (
      <p className="c7ncd-deploy-detail-text">{_textOrNA(data)}</p>
    );
  return (
    <div className={`c7ncd-deploy-security-item${type}`}>
      <p className="c7ncd-deploy-detail-label">
        <FormattedMessage id={`ist.deploy.security.${name}`} />
      </p>
      {content}
    </div>
  );
}

export default withRouter(injectIntl(ExpandRow));
