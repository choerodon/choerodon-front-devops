/* eslint-disable no-useless-return */
import React, { Component, Fragment } from "react";
import { observer, inject } from "mobx-react";
import { withRouter } from "react-router-dom";
import classnames from "classnames";
import _ from "lodash";
import { injectIntl, FormattedMessage } from "react-intl";
import {
  Button,
  Form,
  Select,
  Input,
  Modal,
  Popover,
  Icon,
  Radio,
  Tooltip,
} from "choerodon-ui";
import { stores, Content } from "choerodon-front-boot";
import AppName from "../../../../components/appName";
import "../../../main.scss";
import "../createNetwork/CreateNetwork.scss";
import "./EditNetwork.scss";
import InterceptMask from "../../../../components/interceptMask/InterceptMask";

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
class EditNetwork extends Component {
  constructor(props) {
    super(props);
    /* **************
     *                        state              this
     * portKeys/targetKeys | 用于radio选择模式 | 生成一组表单项的唯一表示
     *
     ************** */
    this.state = {
      submitting: false,
      targetKeys: "instance",
      oldTargetKeys: null,
      portKeys: "ClusterIP",
      validIp: {},
      targetIp: {},
      initName: "",
      initApp: "",
      labels: {},
      config: {},
      initIst: [],
      initIstOption: [],
      deletedInstance: [],
      network: {},
      envId: null,
      envName: null,
    };
    this.portKeys = 1;
    this.targetKeys = 0;
    this.endPoints = 0;
  }

  componentDidMount() {
    this.props.form.resetFields();
    this.loadNetworkById();
  }

  /**
   * 将值放入 externalIps 表单项
   * @param value
   */
  setIpInSelect = (value, type) => {
    const {
      form: { getFieldValue, validateFields, setFieldsValue },
    } = this.props;
    const itemType = type || "externalIps";
    const ip = getFieldValue(itemType) || [];
    if (!ip.includes(value)) {
      ip.push(value);
      setFieldsValue({
        [itemType]: ip,
      });
    }
    validateFields([itemType]);
    const data = type === "targetIps" ? this.targetIpSelect : this.ipSelect;
    if (data) {
      // react-component 内置方法
      // 用于将当前输入值填入组件的标签后，清空当前输入
      // 另一个功能：重复值不会生成新的标签
      data.setInputValue("");
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, store, netId } = this.props;
    const { network } = this.state;
    const { id } = AppState.currentMenuType;
    this.setState({ submitting: true });
    form.validateFields((err, data) => {
      if (!err) {
        const {
          name,
          appId,
          appInstance,
          envId,
          endPoints: endps,
          targetIps,
          portName,
          targetport,
          externalIps,
          portKeys,
          port,
          tport,
          nport,
          targetKeys,
          keywords,
          config,
          values,
        } = data;
        const appIst = appInstance ? _.map(appInstance, item => item) : null;
        const ports = [];
        const label = {};
        const endPoints = {};
        if (portKeys) {
          _.forEach(portKeys, item => {
            if (item || item === 0) {
              const node = {
                port: Number(port[item]),
                targetPort: Number(tport[item]),
                nodePort: nport && nport[item] ? Number(nport[item]) : null,
              };
              ports.push(node);
            }
          });
        }
        if (targetKeys) {
          _.forEach(targetKeys, item => {
            if (item || item === 0) {
              const key = keywords[item];
              label[key] = values[item];
            }
          });
        }
        if (endps && endps.length && targetIps) {
          endPoints[targetIps.join(",")] = _.map(
            _.filter(endps, item => item || item === 0),
            item => ({
              name: portName[item],
              port: Number(targetport[item]),
            })
          );
        }

        const {
          name: oldName,
          appId: oldAppId,
          target: {
            appInstance: oldAppInstance,
            labels: oldLabel,
            endPoints: oldEndPoints,
          },
          envId: oldEnvId,
          config: { externalIps: oldIps, ports: oldPorts },
          type,
        } = network;
        const oldIst = _.map(oldAppInstance, item => item.code);
        const oldPortId = _.map(oldPorts, item => ({
          nodePort: item.nodePort ? _.toNumber(item.nodePort) : null,
          port: item.port ? _.toNumber(item.port) : null,
          targetPort: item.targetPort ? _.toNumber(item.targetPort) : null,
        }));
        const oldNetwork = {
          name: oldName,
          appId: oldAppId || null,
          appInstance: oldIst.length ? oldIst : null,
          envId: oldEnvId,
          externalIp: oldIps,
          ports: oldPortId,
          label: oldLabel || null,
          endPoints: oldEndPoints,
          type,
        };
        const newNetwork = {
          name,
          appId: appId || null,
          appInstance: appIst,
          envId,
          externalIp:
            externalIps && externalIps.length ? externalIps.join(",") : null,
          ports,
          label: !_.isEmpty(label) ? label : null,
          endPoints: !_.isEmpty(endPoints) ? endPoints : null,
          type: config,
        };

        if (_.isEqual(oldNetwork, newNetwork)) {
          this.setState({ submitting: false });
          this.handleClose();
        } else {
          store
            .updateData(id, netId, newNetwork)
            .then(res => {
              this.setState({ submitting: false });
              if (res) {
                this.handleClose();
              }
            })
            .catch(error => {
              this.setState({ submitting: false });
              Choerodon.handleResponseError(error);
            });
        }
      } else {
        this.setState({ submitting: false });
      }
    });
  };

