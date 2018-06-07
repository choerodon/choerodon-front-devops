import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Select, Input, Tooltip, Modal } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import _ from 'lodash';
import '../../../main.scss';
import './NetworkCreate.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const Option = Select.Option;
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

@observer
class NetworkCreate extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      projectId: menu.id,
      versionsArr: [{ versionIndex: 0, instanceIndex: 0 }],
      show: false,
      selectVersionArr: [],
    };
  }
  componentDidMount() {
    const { store, visible } = this.props;
    if (visible) {
      store.loadEnv(this.state.projectId);
    }
  }

  /**
   * 获取实例的options
   */
  getInstanceOptions =(versionId) => {
    const { store } = this.props;
    const instance = store.getInstance;
    let instanceOptions = null;
    let index;
    if (instance.length && versionId) {
      index = _.findIndex(instance, ins => ins.id === versionId);
      if (index !== -1) {
        instanceOptions = instance[index].options.map(options => (
          <Option key={options.id} value={options.id} title={options.code}>
            <Tooltip title="正常">
              <span className="icon-check_circle status-success-instance status-instance" />
            </Tooltip>
            {options.code}
          </Option>
        ));
      }
    }
    return instanceOptions;
  };


  handleSubmit =(e) => {
    e.preventDefault();
    const { store, type, id } = this.props;
    const { projectId } = this.state;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const keys = Object.keys(data);
        let appInstance = [];
        keys.map((k) => {
          if (k.includes('instance')) {
            const index = parseInt(k.split('-')[1], 10);
            appInstance = appInstance.concat(data[k]);
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
        store.addData(projectId, postData)
          .then((res) => {
            if (res) {
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
   * 生成随机字符串ƒ
   * @param len 字符串长度
   * @returns 生成的字符串
   */
  randomString =(len) => {
    const lens = len || 32;
    const $chars = 'abcdefghijklmnopqrstuvwxyz012345678';
    const maxPos = $chars.length;
    let res = '';
    for (let i = 0; i < lens; i += 1) {
      res += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return res;
  };
  /**
   * 选择环境
   * @param value
   */
  selectEnv = (value) => {
    const { store } = this.props;
    store.loadApp(this.state.projectId, value);
    this.setState({ versionsArr: [{ versionIndex: 0, instanceIndex: 0 }],
      versionId: null,
      instanceId: null,
      appId: null,
      envId: value,
      selectVersionArr: [],
      networkValue: '',
    });
    this.props.form.resetFields();
  };
  /**
   * 选择应用
   * @param value
   * @param options
   */
  selectApp = (value, options) => {
    const { store } = this.props;
    store.loadVersion(this.state.projectId, this.state.envId, value);
    this.setState({ versionsArr: [{ versionIndex: 0, instanceIndex: 0 }],
      versionId: null,
      instanceId: null,
    });
    store.setInstance([]);
    const str = this.randomString(4);
    const networkValue = `${options.key}-${str}`;
    this.props.form.setFieldsValue({ 'version-0': undefined, 'instance-0': undefined });
    this.setState({
      networkValue,
      appId: value,
      selectVersionArr: [],
    });
  };

  /**
   * 选择版本
   * @param value
   */
  selectVersion = (value) => {
    const { store } = this.props;
    store.loadInstance(this.state.projectId, this.state.envId, this.state.appId, value);
    const selectVersionArr = this.state.selectVersionArr || [];
    if (selectVersionArr.includes(value)) {
      Choerodon.prompt('该版本已经选过，请更换应用版本');
    } else if (this.state.versionsArr.length === 1) {
      if (selectVersionArr.length === 1) {
        selectVersionArr.pop();
        selectVersionArr.push(value);
      } else {
        selectVersionArr.push(value);
      }
    } else {
      selectVersionArr.push(value);
    }
    this.setState({
      selectVersionArr,
      versionId: value,
    });
  };
  /**
   * 选中version的回调
   * @param value
   */
  handleSelecVersion =(value) => {
    const selectVersionArr = this.state.selectVersionArr || [];
    if (selectVersionArr.includes(value)) {
      Choerodon.prompt('该版本已经选过，请更换应用版本');
    } else {
      selectVersionArr.push(value);
    }
    this.setState({
      selectVersionArr,
    });
  };

  /**
   * 添加版本
   */
  addVersion =() => {
    const versionsArr = this.state.versionsArr;
    if (versionsArr.length) {
      versionsArr.push(
        { versionIndex: versionsArr[versionsArr.length - 1].versionIndex + 1,
          instanceIndex: versionsArr[versionsArr.length - 1].versionIndex + 1 });
    } else {
      versionsArr.push(
        { versionIndex: 0,
          instanceIndex: 0 });
    }
    this.setState({ versionsArr });
  };
  /**
   * 删除版本
   * @param index 版本数组的索引
   */
  removeVersion =(index) => {
    const versionsArr = this.state.versionsArr;
    versionsArr.splice(index, 1);
    this.setState({ versionsArr });
  };
  /**
   * 关闭弹框
   */
  handleClose =() => {
    this.setState({ show: false });
    const { store } = this.props;
    store.setInstance([]);
    store.setApp([]);
    store.setVersions([]);
    store.setEnv([]);
    this.props.form.resetFields();
    this.props.onClose();
  };

  /**
   * 检查名字的唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = (rule, value, callback) => {
    const { store } = this.props;
    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (!pattern.test(value)) {
      callback('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾');
    } else {
      store.checkDomainName(this.state.projectId, this.state.envId, value)
        .then((data) => {
          if (data) {
            callback();
          }
        })
        .catch((error) => {
          if (error.status === 400) {
            callback('名称已存在');
          }
        });
    }
  };
  checkIP =(rule, value, callback) => {
    const p = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const menu = AppState.currentMenuType;
    const { store, form } = this.props;
    const app = store.getApp;
    const env = store.getEnv;
    const version = store.getVersions;
    const instance = store.getInstance;
    let hasPath = false;
    let addStatus = false;
    let tooltipTitle = '请先选择一个版本';
    if (version.length <= 1 && this.state.versionId) {
      tooltipTitle = '该应用下没有可选版本';
    }
    const { selectVersionArr } = this.state;
    const { versionsArr } = this.state;
    if (versionsArr.length) {
      const hasValue = form.getFieldValue(`version-${versionsArr[versionsArr.length - 1].versionIndex}`);
      if (hasValue) {
        hasPath = true;
      }
    }
    if ((hasPath && version.length > versionsArr.length) || versionsArr.length === 0) {
      addStatus = true;
    }
    const formContent = (this.props.visible && <div className="c7n-region c7n-network-create">
      <h2 className="c7n-space-first">在项目&quot;{menu.name}&quot;中创建应用</h2>
      <p>
        请选择环境及实例，配置网络转发策略。目前支持内部和外部两种网络转发方式。
        转发内部网络，则只需定义端口即可，系统会自动为您分配集群内部IP；转发外部网络，则需要定义外部IP及端口。
        <a href="http://choerodon.io/zh/docs/user-guide/deploy/network-management/" className="c7n-external-link">
          <span className="c7n-external-link-content">
              了解详情
          </span>
          <span className="icon-open_in_new" />
        </a>
      </p>
      <Form layout="vertical">
        <FormItem
          className="c7n-create-network-formitem"
          {...formItemLayout}
        >
          {getFieldDecorator('envId', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              transform: value => value.toString(),
            }],
          })(
            <Select
              dropdownClassName="c7n-network-env"
              autoFocus
              filter
              showSearch
              className="c7n-create-network-formitem"
              label="环境名称"
              optionFilterProp="children"
              onSelect={this.selectEnv}
              filterOption={(input, option) => option.props.children[2]
                .toLowerCase().indexOf(input.toLowerCase()) >= 0
              }

            >
              {env.map(v => (
                <Option key={v.id} value={v.id} disabled={!v.connect}>
                  {!v.connect && <span className="env-status-error" />}
                  {v.connect && <span className="env-status-success" />}
                  {v.name}
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('appId', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              transform: value => value.toString(),
            }],
          })(
            <Select
              filter
              className="c7n-create-network-formitem"
              disabled={!this.state.envId}
              showSearch
              notFoundContent="该环境下没有应用部署"
              label="应用名称"
              optionFilterProp="children"
              onSelect={this.selectApp}
              filterOption={(input, option) =>
                option.props.children.props.children.props.children
                  .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {app.map(v => (
                <Option value={v.id} key={v.code}>
                  <Tooltip title={v.code} placement="right" trigger="hover">
                    <span style={{ display: 'inline-block', width: '100%' }}>{v.name}</span>
                  </Tooltip>
                </Option>
              ))}
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
                transform: value => value.toString(),
              }],
            })(
              <Select
                filter
                notFoundContent="该应用下没有版本生成"
                disabled={!this.state.appId}
                label={Choerodon.getMessage('版本', 'version')}
                showSearch
                onSelect={this.selectVersion}
                dropdownMatchSelectWidth
                size="default"
                optionFilterProp="children"
                optionLabelProp="children"
                filterOption={
                  (input, option) =>
                    option.props.children.props.children.props.children
                      .toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {version.map(datas => (<Option
                  value={datas.id}
                  key={datas.id}
                  disabled={this.state.selectVersionArr.includes(datas.id)}
                >
                  <Tooltip
                    placement="right"
                    trigger="hover"
                    title={<p>{datas.version}</p>}
                  >
                    <span style={{ display: 'inline-block', width: '100%' }}>{datas.version}</span>
                  </Tooltip>
                </Option>),
                )}
              </Select>,
            )}
          </FormItem>
          <FormItem
            className="c7n-create-network-test"
            {...formItemLayout}
          >
            {getFieldDecorator(`instance-${data.instanceIndex}`, {
              rules: [{
                required: true,
                message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                transform: value => value.toString(),
              }],
            })(
              <Select
                filter
                disabled={!this.state.versionId}
                label={Choerodon.getMessage('实例', 'instance')}
                showSearch
                notFoundContent="该版本下还没有实例"
                mode="tags"
                dropdownMatchSelectWidth
                size="default"
                optionFilterProp="children"
                optionLabelProp="children"
                filterOption={
                  (input, option) =>
                    option.props.children
                      .toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                { (instance.length && selectVersionArr.length
                && instance.length >= versionsArr.length
                && selectVersionArr.length >= instance.length)
                  ? _.filter(instance, ver => ver.id === selectVersionArr[index])[0]
                    .options.map(instancess => (
                      <Option
                        key={instancess.id}
                        value={instancess.id}
                      >
                        {instancess.code}
                      </Option>
                    )) : <Option key={Math.random().toString()} />}
              </Select>,
            )}
          </FormItem>
          { versionsArr.length > 1 ? <Button shape="circle" className="c7n-domain-icon-delete" onClick={this.removeVersion.bind(this, index)}>
            <span className="icon-delete" />
          </Button> : <span className="icon-delete c7n-app-icon-disabled" />}
        </div>))}
        <div className="c7n-domain-btn-wrapper">
          {addStatus ? <Button className="c7n-domain-btn" onClick={this.addVersion} type="primary" icon="add">添加版本</Button>
            : <Tooltip title={tooltipTitle}><Button className="c7n-domain-btn c7n-domain-icon-delete-disabled" icon="add">添加版本</Button></Tooltip>}
        </div>
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
            initialValue: this.state.networkValue,
          })(
            <Input disabled={!this.state.appId} label="网络名称" maxLength={25} />,
          )}
        </FormItem>
        <FormItem
          className="c7n-create-network-formitem"
          {...formItemLayout}
        >
          {getFieldDecorator('externalIp', {
            rules: [
              {
                validator: this.checkIP,
              },
            ],
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
            }, {
            }],
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
            }, {
            }],
          })(
            <Input maxLength={30} label="目标端口" />,
          )}
        </FormItem>
      </Form>
    </div>);
    return (
      <div className="c7n-region">
        <Sidebar
          cancelText="取消"
          okText="创建"
          title="创建网络"
          visible={this.props.visible}
          onOk={this.handleSubmit}
          onCancel={this.handleClose}
          confirmLoading={this.state.submitting}
        >
          { this.props.visible && formContent}
        </Sidebar>
      </div>
    );
  }
}

export default Form.create({})(withRouter(NetworkCreate));
