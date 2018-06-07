import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const AppHome = asyncRouter(() => import('./envPipelineHome'), () => import('../../../stores/project/envPipeline'));

const EnvPipelineIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={AppHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default EnvPipelineIndex;