  handleClose = (isload = true) => {
    const { onClose, store } = this.props;
    store.setSingleData([]);
    onClose(isload);
  };

  loadNetworkById = () => {
    const {
      store,
      netId,
      form: { setFieldsValue },
    } = this.props;
    const { id } = AppState.currentMenuType;
    store.loadEnv(id);
    store.loadDataById(id, netId).then(data => {
      if (data) {
        const { name, type, appId, target, config, envId, envName } = data;
        const targetKeys =
          target && target.labels
            ? "param"
            : target && target.endPoints
            ? "endPoints"
            : "instance";
        let appInstance = [];
        let labels = {};
        let endPoints = {};
        target && ({ appInstance, labels, endPoints } = target);
        const initIst = [];
        // 将默认选项直接生成，避免加载带来的异步问题
        const initIstOption = [];
        const deletedInstance = [];
        if (appInstance && appInstance.length) {
          _.forEach(appInstance, item => {
            const { id: istId, code, instanceStatus } = item;
            initIst.push(code);
            initIstOption.push(
              <Option key={istId} value={code}>
                <Tooltip
                  title={
                    instanceStatus ? (
                      <FormattedMessage id={instanceStatus} />
                    ) : (
                      <FormattedMessage id="network.ist.deleted" />
                    )
                  }
                  placement="right"
                >
                  {code}
                </Tooltip>
              </Option>
            );
            if (instanceStatus !== "running") {
              deletedInstance.push(code);
            }
          });
        }
        setFieldsValue({ envId: envId || [] });
        this.setState({
          initApp: appId,
          labels: labels || {},
          initName: name,
          targetKeys,
          oldTargetKeys: targetKeys === "param" ? "targetKeys" : targetKeys,
          portKeys: type,
          config,
          initIst,
          initIstOption,
          deletedInstance,
          oldAppData: {
            initApp: appId,
            initIst,
            initIstOption,
            deletedInstance,
          },
          network: data,
          envId,
          envName,
          endPoints,
        });
      }
    });
  };

  /**
   * 目标和网络配置类型选择
   * @param e
   * @param key
   */
  handleTypeChange = (e, key) => {
    const {
      form: { getFieldValue, getFieldDecorator, resetFields, setFieldsValue },
      store,
    } = this.props;
    const {
      envId,
      oldTargetKeys,
      network: {
        type,
        config,
        target: { labels, endPoints },
      },
      oldAppData: { initApp, initIst, initIstOption, deletedInstance },
    } = this.state;

    // 设置初始数据
    const oldValue = {};
    const initKeys = _.keys(labels);
    const flag = _.keys(endPoints)[0];
    oldValue.targetKeys = Array.from({ length: initKeys.length }, (v, k) => k);
    oldValue.endPoints = flag
      ? Array.from({ length: endPoints[flag].length }, (v, k) => k)
      : [];
    oldValue.ports = Array.from({ length: config.ports.length }, (v, k) => k);

    const list = {
      targetKeys: ["keywords", "values"],
      endPoints: ["portName", "targetport"],
    };
    const { id } = AppState.currentMenuType;
    const keys = getFieldValue(key);
    if (key === "portKeys") {
      if (e.target.value === type) {
        setFieldsValue({
          [key]: oldValue.ports,
        });
        this.setState({ config });
      } else {
        setFieldsValue({
          [key]: [0],
        });
        this.setState({ config: {} });
        resetFields(["port", "tport", "nport"]);
      }
      // 清除多组port映射
      this.portKeys = 1;
    } else if (e.target.value === "instance") {
      _.map(["targetKeys", "endPoints"], item => {
        this[item] = 0;
        getFieldDecorator(item, { initialValue: [] });
        setFieldsValue({
          [item]: [],
        });
        resetFields(list[item]);
      });
      this.setState({ labels: {}, endPoints: {} });
      const app = store.getApp;
      if (!(app && app.length)) {
        store.loadApp(id, Number(envId));
      }
      if (oldTargetKeys === "instance") {
        this.setState({
          initApp,
          initIstOption,
          initIst,
          deletedInstance,
        });
        resetFields(["appInstance"]);
      }
    } else {
      // 切换到“填写标签”、“endPoints”时，生成相应表单项并清空应用实例数据
      const value = e.target.value === "param" ? "targetKeys" : e.target.value;
      _.map(["targetKeys", "endPoints"], item => {
        const oldData = item === "targetKeys" ? "labels" : item;
        if (value === item) {
          if (oldTargetKeys === item) {
            this[item] = 0;
            getFieldDecorator(item, { initialValue: oldValue[item] });
            setFieldsValue({
              [item]: oldValue[item],
            });
            resetFields(list[item]);
            this.setState({
              [oldData]: item === "targetKeys" ? labels : endPoints,
            });
          } else {
            getFieldDecorator(item, { initialValue: [0] });
            this[item] = 1;
            setFieldsValue({
              [item]: [0],
            });
          }
        } else {
          this[item] = 0;
          getFieldDecorator(item, { initialValue: [] });
          setFieldsValue({
            [item]: [],
          });
          resetFields(list[item]);
          this.setState({ [oldData]: {} });
        }
      });
      this.setState({
        initApp: "",
        initIstOption: [],
        initIst: [],
        deletedInstance: [],
      });
      resetFields(["appInstance"]);
      store.setIst([]);
    }
    this.setState({ [key]: e.target.value });
  };

