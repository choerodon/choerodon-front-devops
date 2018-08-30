/* eslint-disable react/no-access-state-in-setstate */
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
  checkName =_.debounce((rule, value, callback) => {
    const { intl, form } = this.props;
    const p = /^([a-z0-9]([-a-z0-9]?[a-z0-9])*)$/;
    const { SingleData } = this.state;
    if (SingleData && SingleData.name === value) {
      callback();
    } else if (p.test(value)) {
      const { store } = this.props;
      const envId = form.getFieldValue('envId');
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
      callback(intl.formatMessage({ id: 'domain.names.check.failed' }));
    }
  }, 1000);

  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      pathArr: [{ pathIndex: 0, networkIndex: 0, portIndex: 0 }],
      projectId: menu.id,
      show: false,
      0: { deletedService: [] },
      env: { loading: false, dataSource: [] },
      initServiceLen: 0,
      portInNetwork: [],
      protocol: 'normal',
      selectEnv: null,
    };
  }

  componentDidMount() {
    const { store, id, visible, envId, form } = this.props;
    const { projectId } = this.state;
    if (id && visible) {
      store.loadDataById(projectId, id)
        .then((data) => {
          const { pathList, envId: domainEnv, certId, domain } = data;
          const len = pathList.length;
          for (let i = 0; i < len; i += 1) {
            const list = pathList[i];
            if (list.serviceStatus !== 'running') {
              this.setState({
                [i]: {
                  deletedService: [{
                    name: list.serviceName,
                    id: list.serviceId,
                    status: list.serviceStatus,
                  }] } });
            } else {
              this.setState({ [i]: { deletedService: [] } });
            }
          }
          this.setState({
            initServiceLen: len,
            SingleData: data,
            protocol: certId ? 'secret' : 'normal',
            selectEnv: domainEnv,
          });
          this.initPathArr(pathList.length);
          if (certId && domain && domainEnv) {
            store.loadCertByEnv(projectId, domainEnv, domain);
            form.setFieldsValue({ certId });
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

  componentDidUpdate() {
    if (this.state.pathChange) {
      const { pathArr } = this.state;
      const fields = [];
      pathArr.map((path) => {
        fields.push(`path-${path.pathIndex}`);
        return fields;
      });
      this.props.form.validateFields(fields, { force: true });
      this.checkAllPath(false);
    }
  }

  /**
   * 初始化数组
   * @param length
   */
  initPathArr = (length) => {
    const pathArr = [];
    for (let i = 0; i < length; i += 1) {
      pathArr.push({
        pathIndex: i,
        networkIndex: i,
        portIndex: i,
      });
    }
    this.setState({ pathArr });
  };

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

  /**
   * 提交数据
   * @param e
   */
  handleSubmit =(e) => {
    e.preventDefault();
    const { store, id, type, form } = this.props;
    const { projectId, initServiceLen, SingleData } = this.state;
    const service = store.getNetwork;
    form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const { domain, name, envId, certId } = data;
        const keys = Object.keys(data);
        const postData = { domain, name, envId };
        if (certId) {
          postData.certId = certId;
        }
        const pathList = [];
        let promise = null;
        this.setState({ submitting: true });
        if (type === 'create') {
          keys.forEach((k) => {
            if (k.includes('path')) {
              const index = parseInt(k.split('-')[1], 10);
              const value = data[`network-${index}`];
              const port = data[`port-${index}`];
              pathList.push({ path: `/${data[k]}`, serviceId: value, servicePort: port });
            }
          });
          postData.pathList = pathList;
          promise = store.addData(projectId, postData);
        } else {
          keys.forEach((k) => {
            if (k.includes('path')) {
              const index = parseInt(k.split('-')[1], 10);
              const value = data[`network-${index}`];
              const port = data[`port-${index}`];
              const path = data[k].split('/')[data[k].split('/').length - 1];
              pathList.push({ path: `/${path}`, serviceId: value, servicePort: port });
            }
          });
          postData.pathList = pathList;
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
        if (data) {
          this.handleClose();
        }
        this.setState({ submitting: false });
      }).catch((err) => {
        this.setState({ submitting: false });
        Choerodon.handleResponseError(err);
      });
    }
  };

  /**
   * 添加路径
   */
  addPath =() => {
    const { pathArr } = this.state;
    let index = 0;
    if (pathArr.length) {
      index = pathArr[pathArr.length - 1].pathIndex + 1;
      pathArr.push({
        pathIndex: index,
        networkIndex: index,
        portIndex: index,
      });
      this.checkAllPath(true);
    } else {
      index = 0;
      pathArr.push({
        pathIndex: 0,
        networkIndex: 0,
        portIndex: 0,
      });
    }
    this.setState({ pathArr, [index]: { deletedService: this.state[index - 1].deletedService } });
  };

  /**
   * 删除路径
   * @param index 路径数组的索引
   */
  removePath =(index) => {
    const { pathArr, initServiceLen } = this.state;
    pathArr.splice(index, 1);
    this.setState({ pathArr, initServiceLen: initServiceLen - 1 });
  };

  /**
   * 选择环境
   * @param value
   */
  handleSelectEnv = (value) => {
    const { store, form } = this.props;
    store.loadNetwork(this.state.projectId, value);
    store.setCertificates([]);
    form.resetFields();
    this.setState({
      pathArr: [{ pathIndex: 0, networkIndex: 0, portIndex: 0 }],
      0: { deletedService: [] },
      initServiceLen: 0,
      SingleData: null,
      selectEnv: value,
    });
  };

  /**
   * 关闭弹框
   */
  handleClose =() => {
    const { store, onClose } = this.props;
    this.setState({ show: false });
    store.setEnv([]);
    store.setNetwork([]);
    onClose();
  };

  /**
   * 级联验证path
   * @param flag
   */
  checkAllPath = (flag) => {
    this.setState({ pathChange: flag });
  }

  /**
   * 检查域名和路径组合的唯一性
   * @type {Function}
   */
  checkPath =(rule, value, callback) => {
    const { pathArr } = this.state;
    const patt = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*)$/;
    const domain = this.props.form.getFieldValue('domain');
    const index = parseInt(rule.field.split('-')[1], 10);
    const paths = [];
    for (let i = 0; i < pathArr.length; i += 1) {
      const p = `/${this.props.form.getFieldValue(`path-${pathArr[i].pathIndex}`)}`;
      if (i !== index) {
        paths.push(p);
      }
    }
    if (paths.includes(`/${value}`) && value) {
      callback(this.props.intl.formatMessage({ id: 'domain.path.check.exist' }));
    } else if (value) {
      if (patt.test(value)) {
        if (paths.includes(`/${value}`)) {
          callback(this.props.intl.formatMessage({ id: 'domain.path.check.exist' }));
        } else {
          const { store } = this.props;
          if (this.props.type === 'edit' && this.state.initServiceLen > index) {
            const { id } = this.state.SingleData;
            const v = this.state.SingleData.pathList[index].path
              .slice(1, this.state.SingleData.pathList[index].path.length);
            if (v === value && domain === this.state.SingleData.domain) {
              callback();
            } else {
              store.checkPath(this.state.projectId, domain, `/${value}`, id)
                .then((data) => {
                  if (data) {
                    callback();
                  } else {
                    callback(this.props.intl.formatMessage({ id: 'domain.path.check.exist' }));
                  }
                })
                .catch((error) => {
                  callback();
                });
            }
          } else {
            store.checkPath(this.state.projectId, domain, `/${value}`)
              .then((data) => {
                if (data) {
                  callback();
                } else {
                  callback(this.props.intl.formatMessage({ id: 'domain.path.check.exist' }));
                }
              })
              .catch((error) => {
                callback();
              });
          }
        }
      } else {
        callback(this.props.intl.formatMessage({ id: 'domain.name.check.failed' }));
      }
    } else {
      callback();
    }
  };

  /**
   * 检查域名是否符合规则
   * @type {Function}
   */
  checkDomain = (rule, value, callback) => {
    const { intl, form } = this.props;
    const patt = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)+)$/;
    if (patt.test(value)) {
      callback();
    } else {
      callback(intl.formatMessage({ id: 'domain.name.check.failed' }));
    }
    const { pathArr } = this.state;
    const fields = [];
    pathArr.map((path) => {
      fields.push(`path-${path.pathIndex}`);
      return fields;
    });
    form.validateFields(fields, { force: true });
  };

  /**
   * 校验网络是否可用
   * @param rule
   * @param value
   * @param callback
   */
  checkService = (rule, value, callback) => {
    if (this.props.type === 'create') {
      callback();
    } else {
      const index = parseInt(rule.field.split('-')[1], 10);
      const deletedIns = _.map(this.state[index].deletedService, 'id');
      if (deletedIns.includes(value)) {
        callback(this.props.intl.formatMessage({ id: 'domain.network.check.failed' }));
      } else {
        callback();
      }
    }
  };

  checkPorts = (ports, rule, value, callback) => {
    if (!ports.includes(value)) {
      callback(this.props.intl.formatMessage({ id: 'domain.network.check.failed' }));
    } else {
      callback();
    }
  };

  /**
   * 根据网络加载端口
   * @param data
   * @param id
   */
  handleSelectNetwork = (data, id) => {
    const portInNetwork = [];
    _.forEach(data, (item) => {
      if (id === item.id) {
        const { config: { ports } } = item;
        _.forEach(ports, p => portInNetwork.push(p.port));
      }
    });
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
    const { store, form, intl, type, visible, envId } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const menu = AppState.currentMenuType;
    const { pathArr, SingleData, env, portInNetwork, protocol } = this.state;
    const network = store.getNetwork;
    let addStatus = true;
    // 判断path是否有值
    if (pathArr.length) {
      const hasValue = getFieldValue(`path-${pathArr[pathArr.length - 1].pathIndex}`) || (SingleData && SingleData.pathList);
      if (hasValue) {
        addStatus = false;
      }
    }
    const portWithNetwork = {};
    _.forEach(network, (item) => {
      const { config: { ports }, id } = item;
      const port = [];
      _.forEach(ports, p => port.push(p.port));
      portWithNetwork[id] = port;
    });
    const title = type === 'create' ? <h2 className="c7n-space-first"><FormattedMessage id="domain.create.title" values={{ name: menu.name }} /></h2> : <h2 className="c7n-space-first"><FormattedMessage id="domain.update.title" values={{ name: SingleData && SingleData.name }} /></h2>;
    const content = type === 'create' ? intl.formatMessage({ id: 'domain.create.description' })
      : intl.formatMessage({ id: 'domain.update.description' });
    const initEnvId = envId ? Number(envId) : undefined;
    const contentDom = visible ? (<div className="c7n-region c7n-domainCreate-wrapper">
      {title}
      <div className="page-content-header">
        <p className="description">
          {content}
          <a href={intl.formatMessage({ id: 'domain.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <FormattedMessage id="learnmore" />
            <i className="icon icon-open_in_new" />
          </a>
        </p>
      </div>
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FormItem
          className="c7n-domain-formItem"
          {...formItemLayout}
        >
          {getFieldDecorator('envId', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: 'required' }),
            }],
            initialValue: SingleData ? SingleData.envId : initEnvId,
          })(
            <Select
              dropdownClassName="c7n-domain-env"
              onFocus={this.loadEnv}
              loading={this.state.env.loading}
              filter
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onSelect={this.handleSelectEnv}
              showSearch
              label={intl.formatMessage({ id: 'domain.column.env' })}
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
          className="c7n-domain-formItem"
          {...formItemLayout}
        >
          {getFieldDecorator('name', {
            rules: [{
              required: true,
              whitespace: true,
              message: intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkName,
            }],
            initialValue: SingleData ? SingleData.name : '',
          })(
            <Input
              disabled={!((getFieldValue('envId')) && !(SingleData && SingleData.name))}
              maxLength={40}
              label={intl.formatMessage({ id: 'domain.column.name' })}
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
                message: intl.formatMessage({ id: 'required' }),
              }, {
                validator: this.checkDomain,
              }],
              initialValue: SingleData ? SingleData.domain : '',
            })(
              <Input
                disabled={!(form.getFieldValue('envId'))}
                maxLength={50}
                type="text"
                label={intl.formatMessage({ id: 'domain.form.domain' })}
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
                message: intl.formatMessage({ id: 'required' }),
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
        {pathArr.length >= 1 && pathArr.map((data, index) => {
          const hasServerInit = SingleData && this.state.initServiceLen > index;
          const initPort = hasServerInit
            ? SingleData.pathList[index].servicePort : undefined;
          const initNetwork = hasServerInit
            ? SingleData.pathList[index].serviceId : undefined;
          // 生成端口选项
          const portOption = (type === 'edit' && portInNetwork.length === 0 && hasServerInit)
            ? portWithNetwork[SingleData.pathList[index].serviceId] : portInNetwork;

          return (<div className="domain-network-wrap" key={data.pathIndex}>
            <FormItem
              className="domain-network-item"
              {...formItemLayout}
              key={data.pathIndex}
            >
              {getFieldDecorator(`path-${data.pathIndex}`, {
                rules: [{
                  validator: this.checkPath,
                }],
                initialValue: SingleData && this.state.initServiceLen > index
                  ? SingleData.pathList[index].path.slice(1) : '',
              })(
                <Input
                  prefix="/"
                  onChange={this.checkAllPath.bind(this, true)}
                  disabled={!(form.getFieldValue('domain'))}
                  maxLength={10}
                  label={intl.formatMessage({ id: 'domain.column.path' })}
                  size="default"
                />,
              )}
            </FormItem>
            <FormItem
              className="domain-network-item"
              {...formItemLayout}
            >
              {getFieldDecorator(`network-${data.networkIndex}`, {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: 'required' }),
                }, {
                  validator: this.checkService,
                }],
                initialValue: initNetwork,
              })(
                <Select
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  disabled={!(getFieldValue('envId'))}
                  filter
                  label={intl.formatMessage({ id: 'domain.column.network' })}
                  showSearch
                  dropdownMatchSelectWidth
                  onSelect={this.handleSelectNetwork.bind(this, network)}
                  size="default"
                  optionFilterProp="children"
                  optionLabelProp="children"
                  filterOption={
                    (input, option) => option.props.children[1]
                      .toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {this.state[data.pathIndex].deletedService.map(datas => (<Option value={datas.id} key={`${datas.id}-network`}>
                    {<React.Fragment>
                      {datas.status && datas.status === 'deleted' ? <div className={datas.status && datas.status === 'deleted' && 'c7n-domain-create-status c7n-domain-create-status_deleted'}>
                        {datas.status && datas.status === 'deleted' && <div>{intl.formatMessage({ id: 'deleted' })}</div>}
                      </div> : <React.Fragment>
                        {datas.status && datas.status === 'failed' ? <div className={datas.status && datas.status === 'failed' && 'c7n-domain-create-status c7n-domain-create-status_failed'}>
                          {datas.status && datas.status === 'failed' && <div>{intl.formatMessage({ id: 'failed' })}</div> }
                        </div> : <div className={datas.status && datas.status === 'operating' && 'c7n-domain-create-status c7n-domain-create-status_operating'}>
                          {datas.status && datas.status === 'operating' && <div>{intl.formatMessage({ id: 'operating' })}</div>}
                        </div> }
                      </React.Fragment> }
                    </React.Fragment>}
                    {datas.name}</Option>))}
                  {network.map(datas => (<Option value={datas.id} key={`${datas.id}-network`}>
                    <div className="c7n-domain-create-status c7n-domain-create-status_running">
                      <div>{intl.formatMessage({ id: 'running' })}</div>
                    </div>
                    {datas.name}</Option>))}
                </Select>,
              )}
            </FormItem>
            <FormItem
              className="domain-network-item"
              {...formItemLayout}
            >
              {getFieldDecorator(`port-${data.portIndex}`, {
                trigger: ['onChange', 'onSubmit'],
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: 'required' }),
                }, {
                  validator: this.checkPorts.bind(this, portOption),
                }],
                initialValue: initPort,
              })(<Select
                getPopupContainer={triggerNode => triggerNode.parentNode}
                disabled={!(getFieldValue(`network-${data.networkIndex}`))}
                filter
                label={intl.formatMessage({ id: 'domain.column.port' })}
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
            { pathArr.length > 1 ? <Button shape="circle" className="c7n-domain-icon-delete" onClick={this.removePath.bind(this, index)}>
              <i className="icon icon-delete" />
            </Button> : <i className="icon icon-delete c7n-app-icon-disabled" />}
          </div>);
        })}
        <div className="c7n-domain-btn-wrapper">
          <Tooltip title={addStatus ? intl.formatMessage({ id: 'domain.path.isnull' }) : ''}>
            <Button className="c7n-domain-btn" onClick={this.addPath} type="primary" disabled={addStatus} icon="add">{intl.formatMessage({ id: 'domain.path.add' })}</Button>
          </Tooltip>
        </div>
      </Form>
    </div>) : null;
    return (
      <Sidebar
        okText={type === 'create' ? intl.formatMessage({ id: 'create' }) : intl.formatMessage({ id: 'save' })}
        cancelText={intl.formatMessage({ id: 'cancel' })}
        visible={visible}
        title={title}
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
        className="c7n-podLog-content"
        confirmLoading={this.state.submitting}
      >
        {visible ? contentDom : null}
      </Sidebar>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(CreateDomain)));
