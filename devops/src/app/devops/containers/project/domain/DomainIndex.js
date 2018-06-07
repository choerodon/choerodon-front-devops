import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const DomainHome = asyncRouter(() => import('./domainHome'), () => import('../../../stores/project/domain'));

const domainIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={DomainHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default domainIndex;
