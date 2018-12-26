import React, { PureComponent, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import { withRouter, Link } from "react-router-dom";
import { stores } from "choerodon-front-boot";
import { Tooltip, Button } from "choerodon-ui";
import "./PodCircle.scss";

const { AppState } = stores;

@withRouter
export default class PodCircle extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      showText: false,
    };
    this.timer = null;
  }

  handleCountChange = op => {
    this.setState(prev => {
      return { showText: true, count: prev.count + 1 };
    });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({ showText: false });
    }, 2000);
  };

  renderCircle(sum, correct, correctCount) {
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
      count: { sum, correct, correctCount },
    } = this.props;

    const { count, showText } = this.state;

    const backPath = `/devops/${currentPage}?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`;

    const circle = this.renderCircle(sum, correct, correctCount);

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
                  {circle}
                </Tooltip>
              </Link>
            ) : (
              circle
            )}
          </div>
          <div className="c7ncd-pod-content c7ncd-pod-btn-wrap">
            <Button
              className="c7ncd-pod-btn"
              size="small"
              icon="expand_less"
              onClick={this.handleCountChange}
            />
            <Button
              className="c7ncd-pod-btn"
              size="small"
              icon="expand_more"
              onClick={this.handleCountChange}
            />
          </div>
        </div>
        {showText ? (
          <div className="c7ncd-pod-count">
            <FormattedMessage id="ist.expand.count" />
            <span className="c7ncd-pod-count-value">{count}</span>
          </div>
        ) : null}
      </Fragment>
    );
  }
}
