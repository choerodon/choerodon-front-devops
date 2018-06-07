import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import nomatch from 'nomatch';
import asyncRouter from '../../../../../util/asyncRouter';

const CiPipelineHome = asyncRouter(() => import('./ciPipelineHome'));

const CiPipelineIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={CiPipelineHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default CiPipelineIndex;
