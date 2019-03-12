import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ElementsHome = asyncRouter(() => import('./elementsHome'), () => import('../../../stores/project/elements'));

const elementsIndex = ({ match }) => (<Switch>
  <Route exact path={match.url} component={ElementsHome} />
  <Route path="*" component={nomatch} />
</Switch>);

export default elementsIndex;
