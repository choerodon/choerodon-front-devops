import React, {Component, Fragment} from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Icon, Popover, Spin } from 'choerodon-ui';
import _ from "lodash";
import CodeQualityStore from "../../../../../stores/project/codeQuality";
import Percentage from "../../../../../components/percentage/Percentage";
import Rating from "../../../../../components/rating/Rating";
import LoadingBar from "../../../../../components/loadingBar/LoadingBar";
import { QUALITY_LIST } from "../Constants";

import './QuaityCard.scss';

@injectIntl
@withRouter
@observer
export default class StageTitle extends Component {

  /**
   * 跳转至代码质量页
   */
  linkToQuality = () => {
    const {
      history,
      location: {
        search,
      },
    } = this.props;
    history.push({
      pathname: "/devops/code-quality",
      search,
      state: {
        backPath: `/devops/dev-console${search}`,
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const { getData, getLoading } = CodeQualityStore;
    const { date, status, sonarContents } = getData || {};
    if (!date) {
      return null;
    }
    _.map(QUALITY_LIST, item => {
      const data = _.find(sonarContents, ({ key }) => item.key === key) || {};
      Object.assign(item, data);
    });
    const codeLines = _.find(sonarContents,({ key }) => key === "ncloc_language_distribution");
    let linesKye = [];
    let tooltipsDom = null;
    if (codeLines && codeLines.value) {
      linesKye = codeLines.value.match(/((^|(?<=;)).*?(?==))/g);
      tooltipsDom = _.map(codeLines.value.split(";"), item => <div key={item}>{item}</div>)
    }
    return (
      <div className="c7n-dc-card-wrap c7n-dc-card-codeQuality" onClick={this.linkToQuality}>
        <div className="c7n-dc-card-title">
          <Icon type="quality" />
          <FormattedMessage id="codeQuality.content.title" />
          <span className="codeQuality-title-date">{formatMessage({ id: "codeQuality.analysis"})}：{date.split('+')[0].replace(/T/g, ' ')}</span>
        </div>
        <Spin spinning={getLoading}>
          <div className="c7n-card-codeQuality-content">
            <div className="codeQuality-content-block">
              <span className={`codeQuality-head-status codeQuality-head-status-${status}`}>
                {formatMessage({ id: `codeQuality.status.${status}` })}
              </span>
              <FormattedMessage id="codeQuality.content.title" />
            </div>
            {_.map(QUALITY_LIST, ({ key, value, icon, rate }) => (
              <div className="codeQuality-content-block" key={key}>
                <div className="codeQuality-content-block-detail mg-bottom-12">
                  {key === "coverage" && <Percentage data={Number(value)} size={30} />}
                  <span className="codeQuality-content-number">{value}</span>
                  {key === "coverage" && <span className="content-number-percentage">%</span>}
                  {rate && <Rating rating={rate} size="30px" fontSize="20px" />}
                </div>
                <div className="codeQuality-content-block-detail">
                  <Icon type={icon} />
                  <Popover
                    content={tooltipsDom}
                  >
                    <span className="mg-left-8">
                      {key === "ncloc" ? linesKye.join() : formatMessage({ id: `codeQuality.${key}` })}
                    </span>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        </Spin>
      </div>
    );
  }
}
