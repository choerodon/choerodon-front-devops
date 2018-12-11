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

  renderPorts(container, isLoading) {
    let hasPorts = false;

    const colItems = ["name", "containerPort", "protocol", "hostPort"];

    const columns = _.map(colItems, item => ({
      title: <FormattedMessage id={`ist.deploy.ports.${item}`} />,
      key: item,
      dataIndex: item,
      render: textOrNA,
    }));

    let portsContent = _.map(container, item => {
      const { name, ports } = item;
      if (ports && ports.length) {
        hasPorts = true;
      }
      return (
        <Fragment key={name}>
          <div className="c7ncd-deploy-ports-name">
            <FormattedMessage id="ist.deploy.container" />
            {name}
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

    if (!hasPorts) {
      portsContent = <div>没有端口配置</div>;
    }

    return isLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      portsContent
    );
  }

  renderHealth() {
    return <div>...</div>;
  }

  renderVar() {
    const {
      getData: { detail },
      getLoading,
    } = DeploymentStore;
    let containers = [];
    if (
      detail &&
      detail.spec &&
      detail.spec.template &&
      detail.spec.template.spec
    ) {
      containers = detail.spec.template.spec.containers;
    }
    const columns = [
      {
        title: <FormattedMessage id="ist.deploy.variables.key" />,
        key: "name",
        dataIndex: "name",
      },
      {
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
          <div className="c7ncd-deploy-ports-name">
            <FormattedMessage id="ist.deploy.container" />
            {name}
          </div>
          <Table
            filterBar={false}
            // onChange={this.tableChange}
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

    return getLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      envContent
    );
  }

  renderLabel() {
    const {
      getData: { detail },
      getLoading,
    } = DeploymentStore;
    let labels = [];
    let annotations = [];
    if (detail && detail.metadata) {
      labels = detail.metadata.labels;
      annotations = detail.metadata.annotations;
    }

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

    return getLoading ? (
      <div className="c7ncd-deploy-spin">
        <Spin />
      </div>
    ) : (
      <Fragment>
        <div className="c7ncd-deploy-ports-name">Labels</div>
        {labelContent}
        <div className="c7ncd-deploy-ports-name">Annotations</div>
        {annoContent}
      </Fragment>
    );
  }

  renderVolume() {
    const {
      getData: { detail },
      getLoading,
    } = DeploymentStore;

    let containers = [];
    let volumes = [];
    if (
      detail &&
      detail.spec &&
      detail.spec.template &&
      detail.spec.template.spec
    ) {
      containers = detail.spec.template.spec.containers;
      volumes = detail.spec.template.spec.volumes;
    }

    const volumeType = keys => {
      const VOL_TYPE = ["configMap", "persistentVolumeClaim", "secret"];
      const type = _.filter(VOL_TYPE, item => keys.includes(item));
      let content = null;
      switch (type) {
        case "configMap":
          break;
        case "persistentVolumeClaim":
          break;
        case "secret":
          break;
        case "hostPath":
          break;

        default:
          break;
      }
      return content;
    };

    const volumeContent = [];
    _.map(volumes, vol => {
      const vKey = Object.keys(vol);
      volumeContent.push(volumeType(vKey));
    });
  }

  renderSecurity() {
    const {
      getData: { detail },
      getLoading,
    } = DeploymentStore;
    let containers = [];
    let volumes = [];
    if (
      detail &&
      detail.spec &&
      detail.spec.template &&
      detail.spec.template.spec
    ) {
      containers = detail.spec.template.spec.containers;
      volumes = detail.spec.template.spec.volumes;
    }
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
    if (
      detail &&
      detail.spec &&
      detail.spec.template &&
      detail.spec.template.spec
    ) {
      containers = detail.spec.template.spec.containers;
    }

    const renderFun = {
      ports: this.renderPorts.bind(this, containers, getLoading),
      volume: this.renderVolume,
      health: this.renderHealth,
      security: this.renderSecurity,
      label: this.renderLabel,
      variables: this.renderVar,
    };

    const panelContent = visible
      ? _.map(PANEL_TYPE, item => (
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
            {renderFun[item]()}
          </Panel>
        ))
      : null;

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
            <Button type="primary" key="back" onClick={this.hideSidebar}>
              <FormattedMessage id="close" />
            </Button>,
          ]}
          title={formatMessage({ id: "ist.deploy.detail" })}
          visible={visible}
        >
          <Content code="ist.deploy" values={{ name: sideName }}>
            <Collapse
              bordered={false}
              activeKey={activeKey}
              onChange={this.handlePanelChange}
            >
              {panelContent}
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
function textOrNA(text) {
  if (!text) {
    return "n/a";
  }
  return text;
}

export default withRouter(injectIntl(ExpandRow));
