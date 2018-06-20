import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Select, Steps, Icon, Upload, Radio, Table } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores, message } from 'choerodon-front-boot';
import LoadingBar from '../../../../components/loadingBar';
import '../Importexport.scss';
import '../../../main.scss';

const Step = Steps.Step;
const Option = Select.Option;
const Dragger = Upload.Dragger;
const RadioGroup = Radio.Group;

const { AppState } = stores;

@observer
class ImportChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 1,
      publish: '否',
      level: '本组织',
      visible: false,
    };
  }

  componentDidMount() {
    const { AppStoreStore } = this.props;
  }

  /**
   * 选择是否发布
   * @param e
   */
  onChangePublish = (e) => {
    console.log('radio checked', e.target.value);
    this.setState({
      publish: e.target.value,
    });
    if (e.target.value === '是') {
      this.setState({
        visible: true,
      });
    } else {
      this.setState({
        visible: false,
      });
    }
  };

  /**
   * 选择发布范围
   * @param e
   */
  onChangeLevel = (e) => {
    console.log('radio checked', e.target.value);
    this.setState({
      level: e.target.value,
    });
  };

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
    const props = {
      name: 'file',
      multiple: true,
      action: '//jsonplaceholder.typicode.com/posts/',
      onChange(info) {
        const status = info.file.status;
        if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };
    return (
      <div className="c7n-step-section-wrap">
        <p>
          您可以在此选择相应的文件，并进行上传。
        </p>
        <div className="c7n-step-section-upload">
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files</p>
          </Dragger>
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
          <Button funcType="raised" className="c7n-step-clear" onClick={this.clearStep}>取消</Button>
        </div>
      </div>
    );
  };

  /**
   * 渲染选择文件步骤
   */
  renderStepTwo = () => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const { visible } = this.state;
    return (
      <div className="c7n-step-section-wrap">
        <p>
          您可以在此选择是否发布，如果发布还可以选择发布的范围。若本组织内所有项目均可使用，则选择本组织；若全平台下的所有项目均可使用，则选择全平台。        </p>
        <div className="c7n-step-section">
          <RadioGroup label="是否发布" onChange={this.onChangePublish} value={this.state.publish}>
            <Radio value="否" className="c7n-step-radio">
              否
              <span>
                <Icon type="error" className="c7n-step-section-waring" />
                提示：本次不发布，之后还可以重新发布，但本次版本信息不会保留。
              </span>
            </Radio>
            <Radio value="是" className="c7n-step-radio">是</Radio>
          </RadioGroup>
        </div>
        {visible && (<div className="c7n-step-section">
          <RadioGroup label="发布范围" onChange={this.onChangeLevel} value={this.state.level}>
            <Radio value="本组织" className="c7n-step-radio">本组织</Radio>
            <Radio value="全平台" className="c7n-step-radio">全平台</Radio>
          </RadioGroup>
        </div>)}
        <div className="c7n-step-section">
          <Button
            type="primary"
            funcType="raised"
            className="c7n-step-button"
            // disabled={!(this.state.appId && this.state.versionId)}
            onClick={this.changeStep.bind(this, 3)}
          >
            下一步
          </Button>
          <Button
            funcType="raised"
            className="c7n-step-button"
            // disabled={!(this.state.appId && this.state.versionId)}
            onClick={this.changeStep.bind(this, 1)}
          >
            上一步
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.clearStep}>取消</Button>
        </div>
      </div>
    );
  };

  /**
   * 渲染总览
   */
  renderStepThree = () => {
    const { AppStoreStore } = this.props;
    const columns = [{
      title: '应用名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '应用版本',
      dataIndex: 'age',
      key: 'age',
    }];
    const data = [{
      key: '1',
      name: 'Devops 服务',
      age: '0.7.0-dev.20180619203359',
    }, {
      key: '2',
      name: '敏捷管理后端服务',
      age: '0.6.6-hotfix-ss.20180619135642',
    }, {
      key: '3',
      name: '前端Devops库',
      age: '0.7.0-dev.20180619203359',
    }];
    return (
      <div className="c7n-step-section-wrap">
        <p>
          您可以在此确认上传应用的信息，如需修改请返回上一步。
        </p>
        <div className="c7n-step-section">
          <p>
            <span>是否发布：</span>
            <span>{this.state.publish}</span>
          </p>
          {this.state.visible && (<p>
            <span>发布范围：</span>
            <span>{this.state.level}</span>
          </p>)}
          <Table columns={columns} dataSource={data} />
        </div>
        <div className="c7n-step-section">
          <Button
            type="primary"
            funcType="raised"
            className="c7n-step-button"
            // disabled={!(this.state.appId && this.state.versionId)}
            onClick={this.changeStep.bind(this, 3)}
          >
            导入
          </Button>
          <Button
            funcType="raised"
            className="c7n-step-button"
            // disabled={!(this.state.appId && this.state.versionId)}
            onClick={this.changeStep.bind(this, 2)}
          >
            上一步
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.clearStep}>取消</Button>
        </div>
      </div>
    );
  };

  /**
   * 清除输入并返回第一步
   */
  clearStep = () => {
    this.setState({
      current: 1,
      publish: '否',
    });
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
        <Header title="导入" backPath={`/devops/appstore?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`} />
        <div className="c7n-store-content-wrap">
          <h2 className="c7n-space-first">导入应用</h2>
          <p>
            您可以在此选择相应的应用，上传文件后并进行导出。
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
                title={<span className={current === 1 ? 'c7n-step-active' : ''}>选择文件</span>}
                onClick={this.changeStep.bind(this, 1)}
                status={this.getStatus(1)}
              />
              <Step
                title={<span className={current === 2 ? 'c7n-step-active' : ''}>是否发布</span>}
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

export default withRouter(ImportChart);
