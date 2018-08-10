import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Select, Input, Modal, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { stores, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import '../../../main.scss';
import './CreateDomain.scss';

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
const Sidebar = Modal.Sidebar;
const { AppState } = stores;

@observer
class CreateDomain extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      pathArr: [{ pathIndex: 0, networkIndex: 0 }],
      projectId: menu.id,
      show: false,
      0: { deletedService: [] },
      env: { loading: false, dataSource: [] },
      initServiceLen: 0,
    };
  }
  componentDidMount() {
    const { store, id, visible, envId } = this.props;
    if (id && visible) {
      store.loadDataById(this.state.projectId, id)
        .then((data) => {
          this.setState({ SingleData: data });
          const len = data.pathList.length;
          for (let i = 0; i < len; i += 1) {
            const list = data.pathList[i];
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
          this.setState({ initServiceLen: len });
          this.initPathArr(data.pathList.length);
          store.loadNetwork(this.state.projectId, data.envId);
        });
    }
    if (envId) {
      this.selectEnv(envId);
    }
    store.loadEnv(this.state.projectId)
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
    const { store, id, type } = this.props;
    const { projectId, initServiceLen, SingleData } = this.state;
    const service = store.getNetwork;
    this.props.form.validateFieldsAndScroll((err, data, modify) => {
      if (type === 'create') {
        if (!err) {
          const keys = Object.keys(data);
          const postData = { domain: data.domain, name: data.name, envId: data.envId };
          const pathList = [];
          keys.map((k) => {
            if (k.includes('path')) {
              const index = parseInt(k.split('-')[1], 10);
              const value = data[`network-${index}`];
              pathList.push({ path: `/${data[k]}`, serviceId: value });
            }
            return pathList;
          });
          postData.pathList = pathList;
          this.setState({ submitting: true });
          store.addData(projectId, postData)
            .then((datasss) => {
              if (datasss) {
                this.handleClose();
              }
              this.setState({ submitting: false });
            }).catch(() => {
              this.setState({ submitting: false });
              Choerodon.prompt(err.response.data.message);
            });
        }
      } else {
        if ((!err && modify) || (!err && initServiceLen !== SingleData.pathList.length)) {
          const keys = Object.keys(data);
          const postData = { domain: data.domain, name: data.name, envId: data.envId };
          const pathList = [];
          keys.map((k) => {
            if (k.includes('path')) {
              const index = parseInt(k.split('-')[1], 10);
              const value = data[`network-${index}`];
              const path = data[k].split('/')[data[k].split('/').length - 1];
              pathList.push({ path: `/${path}`, serviceId: value });
            }
            return pathList;
          });
          postData.pathList = pathList;
          postData.domainId = id;
          this.setState({ submitting: true });
          store.updateData(projectId, id, postData)
            .then((datass) => {
              if (datass) {
                this.handleClose();
              }
              this.setState({ submitting: false });
            }).catch(() => {
              this.setState({ submitting: false });
              Choerodon.prompt(err.response.data.message);
            });
        } else if (!modify && !err) {
          this.handleClose();
        }
      }
    });
  };

  /**
   * 添加路径
   */
  addPath =() => {
    const pathArr = this.state.pathArr;
    let index = 0;
    if (pathArr.length) {
      index = pathArr[pathArr.length - 1].pathIndex + 1;
      pathArr.push(
        {
          pathIndex: pathArr[pathArr.length - 1].pathIndex + 1,
          networkIndex: pathArr[pathArr.length - 1].pathIndex + 1,
        });
      this.checkAllPath(true);
    } else {
      index = 0;
      pathArr.push({
        pathIndex: 0,
        networkIndex: 0,
      });
    }
    this.setState({ pathArr, [index]: { deletedService: this.state[index - 1].deletedService } });
  };
  /**
   * 删除路径
   * @param index 路径数组的索引
   */
  removePath =(index) => {
    const pathArr = this.state.pathArr;
    pathArr.splice(index, 1);
    this.setState({ pathArr, initServiceLen: this.state.initServiceLen - 1 });
  };
  /**
   * 选择环境
   * @param value
   */
  selectEnv = (value) => {
    this.setState({ envId: value });
    const { store } = this.props;
    store.loadNetwork(this.state.projectId, value);
    this.props.form.resetFields();
    this.setState({
      pathArr: [{ pathIndex: 0, networkIndex: 0 }],
      0: { deletedService: [] },
      initServiceLen: 0,
      SingleData: null,
    });
  };

  /**
   * 关闭弹框
   */
  handleClose =() => {
    const { store } = this.props;
    this.setState({ show: false });
    store.setEnv([]);
    store.setNetwork([]);
    this.props.onClose();
  };
  /**
   * 检查名称的唯一性
   * @type {Function}
   */
  checkName =_.debounce((rule, value, callback) => {
    const p = /^([a-z0-9]([-a-z0-9]?[a-z0-9])*)$/;
    const { SingleData } = this.state;
    if (SingleData && SingleData.name === value) {
      callback();
    } else {
      if (p.test(value)) {
        const { store } = this.props;
        const envId = this.props.form.getFieldValue('envId');
        if (envId) {
          store.checkName(this.state.projectId, value, envId)
            .then((data) => {
              if (data) {
                callback();
              } else {
                callback(this.props.intl.formatMessage({ id: 'domain.name.check.exist' }));
              }
            })
            .catch(() => callback());
        } else {
          callback(this.props.intl.formatMessage({ id: 'network.form.app.disable' }));
        }
      } else {
        callback(this.props.intl.formatMessage({ id: 'domain.names.check.failed' }));
      }
    }
  }, 1000);
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
    if (paths.includes(`/${value}`) && !value) {
      callback(this.props.intl.formatMessage({ id: 'domain.path.check.exist' }));
    } else if (value) {
      if (patt.test(value)) {
        if (paths.includes(`/${value}`)) {
          callback(this.props.intl.formatMessage({ id: 'domain.path.check.exist' }));
        } else {
          const { store } = this.props;
          if (this.props.type === 'edit' && this.state.initServiceLen > index) {
            const id = this.state.SingleData.id;
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
  checkDomain =(rule, value, callback) => {
    const patt = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*)$/;
    if (patt.test(value)) {
      callback();
    } else {
      callback(this.props.intl.formatMessage({ id: 'domain.name.check.failed' }));
    }
    const { pathArr } = this.state;
    const fields = [];
    pathArr.map((path) => {
      fields.push(`path-${path.pathIndex}`);
      return fields;
    });
    this.props.form.validateFields(fields, { force: true });
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

  render() {
    const { store } = this.props;
    const { getFieldDecorator } = this.props.form;
    const menu = AppState.currentMenuType;
    const network = store.getNetwork;
    const { pathArr, SingleData } = this.state;
    const form = this.props.form;
    let addStatus = true;
    // 判断path是否有值
    if (pathArr.length) {
      const hasValue = form.getFieldValue(`path-${pathArr[pathArr.length - 1].pathIndex}`) || (SingleData && SingleData.pathList);
      if (hasValue) {
        addStatus = false;
      }
    }
    const title = this.props.type === 'create' ? <h2 className="c7n-space-first"><FormattedMessage id={'domain.create.title'} values={{ name: menu.name }} /></h2> : <h2 className="c7n-space-first"><FormattedMessage id={'domain.update.title'} values={{ name: SingleData && SingleData.name }} /></h2>;
    const content = this.props.type === 'create' ? this.props.intl.formatMessage({ id: 'domain.create.description' }) :
      this.props.intl.formatMessage({ id: 'domain.update.description' });
    const envId = this.props.envId ? Number(this.props.envId) : undefined;
    const contentDom = this.props.visible ? (<div className="c7n-region c7n-domainCreate-wrapper">
      {title}
      <div className="page-content-header">
        <p className="description">
          {content}
          <a href={this.props.intl.formatMessage({ id: 'domain.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
            <FormattedMessage id={'learnmore'} />
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
              message: this.props.intl.formatMessage({ id: 'required' }),
              // transform: value => value && value.toString(),
            }],
            initialValue: SingleData ? SingleData.envId : envId,
          })(
            <Select
              dropdownClassName="c7n-domain-env"
              onFocus={this.loadEnv}
              loading={this.state.env.loading}
              filter
              getPopupContainer={triggerNode => triggerNode.parentNode}
              onSelect={this.selectEnv}
              showSearch
              label={this.props.intl.formatMessage({ id: 'domain.column.env' })}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children[2].toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {this.state.env.dataSource.map(v => (
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
              message: this.props.intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkName,
            }],
            initialValue: SingleData ? SingleData.name : '',
          })(
            <Input
              disabled={!(this.props.form.getFieldValue('envId')) || (SingleData && SingleData.name)}
              maxLength={40}
              label={this.props.intl.formatMessage({ id: 'domain.column.name' })}
              size="default"
            />,
          )}
        </FormItem>
        <FormItem
          className="c7n-domain-formItem"
          {...formItemLayout}
        >
          {getFieldDecorator('domain', {
            rules: [{
              required: true,
              whitespace: true,
              message: this.props.intl.formatMessage({ id: 'required' }),
            }, {
              validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.domain : '',
          })(
            <Input
              disabled={!(this.props.form.getFieldValue('envId'))}
              maxLength={50}
              label={this.props.intl.formatMessage({ id: 'domain.form.domain' })}
              size="default"
            />,
          )}
        </FormItem>
        {pathArr.length >= 1 && pathArr.map((data, index) => (<div key={data.pathIndex}>
          <FormItem
            className="c7n-formItem_180"
            {...formItemLayout}
            key={data.pathIndex}
          >
            {getFieldDecorator(`path-${data.pathIndex}`, {
              rules: [{
                // required: true,
                // message: this.props.intl.formatMessage({ id: 'required' }),
              }, {
                validator: this.checkPath,
              },
              ],
              initialValue: SingleData && this.state.initServiceLen > index
                ? SingleData.pathList[index].path.slice(1) : '',
            })(
              <Input
                prefix={'/'}
                onChange={this.checkAllPath.bind(this, true)}
                disabled={!(this.props.form.getFieldValue('domain'))}
                maxLength={10}
                label={this.props.intl.formatMessage({ id: 'domain.column.path' })}
                size="default"
              />,
            )}
          </FormItem>
          <FormItem
            className="c7n-formItem_312"
            {...formItemLayout}
          >
            {getFieldDecorator(`network-${data.networkIndex}`, {
              rules: [{
                required: true,
                message: this.props.intl.formatMessage({ id: 'required' }),
              }, {
                validator: this.checkService,
              }],
              initialValue: SingleData && this.state.initServiceLen > index
                ? SingleData.pathList[index].serviceId : undefined,
            })(
              <Select
                getPopupContainer={triggerNode => triggerNode.parentNode}
                disabled={!(this.props.form.getFieldValue('envId'))}
                filter
                label={this.props.intl.formatMessage({ id: 'domain.column.network' })}
                showSearch
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
                {this.state[data.pathIndex].deletedService.map(datas => (<Option value={datas.id} key={`${datas.id}-network`}>
                  {<React.Fragment>
                    {datas.status && datas.status === 'deleted' ? <div className={datas.status && datas.status === 'deleted' && 'c7n-domain-create-status c7n-domain-create-status_deleted'}>
                      {datas.status && datas.status === 'deleted' && <div>{this.props.intl.formatMessage({ id: 'deleted' })}</div>}
                    </div> : <React.Fragment>
                      {datas.status && datas.status === 'failed' ? <div className={datas.status && datas.status === 'failed' && 'c7n-domain-create-status c7n-domain-create-status_failed'}>
                        {datas.status && datas.status === 'failed' && <div>{this.props.intl.formatMessage({ id: 'failed' })}</div> }
                      </div> : <div className={datas.status && datas.status === 'operating' && 'c7n-domain-create-status c7n-domain-create-status_operating'}>
                        {datas.status && datas.status === 'operating' && <div>{this.props.intl.formatMessage({ id: 'operating' })}</div>}
                      </div> }
                    </React.Fragment> }
                  </React.Fragment>}
                  {datas.name}</Option>),
                )}
                {network.map(datas => (<Option value={datas.id} key={`${datas.id}-network`}>
                  <div className={'c7n-domain-create-status c7n-domain-create-status_running'}>
                    <div>{this.props.intl.formatMessage({ id: 'running' })}</div>
                  </div>
                  {datas.name}</Option>),
                )}
              </Select>,
            )}
          </FormItem>
          { pathArr.length > 1 ? <Button shape="circle" className="c7n-domain-icon-delete" onClick={this.removePath.bind(this, index)}>
            <span className="icon icon-delete" />
          </Button> : <span className="icon icon-delete c7n-app-icon-disabled" />}
        </div>))}
        <div className="c7n-domain-btn-wrapper">
          <Tooltip title={addStatus ? this.props.intl.formatMessage({ id: 'domain.path.isnull' }) : ''}>
            <Button className="c7n-domain-btn" onClick={this.addPath} type="primary" disabled={addStatus} icon="add">{this.props.intl.formatMessage({ id: 'domain.path.add' })}</Button>
          </Tooltip>
        </div>
      </Form>
    </div>) : null;
    return (
      <Sidebar
        okText={this.props.type === 'create' ? this.props.intl.formatMessage({ id: 'create' }) : this.props.intl.formatMessage({ id: 'save' })}
        cancelText={this.props.intl.formatMessage({ id: 'cancel' })}
        visible={this.props.visible}
        title={this.props.title}
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
        className="c7n-podLog-content"
        confirmLoading={this.state.submitting}
      >
        {this.props.visible ? contentDom : null}
      </Sidebar>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(CreateDomain)));
