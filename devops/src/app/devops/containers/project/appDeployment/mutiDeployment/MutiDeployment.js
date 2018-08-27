import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Button, Popover, Tooltip } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { stores } from 'choerodon-front-boot';
import LoadingBar from '../../../../components/loadingBar';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import '../../../main.scss';
import '../AppDeploy.scss';
import './MutiDeployment.scss';

const { AppState } = stores;

@observer
class MutiDeployment extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  render() {
    const { store, intl } = this.props;
    const appList = store.getMutiData;
    const envNames = store.getEnvcard;
    const projectId = parseInt(AppState.currentMenuType.id, 10);

    const trDom = [];
    let envDom = [];
    if (appList.length && envNames.length) {
      appList.map((app, appIndex) => {
        const tdDom = [];
        envNames.map((e, envIndex) => {
          const versionDom = [];
          app.envInstances.map((env, insIndex) => {
            if (env.envId === e.id) {
              versionDom.push(<td key={env.envId}>
                { env.envVersions.map(version => (<div className="c7n-deploy-muti-row" key={version.versionId}>
                  <div className="c7n-deploy-muti_card">
                    <Popover
                      placement="bottom"
                      title={<FormattedMessage id="ist.title" />}
                      content={version.instances.length ? version.instances.map(ist => (
                        <div key={ist.instanceId}>
                          <div className={`c7n-ist-status c7n-ist-status_${ist.instanceStatus}`}>
                            <div>{intl.formatMessage({ id: ist.instanceStatus || 'null' })}</div>
                          </div>
                          <span>{ist.instanceName}</span>
                        </div>
                      )) : <FormattedMessage id="ist.noIst" />}
                      trigger="hover"
                    >
                      <Button
                        className="c7n-multi-ist"
                        funcType="flat"
                        shape="circle"
                      >
                        <div>
                          {version.instances.length}
                        </div>
                      </Button>
                    </Popover>
                    <Tooltip title={version.version}>
                      <div className="c7n-text-ellipsis">
                        {version.version}
                      </div>
                    </Tooltip>
                  </div>
                </div>))}
              </td>);
            } else if (versionDom.length === 0 && insIndex === (app.envInstances.length - 1)) {
              versionDom.push(<td key={env.envId} />);
            }
            return versionDom;
          });
          return tdDom.push(versionDom);
        });

        trDom.push(<tr key={app.applicationId}>
          <td>
            <MouserOverWrapper text={app.applicationName} width={0.12}>
              {app.projectId === projectId ? <Tooltip title={<FormattedMessage id="project" />}><i className="icon icon-project c7n-icon-publish" /></Tooltip> : <Tooltip title={<FormattedMessage id="market" />}><i className="icon icon-apps c7n-icon-publish" /></Tooltip>}
              {app.applicationName}
            </MouserOverWrapper>
          </td>
          <td><React.Fragment>
            <div className="c7n-deploy-muti-row">
              <div className="c7n-deploy-muti_card">
                <Tooltip title={app.latestVersion}>
                  <div className="c7n-text-ellipsis">
                    {app.latestVersion}
                  </div>
                </Tooltip>
              </div>
            </div>
          </React.Fragment></td><React.Fragment>{tdDom}</React.Fragment>
        </tr>);
        return trDom;
      });
      envDom = envNames.map(env => (<td key={env.id}>
        {env.connect ? <Tooltip title={<FormattedMessage id="connect" />}><span className="c7n-ist-status_on" /></Tooltip> : <Tooltip title={<FormattedMessage id="disconnect" />}><span className="c7n-ist-status_off" /></Tooltip>}
        {env.name}
      </td>));
    }

    const contentDom = store.getIsLoading ? <LoadingBar display />
      : (<table className="c7n-mutiDep-table">
        <thead className="c7n-mutiDep-thead">
          <tr>
            <td><FormattedMessage id="deploy.app" /></td>
            <td><FormattedMessage id="ist.lastVer" /></td>
            <React.Fragment>
              {envDom}
            </React.Fragment>
          </tr>
        </thead>
        <tbody>
          {trDom}
        </tbody>
      </table>);

    return (<div className="c7n-multi-wrap">
      {contentDom}
    </div>);
  }
}
export default (withRouter(injectIntl(MutiDeployment)));
