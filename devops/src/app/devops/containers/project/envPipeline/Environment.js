import React, { Component } from "react";
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
import Board from "./pipeline/Board";
import LoadingBar from "../../../components/loadingBar/index";
import EnvGroup from "./EnvGroup";
import "../../main.scss";
import "./EnvPipeLineHome.scss";

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
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      moveBan: false,
      delEnvShow: false,
      delEnv: null,
      moveRight: 300,
      createSelectedRowKeys: [],
      cluster: null,
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
  showSideBar = type => {
    const { EnvPipelineStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    if (type === "create") {
      EnvPipelineStore.loadPrm(projectId);
      EnvPipelineStore.loadCluster(projectId);
    }
    EnvPipelineStore.setSideType(type);
    EnvPipelineStore.setShow(true);
  };

  /**
   * 关闭侧边栏
   */
  handleCancelFun = () => {
    const {
      EnvPipelineStore,
      form: { resetFields },
    } = this.props;
    this.setState({ createSelectedRowKeys: [], createSelected: [] });
    EnvPipelineStore.setShow(false);
    EnvPipelineStore.setEnvData(null);
    EnvPipelineStore.setSelectedRk([]);
    resetFields();
  };

  showGroup = type => {
    const { EnvPipelineStore } = this.props;
    EnvPipelineStore.setSideType(type);
    EnvPipelineStore.setShowGroup(true);
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
    this.setState({ submitting: true });
    if (sideType === "delGroup") {
      EnvPipelineStore.delGroupById(projectId, groupOne.id).then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else if (data) {
          EnvPipelineStore.setGroupOne([]);
          this.reload();
        }
        this.setState({ submitting: false });
        EnvPipelineStore.setBan(false);
      });
    } else {
      const envId = EnvPipelineStore.getEnvData.id;
      EnvPipelineStore.banEnvById(projectId, envId, false).then(data => {
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else if (data) {
          this.loadEnvs();
        }
        this.setState({ submitting: false });
        EnvPipelineStore.setBan(false);
      });
    }
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
    this.setState({ submitting: true });
    EnvPipelineStore.deleteEnv(projectId, delEnv)
      .then(data => {
        this.setState({ submitting: false });
        if (data && data.failed) {
          Choerodon.prompt(data.message);
        } else {
          this.loadEnvs();
          this.closeDelEnvModal();
        }
      })
      .catch(error => {
        this.setState({ submitting: false });
        Choerodon.handleResponseError(err);
      });
  };

  showDelEnvModal = id => {
    this.setState({
      delEnvShow: true,
      delEnv: id,
    });
  };

  closeDelEnvModal = () => {
    this.setState({
      delEnvShow: false,
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
    document
      .getElementsByClassName("c7n-inner-container-ban")[0]
      .scroll({ left: scrollLeft, behavior: "smooth" });
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
    document
      .getElementsByClassName("c7n-inner-container-ban")[0]
      .scroll({ left: scrollLeft + 300, behavior: "smooth" });
    scrollLeft += 300;
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
      delEnvShow,
    } = this.state;
    const {
      id: projectId,
      organizationId,
      type,
      name,
    } = AppState.currentMenuType;
    const {
      getEnvcardPosition: envcardPosition,
      getDisEnvcardPosition: disEnvcardPosition,
      getPrmMbr: prmMbr,
      getMbr: mbr,
      getTagKeys: tagKeys,
      getSelectedRk: selectedRowKeys,
      getEnvData: envData,
      getIst: ist,
      shell,
      getShow: show,
      getShowGroup: showGroup,
      getSideType: sideType,
      getBan: ban,
      getGroup: groupData,
      getCluster,
      getPageInfo,
      loading,
      getInfo: {
        filters,
        sort: { columnKey, order },
        paras,
      },
    } = EnvPipelineStore;

    let DisEnvDom = (
      <span className="c7n-none-des">
        {formatMessage({ id: "envPl.status.stop" })}
      </span>
    );

    if (disEnvcardPosition.length) {
      const disData = [];
      _.map(disEnvcardPosition, d => {
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
                    onClick={this.showDelEnvModal.bind(this, env.id)}
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
            <div className="c7n-env-des" title={env.description}>
              <span className="c7n-env-des-head">
                {formatMessage({ id: "envPl.description" })}
              </span>
              {env.description}
            </div>
          </div>
        </div>
      ));
    }

    const BoardDom = _.map(envcardPosition, e => (
      <Board
        projectId={Number(projectId)}
        key={e.devopsEnvGroupId}
        groupId={e.devopsEnvGroupId}
        Title={e.devopsEnvGroupName}
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
          disEnvcardPosition.length >= 5) ||
        (window.innerWidth >= 1920 && disEnvcardPosition.length >= 6) ||
        (window.innerWidth < 1680 && disEnvcardPosition.length >= 4),
      "c7n-push-none": disEnvcardPosition.length <= 4,
    });

    const rightDom = moveBan ? null : (
      <div role="none" className={rightStyle} onClick={this.pushScrollLeft} />
    );

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
              icon="playlist_add"
              onClick={this.showSideBar.bind(this, "create")}
            >
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
              icon="playlist_add"
              onClick={this.showGroup.bind(this, "createGroup")}
            >
              <FormattedMessage id="envPl.group.create" />
            </Button>
          </Permission>
          <Button funcType="flat" onClick={this.reload} icon="refresh">
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code="env" values={{ name }}>
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
            <React.Fragment>
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
                <Content code="env.stop" values={{ name }}>
                  <div className="c7n-outer-container">
                    {leftDom}
                    <div className="c7n-inner-container-ban">
                      <div className="c7n-env-board-ban">{DisEnvDom}</div>
                    </div>
                    {rightDom}
                  </div>
                </Content>
              </div>
            </React.Fragment>
          )}
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(EnvPipelineHome)));
