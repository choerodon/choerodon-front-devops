/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Input, Form, Tooltip, Modal, Popover, Select } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import classNames from 'classnames';
import CopyToBoard from 'react-copy-to-clipboard';
import Board from './Board';
import LoadingBar from '../../../../components/loadingBar';
import EnvGroup from './EnvGroup';
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
const { Option } = Select;
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
  /**
   * 环境编码校验
   * @param rule 校验规则
   * @param value code值
   * @param callback 回调提示
   */
  checkCode = _.debounce((rule, value, callback) => {
    const { EnvPipelineStore, intl } = this.props;
    const projectId = AppState.currentMenuType.id;
    // eslint-disable-next-line no-useless-escape
    const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    if (value && pa.test(value)) {
      EnvPipelineStore.loadCode(projectId, value)
        .then((error) => {
          if (error && error.failed) {
            callback(intl.formatMessage({ id: 'envPl.code.check.exist' }));
          } else {
            callback();
          }
        });
    } else if (value && !pa.test(value)) {
      callback(intl.formatMessage({ id: 'envPl.code.check.failed' }));
    } else {
      callback();
    }
  }, 1000);

  /**
   * 环境名称校验
   * @param rule 校验规则
   * @param value name值
   * @param callback 回调提示
   */
  checkName = _.debounce((rule, value, callback) => {
    const { EnvPipelineStore, intl } = this.props;
    const projectId = AppState.currentMenuType.id;
    const envData = EnvPipelineStore.getEnvData;
    const flag = envData ? value !== envData.name : value;
    if (flag) {
      EnvPipelineStore.loadName(projectId, value)
        .then((error) => {
          if (error && error.failed) {
            callback(intl.formatMessage({ id: 'envPl.name.check.exist' }));
          } else {
            callback();
          }
        });
    } else {
      callback();
    }
  }, 1000);

  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      token: null,
      envName: '',
      copyMsg: props.intl.formatMessage({ id: 'envPl.code.copy.tooltip' }),
      moveBan: false,
      moveRight: 300,
    };
  }

  componentDidMount() {
    this.loadEnvs();
    this.loadEnvGroups();
  }

  /**
   * 刷新函数
   */
  reload = () => {
    this.loadEnvs();
    this.loadEnvGroups();
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
   * 加载环境组
   */
  loadEnvGroups = () => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvPipelineStore.loadGroup(projectId);
  };

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

  showGroup = (type) => {
    const { EnvPipelineStore } = this.props;
    EnvPipelineStore.setSideType(type);
    EnvPipelineStore.setShowGroup(true);
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
   * 环境禁用/删除组
   */
  banEnv = () => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const sideType = EnvPipelineStore.getSideType;
    const groupOne = EnvPipelineStore.getGroupOne;
    if (sideType === 'delGroup') {
      EnvPipelineStore.delGroupById(projectId, groupOne.id)
        .then((data) => {
          if (data && data.failed) {
            Choerodon.prompt(data.message);
          } else if (data) {
            EnvPipelineStore.setGroupOne([]);
            this.reload();
          }
        });
    } else {
      const envId = EnvPipelineStore.getEnvData.id;
      EnvPipelineStore.banEnvById(projectId, envId, false)
        .then((data) => {
          if (data && data.failed) {
            Choerodon.prompt(data.message);
          } else if (data) {
            this.loadEnvs();
          }
        });
    }
    EnvPipelineStore.setBan(false);
  };

  /**
   * 辅助函数
   */
  handleCopy =() => {
    this.setState({ copyMsg: '已复制' });
  };

  mouseEnter = () => {
    const { intl } = this.props;
    this.setState({ copyMsg: intl.formatMessage({ id: 'envPl.code.copy.tooltip' }) });
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
          const envName = data.name;
          EnvPipelineStore.createEnv(projectId, data).then((res) => {
            if (res) {
              if (res && res.failed) {
                this.setState({
                  submitting: false,
                });
                Choerodon.prompt(res.message);
              } else {
                this.loadEnvs();
                EnvPipelineStore.setSideType('token');
                this.setState({ envName, token: res, submitting: false });
              }
            }
          });
          this.setState({ submitting: false });
        }
      });
    } else {
      this.props.form.validateFieldsAndScroll((err, data, modify) => {
        if (modify) {
          if (!err) {
            EnvPipelineStore.setShow(false);
            const id = EnvPipelineStore.getEnvData.id;
            EnvPipelineStore.setSideType('');
            EnvPipelineStore.updateEnv(projectId, { ...data, id })
              .then((res) => {
                if (res && res.failed) {
                  this.setState({
                    submitting: false,
                  });
                  Choerodon.prompt(res.message);
                } else if (res) {
                  this.loadEnvs();
                  EnvPipelineStore.setShow(false);
                  this.props.form.resetFields();
                  this.setState({ submitting: false });
                }
              });
          }
        } else {
          this.setState({
            submitting: false,
          });
          EnvPipelineStore.setShow(false);
        }
        this.props.form.resetFields();
        this.setState({ submitting: false });
      });
    }
  };

  /**
   * 根据type显示右侧框标题
   * @param type
   * @returns {*}
   */
  showTitle = (type) => {
    const { intl } = this.props;
    if (type === 'create') {
      return intl.formatMessage({ id: 'envPl.create' });
    } else if (type === 'edit') {
      return intl.formatMessage({ id: 'envPl.edit' });
    } else if (type === 'createGroup') {
      return intl.formatMessage({ id: 'envPl.group.create' });
    } else if (type === 'editGroup') {
      return intl.formatMessage({ id: 'envPl.group.edit' });
    } else {
      return intl.formatMessage({ id: 'envPl.token.copy.tooltip' });
    }
  };

  /**
   * 根据type显示footer text
   * @param type
   * @returns {*}
   */
  okText = (type) => {
    const { intl } = this.props;
    if (type === 'create' || type === 'createGroup') {
      return intl.formatMessage({ id: 'create' });
    } else if (type === 'edit' || type === 'editGroup') {
      return intl.formatMessage({ id: 'save' });
    } else {
      return intl.formatMessage({ id: 'envPl.close' });
    }
  };

  /**
   * 点击右滑动
   */
  pushScrollRight = () => {
    const { moveRight } = this.state;
    scrollLeft -= 300;
    if (scrollLeft < 0) {
      scrollLeft = 0;
    }
    this.setState({
      moveBan: false,
      moveRight: moveRight - 300,
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
    const { EnvPipelineStore, intl, form: { getFieldDecorator } } = this.props;
    const { copyMsg, token, envName, moveBan, submitting } = this.state;
    const { id: projectId, organizationId, type, name: projectName } = AppState.currentMenuType;
    const {
      getEnvcardPosition: envcardPosition,
      getDisEnvcardPosition: disEnvcardPosition,
      getEnvData: envData,
      getIst: ist,
      shell,
      getShow: show,
      getShowGroup: showGroup,
      getSideType: sideType,
      getBan: ban,
      getGroup: groupData,
    } = EnvPipelineStore;

    const showBtns = (sideType === 'create' || sideType === 'edit');

    let DisEnvDom = (<span className="c7n-none-des">{intl.formatMessage({ id: 'envPl.status.stop' })}</span>);

    if (disEnvcardPosition.length) {
      const disData = [];
      _.map(disEnvcardPosition, (d) => {
        if (d.devopsEnviromentRepDTOs.length) {
          disData.push(d.devopsEnviromentRepDTOs);
        }
      });
      DisEnvDom = _.map(disData[0], env => (<div className="c7n-env-card c7n-env-card-ban" key={env.id}>
        <div className="c7n-env-card-header">
          {env.name}
          <div className="c7n-env-card-action">
            <Permission
              service={['devops-service.devops-environment.queryByEnvIdAndActive']}
              organizationId={organizationId}
              projectId={projectId}
              type={type}
            >
              <Tooltip title={<FormattedMessage id="envPl.status.restart" />}>
                <Button
                  shape="circle"
                  onClick={this.actEnv.bind(this, env.id)}
                >
                  <i className="icon icon-finished" />
                </Button>
              </Tooltip>
            </Permission>
          </div>
        </div>
        <div className="c7n-env-card-content">
          <div className="c7n-env-state c7n-env-state-ban">
            <FormattedMessage id="envPl.status.stopped" />
          </div>
          <div className="c7n-env-des" title={env.description}>
            <span className="c7n-env-des-head">{intl.formatMessage({ id: 'envPl.description' })}</span>
            {env.description}
          </div>
        </div>
      </div>));
    }

    const suffix = (<Popover placement="right" trigger="hover" content={copyMsg}>
      <div onMouseEnter={this.mouseEnter}>
        <CopyToBoard text={shell || token} onCopy={this.handleCopy}>
          <i className="icon icon-library_books" />
        </CopyToBoard>
      </div>
    </Popover>);

    const BoardDom = _.map(envcardPosition, e => <Board projectId={Number(projectId)} key={e.devopsEnvGroupId} groupId={e.devopsEnvGroupId} Title={e.devopsEnvGroupName} envcardPositionChild={e.devopsEnviromentRepDTOs || []} />);

    const leftDom = scrollLeft !== 0
      ? <div role="none" className="c7n-push-left-ban icon icon-navigate_before" onClick={this.pushScrollRight} />
      : null;

    const rightStyle = classNames({
      'c7n-push-right-ban icon icon-navigate_next': ((window.innerWidth >= 1680 && window.innerWidth < 1920) && disEnvcardPosition.length >= 5) || (window.innerWidth >= 1920 && disEnvcardPosition.length >= 6) || (window.innerWidth < 1680 && disEnvcardPosition.length >= 4),
      'c7n-push-none': disEnvcardPosition.length <= 4,
    });

    const rightDom = moveBan ? null : <div role="none" className={rightStyle} onClick={this.pushScrollLeft} />;

    let formContent = null;
    switch (sideType) {
      case 'create':
        formContent = (<Form className="c7n-sidebar-form" layout="vertical">
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('code', {
              rules: [{
                required: true,
                message: intl.formatMessage({ id: 'required' }),
              }, {
                validator: this.checkCode,
              }],
              initialValue: envData ? envData.code : '',
            })(
              <Input
                maxLength={30}
                label={<FormattedMessage id="envPl.form.code" />}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true,
                message: intl.formatMessage({ id: 'required' }),
              }, {
                validator: this.checkName,
              }],
              initialValue: envData ? envData.name : '',
            })(
              <Input
                maxLength={10}
                label={<FormattedMessage id="envPl.form.name" />}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={<FormattedMessage id="envPl.form.description" />}
          >
            {getFieldDecorator('description', {
              initialValue: envData ? envData.description : '',
            })(
              <TextArea
                autosize={{ minRows: 2 }}
                maxLength={60}
                label={<FormattedMessage id="envPl.form.description" />}
              />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('devopsEnvGroupId')(
              <Select
                allowClear
                filter
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                label={<FormattedMessage id="envPl.form.group" />}
              >
                {groupData.length ? _.map(groupData, g => <Option key={g.id} value={g.id}>{g.name}</Option>) : null}
              </Select>,
            )}
          </FormItem>
        </Form>);
        break;
      case 'token':
        formContent = (<div className="c7n-env-token c7n-sidebar-form">
          <div className="c7n-env-shell-wrap">
            <TextArea
              label={<FormattedMessage id="envPl.token" />}
              className="c7n-input-readOnly"
              autosize
              copy="true"
              readOnly
              value={this.state.token || ''}
            />
            <span className="c7n-env-copy">{suffix}</span>
          </div>
        </div>);
        break;
      case 'key':
        formContent = (<div className="c7n-env-token c7n-sidebar-form">
          <div className="c7n-env-shell-wrap">
            <TextArea
              label={<FormattedMessage id="envPl.token" />}
              className="c7n-input-readOnly"
              autosize
              copy="true"
              readOnly
              value={shell || ''}
            />
            <span className="c7n-env-copy">{suffix}</span>
          </div>
        </div>);
        break;
      case 'edit':
        formContent = (<div className="c7n-sidebar-form">
          <Form>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: intl.formatMessage({ id: 'required' }),
                }, {
                  validator: this.checkName,
                }],
                initialValue: envData ? envData.name : '',
              })(
                <Input
                  maxLength={10}
                  label={<FormattedMessage id="envPl.form.name" />}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('description', {
                initialValue: envData ? envData.description : '',
              })(
                <TextArea
                  autosize={{ minRows: 2 }}
                  maxLength={60}
                  label={<FormattedMessage id="envPl.form.description" />}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
            >
              {getFieldDecorator('devopsEnvGroupId', {
                initialValue: envData ? envData.devopsEnvGroupId : undefined,
              })(
                <Select
                  allowClear
                  filter
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  label={<FormattedMessage id="envPl.form.group" />}
                >
                  {groupData.length ? _.map(groupData, g => <Option key={g.id} value={g.id}>{g.name}</Option>) : null}
                </Select>,
              )}
            </FormItem>
          </Form>
        </div>);
        break;
      default:
        formContent = null;
    }

    return (
      <Page
        className="c7n-region"
        service={[
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.devops-environment.create',
          'devops-service.devops-environment.update',
          'devops-service.devops-environment.checkCode',
          'devops-service.devops-environment.checkName',
          'devops-service.devops-environment.sort',
          'devops-service.devops-environment.queryByEnvIdAndActive',
          'devops-service.devops-environment.queryShell',
          'devops-service.devops-environment.query',
          'devops-service.application-instance.pageByOptions',
          'devops-service.devops-env-group.listByProject',
          'devops-service.devops-env-group.create',
          'devops-service.devops-env-group.update',
          'devops-service.devops-env-group.checkName',
          'devops-service.devops-env-group.delete',
        ]}
      >
        <Header title={<FormattedMessage id="envPl.head" />}>
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
              <i className="icon-playlist_add icon" />
              <FormattedMessage id="envPl.create" />
            </Button>
          </Permission>
          <Permission
            service={['devops-service.devops-env-group.create']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Button
              funcType="flat"
              onClick={this.showGroup.bind(this, 'createGroup')}
            >
              <i className="icon-playlist_add icon" />
              <FormattedMessage id="envPl.group.create" />
            </Button>
          </Permission>
          <Button
            funcType="flat"
            onClick={this.reload}
          >
            <i className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="env" value={{ projectName }}>
          <Sidebar
            title={this.showTitle(sideType)}
            visible={show}
            onOk={(sideType === 'token' || sideType === 'key') ? this.handleCancelFun : this.handleSubmit}
            onCancel={this.handleCancelFun}
            confirmLoading={submitting}
            okCancel={showBtns}
            cancelText={<FormattedMessage id="cancel" />}
            okText={this.okText(sideType)}
          >
            <Content code={`env.${sideType}`} value={{ projectName }} className="sidebar-content">
              {formContent}
            </Content>
          </Sidebar>
          <Modal
            visible={ban}
            width={400}
            onOk={this.banEnv}
            onCancel={this.banCancel}
            closable={false}
            wrapClassName="vertical-center-modal remove"
          >
            {sideType === 'delGroup' ? <div className="c7n-env-modal-content">
              <div>{intl.formatMessage({ id: 'envPl.group.del' })}</div>
              {intl.formatMessage({ id: 'envPl.confirm.group.del' })}
            </div> : (<div className="c7n-env-modal-content">
              <div>{intl.formatMessage({ id: 'envPl.confirm.disable' })}</div>
              <span>{ist.length > 0 ? intl.formatMessage({ id: 'envPl.confirm.content.hasInstance' })
                : intl.formatMessage({ id: 'envPl.confirm.content.noInstance' })}</span>
            </div>)}
          </Modal>
          {showGroup ? <EnvGroup store={EnvPipelineStore} okText={this.okText} showTitle={this.showTitle} /> : null}
          {EnvPipelineStore.getIsLoading ? <LoadingBar display />
            : <React.Fragment>
              {BoardDom.length ? BoardDom : <Board projectId={Number(projectId)} key="none" envcardPositionChild={[]} />}
              <div className="no-content-padding">
                <Content code="env.stop" value={{ projectName }}>
                  <div className="c7n-outer-container">
                    {leftDom}
                    <div className="c7n-inner-container-ban">
                      <div className="c7n-env-board-ban">
                        {DisEnvDom}
                      </div>
                    </div>
                    {rightDom}
                  </div>
                </Content>
              </div>
            </React.Fragment>}
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(EnvPipelineHome)));
