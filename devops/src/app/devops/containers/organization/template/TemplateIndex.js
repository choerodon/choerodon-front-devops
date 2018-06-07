/**
 *create by mading on 2018/3/28
 */
import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import asyncRouter from '../../../../../util/asyncRouter';

const TemplateHome = asyncRouter(() => import('./templateHome'), () => import('../../../stores/organization/template'));
const CopyBord = asyncRouter(() => import('./CopyBord'), () => import('../../../stores/organization/template'));

const EnvironmentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={TemplateHome} />
    <Route exact path={`${match.url}/test`} component={CopyBord} />
  </Switch>
);

export default EnvironmentIndex;
