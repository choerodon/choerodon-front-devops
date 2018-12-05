import React, { Component } from "react";
import { injectIntl, FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { Icon, Radio, Dropdown } from "choerodon-ui";
import DevopsStore from "../../stores/DevopsStore";
import "./index.scss";

const { Group: RadioGroup } = Radio;
const { Button: DropdownButton } = Dropdown;

const REFRESH_MANUAL = "manual";
const REFRESH_AUTOMATIC = "auto";

@injectIntl
export default class RefreshBtn extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onFresh: PropTypes.func.isRequired,
  };

  onChange = e => {
    const {
      onFresh,
      name,
      intl: { formatMessage },
    } = this.props;
    DevopsStore.clearTimer();

    if (e.target.value === REFRESH_AUTOMATIC) {
      Choerodon.prompt(formatMessage({ id: "refresh.auto.open" }));
      DevopsStore.setTimer(onFresh);
      DevopsStore.setAutoFlag({ [name]: true });
    } else {
      DevopsStore.setAutoFlag({ [name]: false });
      Choerodon.prompt(formatMessage({ id: "refresh.auto.close" }));
    }

    DevopsStore.setRadioValue(e.target.value);
  };

  render() {
    const { onFresh } = this.props;

    const radioValue = DevopsStore.getRadioValue;

    const menu = (
      <RadioGroup
        className="c7ncd-refresh-radioGroup"
        onChange={this.onChange}
        value={radioValue}
      >
        <Radio className="c7ncd-refresh-radio" value={REFRESH_MANUAL}>
          <FormattedMessage id="refresh.manual" />
        </Radio>
        <Radio className="c7ncd-refresh-radio" value={REFRESH_AUTOMATIC}>
          <FormattedMessage id="refresh.auto" />
        </Radio>
      </RadioGroup>
    );

    return (
      <DropdownButton
        onClick={() => onFresh(true)}
        className="c7ncd-refresh"
        overlay={menu}
      >
        <Icon type="refresh" />
        <FormattedMessage id="refresh" />
      </DropdownButton>
    );
  }
}
