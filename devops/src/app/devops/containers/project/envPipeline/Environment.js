/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component, Fragment } from "react";
import { observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { injectIntl, FormattedMessage } from "react-intl";
import {
  Button,
  Input,
  Form,
  Tooltip,
  Modal,
  Popover,
  Select,
  Table,
  Spin,
  Tag,
  Icon,
} from "choerodon-ui";
import {
  Content,
  Header,
  Page,
  Permission,
  stores,
} from "choerodon-front-boot";
import _ from "lodash";
import classNames from "classnames";
import CopyToBoard from "react-copy-to-clipboard";
import Board from "./pipeline/Board";
import LoadingBar from "../../../components/loadingBar/index";
import EnvGroup from "./EnvGroup";
import "../../main.scss";
import "./EnvPipeLineHome.scss";
import EnvPipelineStore from "../../../stores/project/envPipeline";
import { getSelectTip } from "../../../utils";

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
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

@observer
class Environment extends Component {
  /**
   * 环境编码校验
   * @param rule 校验规则
   * @param value code值
   * @param callback 回调提示
   */
  checkCode = _.debounce((rule, value, callback) => {
    const {
      EnvPipelineStore,
      intl: { formatMessage },
    } = this.props;
    const { cluster } = this.state;
    if (cluster && value) {
      const pa = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
      const { id: projectId } = AppState.currentMenuType;
      if (pa.test(value)) {
        EnvPipelineStore.checkEnvCode(projectId, cluster, value).then(data => {
          if (data && data.failed) {
            callback(
              formatMessage({
                id: "envPl.code.check.exist",
              })
            );
          } else {
            callback();
          }
        });
      } else {
        callback(
          formatMessage({
            id: "envPl.code.check.failed",
          })
        );
      }
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
    const {
      EnvPipelineStore,
      intl: { formatMessage },
    } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { cluster } = this.state;
    const envData = EnvPipelineStore.getEnvData;
    const flag = envData ? value !== envData.name : value;
    if (cluster && flag) {
      EnvPipelineStore.checkEnvName(projectId, cluster, value).then(error => {
        if (error && error.failed) {
          callback(
            formatMessage({
              id: "envPl.name.check.exist",
            })
          );
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
      moveBan: false,
      delEnvShow: false,
      disEnvShow: false,
      delGroupShow: false,
      disEnvConnect: false,
      envName: null,
      enableClick: false,
      delGroupName: null,
      delEnv: null,
      disEnv: null,
      delGroup: null,
      moveRight: 300,
      createSelectedRowKeys: [],
      createSelected: [],
      selectedRowKeys: false,
      selected: [],
      createSelectedTemp: [],
      cluster: null,
    };
  }

  componentDidMount() {
    this.loadEnvs();
    this.loadEnvGroups();
  }

  componentWillUnmount() {
    const { EnvPipelineStore } = this.props;
    EnvPipelineStore.setEnvcardPosition([]);
    EnvPipelineStore.setDisEnvcardPosition([]);
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
  showSideBar = type => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    if (type === "create") {
      EnvPipelineStore.loadPrm(projectId);
      EnvPipelineStore.loadCluster(projectId);
    }
    EnvPipelineStore.setSideType(type);
    this.setState({
      submitting: false,
    });
    EnvPipelineStore.setShow(true);
  };

  showGroup = type => {
    const { EnvPipelineStore } = this.props;
    EnvPipelineStore.setSideType(type);
    EnvPipelineStore.setShowGroup(true);
  };

  /**
   * 关闭侧边栏
   */
  handleCancelFun = () => {
    const {
      EnvPipelineStore,
      form: { resetFields },
    } = this.props;
    this.setState({
      createSelectedRowKeys: [],
      createSelected: [],
      selectedRowKeys: false,
    });
    EnvPipelineStore.setShow(false);
    EnvPipelineStore.setEnvData(null);
    EnvPipelineStore.setSelectedRk([]);
    resetFields();
  };

  /**
   * 禁用环境
   */
  disableEnv = () => {
    const { EnvPipelineStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { disEnv } = this.state;
    this.setState({
      submitting: true,
    });
    EnvPipelineStore.banEnvById(projectId, disEnv, false)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else if (data) {
          this.loadEnvs();
          this.closeDisEnvModal();
        }
        this.setState({
          submitting: false,
        });
      })
      .catch(error => {
        this.setState({ submitting: false });
        Choerodon.handleResponseError(error);
      });
  };

  showDisEnvModal = (id, connect, name) => {
    const { EnvPipelineStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    EnvPipelineStore.loadInstance(projectId, id)
      .then(() => {
        // 确保查询完实例后才可以点击确认
        this.setState({ enableClick: true });
      })
      .catch(() => {
        this.setState({ enableClick: true });
      });
    this.setState({
      disEnvShow: true,
      disEnv: id,
      disEnvConnect: connect,
    });
  };

  closeDisEnvModal = () => {
    this.setState({
      disEnvShow: false,
      enableClick: false,
    });
  };

  /**
   * 删除环境组
   */
  deleteGroup = () => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const { delGroup } = this.state;
    this.setState({
      submitting: true,
    });
    EnvPipelineStore.delGroupById(projectId, delGroup)
      .then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else if (data) {
          this.reload();
          this.closeDelGroupModal();
        }
        this.setState({
          submitting: false,
        });
      })
      .catch(error => {
        this.setState({
          submitting: false,
        });
        Choerodon.handleResponseError(error);
      });
  };

  showDelGroupModal = (id, name) => {
    this.setState({
      delGroupShow: true,
      delGroup: id,
      delGroupName: name,
    });
  };

  closeDelGroupModal = () => {
    this.setState({
      delGroupShow: false,
    });
  };

  /**
   * 环境启用
   * @param id 环境ID
   */
  actEnv = id => {
    const { EnvPipelineStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    EnvPipelineStore.banEnvById(projectId, id, true).then(data => {
      if (data && data.failed) {
        Choerodon.prompt(data.message);
      } else if (data) {
        this.loadEnvs();
      }
    });
  };

  /**
   * 删除停用区的环境
   */
  deleteEnv = () => {
    const { EnvPipelineStore } = this.props;
    const { id: projectId } = AppState.currentMenuType;
    const { delEnv } = this.state;
    this.setState({
      submitting: true,
    });
    EnvPipelineStore.deleteEnv(projectId, delEnv)
      .then(data => {
        this.setState({
          submitting: false,
        });
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.loadEnvs();
          this.closeDelEnvModal();
        }
      })
      .catch(error => {
        this.setState({
          submitting: false,
        });
        Choerodon.handleResponseError(error);
      });
  };

  showDelEnvModal = (id, name) => {
    this.setState({
      delEnvShow: true,
      delEnv: id,
      envName: name,
    });
  };

  closeDelEnvModal = () => {
    this.setState({
      delEnvShow: false,
    });
  };

  /**
   * 选择集群
   * @param id
   */
  handleCluster = id => {
    const {
      form: { validateFields, getFieldValue },
    } = this.props;
    this.setState(
      {
        cluster: id,
      },
      () => {
        getFieldValue("code") && validateFields(["code"], { force: true });
        getFieldValue("name") && validateFields(["name"], { force: true });
      }
    );
  };

  /**
   * 表单提交
   * @param e
   */
  handleSubmit = e => {
    e.preventDefault();
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    const sideType = EnvPipelineStore.getSideType;
    const tagKeys = EnvPipelineStore.getTagKeys;
    this.setState({
      submitting: true,
    });
    if (sideType === "create") {
      this.props.form.validateFieldsAndScroll((err, data) => {
        if (!err) {
          data.userIds = this.state.createSelectedRowKeys;
          EnvPipelineStore.createEnv(projectId, data).then(res => {
            if (res && res.failed) {
              this.setState({
                submitting: false,
              });
              Choerodon.prompt(res.message);
            } else {
              this.loadEnvs();
              EnvPipelineStore.setShow(false);
              this.setState({
                submitting: false,
                createSelectedRowKeys: [],
                createSelected: [],
              });
            }
          });
        } else {
          this.setState({
            submitting: false,
          });
        }
      });
    } else if (sideType === "edit") {
      this.props.form.validateFieldsAndScroll((err, data, modify) => {
        if (modify) {
          if (!err) {
            EnvPipelineStore.setShow(false);
            const id = EnvPipelineStore.getEnvData.id;
            EnvPipelineStore.setSideType(null);
            EnvPipelineStore.updateEnv(projectId, { ...data, id }).then(res => {
              if (res && res.failed) {
                this.setState({
                  submitting: false,
                });
                Choerodon.prompt(res.message);
              } else if (res) {
                this.loadEnvs();
                EnvPipelineStore.setShow(false);
                this.props.form.resetFields();
                this.setState({
                  submitting: false,
                });
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
      });
    } else {
      const id = EnvPipelineStore.getEnvData.id;
      const userIds = _.map(tagKeys, t => t.iamUserId);
      EnvPipelineStore.assignPrm(projectId, id, userIds)
        .then(data => {
          if (data && data.failed) {
            Choerodon.prompt(data.message);
          } else {
            EnvPipelineStore.setShow(false);
          }
          this.setState({
            selectedRowKeys: false,
            submitting: false,
          });
          EnvPipelineStore.setSelectedRk([]);
          EnvPipelineStore.setTagKeys([]);
        })
        .catch(error => {
          this.setState({
            submitting: false,
          });
          Choerodon.handleResponseError(error);
        });
    }
  };

  /**
   * 根据type显示右侧框标题
   * @param type
   * @returns {*}
   */
  showTitle = type => {
    const {
      intl: { formatMessage },
    } = this.props;
    const msg = {
      create: "create",
      edit: "edit",
      createGroup: "group.create",
      editGroup: "group.edit",
      permission: "authority",
    };
    return type
      ? formatMessage({
          id: `envPl.${msg[type]}`,
        })
      : "";
  };

  /**
   * 根据type显示footer text
   * @param type
   * @returns {*}
   */
  okText = type => {
    const {
      intl: { formatMessage },
    } = this.props;
    let text = "";
    switch (type) {
      case "create":
      case "createGroup":
        text = "create";
        break;
      case "edit":
      case "editGroup":
      case "permission":
        text = "save";
        break;
      default:
        text = "envPl.close";
    }
    return formatMessage({
      id: text,
    });
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
    document.getElementsByClassName("c7n-inner-container-ban")[0].scroll({
      left: scrollLeft,
      behavior: "smooth",
    });
  };

  /**
   * 点击左滑动
   */
  pushScrollLeft = () => {
    const domPosition = document.getElementsByClassName(
      "c7n-inner-container-ban"
    )[0].scrollLeft;
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
    document.getElementsByClassName("c7n-inner-container-ban")[0].scroll({
      left: scrollLeft + 300,
      behavior: "smooth",
    });
    scrollLeft += 300;
  };

  /**
   * 分配权限
   * @param keys
   * @param selected
   */
  onSelectChange = (keys, selected) => {
    const { EnvPipelineStore } = this.props;
    const { getTagKeys: tagKeys, getPrmMbr } = EnvPipelineStore;
    let s = [];
    const a = tagKeys.length
      ? tagKeys.concat(selected)
      : this.state.selected.concat(selected);
    // const tagKs = tagKeys.length ? _.map(tagKeys, p => p.iamUserId).concat(keys) : keys;
    this.setState({ selected: a });
    _.map(keys, o => {
      if (_.filter(a, ["iamUserId", o]).length) {
        s.push(_.filter(a, ["iamUserId", o])[0]);
      }
    });
    const ids = _.map(getPrmMbr, p => p.iamUserId);
    const delIds = _.difference(ids, keys);
    let selectIds = tagKeys;
    _.map(delIds, d => {
      _.map(selectIds, t => {
        if (d === t.iamUserId) {
          selectIds = _.reject(selectIds, s => s.iamUserId === d);
        }
      });
    });
    const temp = _.map(selectIds, s => s.iamUserId);
    _.map(selected, k => {
      if (!_.includes(temp, k.iamUserId)) {
        selectIds.push(k);
      }
    });
    EnvPipelineStore.setSelectedRk(keys);
    EnvPipelineStore.setTagKeys(s);
    this.setState({ selectedRowKeys: keys });
  };

  onCreateSelectChange = (keys, selected) => {
    let s = [];
    const a = this.state.createSelectedTemp.concat(selected);
    this.setState({ createSelectedTemp: a });
    _.map(keys, o => {
      if (_.filter(a, ["iamUserId", o]).length) {
        s.push(_.filter(a, ["iamUserId", o])[0]);
      }
    });
    this.setState({
      createSelectedRowKeys: keys,
      createSelected: s,
    });
  };

  /**
   * table 操作
   * @param pagination
   * @param filters
   * @param sorter
   * @param paras
   */
  tableChange = (pagination, filters, sorter, paras) => {
    const { EnvPipelineStore } = this.props;
    const { id } = AppState.currentMenuType;
    const envId = EnvPipelineStore.getEnvData
      ? EnvPipelineStore.getEnvData.id
      : null;
    const sideType = EnvPipelineStore.getSideType;
    EnvPipelineStore.setInfo({
      filters,
      sort: sorter,
      paras,
    });
    let sort = {
      field: "",
      order: "desc",
    };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      if (sorter.order === "ascend") {
        sort.order = "asc";
      } else if (sorter.order === "descend") {
        sort.order = "desc";
      }
    }
    let searchParam = {};
    let page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };
    if (sideType === "create") {
      EnvPipelineStore.loadPrm(
        id,
        null,
        page,
        pagination.pageSize,
        sort,
        postData
      );
    } else {
      EnvPipelineStore.loadPrm(
        id,
        envId,
        page,
        pagination.pageSize,
        sort,
        postData
      );
    }
  };

  render() {
    const {
      EnvPipelineStore,
      intl: { formatMessage },
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const {
      moveBan,
      submitting,
      createSelectedRowKeys,
      createSelected,
      selectedRowKeys,
      delEnvShow,
      disEnvShow,
      delGroupShow,
      disEnvConnect,
      enableClick,
      envName,
      delGroupName,
    } = this.state;
    const {
      id: projectId,
      organizationId,
      type,
      name,
    } = AppState.currentMenuType;
    const {
      getEnvcardPosition: envCard,
      getDisEnvcardPosition: disEnvCard,
      getPrmMbr,
      getMbr,
      getTagKeys: tagKeys,
      getSelectedRk,
      getEnvData: envData,
      getIst,
      getShow,
      getShowGroup: showGroup,
      getSideType: sideType,
      getGroup: groupData,
      getCluster,
      getPageInfo,
      loading,
      getInfo: { filters, paras },
    } = EnvPipelineStore;

    // 禁用环境的Modal信息
    let disableMsg = "noInstance";
    if (getIst.length && disEnvConnect) {
      disableMsg = "forbidden";
    }

    let DisEnvDom = (
      <span className="c7n-none-des">
        {formatMessage({
          id: "envPl.status.stop",
        })}
      </span>
    );

    if (disEnvCard.length) {
      const disData = [];
      _.map(disEnvCard, d => {
        if (d.devopsEnviromentRepDTOs.length) {
          disData.push(d.devopsEnviromentRepDTOs);
        }
      });
      DisEnvDom = _.map(disData[0], env => (
        <div className="c7n-env-card c7n-env-card-ban" key={env.id}>
          <div className="c7n-env-card-header">
            {env.name}
            <div className="c7n-env-card-action">
              <Permission
                service={[
                  "devops-service.devops-environment.enableOrDisableEnv",
                ]}
                organizationId={organizationId}
                projectId={projectId}
                type={type}
              >
                <Tooltip title={<FormattedMessage id="envPl.status.restart" />}>
                  <Button
                    shape="circle"
                    onClick={this.actEnv.bind(this, env.id)}
                    icon="finished"
                  />
                </Tooltip>
              </Permission>
              <Permission
                service={[
                  "devops-service.devops-environment.enableOrDisableEnv",
                ]}
                organizationId={organizationId}
                projectId={projectId}
                type={type}
              >
                <Tooltip title={<FormattedMessage id="envPl.delete" />}>
                  <Button
                    shape="circle"
                    onClick={this.showDelEnvModal.bind(this, env.id, env.name)}
                    icon="delete_forever"
                  />
                </Tooltip>
              </Permission>
            </div>
          </div>
          <div className="c7n-env-card-content">
            <div className="c7n-env-state c7n-env-state-ban">
              <FormattedMessage id="envPl.status.stopped" />
            </div>
            <div className="c7n-env-des-wrap">
              <div className="c7n-env-des" title={env.description}>
                <span className="c7n-env-des-head">
                  {formatMessage({
                    id: "envPl.description",
                  })}
                </span>
                {env.description}
              </div>
            </div>
          </div>
        </div>
      ));
    }

    const BoardDom = _.map(envCard, e => (
      <Board
        projectId={Number(projectId)}
        key={e.devopsEnvGroupId}
        groupId={e.devopsEnvGroupId}
        Title={e.devopsEnvGroupName}
        onDisable={this.showDisEnvModal}
        onDeleteGroup={this.showDelGroupModal}
        envcardPositionChild={e.devopsEnviromentRepDTOs || []}
      />
    ));

    const leftDom =
      scrollLeft !== 0 ? (
        <div
          role="none"
          className="c7n-push-left-ban icon icon-navigate_before"
          onClick={this.pushScrollRight}
        />
      ) : null;

    const rightStyle = classNames({
      "c7n-push-right-ban icon icon-navigate_next":
        (window.innerWidth >= 1680 &&
          window.innerWidth < 1920 &&
          disEnvCard.length >= 5) ||
        (window.innerWidth >= 1920 && disEnvCard.length >= 6) ||
        (window.innerWidth < 1680 && disEnvCard.length >= 4),
      "c7n-push-none": disEnvCard.length <= 4,
    });

    const rightDom = moveBan ? null : (
      <div role="none" className={rightStyle} onClick={this.pushScrollLeft} />
    );

    const rowSelection = {
      selectedRowKeys: _.map(tagKeys, s => s.iamUserId),
      onChange: this.onSelectChange,
    };

    const rowCreateSelection = {
      selectedRowKeys: createSelectedRowKeys,
      onChange: this.onCreateSelectChange,
    };

    const tagDom = _.map(tagKeys, t => {
      if (t) {
        return (
          <Tag className="c7n-env-tag" key={t.iamUserId}>
            {t.loginName} {t.realName}
          </Tag>
        );
      }
      return null;
    });

    const tagCreateDom = _.map(createSelected, t => (
      <Tag className="c7n-env-tag" key={t.iamUserId}>
        {t.loginName} {t.realName}
      </Tag>
    ));

    const columns = [
      {
        key: "loginName",
        filters: [],
        filteredValue: filters.loginName || [],
        title: formatMessage({
          id: "envPl.loginName",
        }),
        dataIndex: "loginName",
      },
      {
        key: "realName",
        filters: [],
        filteredValue: filters.realName || [],
        title: formatMessage({
          id: "envPl.userName",
        }),
        dataIndex: "realName",
      },
    ];

    let formContent = null;
    switch (sideType) {
      case "create":
        formContent = (
          <div>
            <Form className="c7n-sidebar-form" layout="vertical">
              <div className="c7ncd-sidebar-select">
                <FormItem {...formItemLayout}>
                  {getFieldDecorator("clusterId", {
                    rules: [
                      {
                        required: true,
                        message: formatMessage({
                          id: "required",
                        }),
                      },
                    ],
                  })(
                    <Select
                      allowClear={false}
                      filter
                      onSelect={this.handleCluster}
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      label={<FormattedMessage id="envPl.form.cluster" />}
                    >
                      {getCluster.length
                        ? _.map(getCluster, c => (
                            <Option key={c.id} value={c.id}>
                              {c.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  )}
                </FormItem>
                {getSelectTip("envPl.cluster.tip")}
              </div>
              <FormItem {...formItemLayout}>
                {getFieldDecorator("code", {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({
                        id: "required",
                      }),
                    },
                    {
                      validator: this.checkCode,
                    },
                  ],
                })(
                  <Input
                    disabled={!getFieldValue("clusterId")}
                    maxLength={30}
                    label={<FormattedMessage id="envPl.form.code" />}
                    suffix={getSelectTip("envPl.envCode.tip")}
                  />
                )}
              </FormItem>
              <FormItem {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({
                        id: "required",
                      }),
                    },
                    {
                      validator: this.checkName,
                    },
                  ],
                })(
                  <Input
                    disabled={!getFieldValue("clusterId")}
                    maxLength={10}
                    label={<FormattedMessage id="envPl.form.name" />}
                    suffix={getSelectTip("envPl.envName.tip")}
                  />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="envPl.form.description" />}
              >
                {getFieldDecorator("description")(
                  <TextArea
                    autosize={{
                      minRows: 2,
                    }}
                    maxLength={60}
                    label={<FormattedMessage id="envPl.form.description" />}
                    suffix={getSelectTip("envPl.chooseClu.tip")}
                  />
                )}
              </FormItem>
              <div className="c7ncd-sidebar-select">
                <FormItem {...formItemLayout}>
                  {getFieldDecorator("devopsEnvGroupId")(
                    <Select
                      allowClear
                      filter
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      label={<FormattedMessage id="envPl.form.group" />}
                    >
                      {groupData.length
                        ? _.map(groupData, g => (
                            <Option key={g.id} value={g.id}>
                              {g.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  )}
                </FormItem>
                {getSelectTip("envPl.group.tip")}
              </div>
            </Form>
            <div className="c7n-sidebar-form">
              <div className="c7n-env-tag-title">
                <FormattedMessage id="envPl.authority" />
                <Popover
                  overlayStyle={{ width: 350 }}
                  content={formatMessage({
                    id: "envPl.authority.help",
                  })}
                >
                  <Icon type="help" />
                </Popover>
              </div>
              <Table
                className="c7n-env-noTotal"
                rowSelection={rowCreateSelection}
                columns={columns}
                dataSource={getMbr}
                filterBarPlaceholder={formatMessage({
                  id: "filter",
                })}
                pagination={getPageInfo}
                loading={loading}
                onChange={this.tableChange}
                rowKey={record => record.iamUserId}
                filters={paras.slice()}
              />
            </div>
            <div className="c7n-env-tag-title">
              <FormattedMessage id="envPl.authority.member" />
            </div>
            <div className="c7n-env-tag-wrap"> {tagCreateDom} </div>
          </div>
        );
        break;
      case "edit":
        formContent = (
          <div className="c7n-sidebar-form">
            <Form>
              <FormItem {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({
                        id: "required",
                      }),
                    },
                    {
                      validator: this.checkName,
                    },
                  ],
                  initialValue: envData ? envData.name : "",
                })(
                  <Input
                    maxLength={10}
                    label={<FormattedMessage id="envPl.form.name" />}
                  />
                )}
              </FormItem>
              <FormItem {...formItemLayout}>
                {getFieldDecorator("description", {
                  initialValue: envData ? envData.description : "",
                })(
                  <TextArea
                    autosize={{
                      minRows: 2,
                    }}
                    maxLength={60}
                    label={<FormattedMessage id="envPl.form.description" />}
                  />
                )}
              </FormItem>
              <div className="c7ncd-sidebar-select">
                <FormItem {...formItemLayout}>
                  {getFieldDecorator("devopsEnvGroupId", {
                    initialValue: envData
                      ? envData.devopsEnvGroupId
                      : undefined,
                  })(
                    <Select
                      allowClear
                      filter
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      label={<FormattedMessage id="envPl.form.group" />}
                    >
                      {groupData.length
                        ? _.map(groupData, g => (
                            <Option key={g.id} value={g.id}>
                              {g.name}
                            </Option>
                          ))
                        : null}
                    </Select>
                  )}
                </FormItem>
                {getSelectTip("envPl.group.tip")}
              </div>
            </Form>
          </div>
        );
        break;
      case "permission":
        formContent = (
          <div>
            <div className="c7n-sidebar-form">
              <Table
                className="c7n-env-noTotal"
                rowSelection={rowSelection}
                dataSource={getPrmMbr}
                columns={columns}
                filterBarPlaceholder={formatMessage({
                  id: "filter",
                })}
                pagination={getPageInfo}
                loading={loading}
                onChange={this.tableChange}
                rowKey={record => record.iamUserId}
                filters={paras.slice()}
              />
            </div>
            <div className="c7n-env-tag-title">
              <FormattedMessage id="envPl.authority.member" />
            </div>
            <div className="c7n-env-tag-wrap"> {tagDom} </div>
          </div>
        );
        break;
      default:
        formContent = null;
    }

    return (
      <Page
        className="c7n-region"
        service={[
          "devops-service.devops-environment.listByProjectIdAndActive",
          "devops-service.devops-environment.listAllUserPermission",
          "devops-service.devops-environment.listUserPermissionByEnvId",
          "devops-service.devops-environment.updateEnvUserPermission",
          "devops-service.devops-environment.create",
          "devops-service.devops-environment.update",
          "devops-service.devops-environment.checkCode",
          "devops-service.devops-environment.checkName",
          "devops-service.devops-environment.sort",
          "devops-service.devops-environment.enableOrDisableEnv",
          "devops-service.devops-environment.queryShell",
          "devops-service.devops-environment.query",
          "devops-service.application-instance.pageByOptions",
          "devops-service.devops-env-group.listByProject",
          "devops-service.devops-env-group.create",
          "devops-service.devops-env-group.update",
          "devops-service.devops-env-group.checkName",
          "devops-service.devops-env-group.delete",
        ]}
      >
        <Header title={<FormattedMessage id="envPl.head" />}>
          <Permission
            service={["devops-service.devops-environment.create"]}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Button
              funcType="flat"
              onClick={this.showSideBar.bind(this, "create")}
            >
              <i className="icon-playlist_add icon" />
              <FormattedMessage id="envPl.create" />
            </Button>
          </Permission>
          <Permission
            service={["devops-service.devops-env-group.create"]}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Button
              funcType="flat"
              onClick={this.showGroup.bind(this, "createGroup")}
            >
              <i className="icon-playlist_add icon" />
              <FormattedMessage id="envPl.group.create" />
            </Button>
          </Permission>
          <Button funcType="flat" onClick={this.reload}>
            <i className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          code="env"
          values={{
            name,
          }}
        >
          <Sidebar
            title={this.showTitle(sideType)}
            visible={getShow}
            onOk={this.handleSubmit}
            onCancel={this.handleCancelFun.bind(this)}
            confirmLoading={submitting}
            cancelText={<FormattedMessage id="cancel" />}
            okText={this.okText(sideType)}
            className="c7n-create-sidebar-tooltip"
          >
            <Content
              code={`env.${sideType}`}
              values={{
                name: envData ? envData.name : name,
              }}
              className="sidebar-content"
            >
              {formContent}
            </Content>
          </Sidebar>
          <Modal
            visible={disEnvShow}
            width={400}
            footer={
              enableClick
                ? [
                    <Button key="back" onClick={this.closeDisEnvModal}>
                      {formatMessage({ id: "return" })}
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      loading={submitting}
                      onClick={
                        getIst.length && disEnvConnect
                          ? this.closeDisEnvModal
                          : this.disableEnv
                      }
                    >
                      {formatMessage({ id: "submit" })}
                    </Button>,
                  ]
                : null
            }
            closable={false}
            wrapClassName="vertical-center-modal remove"
          >
            {enableClick ? (
              [
                <div className="c7ncd-modal-title">
                  {formatMessage({ id: `envPl.${disableMsg}.disable` })}
                </div>,
                formatMessage({ id: `envPl.disEnv.${disableMsg}` }),
              ]
            ) : (
              <div className="c7ncd-env-spin">
                <Spin />
              </div>
            )}
          </Modal>
          <Modal
            visible={delGroupShow}
            closable={false}
            confirmLoading={submitting}
            title={`${formatMessage({
              id: "envPl.group.del",
            })}“${delGroupName}”`}
            footer={[
              <Button
                key="back"
                onClick={this.closeDelGroupModal}
                disabled={submitting}
              >
                {<FormattedMessage id="cancel" />}
              </Button>,
              <Button
                key="submit"
                type="danger"
                onClick={this.deleteGroup}
                loading={submitting}
              >
                {formatMessage({ id: "delete" })}
              </Button>,
            ]}
          >
            {formatMessage({ id: "envPl.confirm.group.del" })}
          </Modal>
          <Modal
            visible={delEnvShow}
            closable={false}
            confirmLoading={submitting}
            title={`${formatMessage(
              { id: "envPl.delete.confirm" },
              { name: envName }
            )}`}
            footer={[
              <Button
                key="back"
                onClick={this.closeDelEnvModal}
                disabled={submitting}
              >
                {<FormattedMessage id="cancel" />}
              </Button>,
              <Button
                key="submit"
                type="danger"
                onClick={this.deleteEnv}
                loading={submitting}
              >
                {formatMessage({ id: "delete" })}
              </Button>,
            ]}
          >
            {formatMessage({ id: "envPl.delete.warn" })}
          </Modal>
          {showGroup ? (
            <EnvGroup
              store={EnvPipelineStore}
              okText={this.okText}
              showTitle={this.showTitle}
            />
          ) : null}
          {EnvPipelineStore.getIsLoading ? (
            <LoadingBar display />
          ) : (
            <Fragment>
              {BoardDom.length ? (
                BoardDom
              ) : (
                <Board
                  projectId={Number(projectId)}
                  key="none"
                  envcardPositionChild={[]}
                />
              )}
              <div className="no-content-padding">
                <Content
                  code="env.stop"
                  values={{
                    name,
                  }}
                >
                  <div className="c7n-outer-container">
                    {leftDom}
                    <div className="c7n-inner-container-ban">
                      <div className="c7n-env-board-ban"> {DisEnvDom} </div>
                    </div>
                    {rightDom}
                  </div>
                </Content>
              </div>
            </Fragment>
          )}
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(Environment)));
