import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const PipelineDetailHome = asyncRouter(() => import('./PipelineDetailHome'), () => import('../../../stores/project/pipeline/PipelineDetailStore'));

const PipelineDetailIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={PipelineDetailHome} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default PipelineDetailIndex;
