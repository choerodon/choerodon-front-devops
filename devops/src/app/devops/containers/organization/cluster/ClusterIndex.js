import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ClusterHome = asyncRouter(() => import('./Home'), () => import('../../../stores/organization/cluster'));

const ClusterIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={ClusterHome} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default ClusterIndex;
