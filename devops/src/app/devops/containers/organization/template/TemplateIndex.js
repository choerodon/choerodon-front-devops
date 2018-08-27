/**
 *create by mading on 2018/3/28
 */
import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const TemplateHome = asyncRouter(() => import('./templateHome'), () => import('../../../stores/organization/template'));

const EnvironmentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={TemplateHome} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default EnvironmentIndex;
