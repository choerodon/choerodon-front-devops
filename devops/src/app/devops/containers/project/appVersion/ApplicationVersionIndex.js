import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import asyncRouter from '../../../../../util/asyncRouter';

const AppVersionHome = asyncRouter(() => import('./applicationHome'), () => import('../../../stores/project/applicationVersion'));

const EnvironmentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={AppVersionHome} />
  </Switch>
);

export default EnvironmentIndex;
