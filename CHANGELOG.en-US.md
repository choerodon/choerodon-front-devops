# Changelog
All notable changes to choerodon-front-devops will be documented in this file.

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