  /**
   * 移除一组表单项
   * @param k
   * @param type
   */
  removeGroup = (k, type) => {
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    const keys = getFieldValue(type);
    if (keys.length === 1) {
      return;
    }
    setFieldsValue({
      [type]: _.filter(keys, key => key !== k),
    });
  };

  /**
   * 动态生成一组表单项
   * @param type
   */
  addGroup = type => {
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    const keys = getFieldValue(type);
    const uuid = this[type];
    const nextKeys = _.concat(keys, uuid);
    this[type] = uuid + 1;
    setFieldsValue({
      [type]: nextKeys,
    });
  };

  /**
   * 选择应用, 加载实例, 生成初始网络名
   * @param value
   * @param options
   */
  handleAppSelect = (value, options) => {
    const { store, form } = this.props;
    const { id } = AppState.currentMenuType;
    const envId = form.getFieldValue("envId");
    this.setState({
      initIst: [],
      initIstOption: [],
    });
    store.loadInstance(id, envId, Number(value));
  };

  /**
   * 生成app选项组
   * @param node
   * @returns {*}
   */
  makeAppGroup = node => {
    const { id, name, code, projectId } = node;
    const { id: currentProject } = AppState.currentMenuType;
    return (
      <Option value={id} key={code}>
        <Popover
          placement="right"
          content={
            <Fragment>
              <p>
                <FormattedMessage id="app.name" />:<span>{name}</span>
              </p>
              <p>
                <FormattedMessage id="app.code" />:<span>{code}</span>
              </p>
            </Fragment>
          }
        >
          <div className="c7ncd-net-app">
            <AppName
              name={name}
              showIcon
              self={projectId === Number(currentProject)}
              width="460px"
            />
          </div>
        </Popover>
      </Option>
    );
  };

  /**
   * 检查名字的唯一性
   * @param rule
   * @param value
   * @param callback
   */
  checkName = (rule, value, callback) => {
    const { intl, store, form } = this.props;
    const { id } = AppState.currentMenuType;
    const pattern = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
    const envId = form.getFieldValue("envId");
    if (value && !pattern.test(value)) {
      callback(intl.formatMessage({ id: "network.name.check.failed" }));
    } else if (value && pattern.test(value)) {
      store.checkNetWorkName(id, envId, value).then(data => {
        if (data) {
          callback();
        } else {
          callback(intl.formatMessage({ id: "network.name.check.exist" }));
        }
      });
    } else {
      callback();
    }
  };

  /**
   * 实例校验
   * @param rule
   * @param value
   * @param callback
   */
  checkInstance = (rule, value, callback) => {
    const { intl } = this.props;
    const { deletedInstance } = this.state;
    let msg;
    _.forEach(value, item => {
      if (_.includes(deletedInstance, item) && !msg) {
        msg = intl.formatMessage({ id: "network.instance.check.failed" });
      }
    });
    if (msg) {
      callback(msg);
    } else {
      callback();
    }
  };

