import React, { PureComponent, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import { withRouter, Link } from "react-router-dom";
import { stores } from "choerodon-front-boot";
import _ from "lodash";
import { Tooltip, Button, Modal } from "choerodon-ui";
import "./PodCircle.scss";

const { AppState } = stores;

@withRouter
export default class PodCircle extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      targetCount: this.props.count.sum || 0,
      realCount: this.props.count.sum,
      btnDisable: false,
      visible: false,
    };
  }

  /**
   * 限制连续点击发送请求的次数
   * 限制600ms
   *
   * @memberof PodCircle
   */
  operatePodCount = _.debounce(count => {
    const { id: projectId } = AppState.currentMenuType;
    const { currentPage, store, envId, name } = this.props;
    const page = currentPage === "env-overview" ? "overview" : "instance";
    store.operatePodCount(page, projectId, envId, name, count);
  }, 600);

  /**
   * 环形图下的文字显示
   * @memberof PodCircle
   */
  changeTextDisplay = count => {
    let { realCount } = this.state;
    return count !== realCount;
  };

  handleDecrease = () => {
    let { targetCount, btnDisable } = this.state;
    targetCount -= 1;
    if (!btnDisable && targetCount <= 0) {
      btnDisable = true;
      this.showModal();
    } else {
      this.setState({ targetCount });
      this.operatePodCount(targetCount);
    }
  };

  handleIncrease = () => {
    let { targetCount, btnDisable } = this.state;
    targetCount += 1;
    if (btnDisable && targetCount > 0) {
      btnDisable = false;
    }
    this.setState({ btnDisable, targetCount });
    this.operatePodCount(targetCount);
  };

  /**
   * 获取 pod 的环形图
   * @readonly
   * @memberof PodCircle
   */
  get renderCircle() {
    const {
      count: { sum, correct, correctCount },
    } = this.props;
    return (
      <svg width="70" height="70">
        <circle
          cx="35"
          cy="35"
          r="30"
          strokeWidth={sum === 0 || sum > correctCount ? 5 : 0}
          stroke={sum > 0 ? "#ffb100" : "#f3f3f3"}
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
  }

  showModal = () => {
    this.setState({ visible: true });
  };

  handleOk = () => {
    this.setState({ visible: false, btnDisable: true, targetCount: 0 });
    this.operatePodCount(0);
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  render() {
    const {
      id: projectId,
      name: projectName,
      organizationId,
      type,
    } = AppState.currentMenuType;
    const {
      linkTo,
      handleLink,
      currentPage,
      appId,
      envId,
      connect,
      name,
    } = this.props;
    const { targetCount, btnDisable, visible } = this.state;
    const textDisplay = this.changeTextDisplay(targetCount);
    const backPath = `/devops/${currentPage}?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`;

    return (
      <Fragment>
        <div className="c7ncd-pod-wrap">
          <div className="c7ncd-pod-content">
            {linkTo ? (
              <Link
                to={{
                  pathname: "/devops/container",
                  search: `?type=${type}&id=${projectId}&name=${encodeURIComponent(
                    projectName
                  )}&organizationId=${organizationId}`,
                  state: {
                    appId,
                    envId,
                    backPath,
                  },
                }}
                onClick={handleLink}
              >
                <Tooltip title={<FormattedMessage id="ist.expand.link" />}>
                  {this.renderCircle}
                </Tooltip>
              </Link>
            ) : (
              this.renderCircle
            )}
          </div>
          {connect ? (
            <div className="c7ncd-pod-content c7ncd-pod-btn-wrap">
              <Button
                className="c7ncd-pod-btn"
                size="small"
                icon="expand_less"
                onClick={this.handleIncrease}
              />
              <Button
                disabled={btnDisable}
                className="c7ncd-pod-btn"
                size="small"
                icon="expand_more"
                onClick={this.handleDecrease}
              />
            </div>
          ) : null}
        </div>
        {textDisplay && connect ? (
          <div className="c7ncd-pod-count">
            <FormattedMessage id="ist.expand.count" />
            <span className="c7ncd-pod-count-value">{targetCount}</span>
          </div>
        ) : null}
        <Modal
          title={name}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <p>确认停止该 Deployment 吗？</p>
        </Modal>
      </Fragment>
    );
  }
}
