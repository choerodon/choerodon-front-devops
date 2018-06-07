import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Form, Select, Input, Tooltip, Modal, Progress } from 'choerodon-ui';

import _ from 'lodash';
// import Sidebar from '../../../../components/Sidebar';
import '../../../main.scss';
import '../createNetwork/NetworkCreate.scss';

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
@inject('AppState')
@observer
class Editnetwok extends Component {
  constructor(props) {
    const menu = props.AppState.currentMenuType;
    super(props);
    this.state = {
      projectId: menu.id,
      versionsArr: [],
      show: false,
      IsDisabled: false,
      selectVersionArr: [],
    };
  }
  componentDidMount() {
    const { store } = this.props;
    const proId = this.state.projectId;
    this.loadData(this.props.id);
    // store.loadEnv(proId);
  }
  /**
   * 根据输入框的值判断实例的状态
   */
  getInstanceStatus =(index, versionId) => {
    const { store } = this.props;
    const instance = store.instance;
    const value = this.props.form.getFieldValue(`instance-${index}`);
    const options = _.filter(instance, v => v.id === versionId)[0].options;
    const status = [];
    if (value) {
      value.map((v) => {
        options.map((opt) => {
          if (v === opt.id && opt.intanceStatus && opt.intanceStatus !== 'running') {
            status.push(true);
          }
          return status;
        });
        return status;
      });
    }
    if (status.includes(true)) {
      return true;
    } else {
      return false;
    }
  };
  loadData =(id) => {
    const { store } = this.props;
    const { projectId } = this.state;
    store.loadDataById(projectId, id)
      .then((data) => {
        this.initVersionsArr(data.appVersion.slice().length);
        this.setState({ SingleData: data });
        // store.loadApp(projectId, data.envId);
        store.loadVersion(projectId, data.envId, data.appId);
        const selectVersionArr = _.map(data.appVersion, version => version.id);
        this.setState({ selectVersionArr });
      });
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
   * 加载环境数据
   */
  loadEnv =() => {
    const { store } = this.props;
    store.loadEnv(this.state.projectId);
  };

  /**
   * 加载应用数据
   */
  loadApp =() => {
    const { store } = this.props;
    const SingleData = this.state.SingleData;
    const envId = this.state.envId || SingleData.envId;
    if (!this.state.envId) {
      store.loadApp(this.state.projectId, envId);
    }
  };
  /**
   * 加载version
   */
  loadVersion = () => {
    const { store } = this.props;
    const SingleData = this.state.SingleData;
    const envId = this.state.envId || SingleData.envId;
    const appId = this.state.appId || SingleData.appId;
    if (!this.state.appId) {
      store.loadVersion(this.state.projectId, envId, appId);
    }
  };
  /**
   * 加载实例数据
   * @param index 版本索引
   */
  loadInstance =(index) => {
    const { store } = this.props;
    const SingleData = this.state.SingleData;
    const envId = this.state.envId || SingleData.envId;
    const appId = this.state.appId || SingleData.appId;
    const versionId = this.state.versionId || SingleData.appVersion[index].id;
    if (!this.state.versionId) {
      store.loadInstance(this.state.projectId, envId, appId, versionId);
    }
  };
  /**
   * 选择应用
   * @param value
   * @param options
   */
  selectApp = (value) => {
    const { store } = this.props;
    const SingleData = this.state.SingleData;
    const envId = this.state.envId || SingleData.envId;
    store.loadVersion(this.state.projectId, envId, value);
    store.setVersionDto([]);
    store.setInstance([]);
    this.setState({ versionsArr: [{ versionIndex: 0, instanceIndex: 0 }],
      versionId: null,
      instanceId: null,
      selectVersionArr: [],
    });
    this.setState({
      appId: value,
    });
  };

  /**
   * 选择版本
   * @param value
   */
  selectVersion = (value, options) => {
    const id = parseInt(options.key, 10);
    const selectVersionArr = this.state.selectVersionArr || [];
    const { store } = this.props;
    if (selectVersionArr.includes(id)) {
      Choerodon.prompt('该版本已经选过，请更换应用版本');
    } else if (this.state.versionsArr.length === 1) {
      if (selectVersionArr.length === 1) {
        selectVersionArr.pop();
        selectVersionArr.push(id);
      } else {
        selectVersionArr.push(id);
      }
    } else {
      selectVersionArr.push(id);
    }
    const SingleData = this.state.SingleData;
    const envId = this.state.envId || SingleData.envId;
    const appId = this.state.appId || SingleData.appId;
    store.loadInstance(this.state.projectId, envId, appId, id);
    this.setState({ instanceId: null });
    this.setState({
      versionId: id,
      selectVersionArr,
    });
  };

  /**
   * 添加版本
   */
  addVersion =() => {
    const { store } = this.props;
    // const versionDto = store.getVersionDto;
    const versionsArr = this.state.versionsArr;
    if (versionsArr.length === 0) {
      versionsArr.push({ versionIndex: 0,
        instanceIndex: 0 });
    } else {
      versionsArr.push(
        { versionIndex: versionsArr[versionsArr.length - 1].versionIndex + 1,
          instanceIndex: versionsArr[versionsArr.length - 1].versionIndex + 1 });
    }
    this.setState({ versionsArr });
  };
  /**
   * 删除版本
   * @param index 版本数组的索引
   */
  removeVersion =(index) => {
    const { store } = this.props;
    const data = store.getSingleData.appVersion.slice();
    const versionDto = store.getVersionDto;
    if (versionDto.length) {
      store.setInstance('remove', index);
      store.setVersionDto('remove', index);
    }
    const versionsArr = this.state.versionsArr;
    const selectVersionArr = this.state.selectVersionArr;
    selectVersionArr.splice(index, 1);
    versionsArr.splice(index, 1);
    this.setState({ versionsArr, selectVersionArr });
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const menu = this.props.AppState.currentMenuType;
    const { store, form } = this.props;
    const { versionsArr, SingleData, projectId, selectVersionArr } = this.state;
    const version = store.getVersions;
    const app = store.getApp;
    const instance = store.instance;
    const env = store.getEnv;
    const versionDto = store.getVersionDto;
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
    let haveOption = false;
    if (versionsArr.length && instance.length
      && instance.length >= versionsArr.length
      && selectVersionArr.length >= instance.length) {
      haveOption = true;
    }


    const formContent = (<div className="c7n-region c7n-network-create">
      <h2 className="c7n-space-first">对网络&quot;{SingleData && SingleData.name}&quot;进行修改</h2>
      <p>
        您可在此修改网络配置信息。
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
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkName,
            }],
            initialValue: SingleData ? SingleData.name : '',
          })(
            <Input label="网络名称" maxLength={25} />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('envId', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              transform: value => value.toString(),
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
              transform: value => value.toString(),
            }],
            initialValue: SingleData ? SingleData.appId : undefined,
          })(
            <Select
              filter
              showSearch
              notFoundContent="该环境下没有应用部署"
              label="应用名称"
              optionFilterProp="children"
              onFocus={this.loadApp}
              onSelect={this.selectApp}
              filterOption={(input, option) =>
                option.props.children.props.children.props.children
                  .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {store.loading ? (<Option key={Math.random()}>
                <Progress type="loading" />
              </Option>)
                : app.map(v => (
                  <Option value={v.id} key={v.id}>
                    <Tooltip title={v.code} placement="right" trigger="hover">
                      <span style={{ display: 'inline-block', width: '100%' }}>{v.name}</span>
                    </Tooltip>
                  </Option>))
              }
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
              initialValue: SingleData && versionDto.length > index
                ? versionDto[index].version : undefined,
            })(
              <Select
                filter
                notFoundContent="该应用下没有版本生成"
                label={Choerodon.getMessage('版本', 'version')}
                showSearch
                onSelect={this.selectVersion}
                dropdownMatchSelectWidth
                onFocus={this.loadVersion}
                size="default"
                optionFilterProp="children"
                optionLabelProp="children"
                filterOption={
                  (input, option) =>
                    option.props.children.props.children.props.children
                      .toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {store.loading ? (<Option key={Math.random()}><Progress type="loading" /></Option>)
                  : version.map(datas => (<Option
                    value={datas.version}
                    key={datas.id}
                    disabled={selectVersionArr.includes(datas.id)}
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
                transform: value => value.toString(),
                // validator: this.checkName,
              }],
              initialValue: haveOption ? _.map(SingleData.appVersion[index].appInstance, 'id') : undefined,
            })(
              <Select
                onSelect={this.selectInstance}
                dropdownClassName="test"
                filter
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
                    option.props.children[1]
                      .toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {haveOption ? _.filter(instance, ver => ver.id === selectVersionArr[index])[0]
                  .options.map(instancess => (
                    <Option
                      // disabled={instancess.intanceStatus &&
                      // instancess.intanceStatus !== 'running'}
                      value={instancess.id}
                      // eslint-disable-next-line
                      key={`${index}-${instancess.intanceStatus}`}
                    >
                      {instancess.intanceStatus && instancess.intanceStatus !== 'running' ? <Tooltip title="实例不正常，建议更换实例">
                        <span className="icon-error status-error-instance status-instance" />
                      </Tooltip> : <Tooltip title="正常">
                        <span className="icon-check_circle status-success-instance status-instance" />
                      </Tooltip>}
                      {instancess.code}
                    </Option>
                  )) : <Option key={Math.random().toString()}>sjjsj</Option> }
              </Select>,
            )}
          </FormItem>
          { versionsArr.length > 1 ? <Button
            shape="circle"
            className="c7n-domain-icon-delete"
            onClick={this.removeVersion.bind(this, index)}
          >
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
            }],
            initialValue: SingleData ? SingleData.targetPort : '',
          })(
            <Input maxLength={10} label="目标口号" />,
          )}
        </FormItem>
      </Form>

    </div>);
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
          {formContent}
        </Sidebar>
      </div>
    );
  }
}

export default Form.create({})(withRouter(Editnetwok));
