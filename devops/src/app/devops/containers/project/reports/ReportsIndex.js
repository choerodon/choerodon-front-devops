import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const REPORTSHOME = asyncRouter(() => import('./Home'), () => import('../../../stores/project/reports'));
const SUBMISSION = asyncRouter(() => import('./Submission'), () => import('../../../stores/project/reports'));

const ReportsIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={REPORTSHOME} />
    <Route exact path={`${match.url}/submission`} component={SUBMISSION} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default ReportsIndex;
