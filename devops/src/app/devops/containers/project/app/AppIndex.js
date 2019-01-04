import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';

import { asyncRouter, nomatch } from 'choerodon-front-boot';

const App = asyncRouter(() => import('./appHome'), () => import('../../../stores/project/app/appHome'));
const AppImport = asyncRouter(() => import('./appImport'), () => import('../../../stores/project/app/appHome'));

const EnvironmentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={App} />
    <Route exact path={`${match.url}/import`} component={AppImport} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default EnvironmentIndex;
