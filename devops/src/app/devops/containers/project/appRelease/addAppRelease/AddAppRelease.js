import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Radio, Steps, Table, Tooltip, Form, Input } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import '../../../main.scss';
import '../AppRelease.scss';
import VersionTable from '../versionTable';
import TimePopover from '../../../../components/timePopover';


const { TextArea } = Input;
const RadioGroup = Radio.Group;
const Step = Steps.Step;
const { AppState } = stores;

@observer
class AddAppRelease extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: props.match.params.appId || undefined,
      current: props.match.params.appId ? 2 : 1,
      projectId: AppState.currentMenuType.id,
      mode: 'organization',
    };
  }

  componentDidMount() {
    const { EditReleaseStore } = this.props;
    EditReleaseStore.loadApps({ projectId: this.state.projectId });
    EditReleaseStore.loadApp(this.state.projectId, this.state.appId);
    EditReleaseStore.setSelectData([]);
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
   * 取消第一步
   */
  clearStepOne = () => {
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const type = AppState.currentMenuType.type;
    this.props.history.push(
      `/devops/app-release/1?type=${type}&id=${projectId}&name=${projectName}&organizationId=${AppState.currentMenuType.organizationId}`,
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
            const projectName = AppState.currentMenuType.name;
            const type = AppState.currentMenuType.type;
            EditReleaseStore.setSelectData([]);
            this.props.history.push(
              `/devops/app-release/2?type=${type}&id=${projectId}&name=${projectName}&organizationId=${AppState.currentMenuType.organizationId}`,
            );
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
    const { EditReleaseStore } = this.props;
    const formdata = new FormData();
    const img = e.target.files[0];
    formdata.append('file', e.target.files[0]);
    EditReleaseStore.uploadFile('devops-service', img.name.split('.')[0], formdata)
      .then((data) => {
        if (data) {
          this.setState({ img: data });
          this.getBase64(formdata.get('file'), (imgUrl) => {
            const ele = document.getElementById('img');
            ele.style.backgroundImage = `url(${imgUrl})`;
            this.setState({ imgback: imgUrl });
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
    EditReleaseStore.setSelectData([]);
    if (this.state.appId && this.state.appId === record.id) {
      EditReleaseStore.setApp(null);
      this.setState({ appId: '' });
    } else {
      EditReleaseStore.setApp(record);
      this.setState({ appId: record.id });
    }
  }

  /**
   * table app表格搜索
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  appTableChange =(pagination, filters, sorter, paras) => {
    const { EditReleaseStore } = this.props;
    const menu = AppState.currentMenuType;
    const organizationId = menu.id;
    const sort = { field: 'id', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      if (sorter.order === 'ascend') {
        sort.order = 'asc';
      } else if (sorter.order === 'descend') {
        sort.order = 'desc';
      }
    }
    let searchParam = {};
    const page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    EditReleaseStore
      .loadApps({
        projectId: organizationId,
        sorter: sort,
        postData,
        page,
        size: pagination.pageSize,
      });
  };

  /**
   * 渲染第一步
   */
  handleRenderApp =() => {
    const { EditReleaseStore, intl } = this.props;
    const { formatMessage } = intl;
    const apps = EditReleaseStore.apps.slice();
    const app = EditReleaseStore.app;
    const column = [{
      key: 'check',
      width: '50px',
      render: record => (
        app && record.id === app.id && <i className="icon icon-check icon-select" />
      ),

    }, {
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      title: <FormattedMessage id="app.code" />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }];
    return (
      <div className="deployApp-app">
        <p>
          {formatMessage({ id: 'release.add.step.one.description' })}
        </p>
        <section className="deployAddApp-section">
          <div>
            <Table
              rowClassName="col-check"
              filterBarPlaceholder={formatMessage({ id: 'filter' })}
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
              onChange={this.appTableChange}
            />
          </div>
        </section>
        <section className="deployAddApp-section">
          <Button type="primary" funcType="raised" disabled={!(this.state.appId)} onClick={this.changeStep.bind(this, 2)}>{formatMessage({ id: 'next' })}</Button>
          <Button funcType="raised" style={{ color: 'rgb(63, 81, 181)' }} onClick={this.clearStepOne}>{formatMessage({ id: 'cancel' })}</Button>
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
      title: <FormattedMessage id="deploy.ver" />,
      dataIndex: 'version',
    }, {
      title: <FormattedMessage id="app.createTime" />,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    }, {
      width: 64,
      key: 'action',
      render: record => (
        <div>
          <Tooltip trigger="hover" placement="bottom" content={<div>{this.props.intl.formatMessage({ id: 'delete' })}</div>}>
            <Button shape="circle" funcType="flat" onClick={this.removeVersion.bind(this, record.id)}>
              <i className="icon icon-delete" />
            </Button>
          </Tooltip>
        </div>
      ),
    }];
    return (
      <div className="deployApp-env">
        <p>
          {this.props.intl.formatMessage({ id: 'release.add.step.two.description' })}
        </p>
        <section className="deployAddApp-section">
          <Permission service={['devops-service.application-version.pageByOptions']}>
            <Button style={{ color: 'rgb(63, 81, 181)' }} funcType="raised" onClick={this.handleAddVersion}><i className="icon icon-add" />{this.props.intl.formatMessage({ id: 'release.add.step.two.btn.add' })}</Button>
          </Permission>
        </section>
        <section className="deployAddApp-section">
          <Table
            columns={columns}
            dataSource={data.slice() || []}
            pagination={data.pageInfo}
            rowKey={record => record.id}
          />
        </section>
        <section className="deployAddApp-section">
          <Button type="primary" funcType="raised" onClick={this.changeStep.bind(this, 3)} disabled={!(data.length)}>{this.props.intl.formatMessage({ id: 'next' })}</Button>
          <Button onClick={this.changeStep.bind(this, 1)} style={{ color: 'rgb(63, 81, 181)' }} funcType="raised">{this.props.intl.formatMessage({ id: 'previous' })}</Button>
          <Button style={{ color: 'rgb(63, 81, 181)' }} funcType="raised" onClick={this.clearStepOne}>{this.props.intl.formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第三步
   * @returns {*}
   */
  handleRenderMode = () => {
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div className="deployApp-deploy">
        <p>
          {this.props.intl.formatMessage({ id: 'release.add.step.three.description' })}
        </p>
        <section className="deployAddApp-section">
          <div className="section-text-margin">
            <RadioGroup onChange={this.handleChangeMode} value={this.state.mode} label={<span className="deploy-text">{this.props.intl.formatMessage({ id: 'release.add.step.three.title' })}</span>}>
              <Radio style={radioStyle} value="organization">{this.props.intl.formatMessage({ id: 'organization' })}</Radio>
              <Radio style={radioStyle} value="public">{this.props.intl.formatMessage({ id: 'public' })}</Radio>
            </RadioGroup>
          </div>
          <p style={{ marginLeft: 30, marginTop: 24 }}>
            <i className="icon icon-error release-icon-error" />
            <span className="deploy-tip-text">{this.props.intl.formatMessage({ id: 'release.add.step.three.tooltip' })}</span>
          </p>
        </section>
        <section className="deployAddApp-section">
          <Button type="primary" funcType="raised" onClick={this.changeStep.bind(this, 4)}>{this.props.intl.formatMessage({ id: 'next' })}</Button>
          <Button funcType="raised" style={{ color: 'rgb(63, 81, 181)' }} onClick={this.changeStep.bind(this, 2)}>{this.props.intl.formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" style={{ color: 'rgb(63, 81, 181)' }} onClick={this.clearStepOne}>{this.props.intl.formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  }

  /**
   * 渲染第四步
   * @returns {*}
   */
  handleRenderDescription = () => {
    const { description, category, contributor } = this.state;
    return (
      <div className="deployApp-deploy">
        <p>
          {this.props.intl.formatMessage({ id: 'release.add.step.four.description' })}
        </p>
        <section className="deployAddApp-section">
          <div className="c7n-appRelease-img-wrap">
            <div className="c7n-appRelease-img">
              <div
                style={{ backgroundImage: this.state.imgback ? `url(${this.state.imgback})` : '' }}
                className="c7n-appRelease-img-hover"
                id="img"
                onMouseLeave={this.state.isClick ? () => {} : this.hideBth}
                onMouseEnter={this.showBth}
                onClick={this.triggerFileBtn}
                role="none"
              >
                {this.state.showBtn && <div className="c7n-appRelease-img-child">
                  <i className="icon icon-photo_camera" />
                  <Input id="file" type="file" onChange={this.selectFile} style={{ display: 'none' }} />
                </div>
                }
              </div>
              <span className="c7n-appRelease-img-title">{this.props.intl.formatMessage({ id: 'release.add.step.four.app.icon' })}</span>
            </div>
          </div>
        </section>
        <section className="deployAddApp-section">
          <Input
            value={contributor}
            onChange={(value) => { this.setState({ contributor: value.target.value }); }}
            style={{ width: 512 }}
            maxLength={30}
            label={<span className="apprelease-formItem-label"><FormattedMessage id="appstore.contributor" /></span>}
            size="default"
          />
        </section>
        <section className="deployAddApp-section">
          <Input
            value={category}
            style={{ width: 512 }}
            onChange={(value) => { this.setState({ category: value.target.value }); }}
            maxLength={10}
            label={<span className="apprelease-formItem-label"><FormattedMessage id="appstore.category" /></span>}
            size="default"
          />
        </section>
        <section className="deployAddApp-section deployAddApp-section-512">
          <TextArea
            value={description}
            onChange={(value) => { this.setState({ description: value.target.value }); }}
            style={{ width: 512 }}
            maxLength={100}
            label={<span className="apprelease-formItem-label"><FormattedMessage id="appstore.description.label" /></span>}
            autosize={{ minRows: 2, maxRows: 6 }}
          />
        </section>
        <section className="deployAddApp-section">
          <p>
            <i className="icon icon-error release-icon-error" />
            <span className="deploy-tip-text">{this.props.intl.formatMessage({ id: 'release.add.step.four.tooltip' })}</span>
          </p>
        </section>
        <section className="deployAddApp-section">
          <Button type="primary" funcType="raised" disabled={!(category && contributor && description)} onClick={this.changeStep.bind(this, 5)}>{this.props.intl.formatMessage({ id: 'next' })}</Button>
          <Button funcType="raised" style={{ color: 'rgb(63, 81, 181)' }} onClick={this.changeStep.bind(this, 3)}>{this.props.intl.formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" style={{ color: 'rgb(63, 81, 181)' }} onClick={this.clearStepOne}>{this.props.intl.formatMessage({ id: 'cancel' })}</Button>
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
    return (
      <section className="deployApp-review">
        <p>{this.props.intl.formatMessage({ id: 'release.add.step.five.description' })}</p>
        <section>
          <div>
            <div className="app-release-title">{this.props.intl.formatMessage({ id: 'network.form.app' })}：</div>
            <div className="deployApp-text">{EditReleaseStore.app && EditReleaseStore.app.name}</div>
          </div>
          <div>
            <div className="app-release-title">{this.props.intl.formatMessage({ id: 'deploy.step.one.version' })}：</div>
            <div className="deployApp-text">
              {EditReleaseStore.selectData.length && EditReleaseStore.selectData.map(v => (
                <div key={v.id}>{v.version}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="app-release-title">{this.props.intl.formatMessage({ id: 'appstore.contributor' })}：</div>
            <div className="deployApp-text">{this.state.contributor}</div>
          </div>
          <div>
            <div className="app-release-title">{this.props.intl.formatMessage({ id: 'appstore.category' })}：</div>
            <div className="deployApp-text">{this.state.category}</div>
          </div>
          <div>
            <div className="app-release-title">{this.props.intl.formatMessage({ id: 'appstore.description.label' })}：</div>
            <div className="deployApp-text">{this.state.description}</div>
          </div>
          <div>
            <div className="app-release-title">{this.props.intl.formatMessage({ id: 'release.column.level' })}：</div>
            <div className="deployApp-text">{this.state.mode === 'organization' ? this.props.intl.formatMessage({ id: 'organization' }) : this.props.intl.formatMessage({ id: 'public' })}</div>
          </div>
        </section>
        <section>
          <i className="icon icon-error release-icon-error" /><span>{this.props.intl.formatMessage({ id: 'release.add.step.five.tooltip' })}</span>
        </section>
        <section className="deployAddApp-section">
          <Permission service={['devops-service.application-market.create']}>
            <Button type="primary" loading={this.state.submitting} funcType="raised" onClick={this.handleSubmit}>{this.props.intl.formatMessage({ id: 'release.add.step.five.btn.confirm' })}</Button>
          </Permission>
          <Button funcType="raised" style={{ color: 'rgb(63, 81, 181)' }} onClick={this.changeStep.bind(this, 4)}>{this.props.intl.formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" style={{ color: 'rgb(63, 81, 181)' }} onClick={this.clearStepOne}>{this.props.intl.formatMessage({ id: 'cancel' })}</Button>
        </section>
      </section>
    );
  }

  handleAddVersion = () => {
    const { EditReleaseStore } = this.props;
    EditReleaseStore.changeShow(true);
  };

  removeVersion = (id) => {
    const { EditReleaseStore } = this.props;
    const data = _.cloneDeep(EditReleaseStore.selectData.slice());
    _.remove(data, app => app.id === id);
    EditReleaseStore.setSelectData(data);
  };

  render() {
    const { EditReleaseStore } = this.props;
    const data = EditReleaseStore.selectData;
    const projectName = AppState.currentMenuType.name;
    const { formatMessage } = this.props.intl;
    const { id, type } = AppState.currentMenuType;
    const { appId, mode, current, category, description, contributor } = this.state;
    return (
      <Page
        service={[
          'devops-service.application.listByActiveAndPubAndVersion',
          'devops-service.application.queryByAppId',
          'devops-service.application-market.create',
          'devops-service.application-version.pageByOptions',
        ]}
        className="c7n-region"
      >
        <Header title={<FormattedMessage id="release.home.header.title" />} backPath={`/devops/app-release/1?type=${type}&id=${id}&name=${projectName}&organizationId=${AppState.currentMenuType.organizationId}`} />
        <Content className="c7n-deployApp-wrapper" style={{ paddingBottom: '16px' }} code="release.add" values={{ name: projectName }}>
          <div className="deployApp-card">
            <Steps current={this.state.current}>
              <Step
                title={<span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'release.add.step.one.title' })}</span>}
                onClick={this.changeStep.bind(this, 1)}
                status={this.getStatus(1)}
              />
              <Step
                className={appId ? '' : 'step-disabled'}
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'release.add.step.two.title' })}</span>}
                onClick={this.changeStep.bind(this, 2)}
                status={this.getStatus(2)}
              />
              <Step
                className={data && data.length ? '' : 'step-disabled'}
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'release.add.step.three.title' })}</span>}
                onClick={this.changeStep.bind(this, 3)}
                status={this.getStatus(3)}
              />
              <Step
                className={data && data.length ? '' : 'step-disabled'}
                title={<span style={{ color: current === 4 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'release.add.step.four.title' })}</span>}
                onClick={this.changeStep.bind(this, 4)}
                status={this.getStatus(4)}
              />
              <Step
                className={(category && description && contributor) ? '' : 'step-disabled'}
                title={<span style={{ color: current === 5 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'release.add.step.five.title' })}</span>}
                onClick={this.changeStep.bind(this, 5)}
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
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(AddAppRelease)));
