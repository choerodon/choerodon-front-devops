import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const Instance = asyncRouter(() => import('./Instances'), () => import('../../../stores/project/instances/index'));
const InstancesDetail = asyncRouter(() => import('./instancesDetail'), () => import('../../../stores/project/instances/deployDetail'));

const InstancesIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={Instance} />
    <Route exact path={`${match.url}/:id/:status/detail`} component={InstancesDetail} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default InstancesIndex;
