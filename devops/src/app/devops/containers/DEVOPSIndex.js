import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncRouter, nomatch, asyncLocaleProvider } from 'choerodon-front-boot';

// organization
const Template = asyncRouter(() => import('./organization/template'));
// project
const EnvPipelineIndex = asyncRouter(() => import('./project/envPipeline'));
const CiPipelineManageIndex = asyncRouter(() => import('./project/ciPipelineManage'));
const AppVersion = asyncRouter(() => import('./project/appVersion'));
const App = asyncRouter(() => import('./project/app'));
const AppStore = asyncRouter(() => import('./project/appStore'));
const AppDeployment = asyncRouter(() => import('./project/appDeployment'));
const DeploymentApp = asyncRouter(() => import('./project/deploymentApp'));
const NetworkConfig = asyncRouter(() => import('./project/networkConfig'));
const Domain = asyncRouter(() => import('./project/domain'));
const Container = asyncRouter(() => import('./project/container'));
const AppRelease = asyncRouter(() => import('./project/appRelease'));
const Branch = asyncRouter(() => import('./project/branch'));
const AppTag = asyncRouter(() => import('./project/appTag'));

@inject('AppState')
class DEVOPSIndex extends React.Component {
  render() {
    const { match, AppState } = this.props;
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../locale/${langauge}`));
    return (
      <IntlProviderAsync>
        <Switch>
          <Route path={`${match.url}/env-pipeline`} component={EnvPipelineIndex} />
          <Route path={`${match.url}/ci-pipeline`} component={CiPipelineManageIndex} />
          <Route path={`${match.url}/template`} component={Template} />
          <Route path={`${match.url}/app-version`} component={AppVersion} />
          <Route path={`${match.url}/app`} component={App} />
          <Route path={`${match.url}/app-market`} component={AppStore} />
          <Route path={`${match.url}/instance`} component={AppDeployment} />
          <Route path={`${match.url}/deployment-app`} component={DeploymentApp} />
          <Route path={`${match.url}/service`} component={NetworkConfig} />
          <Route path={`${match.url}/ingress`} component={Domain} />
          <Route path={`${match.url}/container`} component={Container} />
          <Route path={`${match.url}/app-release`} component={AppRelease} />
          <Route path={`${match.url}/branch`} component={Branch} />
          <Route path={`${match.url}/app-tag`} component={AppTag} />
          <Route path={'*'} component={nomatch} />
        </Switch>
      </IntlProviderAsync>
    );
  }
}

export default DEVOPSIndex;
