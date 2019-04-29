import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const DeploymentConfig = asyncRouter(
  () => import('./pipelineRecordHome'),
  () => import('../../../stores/project/pipelineRecord'),
);
const PipelineDetail = asyncRouter(() => import('./pipelineDetail'), () => import('../../../stores/project/pipeline'));

const SecretIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={DeploymentConfig} />
    <Route path={`${match.url}/detail/:pId/:rId`} component={PipelineDetail} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default SecretIndex;

