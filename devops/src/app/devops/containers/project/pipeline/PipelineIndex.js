import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const PipelineHome = asyncRouter(() => import('./pipelineHome'), () => import('../../../stores/project/pipeline'));
const PipelineCreate = asyncRouter(() => import('./pipelineCreate'), () => import('../../../stores/project/pipeline/PipelineCreateStore'));
const PipelineEdit = asyncRouter(() => import('./pipelineEdit'), () => import('../../../stores/project/pipeline/PipelineCreateStore'));
const PipelineDetail = asyncRouter(() => import('./pipelineDetail'), () => import('../../../stores/project/pipeline'));

const PipelineIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={PipelineHome} />
    <Route path={`${match.url}/create`} component={PipelineCreate} />
    <Route path={`${match.url}/edit/:id`} component={PipelineEdit} />
    <Route path={`${match.url}/detail/:id`} component={PipelineDetail} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default PipelineIndex;
