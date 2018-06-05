import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Select, Button, Spin, Radio, Card, Steps, Table, Tooltip, Form, Input } from 'choerodon-ui';
import _ from 'lodash';
import PageHeader from 'PageHeader';
import Permission from 'PerComponent';
import '../../../main.scss';
import './../AppRelease.scss';
import VersionTable from '../versionTable';
import TimePopover from '../../../../components/timePopover';


const { TextArea } = Input;
const RadioGroup = Radio.Group;
const Step = Steps.Step;
@inject('AppState')
@observer
class AddAppRelease extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: props.match.params.appId || undefined,
      current: props.match.params.appId ? 2 : 1,
      envId: undefined,
      projectId: props.AppState.currentMenuType.id,
      mode: 'organization',
      markers: null,
    };
  }

  componentDidMount() {
    const { AppState, EditReleaseStore } = this.props;
    EditReleaseStore.loadApps({ projectId: this.state.projectId });
    EditReleaseStore.loadApp(this.state.projectId, this.state.appId);
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
  }
  /**
   * 处理图片回显
   * @param img
   * @param callback
   */
  getBase64 =(img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  /**
   * 改变步骤条
   * @param index
   */
  changeStep =(index) => {
    this.setState({ current: index });
  }

  handleChangeMode =(value) => {
    this.setState({ mode: value.target.value });
  }

  /**
   * 返回到上一级
   */
  openAppDeployment() {
    const { AppState } = this.props;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const type = AppState.currentMenuType.type;
    const { EditReleaseStore } = this.props;
    EditReleaseStore.setSelectData([]);
    this.props.history.push(
      `/devops/app-release?type=${type}&id=${projectId}&name=${projectName}&organizationId=${AppState.currentMenuType.organizationId}`,
    );
  }

  /**
   * 取消返回到第一步
   */
  clearAll = () => {
    const { AppState, EditReleaseStore } = this.props;
    EditReleaseStore.setVersions([]);
    EditReleaseStore.setValue(null);
    EditReleaseStore.setCurrentInstance([]);
    this.setState({
      appId: undefined,
      app: null,
      mode: 'organization',
      current: 1,
    });
  }
  /**
   * 取消第一步
   */
  clearStepOne = () => {
    const { AppState } = this.props;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const type = AppState.currentMenuType.type;
    this.props.history.push(
      `/devops/app-release?type=${type}&id=${projectId}&name=${projectName}&organizationId=${AppState.currentMenuType.organizationId}`,
    );
  }
  handleSubmit =(e) => {
    e.preventDefault();
    const { EditReleaseStore } = this.props;
    const selectData = EditReleaseStore.getSelectData;
    const { projectId, id, img, category, appId, contributor, description, mode } = this.state;
    const postData = {
      appId,
      appVersions: EditReleaseStore.selectData.slice(),
      category,
      contributor,
      description,
      publishLevel: mode,
    };
    postData.imgUrl = img;
    postData.appVersions = selectData;
    if (!id) {
      this.setState({ submitting: true });
      EditReleaseStore.addData(projectId, postData)
        .then((datass) => {
          this.setState({ submitting: false });
          if (datass) {
            this.openAppDeployment();
          }
        }).catch((err) => {
          this.setState({ submitting: false });
          Choerodon.prompt(err.response.data.message);
        });
    }
  }

  /**
   * 图标的上传button显示
   */
  showBth =() => {
    this.setState({ showBtn: true });
  };
  /**
   * 图标的上传button隐藏
   */
  hideBth =() => {
    this.setState({ showBtn: false });
  };
  /**
   * 触发上传按钮
   */
  triggerFileBtn =() => {
    this.setState({ isClick: true, showBtn: true });
    const ele = document.getElementById('file');
    ele.click();
  };
  /**
   * 选择文件
   * @param e
   */
  selectFile =(e) => {
    const menu = this.props.AppState.currentMenuType;
    const { EditReleaseStore } = this.props;
    const formdata = new FormData();
    const img = e.target.files[0];
    formdata.append('file', e.target.files[0]);
    EditReleaseStore.uploadFile(menu.organizationId, 'devops-service', img.name.split('.')[0], formdata)
      .then((data) => {
        if (data) {
          this.setState({ img: data });
          this.getBase64(formdata.get('file'), (imgUrl) => {
            const ele = document.getElementById('img');
            ele.style.backgroundImage = `url(${imgUrl})`;
          });
        }
      });
    this.setState({ isClick: false, showBtn: false });
  };
  /**
   * 选择要发布的应用
   * @param record
   */
  hanldeSelectApp =(record) => {
    const { EditReleaseStore } = this.props;
    if (this.state.appId && this.state.appId === record.id) {
      EditReleaseStore.setApp(null);
      this.setState({ appId: '' });
    } else {
      EditReleaseStore.setApp(record);
      this.setState({ appId: record.id });
    }
  }
  /**
   * 渲染第一步
   */
  handleRenderApp =() => {
    const { EditReleaseStore } = this.props;
    const apps = EditReleaseStore.apps;
    const app = EditReleaseStore.app;
    const column = [{
      key: 'check',
      width: '50px',
      render: record => (
        app && record.id === app.id && <span className="icon-check icon-select" />
      ),

    }, {
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }];
    return (
      <div className="deployApp-app">
        <p>
          您可以在此选择需要发布的应用。
        </p>
        <section className="deployAddApp-section">
          <div>
            <Table
              className="c7n-table-512"
              onRow={(record) => {
                const { isClick } = this.state;
                return {
                  onClick: this.hanldeSelectApp.bind(this, record),
                };
              }}
              pagination={EditReleaseStore.pageInfo}
              columns={column}
              dataSource={apps}
              rowKey={record => record.id}
              onChange={this.tableChange}
            />
          </div>
        </section>
        <section className="deployAddApp-section">
          <Button type="primary" funcType="raised" disabled={!(this.state.appId)} onClick={this.state.appId ? this.changeStep.bind(this, 2) : () => {}}>下一步</Button>
          <Button funcType="raised" onClick={this.clearStepOne}>取消</Button>
        </section>
      </div>
    );
  }
  /**
   * 渲染第二步
   */
  handleRenderEnv = () => {
    const { EditReleaseStore } = this.props;
    const data = EditReleaseStore.selectData;
    const columns = [{
      title: '版本',
      dataIndex: 'version',
    }, {
      title: '生成时间',
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }, {
      width: '40px',
      key: 'action',
      className: 'c7n-network-text_top',
      render: record => (
        <div>
          <Tooltip trigger="hover" placement="bottom" content={<div>删除</div>}>
            <Button shape="circle" funcType="flat" onClick={this.removeVersion.bind(this, record.id)}>
              <span className="icon-delete_forever" />
            </Button>
          </Tooltip>
        </div>
      ),
    }];
    return (
      <div className="deployApp-env">
        <p>
          您可以在此点击添加版本选择添加需要发布的版本。
        </p>
        <section className="deployAddApp-section">
          <Button style={{ color: 'rgb(63, 81, 181)' }} funcType="raised" onClick={this.handleAddVersion}><span className="icon-add" />添加版本</Button>
        </section>
        <section className="deployAddApp-section">
          <div style={{ width: 512 }}>
            <Table
              columns={columns}
              dataSource={data.slice() || []}
              pagination={data.pageInfo}
              rowKey={record => record.id}
            />
          </div>
        </section>
        <section className="deployAddApp-section">
          <Button type="primary" funcType="raised" onClick={data.length > 0 ? this.changeStep.bind(this, 3) : ''} disabled={!(data.length)}>下一步</Button>
          <Button onClick={this.changeStep.bind(this, 1)} funcType="raised">上一步</Button>
        </section>
      </div>
    );
  };
  /**
   * 渲染第三步
   * @returns {*}
   */
  handleRenderMode = () => {
    const { AppState, EditReleaseStore } = this.props;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div className="deployApp-deploy">
        <p>
          请在此选择应用发布的范围。若本组织内所有项目均可使用，则选择本组织；若全平台下的所有项目均可使用，则选择全平台。
        </p>
        <section className="deployAddApp-section">
          <div className="section-text-margin">
            <RadioGroup onChange={this.handleChangeMode} value={this.state.mode} label={<span className="deploy-text">选择发布层次</span>}>
              <Radio style={radioStyle} value={'organization'}>本组织</Radio>
              <Radio style={radioStyle} value={'public'}>全平台
                <span className="icon-error section-instance-icon" />
                <span className="deploy-tip-text">请注意：发布后不可修改发布范围。</span>
              </Radio>
            </RadioGroup>
          </div>
        </section>
        <section className="deployAddApp-section">
          <Button type="primary" funcType="raised" onClick={this.changeStep.bind(this, 4)}>下一步</Button>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 2)}>上一步</Button>
        </section>
      </div>
    );
  }
  /**
   * 渲染第四步
   * @returns {*}
   */
  handleRenderDescription = () => {
    const { getFieldDecorator } = this.props.form;
    const { description, category, contributor } = this.state;
    return (
      <div className="deployApp-deploy">
        <p>
          您可以在此上传应用图标，填写贡献者、分类及应用描述，维护应用展示信息。
        </p>
        <section className="deployAddApp-section">
          <div className="c7n-appRelease-img-wrap">
            <div className="c7n-appRelease-img">
              <div
                style={{ backgroundImage: this.state.img ? `url(${this.state.img})` : '' }}
                className="c7n-appRelease-img-hover"
                id="img"
                onMouseLeave={this.state.isClick ? () => {} : this.hideBth}
                onMouseEnter={this.showBth}
                onClick={this.triggerFileBtn}
                role="none"
              >
                {this.state.showBtn && <div className="c7n-appRelease-img-child">
                  <span className="icon-photo_camera" />
                  <Input id="file" type="file" onChange={this.selectFile} style={{ display: 'none' }} />
                </div>
                }
              </div>
              <span className="c7n-appRelease-img-title">应用图标</span>
            </div>
          </div>
        </section>
        <section className="deployAddApp-section">
          <Input
            value={contributor}
            onChange={(value) => { this.setState({ contributor: value.target.value }); }}
            style={{ width: 512 }}
            maxLength={30}
            label={Choerodon.getMessage('贡献者', 'contributor')}
            size="default"
            // placeholder={Choerodon.getMessage('域名路径', 'domain path')}
          />
        </section>
        <section className="deployAddApp-section">
          <Input
            value={category}
            style={{ width: 512 }}
            onChange={(value) => { this.setState({ category: value.target.value }); }}
            maxLength={10}
            label={Choerodon.getMessage('分类', 'category')}
            size="default"
            // placeholder={Choerodon.getMessage('域名路径', 'domain path')}
          />
        </section>
        <section className="deployAddApp-section">
          <TextArea
            value={description}
            onChange={(value) => { this.setState({ description: value.target.value }); }}
            style={{ width: 512 }}
            maxLength={50}
            label={Choerodon.languageChange('template.description')}
            autosize={{ minRows: 2, maxRows: 6 }}
          />
          <p>
            <span className="icon-error release-icon-error" />
            <span className="deploy-tip-text">请注意：平台将会提取发布的应用版本中Readme文件展示在应用市场的应用详情页，请先维护好对应的Readme文件后再发布。</span>
          </p>
        </section>
        <section className="deployAddApp-section">
          <Button type="primary" funcType="raised" disabled={!(category && contributor && description)} onClick={this.changeStep.bind(this, 5)}>下一步</Button>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 3)}>上一步</Button>
        </section>
      </div>
    );
  }

  /**
   * 渲染第五步
   * @returns {*}
   */
  handleRenderReview = () => {
    const { EditReleaseStore } = this.props;
    const data = EditReleaseStore.value;
    return (
      <section className="deployApp-review">
        <p>您可以在此确认应用发布的信息，如需修改请返回相应步骤。</p>
        <section>
          <div>
            <div className="deployApp-title">应用名称：</div>
            <div className="deployApp-text">{EditReleaseStore.app && EditReleaseStore.app.name}</div>
          </div>
          <div>
            <div className="deployApp-title">应用版本：</div>
            <div className="deployApp-text">
              {EditReleaseStore.selectData.length && EditReleaseStore.selectData.map(v => (
                <div>{v.version}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="deployApp-title">贡献者：</div>
            <div className="deployApp-text">{this.state.contributor}</div>
          </div>
          <div>
            <div className="deployApp-title">分类：</div>
            <div className="deployApp-text">{this.state.category}</div>
          </div>
          <div>
            <div className="deployApp-title">描述：</div>
            <div className="deployApp-text">{this.state.description}</div>
          </div>
          <div>
            <div className="deployApp-title">发布范围：</div>
            <div className="deployApp-text">{this.state.mode === 'organization' ? '本组织' : '全平台'}</div>
          </div>
        </section>
        <section>
          <span className="icon-error release-icon-error" /><span>请注意：该版本发布后不可取消发布，且不可修改发布范围。</span>
        </section>
        <section className="deployAddApp-section">
          <Permission service={['devops-service.application-market.create']}>
            <Button type="primary" loading={this.state.submitting} funcType="raised" onClick={this.handleSubmit}>发布</Button>
          </Permission>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 4)}>上一步</Button>
        </section>
      </section>
    );
  }

  handleAddVersion = () => {
    const { AppState, EditReleaseStore } = this.props;
    EditReleaseStore.changeShow(true);
  };
  removeVersion = (id) => {
    const { AppState, EditReleaseStore } = this.props;
    const data = _.cloneDeep(EditReleaseStore.selectData.slice());
    _.remove(data, app => app.id === id);
    window.console.log(data);
    EditReleaseStore.setSelectData(data);
  };

  render() {
    const { AppState, EditReleaseStore } = this.props;
    const data = EditReleaseStore.selectData;
    const projectName = AppState.currentMenuType.name;
    const { id, type } = AppState.currentMenuType;
    const { appId, mode, current, category, description, contributor } = this.state;
    return (
      <div className="c7n-region page-container">
        <PageHeader title={'应用发布'} backPath={`/devops/app-release?type=${type}&id=${id}&name=${projectName}&organizationId=${AppState.currentMenuType.organizationId}`} />
        <div className="page-content c7n-deployApp-wrapper" style={{ paddingBottom: '16px' }}>
          <h2 className="c7n-space-first">在项目&quot;{projectName}&quot;中进行应用发布</h2>
          <p>
            您可以在此按指引分步骤完成应用发布。
            <a href="http://choerodon.io/zh/docs/user-guide/deploy/application-deployment/" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon-open_in_new" />
            </a>
          </p>
          <div className="deployApp-card">
            <Steps current={this.state.current}>
              <Step
                title={<span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>选择应用</span>}
                onClick={this.changeStep.bind(this, 1)}
                status={this.getStatus(1)}
              />
              <Step
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>选择发布版本</span>}
                onClick={appId ? this.changeStep.bind(this, 2) : ''}
                status={this.getStatus(2)}
              />
              <Step
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>选择发布范围</span>}
                onClick={data.length ? this.changeStep.bind(this, 3) : ''}
                status={this.getStatus(3)}
              />
              <Step
                title={<span style={{ color: current === 4 ? '#3F51B5' : '', fontSize: 14 }}>填写应用信息</span>}
                onClick={this.changeStep.bind(this, 4)}
                status={this.getStatus(4)}
              />
              <Step
                title={<span style={{ color: current === 5 ? '#3F51B5' : '', fontSize: 14 }}>确认信息</span>}
                onClick={(category && description && contributor) && this.changeStep.bind(this, 5)}
                status={this.getStatus(5)}
              />
            </Steps>
            <div className="deployApp-card-content">
              { this.state.current === 1 && this.handleRenderApp()}

              { this.state.current === 2 && this.handleRenderEnv()}

              { this.state.current === 3 && this.handleRenderMode() }
              { this.state.current === 4 && this.handleRenderDescription() }

              { this.state.current === 5 && this.handleRenderReview() }
            </div>
          </div>
          {EditReleaseStore.show && <VersionTable
            show={EditReleaseStore.show}
            appName={this.state.appName}
            appId={this.state.appId}
            store={EditReleaseStore}
          />}
        </div>
      </div>
    );
  }
}

export default Form.create({})(withRouter(AddAppRelease));
