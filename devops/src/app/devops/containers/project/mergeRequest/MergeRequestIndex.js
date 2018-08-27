import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const MergeRequestHome = asyncRouter(() => import('./mergeRequestHome'), () => import('../../../stores/project/mergeRequest'));

const MergeRequestIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={MergeRequestHome} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default MergeRequestIndex;
