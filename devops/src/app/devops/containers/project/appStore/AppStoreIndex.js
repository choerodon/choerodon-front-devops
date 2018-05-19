import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const AppStoreHome = asyncRouter(() => import('./appStoreHome'), () => import('../../../stores/project/appStore'));
const AppDetail = asyncRouter(() => import('./appDetail'), () => import('../../../stores/project/appStore'));

const AppStoreIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={AppStoreHome} />
    <Route exact path={`${match.url}/:id/app`} component={AppDetail} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default AppStoreIndex;
