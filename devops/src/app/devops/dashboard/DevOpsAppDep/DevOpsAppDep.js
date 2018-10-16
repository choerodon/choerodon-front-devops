import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { DashBoardNavBar, stores, axios } from 'choerodon-front-boot';
import { FormattedMessage, injectIntl } from 'react-intl';
import { observer } from 'mobx-react';
import { Select, Spin, Tooltip, Button } from 'choerodon-ui';
import _ from 'lodash';
import './index.scss';
import '../common.scss';
import '../DevOpsDeploy/index.scss';
import { handleProptError } from '../../utils';

const { AppState } = stores;
const { Option } = Select;

@observer
class DevOpsAppDep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app: [],
      ist: [],
      appId: null,
      loading: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  /**
   * 选择应用
   * @param id 应用ID
   */
  handleAppSelect = (id) => {
    this.setState({
      appId: id,
    });
    this.loadBoard(id);
  };

  loadData() {
    const { projectId } = AppState.currentMenuType;
    axios.get(`/devops/v1/projects/${projectId}/apps/list_all`)
      .then((app) => {
        const appRes = handleProptError(app);
        if (appRes.length) {
          this.setState({
            app: appRes,
            appId: appRes[0].id,
          });
        } else {
          this.setState({
            noSelect: true,
            loading: false,
          });
        }
        this.loadBoard(appRes[0].id);
      });
  }

  /**
   * 加载应用部署情况
   * @param id appId
   */
  loadBoard = (id) => {
    const { projectId } = AppState.currentMenuType;
    this.setState({
      loading: true,
    });
    axios.get(`devops/v1/projects/${projectId}/deployVersions?app_id=${id}`)
      .then((ist) => {
        const istRes = handleProptError(ist);
        if (istRes) {
          this.setState({
            ist: istRes,
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      });
  };

  getContent = () => {
    const { loading, ist } = this.state;
    if (loading) {
      return (<div className="c7n-spin-wrap"><Spin wrapperClassName="c7n-spin-wrap" /></div>);
    }
    const istDom = _.map(ist.deployEnvVersionDTO, i => (<Fragment>
      <div className="c7n-appDep-title">
        {i.envName}
      </div>
      {_.map(i.deployIntanceVersionDTO, t => (<div className="c7n-appDep-ist-wrap">
        <Tooltip title={<div><FormattedMessage id="dashboard.ist" />{t.instanceCount}</div>}>
          <Button
            className="c7n-multi-ist"
            funcType="flat"
            shape="circle"
          >
            <div>
              {t.instanceCount}
            </div>
          </Button>
        </Tooltip>
        <div className="c7n-appDep-ver">
          {t.deployVersion}
        </div>
        {t.update ? <Tooltip title={<FormattedMessage id="dpOverview.update" />}><span className="c7n-ist-status_update_top" /></Tooltip> : null}
      </div>))}

    </Fragment>));
    if (ist.latestVersion) {
      return (<div className="c7n-appDep-wrap">
        <div className="c7n-appDep-title">
          最新版本
        </div>
        <div className="c7n-appDep-ver">{ist.latestVersion}</div>
        {istDom}
      </div>);
    } else {
      return (<div className="c7n-appDep-wrap">
        <div className="c7n-appDep-ver">暂无应用部署</div>
      </div>);
    }
  };

  render() {
    const { id: projectId, name: projectName, organizationId, type } = AppState.currentMenuType;
    const { app, appId, noSelect } = this.state;
    const { intl: { formatMessage } } = this.props;
    const appDom = app.length ? _.map(app, d => (<Option key={d.id} value={d.id}>{d.name}</Option>)) : null;

    return (<Fragment>
      <div className="c7ncd-db-panel">
        <Select
          disabled={noSelect}
          dropdownMatchSelectWidth
          notFoundContent={formatMessage({ id: 'dashboard.noApp' })}
          placeholder={formatMessage({ id: 'dashboard.noApp' })}
          value={appDom ? appId : null}
          className={`c7n-select_100 ${noSelect ? 'c7n-select-noSelect' : ''}`}
          onChange={this.handleAppSelect}
        >
          {appDom}
        </Select>
        {this.getContent()}
      </div>
      <DashBoardNavBar>
        <Link to={`/devops/deploy-overview?type=${type}&id=${projectId}&name=${projectName}&organizationId=${organizationId}`}>
          <FormattedMessage id="dashboard.deploy" />
        </Link>
      </DashBoardNavBar>
    </Fragment>);
  }
}

export default withRouter(injectIntl(DevOpsAppDep));
