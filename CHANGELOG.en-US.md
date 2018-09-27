# Changelog
All notable changes to choerodon-front-devops will be documented in this file.

## [0.10.0] - 2018-09-30
### Added
- Added environment group and support to view environment pipeline in environment group.
- Added certificate management feature for the certificate application and management.
- Added DevOps report forms, which allow to check code commits, application builds and application deployments.
- Added deployment overview to view all application deployment in every environment and make it easier to deploy the latest version of the application on this page.
- Support for using shell commands to control the pod for debugging.
- Allow to write down release notes while creating tags. Moreover, it is editable and amendable.
- Added 'Stop Following' and 'Go Top' while viewing container logs and support full screen view of the container logs.
- Added the droplists to selecte environment and application in the  container page and to  selecte application in the application version page.

### Changed
- Optimized the long link status of container logs.
- Unified all the status display.
- Optimized the status of network, ingress, instance and application deployment.
- Optimized the loading speed of the environmental overview.
- Optimized paging, filtering, sorting, and refreshing of the tables.

### Removed
- Removed the 'multiple application view' from the instance management.

### Fixed
- Fixed the opration problem after the deployment timeout.
- Fixed the problem that  instance replacement was not judged if it was modified.

## [0.9.0] - 2018-08-17
### Added
- New Environmental overview module to facilitate the management of the deployment of an environment-related entities
- Front-end api test

### Changed
- Modify the network page
- Create a network by filling out the label
- Increase the NodePort type of the network
- Remove the application version of the network association
- Unmodified configuration information can not be redeployed
- Optimizing the data loading effect of each module
- Modify the container log to select the background color, and non-edit status can not be copied

### Fixed
- Switch tabs will have data retention issues
- Troubleshooting asynchronous coverage problems when deploying a search application
- Inconsistency between local time and service hours

## [0.8.0] - 2018-07-20
### Added
- `RepositoryHome`, `branch management`, `tag` and `merge request`, achieving more flexible branch management models.
- Job operation event message in `container`. 
- Code quality checking in CI pipeline.
- Sonarqube code quality checking link in `application management`.
- Default selection of latest version in `application export`.

### Changed
- Table column width auto adaption.
- Adjust menu structure. 
- Improve log component of stage log.
- Improve loading and jumping speed of some pages.
- Improve field display of some pages.
- Change the sort of applications in application management.
- Improve service uniqueness check.
- Improve ingress validation rules.

### Fixed
- Problem with select-all in selection box.
- Filter condition of the table component cannot be cleared when the parent component is refreshed.
- Fixed switch version does not clear instances when modify the service in service management.
- Fixed instance details, the log not changed while switch the stage.

## [0.7.0] - 2018-06-29
### Added
- `Service management` instanseinstance availability verification.
- `Service management` port legality verification.
- `Ingress management` service availability verification.
- `Ingress management` path address uniqueness verification.
- Cancel button added to `application release` and `application deployment`.
- Yaml configuration file check and error information display.
- Chinese and English mode supported.

### Changed
- Table column width auto adaption.
- Unified naming standards for table heads in a page.
- Optimized code quality in Ingress management.
- Ingress name unavailable for modification.
- Remove redundant display for identical parts in repository address.
- Relative path used for application icon uploading.
- Optimized application selection display in `application instance` single application interface. Two categories including project application and application market are shown by default. Category list can be expanded.

### Fixed
- Optimized delay caused by multi-step CI request for API.
- Errors in table paging.
- Errors in value filtering when acquiring application versions.
- Optimized prompt information in application version page.
- Absence of "Latest" label for "tag" typed branch in CI pipeline.
- Error in opening "details" link in a new window.
- Inaccuracy in row height yaml calculation when zooming in/out configure information page.

## [0.6.0] - 2018-06-10
### Added
- Comments in `configuration information` to remind users when they edit the values files. 
- Commit link to Gitlab in tag list in `branch management`.
- Page height and table column width auto adaption for a better user interface. 

### Changed
- Change the way of `application deployment` from vertical steps to horizontal steps.
- Design a more intuitive and concise `application instance` for a better user experience.
- Improve the way of replacing values and the yaml theme color in `configuration information` for a better user experience.

### Removed
- "Rapid Deployment" functionalities.

### Fixed
- Failure to acquire code from source code repo caused by double slash in url. 
- Paging failure in `branch management`.