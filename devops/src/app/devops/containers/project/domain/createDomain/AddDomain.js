import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Select, Input, Modal, Tooltip, Icon, Radio } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { stores, Content } from 'choerodon-front-boot';
import classnames from 'classnames';
import _ from 'lodash';
import '../../../main.scss';
import './CreateDomain.scss';

const { Option } = Select;
const { Item: FormItem } = Form;
const { Sidebar } = Modal;
const { Group: RadioGroup } = Radio;
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

@observer
class CreateDomain extends Component {
  /**
   * 检查名称的唯一性
   * @type {Function}
   */
  checkName = _.debounce((rule, value, callback) => {
    const { intl, form: { getFieldValue }, store } = this.props;
    const p = /^([a-z0-9]([-a-z0-9]?[a-z0-9])*)$/;
    const { singleData: { name } } = this.state;
    if (name && name === value) {
      callback();
    } else if (p.test(value)) {
      const envId = getFieldValue('envId');
      if (envId) {
        store.checkName(this.state.projectId, value, envId)
          .then((data) => {
            if (data) {
              callback();
            } else {
              callback(intl.formatMessage({ id: 'domain.name.check.exist' }));
            }
          })
          .catch(() => callback());
      } else {
        callback(intl.formatMessage({ id: 'network.form.app.disable' }));
      }
    } else {
      callback(intl.formatMessage({ id: 'domain.name.check.failed' }));
    }
  }, 1000);

  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      projectId: menu.id,
      deletedService: {},
      env: { loading: false, dataSource: [] },
      portInNetwork: {},
      protocol: 'normal',
      selectEnv: null,
      pathCountChange: false,
      singleData: {},
    };
    this.pathKeys = 1;
  }

  componentDidMount() {
    const { intl: { formatMessage }, store, id, type, envId, form: { setFieldsValue, setFields } } = this.props;
    const { projectId } = this.state;
    if (id && type === 'edit') {
      store.loadDataById(projectId, id).then((data) => {
        const { pathList, envId: domainEnv, certId, certName, domain } = data;
        const deletedService = [];
        _.forEach(pathList, (item, index) => {
          const { serviceStatus, serviceName, serviceId } = item;
          if (serviceStatus !== 'running') {
            deletedService[index] = {
              name: serviceName,
              id: serviceId,
              status: serviceStatus,
            };
          } else {
            deletedService[index] = {};
          }
        });
        this.setState({
          deletedService,
          singleData: data || {},
          protocol: certId ? 'secret' : 'normal',
          selectEnv: domainEnv,
        });
        if (certId && domain && domainEnv) {
          store.loadCertByEnv(projectId, domainEnv, domain);
          if (certName) {
            setFieldsValue({ certId });
          } else {
            setFields({
              certId: {
                value: null,
                errors: [new Error(formatMessage({ id: 'domain.cert.delete' }))],
              },
            });
          }
        }
        store.loadNetwork(projectId, domainEnv);
      });
    }
    // 环境总览传入envId
    if (envId) {
      this.handleSelectEnv(envId);
    }
    store.loadEnv(projectId)
      .then((data) => {
        this.setState({ env: { loading: false, dataSource: data } });
      });
  }

  /**
   * 添加或删除包含路径的表单项触发路径的校验
   * 确保 新添加 的一组路径已经渲染在页面上
   */
  componentDidUpdate() {
    if (this.state.pathCountChange) {
      this.triggerPathCheck();
    }
  }

  /**
   * 加载环境
   */
  loadEnv = () => {
    const { store } = this.props;
    this.setState({ env: { loading: true, dataSource: [] } });
    store.loadEnv(this.state.projectId)
      .then((data) => {
        this.setState({ env: { loading: false, dataSource: data } });
      });
  };

  handleSubmit =(e) => {
    e.preventDefault();
    const { store, id, type, form: { validateFieldsAndScroll } } = this.props;
    const { projectId } = this.state;
    const service = store.getNetwork;
    validateFieldsAndScroll((err, data) => {
      if (!err) {
        this.setState({ submitting: true });
        const { domain, name, envId, certId, paths, path, network, port } = data;
        const postData = { domain, name, envId };
        if (certId) {
          postData.certId = certId;
        }
        let promise = null;
        const pathList = [];
        _.forEach(paths, (item) => {
          const pt = path[item];
          const serviceId = network[item];
          const servicePort = port[item];
          pathList.push({ path: pt, serviceId, servicePort });
        });
        postData.pathList = pathList;
        if (type === 'create') {
          promise = store.addData(projectId, postData);
        } else {
          postData.domainId = id;
          promise = store.updateData(projectId, id, postData);
        }
        this.handleResponse(promise);
      }
    });
  };

  /**
   * 处理创建修改域名请求返回的数据
   * @param promise
   */
  handleResponse = (promise) => {
    if (promise) {
      promise.then((data) => {
        this.setState({ submitting: false });
        if (data) {
          this.handleClose();
        }
      }).catch((err) => {
        this.setState({ submitting: false });
        Choerodon.handleResponseError(err);
      });
    }
  };

  addPath = () => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const keys = getFieldValue('paths');
    const uuid = this.pathKeys;
    const nextKeys = _.concat(keys, uuid);
    this.pathKeys = uuid + 1;
    setFieldsValue({
      paths: nextKeys,
    });
    this.setState({ pathCountChange: true });
  };

  removePath = (k) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const keys = getFieldValue('paths');
    if (keys.length === 1) {
      return;
    }
    setFieldsValue({
      paths: _.filter(keys, key => key !== k),
    });
    this.setState({ pathCountChange: true });
  };

  /**
   * 选择环境
   * @param value
   */
  handleSelectEnv = (value) => {
    const { store, form } = this.props;
    const { selectEnv } = this.state;
    if (value !== selectEnv) {
      store.loadNetwork(this.state.projectId, value);
      store.setCertificates([]);
      form.resetFields();
      this.setState({
        deletedService: {},
        singleData: {},
        selectEnv: value,
      });
    }
  };

  /**
   * 关闭弹框
   */
  handleClose =(isload = true) => {
    const { store, onClose } = this.props;
    store.setEnv([]);
    store.setNetwork([]);
    onClose(isload);
  };

  /**
   * 检查路径
   * 和域名组合检查
   * @param rule
   * @param value
   * @param callback
   */
  checkPath = (rule, value, callback) => {
    const { form: { getFieldValue, getFieldError }, intl, store, type, id } = this.props;
    const { projectId } = this.state;
    if (value) {
      const p = /^\/([a-zA-Z0-9]+(\/[a-zA-Z0-9]+)*)*$/;
      const count = _.countBy(getFieldValue('path'));
      const domain = getFieldValue('domain');
      const domainError = getFieldError('domain');
      if (p.test(value)) {
        // 重复检查
        if (count[value] < 2) {
          // 如果域名校验不通过，则不发起域名路径组合校验
          if (!domainError) {
            let checkPromise = null;
            if (type === 'edit') {
              checkPromise = store.checkPath(projectId, domain, value, id);
            } else {
              checkPromise = store.checkPath(projectId, domain, value);
            }
            this.handleCheckResponse(checkPromise, callback);
          } else {
            callback();
          }
        } else {
          callback(intl.formatMessage({ id: 'domain.path.check.exist' }));
        }
      } else {
        callback(intl.formatMessage({ id: 'domain.path.check.failed' }));
      }
    } else {
      callback(intl.formatMessage({ id: 'domain.path.check.notSet' }));
    }
  };

  /**
   * 处理路径校验返回结果
   * @param promise
   * @param callback
   */
  handleCheckResponse = (promise, callback) => {
    const { intl } = this.props;
    if (promise) {
      promise.then((data) => {
        if (data) {
          callback();
        } else {
          callback(intl.formatMessage({ id: 'domain.path.check.exist' }));
        }
      }).catch((err) => {
        Choerodon.handleResponseError(err);
        callback();
      });
    }
  };

  /**
   * 检查域名是否符合规则
   * @type {Function}
   */
  checkDomain = (rule, value, callback) => {
    const { intl, form: { getFieldValue }, store } = this.props;
    const pattern = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)+)$/;
    if (pattern.test(value)) {
      const paths = getFieldValue('paths');
      const fields = [];
      _.forEach(paths, item => fields.push(`path[${item}]`));
      this.triggerPathCheck();
      callback();
    } else {
      callback(intl.formatMessage({ id: 'domain.domain.check.failed' }));
    }
  };

  /**
   * 触发路径检查
   */
  triggerPathCheck = () => {
    const { getFieldValue, validateFields } = this.props.form;
    const paths = getFieldValue('paths');
    const fields = [];
    _.forEach(paths, item => fields.push(`path[${item}]`));
    validateFields(fields, { force: true });
    this.setState({ pathCountChange: false });
  }

  /**
   * 校验网络是否可用
   * @param rule
   * @param value
   * @param callback
   */
  checkService = (rule, value, callback) => {
    const { type, intl } = this.props;
    const { deletedService } = this.state;
    if (type === 'create') {
      callback();
    } else {
      // network[xxx]
      const index = parseInt(rule.field.slice(8, -1), 10);
      const del = deletedService[index];
      if (del && del.id && del.id === value) {
        callback(intl.formatMessage({ id: 'domain.network.check.failed' }));
      } else {
        callback();
      }
    }
  };

  checkPorts = (ports, rule, value, callback) => {
    if (ports && !ports.includes(value)) {
      callback(this.props.intl.formatMessage({ id: 'domain.network.check.failed' }));
    } else {
      callback();
    }
  };

  /**
   * 根据网络加载端口
   * @param data
   * @param index 标识第几组的网络
   * @param id
   */
  handleSelectNetwork = (data, index, id) => {
    const portArr = [];
    _.forEach(data, (item) => {
      if (id === item.id) {
        const { config: { ports } } = item;
        _.forEach(ports, p => portArr.push(p.port));
      }
    });
    const portInNetwork = {
      [index]: portArr,
    };
    this.setState({ portInNetwork });
  };

  /**
   * 切换网络协议
   * @param e
   */
  handleTypeChange = e => this.setState({ protocol: e.target.value });

  /**
   * 域名输入框失焦，查询证书
   * @param e
   */
  loadCertByDomain = (e) => {
    const { store, form } = this.props;
    const { projectId, selectEnv, protocol } = this.state;
    form.resetFields('certId');
    if (protocol === 'secret' && selectEnv) {
      store.loadCertByEnv(projectId, selectEnv, e.target.value);
    }
  };

  render() {
    const { store, form, intl: { formatMessage }, type, visible, envId: propsEnv } = this.props;
    const { getFieldDecorator, getFieldValue, getFieldsError } = form;
    const { name: menuName } = AppState.currentMenuType;
    const {
      singleData,
      env,
      portInNetwork,
      protocol,
      deletedService,
      submitting,
    } = this.state;
    const network = store.getNetwork;
    const { pathList, envId, name, domain } = singleData;
    const initEnvId = propsEnv ? Number(propsEnv) : undefined;
    let initPaths = [0];
    if (pathList && pathList.length) {
      initPaths.pop();
      initPaths = _.map(pathList, (item, index) => index);
      if (initPaths.length !== 1 && this.pathKeys === 1) {
        this.pathKeys = pathList.length;
      }
    }
    getFieldDecorator('paths', { initialValue: initPaths });
    const paths = getFieldValue('paths');
    // 是否还存在校验未通过的path值
    const pathsError = getFieldsError(_.map(paths, item => `path[${item}]`));
    let hasPathError = true;
    _.forEach(pathsError, (pv, pk) => {
      if (pv[0]) {
        hasPathError = true;
      } else {
        hasPathError = false;
      }
    });
    // 生成路径-网络-端口的表单组
    const pathItem = _.map(paths, (k, index) => {
      let delNetOption = null;
      if (deletedService[k] && !_.isEmpty(deletedService[k])) {
        const { id, status, name: delNetName } = deletedService[k];
        delNetOption = (<Option value={id} key={`${id}-network-error`}>
          <div className={`c7n-domain-create-status c7n-domain-create-status_${status}`}>
            <div>{formatMessage({ id: status })}</div></div>
          {delNetName}</Option>);
      }
      const hasServerInit = pathList && pathList.length && pathList[k];
      const initPort = hasServerInit ? pathList[k].servicePort : undefined;
      const initNetwork = hasServerInit ? pathList[k].serviceId : undefined;
      const initPath = hasServerInit ? pathList[k].path : '/';
      // 网络拥有的端口
      const portWithNetwork = {};
      _.forEach(network, (item) => {
        const { config: { ports }, id } = item;
        const port = [];
        _.forEach(ports, p => port.push(p.port));
        portWithNetwork[id] = port;
      });
      // 生成端口选项
      const portOption = (type === 'edit' && !portInNetwork[k] && hasServerInit)
        ? portWithNetwork[pathList[k].serviceId] : portInNetwork[k];
      return (<div className="domain-network-wrap" key={`paths-${k}`}>
        <FormItem
          className="domain-network-item c7n-select_160"
          {...formItemLayout}
        >
          {getFieldDecorator(`path[${k}]`, {
            rules: [{
              validator: this.checkPath,
            }],
            initialValue: initPath,
          })(
            <Input
              onChange={() => this.setState({ pathCountChange: true })}
              disabled={!(getFieldValue('domain'))}
              maxLength={10}
              label={formatMessage({ id: 'domain.column.path' })}
              size="default"
            />,
          )}
        </FormItem>
        <FormItem
          className="domain-network-item c7n-select_160"
          {...formItemLayout}
        >
          {getFieldDecorator(`network[${k}]`, {
            rules: [{
              required: true,
              message: formatMessage({ id: 'required' }),
            }, {
              validator: this.checkService,
            }],
            initialValue: initNetwork,
          })(
            <Select
              getPopupContainer={triggerNode => triggerNode.parentNode}
              disabled={!(getFieldValue('envId'))}
              filter
              label={formatMessage({ id: 'domain.column.network' })}
              showSearch
              dropdownMatchSelectWidth
              onSelect={this.handleSelectNetwork.bind(this, network, k)}
              size="default"
              optionFilterProp="children"
              optionLabelProp="children"
              filterOption={
                (input, option) => option.props.children[1]
                  .toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {delNetOption}
              {network.map(item => (<Option value={item.id} key={`${item.id}-network`}>
                <div className="c7n-domain-create-status c7n-domain-create-status_running">
                  <div>{formatMessage({ id: 'running' })}</div>
                </div>
                {item.name}</Option>))}
            </Select>,
          )}
        </FormItem>
        <FormItem
          className="domain-network-item c7n-select_160"
          {...formItemLayout}
        >
          {getFieldDecorator(`port[${k}]`, {
            trigger: ['onChange', 'onSubmit'],
            rules: [{
              required: true,
              message: formatMessage({ id: 'required' }),
            }, {
              validator: this.checkPorts.bind(this, portOption),
            }],
            initialValue: initPort,
          })(<Select
            getPopupContainer={triggerNode => triggerNode.parentNode}
            disabled={!getFieldValue(`network[${k}]`)}
            filter
            label={formatMessage({ id: 'domain.column.port' })}
            showSearch
            dropdownMatchSelectWidth
            size="default"
            optionFilterProp="children"
            optionLabelProp="children"
            filterOption={(input, option) => option.props.children.toString()
              .toLowerCase().indexOf(input.toString().toLowerCase()) >= 0}
          >
            {_.map(portOption, item => (<Option key={item} value={item}>{item}</Option>))}
          </Select>)}
        </FormItem>
        {paths.length > 1 ? <Button shape="circle" className="c7n-domain-icon-delete" onClick={this.removePath.bind(this, k)}>
          <i className="icon icon-delete" />
        </Button> : <i className="icon icon-delete c7n-app-icon-disabled" />}
      </div>);
    });
    return (<div className="c7n-region">
      <Sidebar
        destroyOnClose
        okText={type === 'create' ? formatMessage({ id: 'create' }) : formatMessage({ id: 'save' })}
        cancelText={formatMessage({ id: 'cancel' })}
        visible={visible}
        title={formatMessage({ id: `domain.${type === 'create' ? 'create' : 'update'}.head` })}
        onCancel={this.handleClose.bind(this, false)}
        onOk={this.handleSubmit}
        confirmLoading={submitting}
      >
        <Content
          code={`domain.${type === 'create' ? 'create' : 'update'}`}
          values={{ name: menuName }}
          className="sidebar-content c7n-domainCreate-wrapper"
        >
          <Form layout="vertical" onSubmit={this.handleSubmit}>
            <FormItem
              className="c7n-domain-formItem c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('envId', {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'required' }),
                }],
                initialValue: envId || initEnvId,
              })(
                <Select
                  dropdownClassName="c7n-domain-env"
                  onFocus={this.loadEnv}
                  loading={env.loading}
                  filter
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  onSelect={this.handleSelectEnv}
                  showSearch
                  label={formatMessage({ id: 'domain.column.env' })}
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children[2]
                    .toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {env.dataSource.map(v => (
                    <Option value={v.id} key={`${v.id}-env`} disabled={!v.connect}>
                      {!v.connect && <span className="env-status-error" />}
                      {v.connect && <span className="env-status-success" />}
                      {v.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem
              className="c7n-domain-formItem c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: formatMessage({ id: 'required' }),
                }, {
                  validator: this.checkName,
                }],
                initialValue: name || '',
              })(
                <Input
                  disabled={!(getFieldValue('envId') && !name)}
                  maxLength={40}
                  label={formatMessage({ id: 'domain.column.name' })}
                  size="default"
                />,
              )}
            </FormItem>
            <div className="c7n-creation-title">
              <Icon type="language" />
              <FormattedMessage id="domain.protocol" />
            </div>
            <div className="c7n-creation-radio">
              <div className="creation-radio-label">
                <FormattedMessage id="chooseType" />
              </div>
              <FormItem
                className="c7n-select_512 creation-radio-form"
                label={<FormattedMessage id="ctf.target.type" />}
                {...formItemLayout}
              >
                {getFieldDecorator('type', {
                  initialValue: protocol,
                })(<RadioGroup
                  disabled={!getFieldValue('envId')}
                  name="type"
                  onChange={this.handleTypeChange}
                >
                  <Radio value="normal"><FormattedMessage id="domain.protocol.normal" /></Radio>
                  <Radio value="secret"><FormattedMessage id="domain.protocol.secret" /></Radio>
                </RadioGroup>)}
              </FormItem>
            </div>
            <div className="c7n-creation-panel">
              <FormItem
                className="c7n-select_480 creation-form-item"
                {...formItemLayout}
              >
                {getFieldDecorator('domain', {
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: formatMessage({ id: 'required' }),
                  }, {
                    validator: this.checkDomain,
                  }],
                  initialValue: domain || '',
                })(
                  <Input
                    disabled={!(getFieldValue('envId'))}
                    maxLength={50}
                    type="text"
                    label={formatMessage({ id: 'domain.form.domain' })}
                    size="default"
                    onBlur={this.loadCertByDomain}
                  />,
                )}
              </FormItem>
              {protocol === 'secret' ? (<FormItem
                className="c7n-select_480 creation-form-item"
                {...formItemLayout}
              >
                {getFieldDecorator('certId', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'required' }),
                  }],
                })(<Select
                  className="c7n-select_512"
                  optionFilterProp="children"
                  label={<FormattedMessage id="domain.form.cert" />}
                  notFoundContent={<FormattedMessage id="domain.cert.none" />}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  filterOption={(input, option) => option.props.children
                    .toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  filter
                  showSearch
                >
                  {_.map(store.getCertificates, item => (<Option value={item.id} key={item.id}>
                    {item.certName}
                  </Option>))}
                </Select>)}
              </FormItem>) : null}
            </div>
            {pathItem}
            <div className="c7n-domain-btn-wrapper">
              <Tooltip title={hasPathError || !getFieldValue('domain') ? formatMessage({ id: 'domain.path.isnull' }) : ''}>
                <Button
                  className="c7n-domain-btn"
                  onClick={this.addPath}
                  type="primary"
                  disabled={hasPathError || !getFieldValue('domain')}
                  icon="add"
                >
                  {formatMessage({ id: 'domain.path.add' })}
                </Button>
              </Tooltip>
            </div>
          </Form>
        </Content>
      </Sidebar>
    </div>);
  }
}

export default Form.create({})(withRouter(injectIntl(CreateDomain)));
