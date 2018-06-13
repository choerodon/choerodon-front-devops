/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Form, Tooltip, Modal, Popover } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import classNames from 'classnames';
import CopyToBoard from 'react-copy-to-clipboard';
import Board from './Board';
import LoadingBar from '../../../../components/loadingBar';
import '../../../main.scss';
import './EnvPipeLineHome.scss';

/**
 * 分页查询单页size
 * @type {number}
 */
let scrollLeft = 0;
const FormItem = Form.Item;
const { TextArea } = Input;
const { Sidebar } = Modal;
const { AppState } = stores;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

@observer
class EnvPipelineHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      openRemove: false,
      submitting: false,
      token: null,
      envName: '',
      copyMsg: '复制下文代码至Kubernetes运行，与平台建立链接',
      moveBan: false,
      moveRight: 300,
    };
  }

  componentDidMount() {
    this.loadEnvs();
  }

  /**
   * 刷新函数
   */
  reload = () => {
    this.loadEnvs();
  };

  /**
   * 加载环境数据
   */
  loadEnvs = () => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvPipelineStore.loadEnv(projectId, true);
    EnvPipelineStore.loadEnv(projectId, false);
  };

  /**
   * 环境编码校验
   * @param rule 校验规则
   * @param value code值
   * @param callback 回调提示
   */
  checkCode = _.debounce((rule, value, callback) => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    // eslint-disable-next-line no-useless-escape
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      EnvPipelineStore.loadCode(projectId, value)
        .then((error) => {
          if (error && error.failed) {
            callback(Choerodon.getMessage('编码已存在', 'Code existed.'));
          } else {
            callback();
          }
        });
    } else {
      callback(Choerodon.getMessage('编码只能由小写字母、数字、"-"组成，且以小写字母开头，不能以"-"结尾', 'Code can contain only lowercase letters, digits,"-", must start with lowercase letters and will not end with "-"'));
    }
  }, 1000);

  /**
   * 环境名称校验
   * @param rule 校验规则
   * @param value name值
   * @param callback 回调提示
   */
  checkName = _.debounce((rule, value, callback) => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const envData = EnvPipelineStore.getEnvData;
    if (envData ? value !== envData.name : value) {
      EnvPipelineStore.loadName(projectId, value)
        .then((error) => {
          if (error && error.failed) {
            callback(Choerodon.getMessage('环境名已存在', 'Name existed'));
          } else {
            callback();
          }
        });
    } else {
      callback();
    }
  }, 1000);

  /**
   * 弹出侧边栏
   * @param type 侧边栏内容标识
   */
  showSideBar = (type) => {
    this.props.form.resetFields();
    const { EnvPipelineStore } = this.props;
    EnvPipelineStore.setEnvData(null);
    EnvPipelineStore.setSideType(type);
    EnvPipelineStore.setShow(true);
  };

  /**
   * 关闭侧边栏
   */
  handleCancelFun = () => {
    const { EnvPipelineStore } = this.props;
    const sideType = EnvPipelineStore.getSideType;
    if (sideType === 'token') {
      this.loadEnvs();
    }
    EnvPipelineStore.setEnvData(null);
    EnvPipelineStore.setShow(false);
    this.props.form.resetFields();
  };

  /**
   * 环境启用
   * @param id 环境ID
   */
  actEnv = (id) => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvPipelineStore.banEnvById(projectId, id, true)
      .then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else if (data) {
          this.loadEnvs();
        }
      });
  };

  /**
   * 关闭禁用框
   */
  banCancel = () => {
    const { EnvPipelineStore } = this.props;
    EnvPipelineStore.setBan(false);
  };

  /**
   * 环境禁用
   */
  banEnv = () => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const envId = EnvPipelineStore.getEnvData.id;
    EnvPipelineStore.banEnvById(projectId, envId, false)
      .then((data) => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else if (data) {
          this.loadEnvs();
        }
      });

    EnvPipelineStore.setBan(false);
  };

  /**
   * 辅助函数
   */
  handleCopy =() => {
    this.setState({ copyMsg: '已复制' });
  };

  mouseEnter = () => {
    this.setState({ copyMsg: '复制下文代码至Kubernetes运行，与平台建立链接' });
  };

  /**
   * 表单提交
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const sideType = EnvPipelineStore.getSideType;
    this.setState({
      submitting: true,
    });
    if (sideType === 'create') {
      this.props.form.validateFieldsAndScroll((err, data) => {
        if (!err) {
          this.setState({ submitting: false });
          const envName = data.name;
          EnvPipelineStore.createEnv(projectId, data).then((res) => {
            if (res) {
              if (res && res.failed) {
                this.setState({
                  submitting: false,
                  buttonClicked: false,
                });
                Choerodon.prompt(res.message);
              } else {
                this.loadEnvs();
                EnvPipelineStore.setSideType('token');
                this.setState({ envName, token: res, isLoading: false, submitting: false });
              }
            }
          });
        }
      });
    } else {
      this.props.form.validateFieldsAndScroll((err, data) => {
        if (!err) {
          EnvPipelineStore.setShow(false);
          const id = EnvPipelineStore.getEnvData.id;
          EnvPipelineStore.setSideType('');
          this.setState({ submitting: false });
          EnvPipelineStore.updateEnv(projectId, { ...data, id })
            .then((res) => {
              if (res && res.failed) {
                this.setState({
                  submitting: false,
                  buttonClicked: false,
                });
                Choerodon.prompt(res.message);
              } else if (res) {
                this.loadEnvs();
                EnvPipelineStore.setShow(false);
                this.props.form.resetFields();
                this.setState({ isLoading: false, submitting: false });
              }
            });
        }
      });
    }
  };

  /**
   * 根据type显示右侧框标题
   * @param type
   * @returns {*}
   */
  showTitle = (type) => {
    if (type === 'create') {
      return Choerodon.languageChange('envPl.create');
    } else if (type === 'edit') {
      return Choerodon.languageChange('envPl.edit');
    } else {
      return Choerodon.getMessage('复制指令', 'Copy Token');
    }
  };

  /**
   * 点击右滑动
   */
  pushScrollRight = () => {
    scrollLeft -= 300;
    if (scrollLeft < 0) {
      scrollLeft = 0;
    }
    this.setState({
      moveBan: false,
      moveRight: this.state.moveRight - 300,
    });
    document.getElementsByClassName('c7n-inner-container-ban')[0].scroll({ left: scrollLeft, behavior: 'smooth' });
  };

  /**
   * 点击左滑动
   */
  pushScrollLeft = () => {
    const domPosition = document.getElementsByClassName('c7n-inner-container-ban')[0].scrollLeft;
    this.setState({
      moveRight: domPosition,
    });
    if (this.state.moveRight === domPosition) {
      this.setState({
        moveBan: true,
      });
      scrollLeft = domPosition;
    } else {
      this.setState({
        moveBan: false,
      });
    }
    document.getElementsByClassName('c7n-inner-container-ban')[0].scroll({ left: scrollLeft + 300, behavior: 'smooth' });
    scrollLeft += 300;
  };

  render() {
    const { EnvPipelineStore } = this.props;
    const { getFieldDecorator } = this.props.form;
    const envcardPosition = EnvPipelineStore.getEnvcardPosition;
    const disEnvcardPosition = EnvPipelineStore.getDisEnvcardPosition;
    const envData = EnvPipelineStore.getEnvData;
    const ist = EnvPipelineStore.getIst;
    const shell = EnvPipelineStore.shell;
    const show = EnvPipelineStore.getShow;
    const sideType = EnvPipelineStore.getSideType;
    const showBtns = (sideType === 'create' || sideType === 'edit');
    const ban = EnvPipelineStore.getBan;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    const projectName = AppState.currentMenuType.name;
    let DisEnvDom = (<span className="c7n-none-des">暂无停用环境</span>);
    if (disEnvcardPosition.length) {
      DisEnvDom = _.map(disEnvcardPosition, env =>
        (<div className="c7n-env-card c7n-env-card-ban">
          <div className="c7n-env-card-header">
            {env.name}
            <div className="c7n-env-card-action">
              <Permission
                service={['devops-service.devops-environment.queryByEnvIdAndActive']}
                organizationId={organizationId}
                projectId={projectId}
                type={type}
              >
                <Tooltip title="重启环境">
                  <Button
                    shape="circle"
                    onClick={this.actEnv.bind(this, env.id)}
                  >
                    <span className="icon icon-finished" />
                  </Button>
                </Tooltip>
              </Permission>
            </div>
          </div>
          <div className="c7n-env-state c7n-env-state-ban">
            已停用
          </div>
          <div className="c7n-env-des">
            <span className="c7n-env-des-head">描述：</span>
            {env.description}
          </div>
        </div>));
    }

    const suffix = (<Popover placement="right" trigger="hover" content={this.state.copyMsg}>
      <div onMouseEnter={this.mouseEnter}>
        <CopyToBoard text={shell || this.state.token} onCopy={this.handleCopy}>
          <span className="icon icon-library_books" />
        </CopyToBoard>
      </div>
    </Popover>);

    const formContent =
      (<div className="c7n-region">{
        (() => {
          if (sideType === 'create') {
            return (<div>
              <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的环境创建</h2>
              <p>
                请在下面输入环境编码、名称、描述，创建新环境。新环境默认新增在环境流水线的最后一个节点。
                <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/environment-pipeline/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                  <span className="c7n-external-link-content">
                  了解详情
                  </span>
                  <span className="icon-open_in_new" />
                </a>
              </p>
              <Form className="c7n-sidebar-form" layout="vertical">
                <FormItem
                  {...formItemLayout}
                >
                  {getFieldDecorator('code', {
                    rules: [{
                      required: true,
                      message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                    }, {
                      validator: this.checkCode,
                    }],
                    initialValue: envData ? envData.code : '',
                  })(
                    <Input
                      maxLength={10}
                      label={Choerodon.getMessage('环境编码', 'Environment Code')}
                    />,
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={Choerodon.getMessage('环境名称', 'Environment Name')}
                >
                  {getFieldDecorator('name', {
                    rules: [{
                      required: true,
                      message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                    }, {
                      validator: this.checkName,
                    }],
                    initialValue: envData ? envData.name : '',
                  })(
                    <Input
                      maxLength={10}
                      label={Choerodon.getMessage('环境名称', 'Environment Name')}
                    />,
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={Choerodon.getMessage('环境描述', 'Environment Description')}
                >
                  {getFieldDecorator('description', {
                    initialValue: envData ? envData.description : '',
                  })(
                    <TextArea
                      autosize={{ minRows: 2 }}
                      maxLength={60}
                      label={Choerodon.getMessage('环境描述', 'Environment Description')}
                    />,
                  )}
                </FormItem>
              </Form>
            </div>);
          } else if (sideType === 'token') {
            return (<div className="c7n-env-token c7n-sidebar-form">
              <h2 className="c7n-space-first">复制环境&quot;{this.state.envName}&quot;的指令</h2>
              <p>
                复制下文代码至Kubernetes运行，与平台建立链接。
                <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/environment-pipeline/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                  <span className="c7n-external-link-content">
                  了解详情
                  </span>
                  <span className="icon icon-open_in_new" />
                </a>
              </p>
              <div className="c7n-env-shell-wrap">
                <TextArea
                  label={Choerodon.getMessage('指令', 'Environment Token')}
                  className="c7n-input-readOnly"
                  autosize
                  copy
                  readOnly
                  value={this.state.token || ''}
                />
                <span className="c7n-env-copy">
                  {suffix}
                </span>
              </div>
            </div>);
          } else if (sideType === 'key') {
            return (<div className="c7n-env-token c7n-sidebar-form">
              <h2 className="c7n-space-first">复制环境&quot;{envData ? envData.name : ''}&quot;的指令</h2>
              <p>
                复制下文代码至Kubernetes运行，与平台建立链接。
                <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/environment-pipeline/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                  <span className="c7n-external-link-content">
                  了解详情
                  </span>
                  <span className="icon icon-open_in_new" />
                </a>
              </p>
              <div className="c7n-env-shell-wrap">
                <TextArea
                  label={Choerodon.getMessage('指令', 'Environment Token')}
                  className="c7n-input-readOnly"
                  autosize
                  copy
                  readOnly
                  value={shell || ''}
                />
                <span className="c7n-env-copy">
                  {suffix}
                </span>
              </div>
            </div>);
          } else {
            return (<div className="c7n-sidebar-form">
              <h2 className="c7n-space-first">对&quot;{envData && envData.code}&quot;环境修改</h2>
              <p>
                您可在此修改环境名称及描述，也可以复制指令至Kubernetes运行，与平台建立连接。
                <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/environment-pipeline/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                  <span className="c7n-external-link-content">
                  了解详情
                  </span>
                  <span className="icon icon-open_in_new" />
                </a>
              </p>
              <Form>
                <FormItem
                  {...formItemLayout}
                  label={Choerodon.getMessage('环境名称', 'Environment Name')}
                >
                  {getFieldDecorator('name', {
                    rules: [{
                      required: true,
                      message: Choerodon.getMessage('该字段是必输的', 'This field is required.'),
                    }, {
                      validator: this.checkName,
                    }],
                    initialValue: envData ? envData.name : '',
                  })(
                    <Input
                      maxLength={10}
                      label={Choerodon.getMessage('环境名称', 'Environment Name')}
                    />,
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={Choerodon.getMessage('环境描述', 'Environment Description')}
                >
                  {getFieldDecorator('description', {
                    initialValue: envData ? envData.description : '',
                  })(
                    <TextArea
                      autosize={{ minRows: 2 }}
                      maxLength={60}
                      label={Choerodon.getMessage('环境描述', 'Environment Description')}
                    />,
                  )}
                </FormItem>
              </Form>
            </div>);
          }
        })()
      }
      </div>);

    const BoardDom = EnvPipelineStore.getIsLoading ? <LoadingBar display /> :
      (<Board projectId={projectId} envcardPosition={envcardPosition} />);

    const leftDom = scrollLeft !== 0 ?
      <div role="none" className="c7n-push-left-ban icon icon-navigate_before" onClick={this.pushScrollRight} />
      : null;

    const rightStyle = classNames({
      'c7n-push-right-ban icon icon-navigate_next': ((window.innerWidth >= 1680 && window.innerWidth < 1920) && disEnvcardPosition.length >= 5) || (window.innerWidth >= 1920 && disEnvcardPosition.length >= 6) || (window.innerWidth < 1680 && disEnvcardPosition.length >= 4),
      'c7n-push-none': disEnvcardPosition.length <= 4,
    });

    const rightDom = this.state.moveBan ? null : <div role="none" className={rightStyle} onClick={this.pushScrollLeft} />;

    return (
      <Page className="c7n-region">
        <Header title={Choerodon.languageChange('envPl.title')}>
          <Permission
            service={['devops-service.devops-environment.create']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Button
              funcType="flat"
              onClick={this.showSideBar.bind(this, 'create')}
            >
              <span className="icon-playlist_add icon" />
              <span>{Choerodon.getMessage('创建环境', 'Create')}</span>
            </Button>
          </Permission>
          <Button
            funcType="flat"
            onClick={this.reload}
          >
            <span className="icon-refresh icon" />
            <span>{Choerodon.languageChange('refresh')}</span>
          </Button>
        </Header>
        <Content>
          <Sidebar
            title={this.showTitle(sideType)}
            visible={show}
            onOk={(sideType === 'token' || sideType === 'key') ? this.handleCancelFun : this.handleSubmit}
            onCancel={this.handleCancelFun}
            loading={this.state.submitting}
            okCancel={showBtns}
            cancelText={Choerodon.languageChange('cancel')}
            okText={(sideType === 'token' || sideType === 'key') ? Choerodon.getMessage('关闭', 'Close') : Choerodon.getMessage('保存', 'Save')}
          >
            {formContent}
          </Sidebar>
          <Modal
            visible={ban}
            width={400}
            onOk={this.banEnv}
            onCancel={this.banCancel}
            wrapClassName="vertical-center-modal remove"
          >
            <h2>{Choerodon.getMessage('确认禁用', 'Confirm Delete')}</h2>
            <span>{ist.length > 0 ? Choerodon.getMessage('该环境下存在实例，不可禁用。', 'There are instances in operation under this environment, which are not disabled.') :
              Choerodon.getMessage('当你点击确认后，该环境将被禁用。', 'When you click delete, after which the data will be permanently deleted and irreversible!')}</span>
          </Modal>
          <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的环境流水线</h2>
          <p>
            环境是指一个应用可以被部署的地方。常见环境有开发测试环境，预生产环境，生产环境等。平台自动为您的项目生成一条环境流水线，您可在下方拖拽需要调整顺序的环境至目标位置。
            <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/environment-pipeline/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                了解详情
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          {BoardDom}
          <div className="c7n-env-discontent">
            <h2 className="c7n-space-first">项目&quot;{projectName}&quot;的环境停用区</h2>
            <p>
              您可在此查看已被停用的环境，也可以重新启用这些环境。
              <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/environment-pipeline/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  了解详情
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            <div className="c7n-outer-container">
              {leftDom}
              <div className="c7n-inner-container-ban">
                <div className="c7n-env-board-ban">
                  {DisEnvDom}
                </div>
              </div>
              {rightDom}
            </div>
          </div>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(EnvPipelineHome));
