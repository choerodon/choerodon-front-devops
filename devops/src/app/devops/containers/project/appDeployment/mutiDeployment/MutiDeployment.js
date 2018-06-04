import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Button, Popover, Tooltip } from 'choerodon-ui';
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

  render() {
    const { store } = this.props;
    const appList = store.getMutiData;
    const envNames = store.getEnvcard;

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
                        <div>
                          {version.instances.length}
                        </div>
                      </Button>
                    </Popover>
                    <span className="c7n-deploy-istname c7n-text-ellipsis">{version.version}</span>
                  </div>
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
          <td>
            {app.publishLevel ? <Tooltip title="应用市场"><span className="icon-apps c7n-icon-publish" /></Tooltip> : <Tooltip title="本项目"><span className="icon-project c7n-icon-publish" /></Tooltip>}
            {app.applicationName}
          </td>
          <td><React.Fragment>
            <div className="c7n-deploy-muti-row">
              <div className="c7n-deploy-muti_card">
                <span className="c7n-deploy-istname c7n-text-ellipsis">{app.latestVersion}</span>
              </div>
            </div>
          </React.Fragment></td><React.Fragment>{tdDom}</React.Fragment>
        </tr>);
        return trDom;
      });
      envDom = envNames.map(env => (<td>
        {env.connect ? <Tooltip title="已连接"><span className="c7n-ist-status_on" /></Tooltip> : <Tooltip title="未连接"><span className="c7n-ist-status_off" /></Tooltip>}
        {env.name}
      </td>));
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
