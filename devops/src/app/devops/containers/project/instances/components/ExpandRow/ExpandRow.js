import React, { Component, Fragment } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { withRouter, Link } from "react-router-dom";
import _ from "lodash";
import TimeAgo from "timeago-react";
import { stores, Content } from "choerodon-front-boot";
import { Tooltip, Button, Modal, Collapse } from "choerodon-ui";
import { formatDate } from "../../../../../utils/index";
import "./index.scss";
import { inject } from "mobx-react";

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

class ExpandRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      sideName: "",
    };
  }

  handleClick(name) {
    this.setState({ visible: true, sideName: name });
  }

  hideSidebar = () => {
    this.setState({ visible: false });
  };

  /**
   *
   * @param {*} item
   * @param {*} envId
   * @param {*} appId
   * @param {*} status
   * @returns
   * @memberof ExpandRow
   */
  getContent(item, envId, appId, status) {
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
              onClick={this.handleClick.bind(this, name)}
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

  render() {
    const {
      record: { deploymentDTOS, envId, appId, status },
      url,
      intl: { formatMessage },
    } = this.props;

    const { visible, sideName } = this.state;

    const deployContent = _.map(deploymentDTOS, item =>
      this.getContent(item, envId, appId, status)
    );

    const panelContent = _.map(PANEL_TYPE, item => (
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
        {item !== "variables" ? "楼下有🐕！" : "🐶:汪汪汪~~~"}
      </Panel>
    ));

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
            <Collapse bordered={false}>{panelContent}</Collapse>
          </Content>
        </Sidebar>
      </Fragment>
    );
  }
}

export default withRouter(injectIntl(ExpandRow));