  /**
   * 验证ip
   * @param rule
   * @param value
   * @param callback
   * @param type
   */
  checkIP = (rule, value, callback, type) => {
    const { intl } = this.props;
    const p = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
    const validIp = {};
    const data = type === "targetIps" ? "targetIp" : "validIp";
    let errorMsg;
    if (value && value.length) {
      _.forEach(value, (item, index) => {
        if (!p.test(item)) {
          errorMsg = intl.formatMessage({ id: "network.ip.check.failed" });
          validIp[item] = true;
        }
      });
      this.setState({ [data]: validIp });
      callback(errorMsg);
    } else {
      callback();
    }
  };

  /**
   * 验证端口号
   * @param rule
   * @param value
   * @param callback
   * @param type
   */
  checkPort = (rule, value, callback, type) => {
    const { intl } = this.props;
    const {
      form: { getFieldValue },
    } = this.props;
    const p = /^([1-9]\d*|0)$/;
    const count = _.countBy(getFieldValue(type));
    const data = {
      typeMsg: "",
      min: 0,
      max: 65535,
      failedMsg: "network.port.check.failed",
    };
    switch (type) {
      case "tport":
        data.typeMsg = "network.tport.check.repeat";
        break;
      case "nport":
        data.typeMsg = "network.nport.check.repeat";
        data.min = 30000;
        data.max = 32767;
        data.failedMsg = "network.nport.check.failed";
        break;
      case "targetport":
        data.typeMsg = "network.tport.check.repeat";
        break;
      default:
        data.typeMsg = "network.port.check.repeat";
    }
    if (value) {
      if (
        p.test(value) &&
        parseInt(value, 10) >= data.min &&
        parseInt(value, 10) <= data.max
      ) {
        if (count[value] < 2) {
          callback();
        } else {
          callback(intl.formatMessage({ id: data.typeMsg }));
        }
      } else {
        callback(intl.formatMessage({ id: data.failedMsg }));
      }
    } else {
      callback();
    }
  };

  /**
   * 关键字检查
   * @param rule
   * @param value
   * @param callback
   */
  checkKeywords = (rule, value, callback) => {
    const { intl } = this.props;
    const {
      form: { getFieldValue },
    } = this.props;
    const p = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    const keyCount = _.countBy(getFieldValue("keywords"));
    if (value) {
      if (p.test(value)) {
        if (keyCount[value] < 2) {
          callback();
        } else {
          callback(intl.formatMessage({ id: "network.key.check.repeat" }));
        }
      } else {
        callback(intl.formatMessage({ id: "network.key.check.failed" }));
      }
    } else {
      callback();
    }
  };

  checkValue = (rule, value, callback) => {
    const { intl } = this.props;
    const p = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
    if (value) {
      if (p.test(value)) {
        callback();
      } else {
        callback(intl.formatMessage({ id: "network.value.check.failed" }));
      }
    } else {
      callback();
    }
  };

  /**
   * 处理实例的内容
   * @param liNode
   * @param value
   * @returns {*}
   */
  handleRenderInstance = (liNode, value) => {
    const { deletedInstance } = this.state;
    return React.cloneElement(liNode, {
      className: classnames(liNode.props.className, {
        "instance-status-disable": _.includes(deletedInstance, value),
      }),
      // 防止Tooltip组件的title属性被放到默认属性中
      title: "",
    });
  };

  /**
   * 处理ip输入的内容并返回给value
   * @param liNode
   * @param value
   * @param type
   * @returns {*}
   */
  handleChoiceRender = (liNode, value, type) =>
    React.cloneElement(liNode, {
      className: classnames(liNode.props.className, {
        /* eslint-disable react/destructuring-assignment */
        "ip-check-error": this.state[type || "validIp"][value],
      }),
    });

  /**
   * 删除ip选择框中的标签校验标识
   * @param value
   * @param type
   */
  handleChoiceRemove = (value, type) => {
    const {
      form: { validateFields },
    } = this.props;
    const data = this.state[type || "validIp"];
    // 直接删除
    if (value in data) {
      delete data[value];
    }
    validateFields([type === "targetIp" ? "targetIps" : "externalIps"]);
  };

  /**
   * ip选择框监听键盘按下事件
   * @param e
   * @param type
   */
  handleInputKeyDown = (e, type) => {
    const { value } = e.target;
    if (e.keyCode === 13 && !e.isDefaultPrevented() && value) {
      this.setIpInSelect(value, type);
    }
  };

  ipSelectRef = (node, type) => {
    const data = type === "targetIps" ? "targetIpSelect" : "ipSelect";
    if (node) {
      this[data] = node.rcSelect;
    }
  };

