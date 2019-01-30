import React, { Component, Fragment } from "react";
import { observer } from "mobx-react";
import { injectIntl, FormattedMessage } from "react-intl";
import { withRouter } from "react-router-dom";
import { Select, Button, Radio, Steps, Icon, Tooltip, Input, Form } from "choerodon-ui";
import { Content, Header, Page, Permission, stores } from "choerodon-front-boot";
import _ from "lodash";
import "./DeployApp.scss";

class AppDeployment extends Component {

}

export default Form.create({})(withRouter(injectIntl(AppDeployment)));
