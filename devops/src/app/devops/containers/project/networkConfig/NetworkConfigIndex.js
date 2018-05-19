import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const NetworkHome = asyncRouter(() => import('./networkHome'), () => import('../../../stores/project/networkConfig'));

const networkConfigIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={NetworkHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default networkConfigIndex;
