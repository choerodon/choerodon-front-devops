import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const DeploymentApp = asyncRouter(() => import('./deploymentAppHome'), () => import('../../../stores/project/deploymentApp'));

const DeploymentAppIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={DeploymentApp} />
    <Route exact path={`${match.url}/:appId/:verId`} component={DeploymentApp} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default DeploymentAppIndex;
