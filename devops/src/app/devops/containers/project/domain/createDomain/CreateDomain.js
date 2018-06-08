import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Select, Input, Modal } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
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
    };
  }
  componentDidMount() {
    const { store, id, visible } = this.props;
    if (id && visible) {
      store.loadDataById(this.state.projectId, id)
        .then((data) => {
          this.initPathArr();
          // 存在一个异步
          // store.loadNetwork(this.state.projectId, data.envId);
          this.setState({ SingleData: data });
        });
    }
    store.loadEnv(this.state.projectId);
  }

  initPathArr = () => {
    const { store } = this.props;
    const length = store.getDto.slice().length;
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
   * 提交数据
   * @param e
   */
  handleSubmit =(e) => {
    e.preventDefault();
    const { store, id, type } = this.props;
    const { projectId } = this.state;
    const service = store.getNetwork;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const keys = Object.keys(data);
        const postData = { domain: data.domain, name: data.name, envId: data.envId };
        const pathList = [];
        keys.map((k) => {
          if (k.includes('path')) {
            const index = parseInt(k.split('-')[1], 10);
            const value = data[`network-${index}`];
            // let ids;
            // _.map(service, (s) => {
            //   if (s.name === name) {
            //     ids = s.id;
            //   }
            // });
            // window.console.log(ids);
            pathList.push({ path: `${data[k]}`, serviceId: value });
          }
          return pathList;
        });
        postData.pathList = pathList;
        // window.console.log(postData);
        if (type === 'create') {
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
        } else {
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
        }
      }
    });
  };

  /**
   * 添加路径
   */
  addPath =() => {
    const { store } = this.props;
    const data = store.getDto;
    const pathArr = this.state.pathArr;
    if (pathArr.length) {
      pathArr.push(
        {
          pathIndex: pathArr[pathArr.length - 1].pathIndex + 1,
          networkIndex: pathArr[pathArr.length - 1].pathIndex + 1,
        });
    } else {
      pathArr.push({
        pathIndex: 0,
        networkIndex: 0,
      });
    }
    this.setState({ pathArr });
  };
  /**
   * 删除路径
   * @param index 路径数组的索引
   */
  removeDomain =(index) => {
    const { store } = this.props;
    const data = store.getDto;
    if (data.length === 1) {
      store.setDto([]);
    }
    const pathArr = this.state.pathArr;
    // const pathArr = data.length ? data : this.state.pathArr;
    pathArr.splice(index, 1);
    this.setState({ pathArr });
  };
  /**
   * 选择环境
   * @param value
   */
  selectEnv = (value) => {
    this.setState({ envId: value });
    const { store } = this.props;
    store.loadNetwork(this.state.projectId, value);
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
    // const p = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    const { SingleData } = this.state;
    if (SingleData && SingleData.name === value) {
      callback();
    } else {
      const { store } = this.props;
      const envId = this.props.form.getFieldValue('envId');
      if (envId) {
        store.checkName(this.state.projectId, value, envId)
          .then((data) => {
            if (data) {
              callback();
            } else {
              callback('名称已存在');
            }
          })
          .catch(() => callback());
      } else {
        callback('请先选环境');
      }
    }
  }, 1000);

  /**
   * 检查域名和路径组合的唯一性
   * @type {Function}
   */
  checkPath =_.debounce((rule, value, callback) => {
    const { pathArr } = this.state;
    const dto = this.props.store.getDto;
    const domain = this.props.form.getFieldValue('domain');
    const index = parseInt(rule.field.split('-')[1], 10);
    const p = /^\//;
    let check = true;
    if (pathArr.length) {
      for (let i = 0; i < pathArr.length; i += 1) {
        const paths = this.props.form.getFieldValue(`path-${pathArr[i].pathIndex}`);
        if (paths === value && i !== index) {
          callback('路径在该域名路径下已存在，请更改域名路径或者路径');
          check = false;
          return;
        }
      }
    }
    if (check && domain && p.test(value) && !dto.length) {
      const { store } = this.props;
      store.checkPath(this.state.projectId, domain, value)
        .then((data) => {
          if (data) {
            callback();
          } else {
            callback('路径在该域名路径下已存在，请更改域名路径或者路径');
          }
        })
        .catch((error) => {
          callback();
        });
    } else if (!domain) {
      callback('请先填域名路径');
    } else if (!p.test(value)) {
      callback('路径必须以/开头');
    } else {
      callback();
    }
  }, 1000);
  /**
   * 检查域名是否符合规则
   * @type {Function}
   */
  checkDomain =_.debounce((rule, value, callback) => {
    const p = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    if (p.test(value)) {
      callback();
    } else {
      callback('域名只能包含小写字母，数字、"-"、".",且以小写字母或数字开头');
    }
  }, 500);

  render() {
    const { store } = this.props;
    const { getFieldDecorator } = this.props.form;
    const menu = AppState.currentMenuType;
    const network = store.getNetwork;
    const env = store.getEnv;
    const form = this.props.form;
    const dto = store.getDto;
    let hasPath = false;
    let addStatus = false;
    const { pathArr, SingleData } = this.state;
    // 判断path是否有值
    if (this.state.pathArr.length) {
      const hasValue = form.getFieldValue(`path-${this.state.pathArr[this.state.pathArr.length - 1].pathIndex}`);
      if (hasValue) {
        hasPath = true;
      }
    }
    if (hasPath || pathArr.length === 0) {
      addStatus = true;
    }
    const title = this.props.type === 'create' ? <h2 className="c7n-space-first">在项目&quot;{menu.name}&quot;中创建域名</h2> : <h2 className="c7n-space-first">对域名&quot;{SingleData && SingleData.name}&quot;进行修改</h2>;
    const content = this.props.type === 'create' ? '请选择环境，填写网络名称、地址、路径，并选择网络配置域名访问规则' :
      '您可在此修改域名配置信息';
    const contentDom = this.props.visible ? (<div className="c7n-region c7n-domainCreate-wrapper">
      {title}
      <p>
        {content}
        <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/ingress/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
          <span className="c7n-external-link-content">
              了解详情
          </span>
          <span className="icon icon-open_in_new" />
        </a>
      </p>
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FormItem
          className="c7n-domain-formItem"
          {...formItemLayout}
        >
          {getFieldDecorator('envId', {
            rules: [{
              required: true,
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              transform: (value) => { return value && value.toString() },
            }],
            initialValue: SingleData ? SingleData.envId : undefined,
          })(
            <Select
              dropdownClassName="c7n-domain-env"
              autoFocus
              filter
              onSelect={this.selectEnv}
              showSearch
              label="环境名称"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children[2].toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {env.length && env.map(v => (
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
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkName,
            }],
            initialValue: SingleData ? SingleData.name : '',
          })(
            <Input
              maxLength={30}
              label={Choerodon.getMessage('域名名称', 'name')}
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
              message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
            }, {
              validator: this.checkDomain,
            }],
            initialValue: SingleData ? SingleData.domain : '',
          })(
            <Input
              maxLength={50}
              label={Choerodon.getMessage('域名地址', 'domain')}
              size="default"
            />,
          )}
        </FormItem>
        {pathArr.length >= 1 && pathArr.map((data, index) => (<div key={data.pathIndex}>
          <FormItem
            className="c7n-formItem_180"
            {...formItemLayout}
          >
            {getFieldDecorator(`path-${data.pathIndex}`, {
              rules: [{
                required: true,
              }, {
                validator: this.checkPath,
              },
              ],
              initialValue: SingleData && dto.length > index
                ? dto[index].path : '/',
            })(
              <Input
                maxLength={10}
                label={Choerodon.languageChange('domain.path')}
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
                transform: (value) => { return value && value.toString() },
                message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
              }],
              initialValue: SingleData && dto.length > index
                ? dto[index].serviceId : undefined,
            })(
              <Select
                filter
                label={Choerodon.getMessage('网络', 'network')}
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
                {network.map(datas => (<Option value={datas.id} key={`${datas.id}-network`}>
                  {datas.serviceStatus && datas.serviceStatus === 'running' && <div className={datas.serviceStatus && datas.serviceStatus === 'running' && 'c7n-domain-create-status c7n-domain-create-status_running'}>
                    {datas.serviceStatus && datas.serviceStatus === 'running' && <div>正常</div> }
                  </div> }
                  {datas.serviceStatus && datas.serviceStatus === 'deleted' && <div className={datas.serviceStatus && datas.serviceStatus === 'deleted' && 'c7n-domain-create-status c7n-domain-create-status_deleted'}>
                    {datas.serviceStatus && datas.serviceStatus === 'deleted' && <div>已删除</div> }
                  </div> }
                  {datas.serviceStatus && datas.serviceStatus === 'failed' && <div className={datas.serviceStatus && datas.serviceStatus === 'failed' && 'c7n-domain-create-status c7n-domain-create-status_failed'}>
                    {datas.serviceStatus && datas.serviceStatus === 'failed' && <div>失败</div> }
                  </div> }
                  {datas.serviceStatus && datas.serviceStatus === 'operating' && <div className={datas.serviceStatus && datas.serviceStatus === 'operating' && 'c7n-domain-create-status c7n-domain-create-status_operating'}>
                    {datas.serviceStatus && datas.serviceStatus === 'operating' && <div>处理中</div> }
                  </div> }

                  {datas.name}</Option>),
                )}
              </Select>,
            )}
          </FormItem>
          { pathArr.length > 1 ? <Button shape="circle" className="c7n-domain-icon-delete" onClick={this.removeDomain.bind(this, index)}>
            <span className="icon icon-delete" />
          </Button> : <span className="icon icon-delete c7n-app-icon-disabled" />}
        </div>))}
        <div className="c7n-domain-btn-wrapper">
          <Button className="c7n-domain-btn" onClick={this.addPath} type="primary" disabled={!addStatus} icon="add">添加路径</Button>
        </div>
      </Form>
    </div>) : null;
    return (
      <Sidebar
        okText={this.props.type === 'create' ? '创建' : '保存'}
        cancelText="取消"
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

export default Form.create({})(withRouter(CreateDomain));
