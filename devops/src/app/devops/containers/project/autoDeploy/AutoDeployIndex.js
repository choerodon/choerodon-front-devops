import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const AutoDeploy = asyncRouter(
  () => import('./autoDeployHome'),
  () => import('../../../stores/project/autoDeploy')
);
const AutoDeployRecord = asyncRouter(
  () => import('./autoDeployRecord'),
  () => import('../../../stores/project/autoDeploy')
);

const SecretIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={AutoDeploy} />
    <Route exact path={`${match.url}/record`} component={AutoDeployRecord} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default SecretIndex;
