import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Button, DatePicker } from 'choerodon-ui';
import moment from 'moment';
import './TimePicker.scss';

const { RangePicker } = DatePicker;
const ButtonGroup = Button.Group;

function TimePicker(props) {
  const { startTime, endTime, store, func } = props;

  const handleClick = (val) => {
    store.setEndTime(moment());
    switch (val) {
      case 'today':
        store.setStartTime(moment());
        func();
        break;
      case 'seven':
        store.setStartTime(moment().subtract(6, 'days'));
        func();
        break;
      case 'thirty':
        store.setStartTime(moment().subtract(29, 'days'));
        func();
        break;
      default:
        store.setStartTime(moment().subtract(6, 'days'));
        func();
        break;
    }
  };

  return (
    <div className="c7n-report-date-wrap">
      <div className="c7n-report-time-btn">
        <ButtonGroup>
          <Button
            funcType="flat"
            onClick={handleClick.bind(this, 'today')}
          >
            <FormattedMessage id="report.data.today" />
          </Button>
          <Button
            funcType="flat"
            onClick={handleClick.bind(this, 'seven')}
          >
            <FormattedMessage id="report.data.seven" />
          </Button>
          <Button
            funcType="flat"
            onClick={handleClick.bind(this, 'thirty')}
          >
            <FormattedMessage id="report.data.thirty" />
          </Button>
        </ButtonGroup>
      </div>
      <div className="c7n-report-time-pick">
        <RangePicker
          value={[startTime, moment(endTime)]}
          allowClear={false}
          onChange={(date, dateString) => {
            store.setStartTime(moment(dateString[0]));
            store.setEndTime(moment(dateString[1]));
            func();
          }}
        />
      </div>
    </div>
  );
}

export default withRouter(TimePicker);
