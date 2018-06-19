import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Select, Input, Tooltip, Modal, Progress, Popover, Icon } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import classnames from 'classnames';
import _ from 'lodash';
import '../../../main.scss';
import '../createNetwork/NetworkCreate.scss';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 26 },
  },
};
const { AppState } = stores;
const { Option, OptGroup } = Select;

@observer
class EditService extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      projectId: menu.id,
      versionsArr: [],
      show: false,
      IsDisabled: false,
      selectVersionArr: [],
      env: { loading: false, id: '', dataSource: [] },
      app: { loading: false, id: '', dataSource: [] },
      versions: [],
      0: { versions: [], instances: [], deletedIns: [] },
      instanceLoading: false,
      initVersionlength: 0, // 版本默认值
      deletedInstance: [],
    };
  }
  componentDidMount() {
    this.loadData(this.props.id);
  }

  /**
   * 初始化数据
   * @param id
   */
  loadData =(id) => {
    const { store } = this.props;
    const { projectId } = this.state;
    store.loadDataById(projectId, id)
      .then((data) => {
        store.loadApp(this.state.projectId, data.envId);
        store.loadVersion(projectId, data.envId, data.appId);
        this.setState({
          env: {
            loading: false,
            id: data.envId,
            dataSource: [{ id: data.envId, name: data.envName }] },
          app: {
            loading: false,
            id: data.appId,
            dataSource: [{ id: data.appId, name: data.appName, projectId: data.appProjectId }],
          },
        });
        const length = data.appVersion.length;
        let deletedInstance = this.state.deletedInstance;
        for (let j = 0; j < length; j += 1) {
          const instances = _.filter(data.appVersion[j].appInstance, v => v.intanceStatus === 'running');
          const deletedIns = _.filter(data.appVersion[j].appInstance, v => v.intanceStatus !== 'running');
          deletedInstance = deletedInstance.concat(deletedIns);
          this.setState({
            [j]: { versions: [data.appVersion[j]], instances, deletedIns }, deletedInstance });
        }
        this.initVersionsArr(data.appVersion.slice().length);
        this.setState({ SingleData: data, initVersionlength: length });
      });
    //
  };
  /**
   * 初始化版本数组
   * @param length 应用版本长度
   */
  initVersionsArr = (length) => {
    const versionsArr = [];
    for (let i = 0; i < length; i += 1) {
      versionsArr.push({
        versionIndex: i,
        instanceIndex: i,
      });
    }
    this.setState({ versionsArr });
  };

  /**
   * 加载应用数据
   */
  loadApp = () => {
    const { store } = this.props;
    this.setState({ app: { loading: true, id: '', dataSource: [] } });
    const envId = this.props.form.getFieldValue('envId');
    store.loadApp(this.state.projectId, envId)
      .then((data) => {
        this.setState({ app: { loading: false, id: '', dataSource: data } });
      });
  };
  /**
   * 加载版本数据
   */
  loadVersion = (index) => {
    const { store } = this.props;
    const versions = store.getVersions;
    const { instances, deletedIns } = this.state[index];
    if (index === 0) {
      this.setState({ 0: { versions, instances, deletedIns } });
    } else {
      const dataSource = _.cloneDeep(versions);
      for (let j = 0; j < index; j += 1) {
        const id = parseInt(this.props.form.getFieldValue(`version-${j}`), 10);
        _.remove(dataSource, v => v.id === id);
        this.setState({ [index]: { versions: dataSource, instances, deletedIns } });
      }
    }
  };
  /**
   * 加载实例数据
   */
  loadInstance = (index) => {
    const { store } = this.props;
    const versionId = this.props.form.getFieldValue(`version-${index}`);
    const envId = this.props.form.getFieldValue('envId');
    const appId = this.props.form.getFieldValue('appId');
    const { versions, deletedIns } = this.state[index];
    this.setState({ instanceLoading: true });
    store.loadInstance(this.state.projectId, envId, appId, versionId)
      .then((data) => {
        this.setState({ [index]: { versions, instances: data, deletedIns } });
        this.setState({ instanceLoading: false });
      });
  };

  handleSubmit =(e) => {
    e.preventDefault();
    const { store, id } = this.props;
    const { projectId } = this.state;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        let appInstance = [];
        const keys = Object.keys(data);
        keys.map((k) => {
          if (k.includes('instance')) {
            // const index = parseInt(k.split('-')[1], 10);
            appInstance = appInstance.concat(data[k]);
            // appVersion.push({ appVersionId: data[k], appInstance: data[`instance-${index}`] });
          }
          return appInstance;
        });
        const {
          envId,
          appId,
          externalIp,
          name,
          port,
          targetPort,
        } = data;
        const postData = { envId, appId, externalIp, port, name, appInstance, targetPort };
        this.setState({ submitting: true });
        store.updateData(projectId, id, postData)
          .then((datasss) => {
            if (datasss) {
              this.handleClose();
            }
            this.setState({ submitting: false });
          }).catch((errs) => {
            this.setState({ submitting: false });
            Choerodon.prompt(errs.response.data.message);
          });
      }
    });
  };
  /**
   * 选择应用
   * @param value
   * @param options
   */
  selectApp = (value, options) => {
    const { store } = this.props;
    const envId = this.props.form.getFieldValue('envId');
    store.loadVersion(this.state.projectId, envId, value);
    this.setState({
      versionsArr: [
        { versionIndex: 0, instanceIndex: 0 }],
      0: { versions: [], instances: [], deletedIns: [] },
    });
    this.props.form.setFieldsValue({ 'version-0': undefined, 'instance-0': undefined });
  };

  /**
   * 添加版本
   */
  addVersion =() => {
    const versionsArr = this.state.versionsArr;
    let index;
    if (versionsArr.length) {
      index = versionsArr[versionsArr.length - 1].versionIndex + 1;
      versionsArr.push(
        { versionIndex: versionsArr[versionsArr.length - 1].versionIndex + 1,
          instanceIndex: versionsArr[versionsArr.length - 1].versionIndex + 1 });
    } else {
      versionsArr.push(
        { versionIndex: 0,
          instanceIndex: 0 });
      index = 0;
    }
    this.setState({ versionsArr, [index]: { versions: [], instances: [], deletedIns: [] } });
  };
  /**
   * 删除版本
   * @param index 版本数组的索引
   */
  removeVersion =(index) => {
    const versionsArr = this.state.versionsArr;
    _.remove(versionsArr, v => v.versionIndex === index);
    this.setState({ versionsArr, initVersionlength: this.state.initVersionlength - 1 });
  };
  /**
   * 关闭弹框
   */
  handleClose =() => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  /**
   * 检查名字的唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = _.debounce((rule, value, callback) => {
    const { store } = this.props;
    const { SingleData } = this.state;
    const envId = this.state.envId || SingleData.envId;
    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (!pattern.test(value)) {
      callback('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾');
    } else if (value !== SingleData.name) {
      store.checkDomainName(this.state.projectId, envId, value)
        .then(() => {
          callback();
        })
        .catch((error) => {
          if (error.response.message.status === 400) {
            callback('名称已存在');
          }
        });
    } else {
      callback();
    }
  }, 1000);
  /**
   * 校验IP
   * @param rule
   * @param value
   * @param callback
   */
  checkIP =(rule, value, callback) => {
    const p = /^(\d{0,3}\.\d{0,3}\.\d{0,3}\.\d{0,3})$/;
    if (value) {
      if (p.test(value)) {
        callback();
      } else {
        callback('请输入正确的ip类似 (0-255).(0-255).(0-255).(0-255)');
      }
    } else {
      callback();
    }
  };
  handleRenderInstance =(liNode, value) => {
    const { deletedInstance } = this.state;
    const deleIns = _.map(deletedInstance, 'id');
    return React.cloneElement(liNode, {
      className: classnames(liNode.props.className, {
        'instance-status-disable': deleIns.includes(value),
      }),
    });
  };
  /**
   * 校验实例是否可用
   * @param rule
   * @param value
   * @param callback
   */
  checkInstance = (rule, value, callback) => {
    const index = parseInt(rule.field.split('-')[1], 10);
    const deletedIns = _.map(this.state[index].deletedIns, 'id');
    value.map((v) => {
      if (deletedIns.includes(v)) {
        callback('请移除不可用的实例');
      } else {
        callback();
      }
      return deletedIns;
    });
  };

  /**
   * 验证端口号
   * @param rule
   * @param value
   * @param callback
   */
  checkPort = (rule, value, callback) => {
    const p = /^[1-9]\d*$/;
    if (value) {
      if (p.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 65535) {
        callback();
      } else {
        callback('该字段必须是数字且值在1-65535之间');
      }
    } else {
      callback();
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const menu = AppState.currentMenuType;
    const { store, form } = this.props;
    const { versionsArr, SingleData } = this.state;
    const version = store.getVersions;
    const app = this.state.app.dataSource;
    let hasPath = false;
    let addStatus = false;
    if (versionsArr.length) {
      const hasValue = form.getFieldValue(`version-${versionsArr[versionsArr.length - 1].versionIndex}`);
      if (hasValue) {
        hasPath = true;
      }
    }
    if ((hasPath && version.length > versionsArr.length) || versionsArr.length === 0) {
      addStatus = true;
    }
    let tooltipTitle = '请先选择一个版本';
    if (version.length <= 1 && this.state.versionId) {
      tooltipTitle = '该应用下没有可选版本';
    }
    return (
      <div className="c7n-region">
        <Sidebar
          title="修改网络"
          visible={this.props.visible}
          onOk={this.handleSubmit}
          onCancel={this.handleClose}
          loading={this.state.submitting}
          cancelText="取消"
          okText="确定"
        >
          <div className="c7n-region c7n-network-create">
            <h2 className="c7n-space-first">对网络&quot;{SingleData && SingleData.name}&quot;进行修改</h2>
            <p>
              您可在此修改网络配置信息。
              <a href="http://v0-6.choerodon.io/zh/docs/user-guide/deployment-pipeline/service/" className="c7n-external-link" rel="nofollow me noopener noreferrer" target="_blank">
                <span className="c7n-external-link-content">
                    了解详情
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            <Form layout="vertical">
              <FormItem
                className="c7n-create-network-formitem"
                {...formItemLayout}
              >
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                  }, {
                    validator: this.checkName,
                  }],
                  initialValue: SingleData ? SingleData.name : '',
                })(
                  <Input label="网络名称" maxLength={25} readOnly />,
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
              >
                {getFieldDecorator('envId', {
                  rules: [{
                    required: true,
                    message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                    // transform: value => value.toString(),
                  }],
                  initialValue: SingleData ? SingleData.envId : undefined,
                })(
                  <Select
                    dropdownClassName="c7n-network-env"
                    disabled
                    filter
                    className="c7n-create-network-formitem"
                    showSearch
                    label="环境名称"
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children[1]
                      .toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    <Option
                      value={SingleData ? SingleData.envId : Math.random()}
                    >{SingleData ? SingleData.envName : ''}</Option>
                  </Select>,
                )}
              </FormItem>
              <FormItem
                className="c7n-create-network-formitem"
                {...formItemLayout}
              >
                {getFieldDecorator('appId', {
                  rules: [{
                    required: true,
                    message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                    // transform: value => value.toString(),
                  }],
                  initialValue: SingleData ? SingleData.appId : undefined,
                })(
                  <Select
                    onSelect={this.selectApp}
                    filter
                    showSearch
                    notFoundContent="该环境下没有应用部署"
                    label="应用名称"
                    optionFilterProp="children"
                    onFocus={this.loadApp}
                    filterOption={(input, option) =>
                      option.props.children.props.children[1].props.children
                        .toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    <OptGroup label="本项目" key={'project'}>
                      {app && _.filter(app, a => a.projectId === (parseInt(menu.id, 10))).map(v => (
                        <Option value={v.id} key={v.code}>
                          <Popover
                            placement="right"
                            content={<div>
                              <p>
                                <span>名称：</span>
                                <span>{v.name}</span>
                              </p>
                              <p>
                                <span>编码：</span>
                                <span>{v.code}</span>
                              </p>
                            </div>}
                          >
                            <span className="icon icon-project" />
                            <span style={{ display: 'inline-block', paddingLeft: 8 }}>{v.name}</span>
                          </Popover>
                        </Option>
                      ))}
                    </OptGroup>
                    <OptGroup label="应用市场" key={'market'}>
                      {app && _.filter(app, a => a.projectId !== (parseInt(menu.id, 10))).map(v => (
                        <Option value={v.id} key={v.code}>
                          <Popover
                            placement="right"
                            content={<div>
                              <p>
                                <span>名称：</span>
                                <span>{v.name}</span>
                              </p>
                              <p>
                                <span>贡献者：</span>
                                <span>{v.contributor}</span>
                              </p>
                              <p>
                                <span>描述：</span>
                                <span>{v.description}</span>
                              </p>
                            </div>}
                          >
                            <span className="icon icon-apps" />
                            <span style={{ display: 'inline-block', paddingLeft: 8 }}>{v.name}</span>
                          </Popover>
                        </Option>
                      ))}
                    </OptGroup>
                  </Select>,
                )}
              </FormItem>

              {versionsArr.map((data, index) => (<div style={{ position: 'relative' }}>
                <FormItem
                  className="c7n-create-network-formitem-network"
                  {...formItemLayout}
                >
                  {getFieldDecorator(`version-${data.versionIndex}`, {
                    rules: [{
                      required: true,
                      message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                      // transform: value => value.toString(),
                    }],
                    initialValue: SingleData && this.state.initVersionlength > index
                      ? SingleData.appVersion[data.versionIndex].id : undefined,
                  })(
                    <Select
                      disabled={!(this.props.form.getFieldValue('appId'))}
                      filter
                      notFoundContent="该应用下没有版本生成"
                      label={Choerodon.getMessage('版本', 'version')}
                      showSearch
                      onSelect={this.selectVersion}
                      dropdownMatchSelectWidth
                      onFocus={this.loadVersion.bind(this, data.versionIndex)}
                      size="default"
                      optionFilterProp="children"
                      optionLabelProp="children"
                      filterOption={
                        (input, option) =>
                          option.props.children.props.children.props.children
                            .toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {this.state[data.versionIndex].versions.map(datas => (<Option
                        value={datas.id}
                      >
                        <Tooltip
                          placement="right"
                          trigger="hover"
                          title={<p>{datas.version}</p>}
                        >
                          {datas.version}
                        </Tooltip>
                      </Option>))
                      }
                    </Select>,
                  )}
                </FormItem>
                <FormItem
                  className="c7n-create-network-test"
                  {...formItemLayout}
                >
                  {getFieldDecorator(`instance-${index}`, {
                    rules: [{
                      required: true,
                      message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                      // transform: value => value.toString(),
                    }, {
                      validator: this.checkInstance,
                    }],
                    initialValue: SingleData && this.state.initVersionlength > index ? _.map(SingleData.appVersion[data.versionIndex].appInstance, 'id') : undefined,
                  })(
                    <Select
                      key={data.instanceIndex}
                      disabled={!(this.props.form.getFieldValue(`version-${data.versionIndex}`))}
                      onFocus={this.loadInstance.bind(this, data.instanceIndex)}
                      filter
                      loading={this.state.instanceLoading}
                      label={Choerodon.getMessage('实例', 'instance')}
                      showSearch
                      notFoundContent="该版本下还没有实例"
                      mode="tags"
                      dropdownMatchSelectWidth
                      size="default"
                      optionFilterProp="children"
                      optionLabelProp="children"
                      choiceRender={this.handleRenderInstance}
                      filterOption={
                        (input, option) =>
                          option.props.children.props.children.props.children
                            .toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {this.state[data.instanceIndex].deletedIns.map(opt => (
                        <Option value={opt.id} key={`${data.versionIndex}-${opt.id}`}>
                          <Tooltip title={Choerodon.languageChange(opt.intanceStatus || 'null')} placement="right">
                            <div style={{ display: 'inline-block', width: '98%' }}>
                              {opt.code}
                            </div>
                          </Tooltip>

                        </Option>
                      ))}
                      {this.state[data.instanceIndex].instances.map(instancess => (
                        <Option value={instancess.id} key={`${data.versionIndex}-${instancess.id}`}>
                          <Tooltip title={'运行中'} placement="right">
                            <div style={{ display: 'inline-block', width: '98%' }}>
                              {instancess.code}
                            </div>
                          </Tooltip>
                        </Option>
                      ))}
                    </Select>,
                  )}
                </FormItem>
                { versionsArr.length > 1 ? <Button
                  shape="circle"
                  className="c7n-domain-icon-delete"
                  onClick={this.removeVersion.bind(this, index)}
                >
                  <span className="icon icon-delete" />
                </Button> : <span className="icon icon-delete c7n-app-icon-disabled" />}
              </div>))}
              <div className="c7n-domain-btn-wrapper">
                {addStatus ? <Button className="c7n-domain-btn" onClick={this.addVersion} type="primary" icon="add">添加版本</Button>
                  : <Tooltip title={tooltipTitle}><Button className="c7n-domain-btn c7n-domain-icon-delete-disabled" icon="add">添加版本</Button></Tooltip>}
              </div>
              <FormItem
                className="c7n-create-network-formitem"
                {...formItemLayout}
              >
                {getFieldDecorator('externalIp', {
                  rules: [{
                    validator: this.checkIP,
                  }],
                  initialValue: SingleData ? SingleData.externalIp : '',
                })(
                  <Input maxLength={15} label="外部IP" />,
                )}
              </FormItem>
              <FormItem
                className="c7n-create-network-formitem"
                {...formItemLayout}
              >
                {getFieldDecorator('port', {
                  rules: [{
                    required: true,
                    message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                    transform: value => value.toString(),
                  }, {
                    validator: this.checkPort,
                  }],
                  initialValue: SingleData ? SingleData.port : '',
                })(
                  <Input maxLength={5} label="端口号" />,
                )}
              </FormItem>
              <FormItem
                className="c7n-create-network-formitem"
                {...formItemLayout}
              >
                {getFieldDecorator('targetPort', {
                  rules: [{
                    required: true,
                    message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                    transform: value => value.toString(),
                  }, {
                    validator: this.checkPort,
                  }],
                  initialValue: SingleData ? SingleData.targetPort : '',
                })(
                  <Input
                    maxLength={5}
                    label="目标端口"
                    suffix={<Popover
                      overlayStyle={{ maxWidth: '180px', wordBreak: 'break-all' }}
                      className="routePop"
                      placement="right"
                      trigger="hover"
                      content={'网络选择的目标实例所暴露的端口号'}
                    >
                      <Icon type="help" />
                    </Popover>
                    }
                  />,
                )}
              </FormItem>
            </Form>

          </div>
        </Sidebar>
      </div>
    );
  }
}

export default Form.create({})(withRouter(EditService));
