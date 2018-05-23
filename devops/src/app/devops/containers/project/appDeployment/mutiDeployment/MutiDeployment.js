import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Button, Popover } from 'choerodon-ui';
import Permission from 'PerComponent';
import LoadingBar from '../../../../components/loadingBar';
import '../../../main.scss';
import '../AppDeploy.scss';
import './MutiDeployment.scss';

@inject('AppState')
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

  /**
   * 条件部署应用到下一个环境
   * @param envId 环境ID
   * @param verId 版本ID
   * @param appId 应用ID
   */
  deployApp = (envId, verId, appId) => {
    const { AppState } = this.props;
    const projectId = AppState.currentMenuType.id;
    const projectName = AppState.currentMenuType.name;
    const type = AppState.currentMenuType.type;
    this.linkToChange(`/devops/deployment-app?envId=${envId}&verId=${verId}&appId=${appId}&type=${type}&id=${projectId}&name=${projectName}`);
  };

  render() {
    const { store, AppState } = this.props;
    const appList = store.getMutiData;
    const envNames = store.getEnvcard;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;

    const trDom = [];
    let envDom = [];
    if (appList.length && envNames.length) {
      appList.map((app, appIndex) => {
        const tdDom = [];
        envNames.map((e, envIndex) => {
          const versionDom = [];
          app.envInstances.map((env, insIndex) => {
            if (env.envId === e.id) {
              versionDom.push(<td>
                { env.envVersions.map(version => (<div className="c7n-deploy-muti-row">
                  <div className="c7n-deploy-muti_card" >
                    <span className="c7n-deploy-circle">V</span>
                    <span className="c7n-deploy-istname c7n-text-ellipsis">{version.version}</span>
                    <Popover
                      placement="bottom"
                      title="实例"
                      content={version.instances.length ? version.instances.map(ist => (
                        <div>
                          <div className={`c7n-ist-status c7n-ist-status_${ist.instanceStatus}`} >
                            <div>{Choerodon.languageChange(ist.instanceStatus || 'null')}</div>
                          </div>
                          <span>{ist.instanceName}</span>
                        </div>
                      )) : '暂无实例'}
                      trigger="hover"
                    >
                      <Button
                        className="c7n-multi-ist"
                        funcType="flat"
                        shape="circle"
                      >
                        <span className="icon-instance_outline" />
                      </Button>
                    </Popover>
                  </div>
                  {(envIndex + 1) === envNames.length ? '' :
                    (<Permission
                      service={['devops-service.application-instance.deploy']}
                      organizationId={organizationId}
                      projectId={projectId}
                      type={type}
                    >
                      <Button
                        className="c7n-mutiDep-icon"
                        funcType="flat"
                        shape="circle"
                        onClick={this.deployApp.bind(this, envNames[envIndex + 1].id,
                          version.versionId, appList[appIndex].applicationId)}
                      >
                        <span className="icon-keyboard_arrow_right" />
                      </Button>
                    </Permission>)}
                </div>))}
              </td>);
            } else if (versionDom.length === 0 && insIndex === (app.envInstances.length - 1)) {
              versionDom.push(<td />);
            }
            return versionDom;
          });
          return tdDom.push(versionDom);
        });

        trDom.push(<tr>
          <td>{app.applicationName}</td>
          <td><React.Fragment>
            <div className="c7n-deploy-muti-row">
              <div className="c7n-deploy-muti_card">
                <span className="c7n-deploy-circle">V</span>
                <span className="c7n-deploy-istname c7n-text-ellipsis">{app.latestVersion}</span>
              </div>
              <Permission
                service={['devops-service.application-instance.deploy']}
                organizationId={organizationId}
                projectId={projectId}
                type={type}
              >
                <Button
                  className="c7n-mutiDep-icon"
                  funcType="flat"
                  shape="circle"
                  onClick={this.deployApp.bind(this, envNames[0].id,
                    app.latestVersionId, app.applicationId)}
                >
                  <span className="icon-keyboard_arrow_right" />
                </Button>
              </Permission>
            </div>
          </React.Fragment></td><React.Fragment>{tdDom}</React.Fragment>
        </tr>);
        return trDom;
      });
      envDom = envNames.map(env => <td>{env.name}{env.id}</td>);
    }

    const contentDom = store.getIsLoading ? <LoadingBar display />
      : (<table className="c7n-mutiDep-table">
        <thead className="c7n-mutiDep-thead">
          <tr>
            <td>应用</td>
            <td>最新版本</td>
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
export default (withRouter(MutiDeployment));
