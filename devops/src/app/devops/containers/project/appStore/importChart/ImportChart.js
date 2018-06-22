import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Select, Steps, Icon, Upload, Radio, Table } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
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
      fileList: false,
      defaultFileList: [],
      fileCode: false,
      upDown: [],
    };
  }

  /**
   * 选择是否发布
   * @param e
   */
  onChangePublish = (e) => {
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
    if (index === 2) {
      const projectId = parseInt(AppState.currentMenuType.id, 10);
      const { AppStoreStore } = this.props;
      const formdata = new FormData();
      formdata.append('file', this.state.fileList);
      AppStoreStore.uploadChart(projectId, formdata)
        .then((data) => {
          if (!data.failed) {
            this.setState({
              current: index,
              fileCode: data.fileCode,
            });
          }
        });
    } else {
      this.setState({ current: index });
    }
  };

  /**
   * 展开/收起实例
   */
  handleChangeStatus = (id, length) => {
    const { upDown } = this.state;
    const cols = document.getElementsByClassName(`col-${id}`);
    if (_.indexOf(upDown, id) === -1) {
      for (let i = 0; i < cols.length; i += 1) {
        cols[i].style.height = `${Math.ceil(length / 4) * 31}px`;
      }
      upDown.push(id);
      this.setState({
        upDown,
      });
    } else {
      for (let i = 0; i < cols.length; i += 1) {
        cols[i].style.height = '31px';
      }
      _.pull(upDown, id);
      this.setState({
        upDown,
      });
    }
  };

  /**
   * 取消
   */
  handleBack = () => {
    const { AppStoreStore } = this.props;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    this.props.history.push(`/devops/appstore?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`);
    if (this.state.fileCode) {
      AppStoreStore.uploadCancel(projectId, this.state.fileCode)
        .then(() => {
          this.setState({
            fileCode: false,
          });
        });
    }
  };

  importChart = (fileCode) => {
    const { publish, level } = this.state;
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const { AppStoreStore } = this.props;
    if (publish === '是') {
      AppStoreStore.importPublishStep(projectId, fileCode, level)
        .then((data) => {
          if (data === true) {
            Choerodon.prompt('导入成功');
            this.handleBack();
          }
        });
    } else {
      AppStoreStore.importStep(projectId, fileCode);
    }
  };

  /**
   * 渲染选择文件步骤
   */
  renderStepOne = () => {
    const projectId = parseInt(AppState.currentMenuType.id, 10);
    const { AppStoreStore } = this.props;
    const { fileList, defaultFileList, fileCode } = this.state;
    const props = {
      name: 'file',
      action: '//jsonplaceholder.typicode.com/posts/',
      multiple: false,
      disabled: Boolean(fileList),
      fileList: defaultFileList,
      onChange: (info) => {
        const status = info.file.status;
        if (status === 'done') {
          Choerodon.prompt(`${info.file.name} file uploaded successfully.`);
          this.setState({
            defaultFileList: info.fileList,
          });
        } else if (status === 'error') {
          this.setState({
            defaultFileList: info.fileList,
          });
        }
      },
      beforeUpload: (file) => {
        if (file.size > 1024 * 1024) {
          const tmp = file;
          tmp.status = 'error';
          this.setState({ fileList: file });
          Choerodon.prompt('文件大小不能超过1M');
          return false;
        } else if (file.type !== 'application/zip') {
          const tmp = file;
          tmp.status = 'error';
          this.setState({ fileList: file });
          Choerodon.prompt('文件格式错误');
          return false;
        } else {
          const tmp = file;
          tmp.status = 'done';
          this.setState({ fileList: file });
        }
        return false;
      },
      onRemove: () => {
        this.setState({
          fileList: false,
          defaultFileList: [],
        });
        if (fileCode) {
          AppStoreStore.uploadCancel(projectId, fileCode)
            .then(() => {
              this.setState({
                fileCode: false,
              });
            });
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
            disabled={!(fileList.status === 'done')}
            onClick={this.changeStep.bind(this, 2)}
          >
            下一步
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.handleBack}>取消</Button>
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
            <Radio value="false" className="c7n-step-radio">本组织</Radio>
            <Radio value="true" className="c7n-step-radio">全平台</Radio>
          </RadioGroup>
        </div>)}
        <div className="c7n-step-section">
          <Button
            type="primary"
            funcType="raised"
            className="c7n-step-button"
            onClick={this.changeStep.bind(this, 3)}
          >
            下一步
          </Button>
          <Button
            funcType="raised"
            className="c7n-step-button"
            onClick={this.changeStep.bind(this, 1)}
          >
            上一步
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.handleBack}>取消</Button>
        </div>
      </div>
    );
  };

  /**
   * 渲染总览
   */
  renderStepThree = () => {
    const { AppStoreStore } = this.props;
    const { upDown } = this.state;
    const data = AppStoreStore.getImpApp;
    const columns = [{
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '应用版本',
      key: 'version',
      render: record => (<div>
        <div role={'none'} className={`c7n-step-table-column col-${record.id}`} onClick={this.handleChangeStatus.bind(this, record.id, record.appVersions.length)}>
          {record.appVersions && document.getElementsByClassName(`${record.id}-col-parent`)[0] && parseInt(window.getComputedStyle(document.getElementsByClassName(`${record.id}-col-parent`)[0]).height, 10) > 31
          && <span className={_.indexOf(upDown, record.id) !== -1
            ? 'icon icon-keyboard_arrow_up c7n-step-table-icon' : 'icon icon-keyboard_arrow_down c7n-step-table-icon'}
          />
          }
          <div className={`${record.id}-col-parent`}>
            {_.map(record.appVersions, v => <div key={v.id} className="c7n-step-col-circle">{v.version}</div>)}
          </div>
        </div>
      </div>),
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
          <Table
            filterBar={false}
            pagination={false}
            columns={columns}
            dataSource={data.appMarketList}
            rowKey={record => record.id}
          />
        </div>
        <div className="c7n-step-section">
          <Button
            type="primary"
            funcType="raised"
            className="c7n-step-button"
            disabled={!(this.state.fileList.status === 'done')}
            onClick={this.importChart.bind(this, data.fileCode)}
          >
            导入
          </Button>
          <Button
            funcType="raised"
            className="c7n-step-button"
            onClick={this.changeStep.bind(this, 2)}
          >
            上一步
          </Button>
          <Button funcType="raised" className="c7n-step-clear" onClick={this.handleBack}>取消</Button>
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
                className={!this.state.defaultFileList.length ? 'c7n-step-disabled' : ''}
                title={<span className={current === 2 ? 'c7n-step-active' : ''}>是否发布</span>}
                onClick={this.changeStep.bind(this, 2)}
                status={this.getStatus(2)}
              />
              <Step
                className={!this.state.defaultFileList.length ? 'c7n-step-disabled' : ''}
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
