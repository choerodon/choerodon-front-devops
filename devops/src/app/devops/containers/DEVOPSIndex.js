import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncRouter, nomatch, asyncLocaleProvider } from 'choerodon-front-boot';

// organization
const Template = asyncRouter(() => import('./organization/template'));
const Cluster = asyncRouter(() => import('./organization/cluster'));
// project
const EnvPipelineIndex = asyncRouter(() => import('./project/envPipeline'));
const CiPipelineManageIndex = asyncRouter(() => import('./project/ciPipelineManage'));
const AppVersion = asyncRouter(() => import('./project/appVersion'));
const App = asyncRouter(() => import('./project/app'));
const AppStore = asyncRouter(() => import('./project/appStore'));
const InstancesIndex = asyncRouter(() => import('./project/instances'));
const DeploymentApp = asyncRouter(() => import('./project/deploymentApp'));
const NetworkConfig = asyncRouter(() => import('./project/networkConfig'));
const Domain = asyncRouter(() => import('./project/domain'));
const Container = asyncRouter(() => import('./project/container'));
const AppRelease = asyncRouter(() => import('./project/appRelease'));
const Branch = asyncRouter(() => import('./project/branch'));
const MergeRequest = asyncRouter(() => import('./project/mergeRequest'));
const AppTag = asyncRouter(() => import('./project/appTag'));
const Repository = asyncRouter(() => import('./project/repository'));
const EnvOverview = asyncRouter(() => import('./project/envOverview'));
const DeployOverview = asyncRouter(() => import('./project/deployOverview'));
const Certificate = asyncRouter(() => import('./project/certificate'));
const Reports = asyncRouter(() => import('./project/reports'));
const DevConsole = asyncRouter(() => import('./project/devConsole'));

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
          <Route path={`${match.url}/env-overview`} component={EnvOverview} />
          <Route path={`${match.url}/deploy-overview`} component={DeployOverview} />
          <Route path={`${match.url}/ci-pipeline`} component={CiPipelineManageIndex} />
          <Route path={`${match.url}/template`} component={Template} />
          <Route path={`${match.url}/cluster`} component={Cluster} />
          <Route path={`${match.url}/app-version`} component={AppVersion} />
          <Route path={`${match.url}/app`} component={App} />
          <Route path={`${match.url}/app-market`} component={AppStore} />
          <Route path={`${match.url}/instance`} component={InstancesIndex} />
          <Route path={`${match.url}/deployment-app`} component={DeploymentApp} />
          <Route path={`${match.url}/service`} component={NetworkConfig} />
          <Route path={`${match.url}/ingress`} component={Domain} />
          <Route path={`${match.url}/container`} component={Container} />
          <Route path={`${match.url}/app-release`} component={AppRelease} />
          <Route path={`${match.url}/branch`} component={Branch} />
          <Route path={`${match.url}/merge-request`} component={MergeRequest} />
          <Route path={`${match.url}/tag`} component={AppTag} />
          <Route path={`${match.url}/repository`} component={Repository} />
          <Route path={`${match.url}/certificate`} component={Certificate} />
          <Route path={`${match.url}/reports`} component={Reports} />
          <Route path={`${match.url}/dev-console`} component={DevConsole} />
          <Route path="*" component={nomatch} />
        </Switch>
      </IntlProviderAsync>
    );
  }
}

export default DEVOPSIndex;
