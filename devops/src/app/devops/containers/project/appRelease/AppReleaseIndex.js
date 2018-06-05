import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import asyncRouter from '../../../../../util/asyncRouter';

const AppReleaseHome = asyncRouter(() => import('./appReleaseHome'), () => import('../../../stores/project/appRelease'));
const AppCreateDetail = asyncRouter(() => import('./appReleaseEdit'), () => import('../../../stores/project/appRelease/editRelease'));
const AddAppRelease = asyncRouter(() => import('./addAppRelease'), () => import('../../../stores/project/appRelease/editRelease'));
const EditVersions = asyncRouter(() => import('./editVersions'), () => import('../../../stores/project/appRelease/editVersions'));

const EnvironmentIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={AppReleaseHome} />
    <Route exact path={`${match.url}/edit/:id`} component={AppCreateDetail} />
    <Route exact path={`${match.url}/add/:appId`} component={AddAppRelease} />
    <Route exact path={`${match.url}/app/:name/edit-version/:id`} component={EditVersions} />
  </Switch>
);

export default EnvironmentIndex;
