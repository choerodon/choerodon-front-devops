import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import asyncRouter from '../../../../../util/asyncRouter';

const AppReleaseHome = asyncRouter(() => import('./appReleaseHome'), () => import('../../../stores/project/appRelease'));
const AppCreateDetail = asyncRouter(() => import('./appReleaseEdit'), () => import('../../../stores/project/appRelease'));

const EnvironmentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={AppReleaseHome} />
    <Route exact path={`${match.url}/edit/:id`} component={AppCreateDetail} />
    <Route exact path={`${match.url}/add`} component={AppCreateDetail} />
  </Switch>
);

export default EnvironmentIndex;
