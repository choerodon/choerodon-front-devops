import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Select, Steps, Icon, Upload } from 'choerodon-ui';
import { Content, Header, message, Page, Permission, stores } from 'choerodon-front-boot';
import LoadingBar from '../../../../components/loadingBar';
import '../Importexport.scss';
import '../../../main.scss';

const Option = Select.Option;
const Step = Steps.Step;

const { AppState } = stores;

@observer
class ExportChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 1,
    };
  }

  componentDidMount() {
    const { AppStoreStore } = this.props;
  }

  /**
   * 获取步骤条状态
   * @param index
   * @returns {string}
   */
  getStatus = (index) => {
    const { current } = this.state;
    let status = 'process';
    if (index === current) {
      status = 'process';
    } else if (index > current) {
      status = 'wait';
    } else {
      status = 'finish';
    }
    return status;
  };

  /**
   * 改变步骤条
   * @param index
   */
  changeStep = (index) => {
    this.setState({ current: index });
  };

  /**
   * 渲染选择文件步骤
   */
  renderStepOne = () => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);

    return (
      <div className="c7n-step-section-wrap">
        <p>
          您可以在此选择想要导出的应用，您可以一次选择多个应用。
        </p>
        <div className="c7n-step-section">
          <div className="c7n-step-section-content">
            zz
          </div>
        </div>
        <div className="c7n-step-section">
          <Button
            type="primary"
            funcType="raised"
            className="c7n-step-button"
            // disabled={!(this.state.appId && this.state.versionId)}
            onClick={this.changeStep.bind(this, 2)}
          >
            下一步
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.clearStepOne}>取消</Button>
        </div>
      </div>
    );
  };

  render() {
    const { AppStoreStore } = this.props;
    const { current } = this.state;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;

    return (
      <Page className="c7n-region">
        <Header title="导出" backPath={`/devops/appstore?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`}>
          <Button
            funcType="flat"
            onClick={this.reload}
          >
            <span className="icon-refresh icon" />
            <span>{Choerodon.languageChange('refresh')}</span>
          </Button>
        </Header>
        <div className="c7n-store-content">
          <h2 className="c7n-space-first">导出应用</h2>
          <p>
            您可以在此选择相应的应用，并选择版本进行导出。
            <a href="http://v0-6.choerodon.io/zh/docs/user-guide/deployment-pipeline/application-market/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          <div className="c7n-store-card-wrap" style={{ minHeight: window.innerHeight - 277 }}>
            <Steps current={current}>
              <Step
                title={<span className={current === 1 ? 'c7n-step-active' : ''}>选择应用</span>}
                onClick={this.changeStep.bind(this, 1)}
                status={this.getStatus(1)}
              />
              <Step
                title={<span className={current === 2 ? 'c7n-step-active' : ''}>选择版本</span>}
                onClick={this.changeStep.bind(this, 2)}
                status={this.getStatus(2)}
              />
              <Step
                title={<span className={current === 3 ? 'c7n-step-active' : ''}>确认信息</span>}
                onClick={this.changeStep.bind(this, 3)}
                status={this.getStatus(3)}
              />
            </Steps>
            {current === 1 && this.renderStepOne()}
            {current === 2 && this.renderStepTwo()}
            {current === 3 && this.renderStepThree()}
          </div>
        </div>
      </Page>
    );
  }
}

export default withRouter(ExportChart);