  render() {
    const { visible, form, intl, store } = this.props;
    const {
      submitting,
      targetKeys: targetType,
      portKeys: configType,
      initName,
      initIst,
      initIstOption,
      initApp,
      labels,
      config,
      envId,
      envName,
      endPoints: endPointsData,
    } = this.state;
    const { name: menuName, id: projectId } = AppState.currentMenuType;
    const { getFieldDecorator, getFieldValue } = form;
    // const { envId, envName } = store.getSingleData;
    const localApp = _.filter(
      store.getApp,
      item => item.projectId === Number(projectId)
    );
    const storeApp = _.filter(
      store.getApp,
      item => item.projectId !== Number(projectId)
    );
    let portWidthSingle = "240";
    let portWidthMut = "portL";
    if (configType !== "ClusterIP") {
      portWidthSingle = "150";
      portWidthMut = "portS";
    }

    // 生成多组 port
    const { ports, externalIps } = config;
    const trustIps = _.filter(externalIps, item => item);
    const initIp = trustIps.length ? trustIps : undefined;
    const initPort = [0];
    const nPort = [];
    const pPort = [];
    const tPort = [];
    if (ports && ports.length) {
      initPort.pop();
      _.forEach(ports, (item, index) => {
        const { nodePort, port, targetPort } = item;
        initPort.push(index);
        nPort.push(nodePort);
        pPort.push(port);
        tPort.push(targetPort);
      });
      if (initPort.length !== 1 && this.portKeys === 1) {
        this.portKeys = ports.length;
      }
    }
    getFieldDecorator("portKeys", { initialValue: initPort });
    const portKeys = getFieldValue("portKeys");
    const portItems = _.map(portKeys, (k, index) => (
      <div key={`port-${k}`} className="network-port-wrap">
        {configType !== "ClusterIP" ? (
          <FormItem
            className={`c7n-select_${
              portKeys.length > 1 ? "portS" : "150"
            } network-panel-form network-port-form`}
            {...formItemLayout}
          >
            {getFieldDecorator(`nport[${k}]`, {
              initialValue: nPort[k],
              rules: [
                {
                  validator: (rule, value, callback) =>
                    this.checkPort(rule, value, callback, "nport"),
                },
              ],
            })(
              <Input
                type="text"
                maxLength={5}
                label={<FormattedMessage id="network.config.nodePort" />}
              />
            )}
          </FormItem>
        ) : null}
        <FormItem
          className={`c7n-select_${
            portKeys.length > 1 ? portWidthMut : portWidthSingle
          } network-panel-form network-port-form`}
          {...formItemLayout}
        >
          {getFieldDecorator(`port[${k}]`, {
            initialValue: pPort[k],
            rules: [
              {
                required: true,
                message: intl.formatMessage({ id: "required" }),
              },
              {
                validator: (rule, value, callback) =>
                  this.checkPort(rule, value, callback, "port"),
              },
            ],
          })(
            <Input
              type="text"
              maxLength={5}
              disabled={!getFieldValue("envId")}
              label={<FormattedMessage id="network.config.port" />}
            />
          )}
        </FormItem>
        <FormItem
          className={`c7n-select_${
            portKeys.length > 1 ? portWidthMut : portWidthSingle
          } network-panel-form network-port-form`}
          {...formItemLayout}
        >
          {getFieldDecorator(`tport[${k}]`, {
            initialValue: tPort[k],
            rules: [
              {
                required: true,
                message: intl.formatMessage({ id: "required" }),
              },
              {
                validator: (rule, value, callback) =>
                  this.checkPort(rule, value, callback, "tport"),
              },
            ],
          })(
            <Input
              type="text"
              maxLength={5}
              disabled={!getFieldValue("envId")}
              label={<FormattedMessage id="network.config.targetPort" />}
            />
          )}
        </FormItem>
        {portKeys.length > 1 ? (
          <Icon
            className="network-group-icon"
            type="delete"
            onClick={() => this.removeGroup(k, "portKeys")}
          />
        ) : null}
      </div>
    ));

    // endPoints生成多组 port
    const flag = _.keys(endPointsData)[0];
    const targetIps = flag ? _.split(flag, ",") : undefined;
    const endport = [];
    const portName = [];
    const targetport = [];
    if (flag) {
      _.map(endPointsData[flag], (item, index) => {
        endport.push(index);
        portName.push(item.name);
        targetport.push(item.port);
      });
      if (this.endPoints === 0) {
        this.endPoints = endPointsData[flag].length;
      }
    }
    getFieldDecorator("endPoints", { initialValue: endport });
    const endPoints = getFieldValue("endPoints");
    const targetPortItems = _.map(endPoints, (k, index) => (
      <div key={`endPoints-${k}`} className="network-port-wrap">
        <FormItem
          className={`c7n-select_${
            endPoints.length > 1 ? "portL" : 240
          } network-panel-form network-port-form`}
          {...formItemLayout}
        >
          {getFieldDecorator(`portName[${k}]`, {
            rules: [
              {
                required: true,
                message: intl.formatMessage({ id: "required" }),
              },
            ],
            initialValue: portName[k],
          })(
            <Input
              type="text"
              disabled={!getFieldValue("envId")}
              label={<FormattedMessage id="network.target.portName" />}
            />
          )}
        </FormItem>
        <FormItem
          className={`c7n-select_${
            endPoints.length > 1 ? "portL" : 240
          } network-panel-form network-port-form`}
          {...formItemLayout}
        >
          {getFieldDecorator(`targetport[${k}]`, {
            rules: [
              {
                required: true,
                message: intl.formatMessage({ id: "required" }),
              },
              {
                validator: (rule, value, callback) =>
                  this.checkPort(rule, value, callback, "targetport"),
              },
            ],
            initialValue: targetport[k],
          })(
            <Input
              type="text"
              maxLength={5}
              disabled={!getFieldValue("envId")}
              label={<FormattedMessage id="network.config.targetPort" />}
            />
          )}
        </FormItem>
        {endPoints.length > 1 ? (
          <Icon
            className="network-group-icon"
            type="delete"
            onClick={() => this.removeGroup(k, "endPoints")}
          />
        ) : null}
      </div>
    ));

    // 生成多组 target
    const initLabels = [];
    const initKeys = _.keys(labels);
    const initValues = _.values(labels);
    _.forEach(initKeys, (item, index) => initLabels.push(index));
    if (this.targetKeys === 0) {
      this.targetKeys = initKeys.length;
    }
    getFieldDecorator("targetKeys", { initialValue: initLabels });
    const targetKeys = getFieldValue("targetKeys");
    const targetItems = _.map(targetKeys, k => (
      <div key={`target-${k}`} className="network-port-wrap">
        <FormItem
          className={`c7n-select_${
            targetKeys.length > 1 ? "entryS" : "entryL"
          } network-panel-form network-port-form`}
          {...formItemLayout}
        >
          {getFieldDecorator(`keywords[${k}]`, {
            initialValue: initKeys[k],
            rules: [
              {
                required: true,
                message: intl.formatMessage({ id: "required" }),
              },
              {
                validator: this.checkKeywords,
              },
            ],
          })(
            <Input
              type="text"
              disabled={!getFieldValue("envId")}
              label={<FormattedMessage id="network.config.keyword" />}
            />
          )}
        </FormItem>
        <Icon className="network-group-icon" type="drag_handle" />
        <FormItem
          className={`c7n-select_${
            targetKeys.length > 1 ? "entryS" : "entryL"
          } network-panel-form network-port-form`}
          {...formItemLayout}
        >
          {getFieldDecorator(`values[${k}]`, {
            initialValue: initValues[k],
            rules: [
              {
                required: true,
                message: intl.formatMessage({ id: "required" }),
              },
              {
                validator: this.checkValue,
              },
            ],
          })(
            <Input
              type="text"
              disabled={!getFieldValue("envId")}
              label={<FormattedMessage id="network.config.value" />}
            />
          )}
        </FormItem>
        {targetKeys.length > 1 ? (
          <Icon
            className="network-group-icon"
            type="delete"
            onClick={() => this.removeGroup(k, "targetKeys")}
          />
        ) : null}
      </div>
    ));

    // 初始化实例
    const ist = store.getIst;
    // 将默认的选项过滤
    const istOption = _.map(
      _.filter(ist, item => !_.includes(initIst, item.code)),
      item => {
        const { id, code } = item;
        return (
          <Option key={id} value={code}>
            <Tooltip
              title={<FormattedMessage id="running" />}
              placement="right"
            >
              {code}
            </Tooltip>
          </Option>
        );
      }
    );

    const localAppOptions = _.map(localApp, node => this.makeAppGroup(node));

    const storeAppOptions = _.map(storeApp, node => this.makeAppGroup(node));

    return (
      <div className="c7n-region">
        <Sidebar
          destroyOnClose
          cancelText={<FormattedMessage id="cancel" />}
          okText={<FormattedMessage id="edit" />}
          title={<FormattedMessage id="network.header.update" />}
          visible={visible}
          onOk={this.handleSubmit}
          onCancel={this.handleClose.bind(this, false)}
          confirmLoading={submitting}
        >
          <Content
            code="network.update"
            values={{ name: initName }}
            className="c7n-network-create sidebar-content"
          >
            <Form layout="vertical">
              <FormItem
                className="c7n-select_512 network-form-name"
                {...formItemLayout}
              >
                {getFieldDecorator("name", {
                  initialValue: initName,
                  rules: [
                    {
                      required: true,
                      message: intl.formatMessage({ id: "required" }),
                    },
                  ],
                })(
                  <Input
                    disabled
                    maxLength={30}
                    type="text"
                    label={<FormattedMessage id="network.form.name" />}
                  />
                )}
              </FormItem>
              <FormItem className="c7n-select_512" {...formItemLayout}>
                {getFieldDecorator("envId", {
                  initialValue: envId,
                  rules: [
                    {
                      required: true,
                      message: intl.formatMessage({ id: "required" }),
                    },
                  ],
                })(
                  <Select
                    disabled
                    className="c7n-select_512"
                    label={<FormattedMessage id="network.env" />}
                    optionFilterProp="children"
                  >
                    <Option value={envId}>{envName}</Option>
                  </Select>
                )}
              </FormItem>
              <div className="network-panel-title">
                <Icon type="instance_outline" />
                <FormattedMessage id="network.target" />
              </div>
              <div className="network-radio-wrap">
                <div className="network-radio-label">
                  <FormattedMessage id="chooseType" />
                </div>
                <FormItem
                  className="c7n-select_512 network-radio-form"
                  label={<FormattedMessage id="chooseType" />}
                  {...formItemLayout}
                >
                  {getFieldDecorator("target", {
                    initialValue: targetType,
                  })(
                    <RadioGroup
                      name="target"
                      disabled={!getFieldValue("envId")}
                      onChange={e => this.handleTypeChange(e, "targetKeys")}
                    >
                      <Radio value="instance">
                        <FormattedMessage id="network.target.instance" />
                      </Radio>
                      <Radio value="param">
                        <FormattedMessage id="network.target.param" />
                      </Radio>
                      <Radio value="endPoints">Endpoints</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </div>
              <div className="network-panel">
                {targetType === "instance" && (
                  <Fragment>
                    <FormItem
                      className="c7n-select_480 network-panel-form"
                      {...formItemLayout}
                    >
                      {getFieldDecorator("appId", {
                        initialValue:
                          localAppOptions.length || storeAppOptions.length
                            ? initApp
                            : undefined,
                        rules: [
                          {
                            required: true,
                            message: intl.formatMessage({ id: "required" }),
                          },
                        ],
                      })(
                        <Select
                          filter
                          showSearch
                          className="c7n-select_480"
                          optionFilterProp="children"
                          disabled={!getFieldValue("envId")}
                          onSelect={this.handleAppSelect}
                          label={<FormattedMessage id="network.form.app" />}
                          getPopupContainer={triggerNode =>
                            triggerNode.parentNode
                          }
                          filterOption={(input, option) =>
                            option.props.children.props.children.props.children.props.name
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <OptGroup
                            label={<FormattedMessage id="project" />}
                            key="project"
                          >
                            {localAppOptions}
                          </OptGroup>
                          <OptGroup
                            label={<FormattedMessage id="market" />}
                            key="markert"
                          >
                            {storeAppOptions}
                          </OptGroup>
                        </Select>
                      )}
                    </FormItem>
                    <FormItem
                      className="c7n-select_480 network-panel-form"
                      {...formItemLayout}
                    >
                      {getFieldDecorator("appInstance", {
                        initialValue: initIst.length ? initIst : undefined,
                        trigger: ["onChange", "onSubmit"],
                        rules: [
                          {
                            required: true,
                            message: intl.formatMessage({ id: "required" }),
                          },
                          {
                            validator: this.checkInstance,
                          },
                        ],
                      })(
                        <Select
                          filter
                          mode="multiple"
                          className="c7n-select_480 network-select-instance"
                          optionFilterProp="children"
                          optionLabelProp="children"
                          disabled={!getFieldValue("envId")}
                          label={
                            <FormattedMessage id="network.target.instance" />
                          }
                          notFoundContent={intl.formatMessage({
                            id: "network.form.instance.disable",
                          })}
                          getPopupContainer={triggerNode =>
                            triggerNode.parentNode
                          }
                          choiceRender={this.handleRenderInstance}
                          filterOption={(input, option) =>
                            option.props.children.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {initIstOption}
                          {istOption}
                        </Select>
                      )}
                    </FormItem>
                  </Fragment>
                )}
                {targetType === "param" && (
                  <Fragment>
                    {targetItems}
                    <Button
                      disabled={!getFieldValue("envId")}
                      type="primary"
                      funcType="flat"
                      onClick={() => this.addGroup("targetKeys")}
                      icon="add"
                    >
                      <FormattedMessage id="network.config.addtarget" />
                    </Button>
                  </Fragment>
                )}
                {targetType === "endPoints" && (
                  <Fragment>
                    <FormItem
                      className="c7n-select_480 network-panel-form"
                      {...formItemLayout}
                    >
                      {getFieldDecorator("targetIps", {
                        rules: [
                          {
                            required: true,
                            message: intl.formatMessage({ id: "required" }),
                          },
                          {
                            validator: (rule, value, callback) =>
                              this.checkIP(rule, value, callback, "targetIps"),
                          },
                        ],
                        initialValue: targetIps,
                      })(
                        <Select
                          mode="tags"
                          ref={node => this.ipSelectRef(node, "targetIps")}
                          disabled={!getFieldValue("envId")}
                          className="c7n-select_512"
                          label={<FormattedMessage id="network.target.ip" />}
                          onInputKeyDown={e =>
                            this.handleInputKeyDown(e, "targetIps")
                          }
                          choiceRender={(liNode, value) =>
                            this.handleChoiceRender(liNode, value, "targetIp")
                          }
                          onChoiceRemove={value =>
                            this.handleChoiceRemove(value, "targetIp")
                          }
                          filterOption={false}
                          notFoundContent={false}
                          showNotFindInputItem={false}
                          showNotFindSelectedItem={false}
                          allowClear
                        />
                      )}
                    </FormItem>
                    {targetPortItems}
                    <Button
                      disabled={!getFieldValue("envId")}
                      type="primary"
                      funcType="flat"
                      onClick={() => this.addGroup("endPoints")}
                      icon="add"
                    >
                      <FormattedMessage id="network.config.addport" />
                    </Button>
                  </Fragment>
                )}
              </div>
              <div
                className={`network-panel-title ${
                  !getFieldValue("envId") ? "network-panel-title_disabled" : ""
                }`}
              >
                <Icon type="router" />
                <FormattedMessage id="network.config" />
              </div>
              <div className="network-radio-wrap">
                <div
                  className={`network-radio-label ${
                    !getFieldValue("envId")
                      ? "network-radio-label_disabled"
                      : ""
                  }`}
                >
                  <FormattedMessage id="chooseType" />
                </div>
                <FormItem
                  className="c7n-select_512 network-radio-form"
                  {...formItemLayout}
                >
                  {getFieldDecorator("config", {
                    initialValue: configType,
                  })(
                    <RadioGroup
                      name="config"
                      disabled={!getFieldValue("envId")}
                      onChange={e => this.handleTypeChange(e, "portKeys")}
                    >
                      <Radio value="ClusterIP">ClusterIP</Radio>
                      <Radio value="NodePort">NodePort</Radio>
                      <Radio value="LoadBalancer">LoadBalancer</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </div>
              <div className="network-panel">
                {configType === "ClusterIP" ? (
                  <Fragment>
                    <FormItem
                      className="c7n-select_480 network-panel-form"
                      {...formItemLayout}
                    >
                      {getFieldDecorator("externalIps", {
                        initialValue: initIp,
                        rules: [
                          {
                            validator: this.checkIP,
                          },
                        ],
                      })(
                        <Select
                          mode="tags"
                          ref={this.ipSelectRef}
                          disabled={!getFieldValue("envId")}
                          className="c7n-select_512"
                          label={<FormattedMessage id="network.config.ip" />}
                          onInputKeyDown={this.handleInputKeyDown}
                          choiceRender={this.handleChoiceRender}
                          onChoiceRemove={this.handleChoiceRemove}
                          filterOption={false}
                          notFoundContent={false}
                          showNotFindInputItem={false}
                          showNotFindSelectedItem={false}
                          allowClear
                        />
                      )}
                    </FormItem>
                    {portItems}
                  </Fragment>
                ) : (
                  portItems
                )}
                <Button
                  disabled={!getFieldValue("envId")}
                  type="primary"
                  funcType="flat"
                  onClick={() => this.addGroup("portKeys")}
                  icon="add"
                >
                  <FormattedMessage id="network.config.addport" />
                </Button>
              </div>
            </Form>
            <InterceptMask visible={submitting} />
          </Content>
        </Sidebar>
      </div>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(EditNetwork)));
