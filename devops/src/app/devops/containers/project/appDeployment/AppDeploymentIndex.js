import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const AppHome = asyncRouter(() => import('./deployHome'), () => import('../../../stores/project/appDeployment'));
const DeploymentDetail = asyncRouter(() => import('./deploymentDetail'), () => import('../../../stores/project/appDeployment/deployDetail'));

const appDeploymentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={AppHome} />
    <Route exact path={`${match.url}/:id/:status/detail`} component={DeploymentDetail} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default appDeploymentIndex;
