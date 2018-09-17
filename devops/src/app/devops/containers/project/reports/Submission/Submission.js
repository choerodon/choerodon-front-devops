import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Select, Button, Radio } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import ChartSwitch from '../Component/ChartSwitch';
import './Submission.scss';

const { AppState } = stores;
const { Button: RadioButton } = Radio;
const { Group: RadioGroup } = Radio;
const { Option } = Select;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

@observer
class Submission extends Component {
  handleRefresh = () => {};

  /**
   * 视图切换
   * @param e
   */
  handleChange = (e) => {
    console.log(e.target.value);
  };

  /**
   * 用户、应用选择
   * @param e
   */
  handleSelect = (e) => {
    console.log(e.target.value);
  };

  render() {
    const { intl: { formatMessage }, history } = this.props;
    const { id, name, type, organizationId } = AppState.currentMenuType;
    return (<Page className="c7n-region">
      <Header
        title={formatMessage({ id: 'report.submission.head' })}
        backPath={`/devops/reports?type=${type}&id=${id}&name=${name}&organizationId=${organizationId}`}
      >
        <ChartSwitch
          history={history}
          current="submission"
        />
        <Button
          icon="refresh"
          onClick={this.handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Content code="report.submission" value={{ name }}>
        <div className="c7n-report-submission">
          <div className="c7n-report-chart">
            <div className="c7n-report-viewport">
              <div className="c7n-report-viewport-mode">
                <span>查看视图：</span>
                <RadioGroup onChange={this.handleChange} defaultValue="app">
                  <RadioButton value="app">应用</RadioButton>
                  <RadioButton value="user">用户</RadioButton>
                </RadioGroup>
              </div>
              <Select
                className="c7n-report-viewport-select"
                mode="multiple"
                placeholder="Please select"
                defaultValue={['a10', 'c12']}
                onChange={this.handleSelect}
              >
                {children}
              </Select>
            </div>
          </div>
          <div className="c7n-report-history">right</div>
        </div>
      </Content>
    </Page>);
  }
}

export default injectIntl(Submission);
