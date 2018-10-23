import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const DevConsole = asyncRouter(() => import('./devConsoleHome'), () => import('../../../stores/project/devConsole'));

const DevConsoleIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={DevConsole} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default DevConsoleIndex;
