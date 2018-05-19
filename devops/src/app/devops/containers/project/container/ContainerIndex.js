import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import asyncRouter from '../../../../../util/asyncRouter';

const ContainerHome = asyncRouter(() => import('./containerHome'), () => import('../../../stores/project/container'));

const EnvironmentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={ContainerHome} />
  </Switch>
);

export default EnvironmentIndex;
