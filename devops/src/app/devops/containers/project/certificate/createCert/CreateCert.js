import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { stores, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Form, Select, Input, Modal, Icon, Radio, Upload } from 'choerodon-ui';
import '../../../main.scss';
import './CreateCert.scss';

const HEIGHT = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

const { AppState } = stores;
const { Sidebar } = Modal;
const { Item: FormItem } = Form;
const { Option, OptGroup } = Select;
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
@observer
class CreateCert extends Component {
  /**
   * 与域名相同的校验
   */
  checkName =_.debounce((rule, value, callback) => {
    const p = /^([a-z0-9]([-a-z0-9]?[a-z0-9])*)$/;
    const { intl } = this.props;
    if (p.test(value)) {
      const { store, form } = this.props;
      const { id: projectId } = AppState.currentMenuType;
      const envId = form.getFieldValue('envId');
      store.checkCertName(projectId, value, envId)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback(intl.formatMessage({ id: 'ctf.name.check.exist' }));
          }
        })
        .catch(() => callback());
    } else {
      callback(intl.formatMessage({ id: 'ctf.names.check.failed' }));
    }
  }, 1000);

  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      type: 'request',
      keyLoad: false,
      certLoad: false,
    };
    this.domainCount = 1;
  }

  componentDidMount() {
    const { store } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    store.loadEnvData(projectId);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { form, store } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    this.setState({ submitting: true });
    form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        if (data.type === 'upload') {
          const { key, cert } = data;
          const formdata = new FormData();
          _.forEach(data, (value, k) => {
            if (k !== 'domainArr' && k !== 'key' && k !== 'cert') {
              formdata.append(k, value);
            }
          });
          formdata.append('key', key[0]);
          formdata.append('cert', cert[0]);
          const p = store.createCert(projectId, formdata);
          this.handleResponse(p);
        } else if (data.type === 'request') {
          const formdata = new FormData();
          _.forEach(data, (value, k) => {
            if (k !== 'domainArr' && k !== 'key' && k !== 'cert') {
              formdata.append(k, value);
            }
          });
          const p = store.createCert(projectId, formdata);
          this.handleResponse(p);
        }
      } else {
        this.setState({ submitting: false });
      }
    });
  };

  /**
   * 处理创建证书请求所返回的数据
   * @param promise
   */
  handleResponse = (promise) => {
    const { store, envId } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    promise.then((res) => {
      this.setState({ submitting: false });
      if (res && res.failed) {
        Choerodon.prompt(res.message);
      } else {
        const initSize = HEIGHT <= 900 ? 10 : 15;
        const filter = {
          page: 0,
          pageSize: initSize,
          postData: { searchParam: {}, param: '' },
          sorter: {
            field: 'id',
            columnKey: 'id',
            order: 'descend',
          },
          param: [],
          createDisplay: false,
        };
        store.setTableFilter(filter);
        store.loadCertData(projectId, 0, initSize, { field: 'id', order: 'descend' }, { searchParam: {}, param: '' }, envId);
        this.handleClose(true);
      }
    }).catch((error) => {
      Choerodon.handleResponseError(error);
      this.setState({ submitting: false });
    });
  };

  /**
   * 关闭弹框
   */
  handleClose = (isload = true) => {
    const { onClose } = this.props;
    onClose(isload);
  };

  /**
   * 域名格式检查
   * @param rule
   * @param value
   * @param callback
   */
  checkDomain = (rule, value, callback) => {
    const { intl, form } = this.props;
    const { getFieldValue } = form;
    const p = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)+)$/;
    const keyCount = _.countBy(getFieldValue('domains'));
    if (p.test(value)) {
      if (keyCount[value] < 2) {
        callback();
      } else {
        callback(intl.formatMessage({ id: 'ctf.domain.check.repeat' }));
      }
    } else {
      callback(intl.formatMessage({ id: 'ctf.domain.check.failed' }));
    }
  };

  /**
   * 添加域名
   */
  addDomain = () => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const keys = getFieldValue('domainArr');
    const uuid = this.domainCount;
    const nextKeys = _.concat(keys, uuid);
    this.domainCount = uuid + 1;
    setFieldsValue({
      domainArr: nextKeys,
    });
  };

  /**
   * 删除一个域名
   * @param k
   */
  removeGroup = (k) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    const keys = getFieldValue('domainArr');
    if (keys.length === 1) {
      return;
    }
    setFieldsValue({
      domainArr: _.filter(keys, key => key !== k),
    });
  };

  /**
   * 获取环境选择器的元素节点
   * @param node
   */
  envSelectRef = (node) => {
    if (node) {
      this.envSelect = node.rcSelect;
    }
  };

  /**
   * 切换参数类型
   * @param e
   */
  handleTypeChange = e => this.setState({ type: e.target.value });

  /**
   * 表单中Upload的onChange
   * 响应 上传、删除
   * @param type
   * @param e
   * @returns {*}
   */
  handleUpload = (type, e) => {
    const { file, fileList } = e;
    const keyFileList = [];
    const fileLoadType = type === '.key' ? 'keyLoad' : 'certLoad';
    this.setState({ [fileLoadType]: true });
    if (_.isArray(e)) {
      return e;
    } else if (fileList.length) {
      // 上传，且只能上传一个文件
      const isType = file.name.endsWith(type);
      if (!isType) {
        this.setState({ [fileLoadType]: false });
      } else {
        keyFileList.push(file);
        this.setState({ [fileLoadType]: true });
      }
    } else {
      // 移除
      this.setState({ [fileLoadType]: false });
    }
    return keyFileList;
  };

  /**
   * 始终返回false，阻止自动上传
   * @param type
   * @param file
   * @returns {boolean}
   */
  beforeUploadFile = (type, file) => {
    const { intl } = this.props;
    const isKeyFile = file.name.endsWith(type);
    if (!isKeyFile) {
      Choerodon.prompt(intl.formatMessage({ id: 'file.type.error' }));
    } else {
      Choerodon.prompt(`${file.name} ${intl.formatMessage({ id: 'file.uploaded.success' })}`);
    }
    return false;
  };

  render() {
    const { visible, form, intl, store, onClose, envId } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { submitting, type, keyLoad, certLoad } = this.state;
    const { name: menuName, id: projectId } = AppState.currentMenuType;
    // 上传配置
    const uploadKeyProps = {
      action: '//jsonplaceholder.typicode.com/posts/',
      beforeUpload: this.beforeUploadFile.bind(this, '.key'),
      multiple: false,
    };
    const uploadCertProps = {
      action: '//jsonplaceholder.typicode.com/posts/',
      beforeUpload: this.beforeUploadFile.bind(this, '.crt'),
      multiple: false,
    };
    getFieldDecorator('domainArr', { initialValue: [0] });
    // 设置环境选择器自动聚焦
    // if (this.envSelect && !getFieldValue('envId')) {
    //   this.envSelect.focus();
    // }
    const domainArr = getFieldValue('domainArr');
    const domainItems = _.map(domainArr, (k, index) => (<div key={`domains-${k}`} className="creation-panel-group">
      <FormItem
        className={`c7n-select_${domainArr.length > 1 ? 454 : 480} creation-form-item`}
        {...formItemLayout}
      >
        {getFieldDecorator(`domains[${k}]`, {
          rules: [{
            required: true,
            message: intl.formatMessage({ id: 'required' }),
          }, {
            validator: this.checkDomain,
          }],
        })(
          <Input
            type="text"
            maxLength={50}
            label={<FormattedMessage id="ctf.config.domain" />}
          />,
        )}
      </FormItem>
      {domainArr.length > 1 ? (<Icon className="creation-panel-icon" type="delete" onClick={() => this.removeGroup(k)} />) : null}
    </div>));
    const env = store.getEnvData;
    return (<div className="c7n-region">
      <Sidebar
        destroyOnClose
        cancelText={<FormattedMessage id="cancel" />}
        okText={<FormattedMessage id="create" />}
        title={<FormattedMessage id="ctf.sidebar.create" />}
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleClose.bind(this, false)}
        confirmLoading={submitting}
      >
        <Content code="ctf.create" values={{ name: menuName }} className="c7n-ctf-create sidebar-content">
          <Form layout="vertical">
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('envId', {
                initialValue: env.length ? envId : undefined,
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: 'required' }),
                }],
              })(<Select
                ref={this.envSelectRef}
                className="c7n-select_512"
                label={<FormattedMessage id="ctf.envName" />}
                placeholder={intl.formatMessage({ id: 'ctf.env.placeholder' })}
                optionFilterProp="children"
                onSelect={this.handleEnvSelect}
                getPopupContainer={triggerNode => triggerNode.parentNode}
                filterOption={(input, option) => option.props.children[1]
                  .toLowerCase().indexOf(input.toLowerCase()) >= 0}
                filter
                showSearch
              >
                {_.map(env, (item) => {
                  const { id, connect, name } = item;
                  return (<Option key={id} value={id} disabled={!connect}>
                    {connect ? <span className="env-status-success" /> : <span className="env-status-error" />}
                    {name}
                  </Option>);
                })}
              </Select>)}
            </FormItem>
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('certName', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: 'required' }),
                }, {
                  validator: this.checkName,
                }],
              })(
                <Input
                  disabled={!getFieldValue('envId')}
                  maxLength={40}
                  type="text"
                  label={<FormattedMessage id="ctf.name" />}
                />,
              )}
            </FormItem>
            <div className="c7n-creation-title">
              <Icon type="settings" />
              <FormattedMessage id="ctf.config" />
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
                  initialValue: 'request',
                })(<RadioGroup
                  name="type"
                  onChange={this.handleTypeChange}
                >
                  <Radio value="request"><FormattedMessage id="ctf.apply" /></Radio>
                  <Radio value="upload"><FormattedMessage id="ctf.upload" /></Radio>
                </RadioGroup>)}
              </FormItem>
            </div>
            <div className="c7n-creation-panel">
              {domainItems}
              <FormItem
                className="c7n-select_480 creation-panel-button"
                {...formItemLayout}
              >
                <Button
                  type="primary"
                  funcType="flat"
                  onClick={this.addDomain}
                  icon="add"
                ><FormattedMessage id="ctf.config.add" /></Button>
              </FormItem>
              {type === 'upload' ? (<Fragment>
                <div className="ctf-upload-head">
                  <p className="ctf-upload-title"><FormattedMessage id="ctf.add.cert" /></p>
                  <p className="ctf-upload-text"><FormattedMessage id="ctf.add.describe" /></p>
                </div>
                <div className="ctf-upload-item">
                  <FormItem
                    label={<FormattedMessage id="ctf.keyFile" />}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('key', {
                      valuePropName: 'fileList',
                      getValueFromEvent: this.handleUpload.bind(this, '.key'),
                      rules: [{
                        required: true,
                        message: intl.formatMessage({ id: 'ctf.key.required' }),
                      }],
                    })(<Upload disabled={keyLoad} {...uploadKeyProps}>
                      <Button
                        disabled={keyLoad}
                        className="ctf-upload-button"
                      >
                        <Icon type="file_upload" />
                        <FormattedMessage id="ctf.keyFile" />
                      </Button>
                    </Upload>)}
                  </FormItem>
                </div>
                <div className="ctf-upload-item">
                  <FormItem
                    label={<FormattedMessage id="ctf.certFile" />}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('cert', {
                      valuePropName: 'fileList',
                      getValueFromEvent: this.handleUpload.bind(this, '.crt'),
                      rules: [{
                        required: true,
                        message: intl.formatMessage({ id: 'ctf.cert.required' }),
                      }],
                    })(<Upload disabled={certLoad} {...uploadCertProps}>
                      <Button
                        disabled={certLoad}
                        className="ctf-upload-button"
                      >
                        <Icon type="file_upload" />
                        <FormattedMessage id="ctf.certFile" />
                      </Button>
                    </Upload>)}
                  </FormItem>
                </div>
              </Fragment>) : null}
            </div>
          </Form>
        </Content>
      </Sidebar>
    </div>);
  }
}

export default Form.create({})(injectIntl(CreateCert));
