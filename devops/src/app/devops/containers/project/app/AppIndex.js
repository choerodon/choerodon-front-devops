/**
 *create by mading on 2018/3/28
 */
import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import asyncRouter from '../../../../../util/asyncRouter';

const App = asyncRouter(() => import('./appHome'), () => import('../../../stores/project/app/appHome'));
const BranchHome = asyncRouter(() => import('./branchHome'), () => import('../../../stores/project/app/branchManage'));

const EnvironmentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={App} />
    <Route exact path={`${match.url}/:name/:id/branch`} component={BranchHome} />
  </Switch>
);

export default EnvironmentIndex;
