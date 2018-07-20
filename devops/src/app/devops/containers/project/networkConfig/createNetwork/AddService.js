import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Form, Select, Input, Tooltip, Modal, Popover, Icon } from 'choerodon-ui';
import { stores, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import '../../../main.scss';
import './NetworkCreate.scss';

const { AppState } = stores;
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
const { Option, OptGroup } = Select;

@observer
class AddService extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      projectId: menu.id,
      versionsArr: [{ versionIndex: 0, instanceIndex: 0 }],
      show: false,
      env: { loading: false, id: '', dataSource: [] },
      app: { loading: false, id: '', dataSource: [] },
      versions: [],
      0: { versions: [], instances: [] },
      instanceLoading: false,
    };
  }
  /**
   * 加载环境数据
   */
  loadEnv = () => {
    const { store } = this.props;
    this.setState({ env: { loading: true, id: '', dataSource: [] } });
    store.loadEnv(this.state.projectId)
      .then((data) => {
        this.setState({ env: { loading: false, id: '', dataSource: data } });
      });
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
    if (index === 0) {
      this.setState({ 0: { versions, instances: [] } });
    } else {
      const dataSource = _.cloneDeep(versions);
      for (let j = 0; j < index; j += 1) {
        const id = parseInt(this.props.form.getFieldValue(`version-${j}`), 10);
        _.remove(dataSource, v => v.id === id);
        this.setState({ [index]: { versions: dataSource, instances: [] } });
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
    const versions = this.state[index].versions;
    this.setState({ instanceLoading: true });
    store.loadInstance(this.state.projectId, envId, appId, versionId)
      .then((data) => {
        this.setState({ [index]: { versions, instances: data } });
        this.setState({ instanceLoading: false });
      });
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
      app: { loading: false, id: '', dataSource: [] },
      0: { versions: [], instances: [] },
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
    const envId = this.props.form.getFieldValue('envId');
    store.loadVersion(this.state.projectId, envId, value);
    this.setState({
      versionsArr: [{ versionIndex: 0, instanceIndex: 0 }], 0: { versions: [], instances: [] },
    });
    const str = this.randomString(4);
    const networkValue = `${options.key}-${str}`;
    this.props.form.setFieldsValue({ 'version-0': undefined, 'instance-0': undefined });
    this.setState({
      networkValue,
    });
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
    this.setState({ versionsArr, [index]: { versions: [], instances: [] } });
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
    const { intl } = this.props;
    const { store } = this.props;
    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    const envId = this.props.form.getFieldValue('envId');
    if (value && !pattern.test(value)) {
      callback(intl.formatMessage({ id: 'network.name.check.failed' }));
    } else if (value && pattern.test(value)) {
      store.checkDomainName(this.state.projectId, envId, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(intl.formatMessage({ id: 'network.name.check.exist' }));
          }
        });
    } else {
      callback();
    }
  };
  /**
   * 验证ip
   * @param rule
   * @param value
   * @param callback
   */
  checkIP =(rule, value, callback) => {
    const { intl } = this.props;
    const p = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;
    if (value) {
      if (p.test(value)) {
        callback();
      } else {
        callback(intl.formatMessage({ id: 'network.ip.check.failed' }));
      }
    } else {
      callback();
    }
  };
  /**
   * 验证端口号
   * @param rule
   * @param value
   * @param callback
   */
  checkPort = (rule, value, callback) => {
    const { intl } = this.props;
    const p = /^[1-9]\d*$/;
    if (value) {
      if (p.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 65535) {
        callback();
      } else {
        callback(intl.formatMessage({ id: 'network.port.check.failed' }));
      }
    } else {
      callback();
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const menu = AppState.currentMenuType;
    const { store, form, intl } = this.props;
    const app = this.state.app.dataSource;
    const env = this.state.env.dataSource;
    const version = store.getVersions;
    let hasPath = false;
    let addStatus = false;
    let tooltipTitle = intl.formatMessage({ id: 'network.form.version.null' });
    if (version.length <= 1 && this.state.versionId) {
      tooltipTitle = intl.formatMessage({ id: 'network.form.version.checked' });
    }
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
    const formContent = (this.props.visible && <Content code={'network.create'} values={{ name: menu.name }} className="c7n-network-create sidebar-content">
      <Form layout="vertical">
        <FormItem
          className="c7n-create-network-formitem"
          {...formItemLayout}
        >
          {getFieldDecorator('envId', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: 'required' }),
              // transform: value => value.toString(),
            }],
          })(
            <Select
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onFocus={this.loadEnv}
              loading={this.state.env.loading}
              dropdownClassName="c7n-network-env"
              filter
              showSearch
              className="c7n-create-network-formitem"
              label={<FormattedMessage id={'network.column.env'} />}
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
              message: intl.formatMessage({ id: 'required' }),
              // transform: value => value.toString(),
            }],
          })(
            <Select
              getPopupContainer={triggerNode => triggerNode.parentNode}
              disabled={!(this.props.form.getFieldValue('envId'))}
              onFocus={this.loadApp}
              loading={this.state.app.loading}
              filter
              className="c7n-create-network-formitem"
              showSearch
              notFoundContent={intl.formatMessage({ id: 'network.form.app.disable' })}
              label={<FormattedMessage id={'network.form.app'} />}
              optionFilterProp="children"
              onSelect={this.selectApp}
              filterOption={(input, option) =>
                option.props.children.props.children[1].props.children
                  .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              <OptGroup label={<FormattedMessage id={'project'} />} key={'project'}>
                {_.filter(app, a => a.projectId === (parseInt(menu.id, 10))).map(v => (
                  <Option value={v.id} key={v.code}>
                    <Popover
                      placement="right"
                      content={<div>
                        <p>
                          <FormattedMessage id={'app.name'} />:
                          <span>{v.name}</span>
                        </p>
                        <p>
                          <FormattedMessage id={'app.code'} />:
                          <span>{v.code}</span>
                        </p>
                      </div>}
                    >
                      <span className="icon icon-project" />
                      <span style={{ paddingLeft: 8 }}>{v.name}</span>
                    </Popover>
                  </Option>
                ))}
              </OptGroup>
              <OptGroup label={<FormattedMessage id={'market'} />} key={'markert'}>
                {_.filter(app, a => a.projectId !== (parseInt(menu.id, 10))).map(v => (
                  <Option value={v.id} key={v.code}>
                    <Popover
                      placement="right"
                      content={<div>
                        <p>
                          <FormattedMessage id={'appstore.name'} />:
                          <span>{v.name}</span>
                        </p>
                        <p>
                          <FormattedMessage id={'appstore.contributor'} />:
                          <span>{v.contributor}</span>
                        </p>
                        <p>
                          <FormattedMessage id={'appstore.description'} />:
                          <span>{v.description}</span>
                        </p>
                      </div>}
                    >
                      <span className="icon icon-apps" />
                      <span style={{ width: '100%', paddingLeft: 8 }}>{v.name}</span>
                    </Popover>
                  </Option>
                ))}
              </OptGroup>
            </Select>,
          )}
        </FormItem>
        {versionsArr.map((data, index) => (<div key={data.versionIndex} style={{ position: 'relative' }}>
          <FormItem
            className="c7n-create-network-formitem-network"
            {...formItemLayout}
          >
            {getFieldDecorator(`version-${data.versionIndex}`, {
              rules: [{
                required: true,
                message: intl.formatMessage({ id: 'required' }),
                // transform: value => value.toString(),
              }],
            })(
              <Select
                getPopupContainer={triggerNode => triggerNode.parentNode}
                onFocus={this.loadVersion.bind(this, data.versionIndex)}
                filter
                notFoundContent={intl.formatMessage({ id: 'network.form.version.disable' })}
                disabled={!(this.props.form.getFieldValue('appId'))}
                label={<FormattedMessage id={'network.column.version'} />}
                showSearch
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
                {this.state[data.versionIndex].versions.map(datas => (<Option
                  value={datas.id}
                  key={datas.id}
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
                message: intl.formatMessage({ id: 'required' }),
                // transform: value => value.toString(),
              }],
            })(
              <Select
                getPopupContainer={triggerNode => triggerNode.parentNode}
                loading={this.state.instanceLoading}
                onFocus={this.loadInstance.bind(this, data.instanceIndex)}
                filter
                disabled={!(this.props.form.getFieldValue(`version-${data.versionIndex}`))}
                label={<FormattedMessage id={'network.form.instance'} />}
                showSearch
                notFoundContent={intl.formatMessage({ id: 'network.form.instance.disable' })}
                mode="multiple"
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
                { this.state[data.instanceIndex].instances.map(instancess => (
                  <Option
                    key={instancess.id}
                    value={instancess.id}
                  >
                    {instancess.code}
                  </Option>
                ))}
              </Select>,
            )}
          </FormItem>
          { versionsArr.length > 1 ? <Button shape="circle" className="c7n-domain-icon-delete" onClick={this.removeVersion.bind(this, index)}>
            <span className="icon icon-delete" />
          </Button> : <span className="icon icon-delete c7n-app-icon-disabled" />}
        </div>))}
        <div className="c7n-domain-btn-wrapper">
          {addStatus ? <Button className="c7n-domain-btn" onClick={this.addVersion} type="primary" icon="add"><FormattedMessage id={'network.btn.add'} /></Button>
            : <Tooltip title={tooltipTitle}><Button className="c7n-domain-btn c7n-domain-icon-delete-disabled" icon="add"><FormattedMessage id={'network.btn.add'} /></Button></Tooltip>}
        </div>
        <FormItem
          className="c7n-create-network-formitem"
          {...formItemLayout}
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkName,
            }],
            initialValue: this.state.networkValue,
          })(
            <Input disabled={!(this.props.form.getFieldValue('appId'))} label={<FormattedMessage id={'network.form.name'} />} maxLength={40} />,
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
            <Input maxLength={15} label={<FormattedMessage id={'network.column.ip'} />} />,
          )}
        </FormItem>
        <FormItem
          className="c7n-create-network-formitem"
          {...formItemLayout}
        >
          {getFieldDecorator('port', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkPort,
            }],
          })(
            <Input maxLength={5} label={<FormattedMessage id={'network.column.port'} />} />,
          )}
        </FormItem>
        <FormItem
          className="c7n-create-network-formitem"
          {...formItemLayout}
        >
          {getFieldDecorator('targetPort', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkPort,
            }],
          })(
            <Input
              maxLength={5}
              label={<FormattedMessage id={'network.column.targetPort'} />}
              suffix={<Popover
                overlayStyle={{ maxWidth: '180px', wordBreak: 'break-all' }}
                className="routePop"
                placement="right"
                trigger="hover"
                content={intl.formatMessage({ id: 'network.form.targetPort.help' })}
              >
                <Icon type="help" />
              </Popover>
              }
            />,
          )}
        </FormItem>
      </Form>
    </Content>);
    return (
      <div className="c7n-region">
        <Sidebar
          cancelText={<FormattedMessage id={'cancel'} />}
          okText={<FormattedMessage id={'create'} />}
          title={<FormattedMessage id={'network.header.create'} />}
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

export default Form.create({})(withRouter(injectIntl(AddService)));
