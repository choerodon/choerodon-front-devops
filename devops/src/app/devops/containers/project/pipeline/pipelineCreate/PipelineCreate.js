import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Modal, Spin, Tooltip, Form, Input, Select, Radio } from 'choerodon-ui';
import { Permission, Content, Header, Page, Action } from 'choerodon-front-boot';
import _ from 'lodash';
import StageCard from '../components/stageCard';
import StageTitle from '../components/stageTitle';

import './PipelineCreate.scss';
import '../../../main.scss';

const { Item: FormItem } = Form;
const { Option } = Select;
const { Group: RadioGroup } = Radio;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 26 },
  },
};

@Form.create()
@injectIntl
@withRouter
@inject('AppState')
@observer
export default class PipelineCreate extends Component {
  state = {
    triggerType: 'auto',
    showLengthInfo: false,
  };

  changeTriggerType = (e) => {
    this.setState({
      triggerType: e.target.value,
    });
  };

  /**
   * 输入框显示已输入字数，无内容不显示
   */
  handleInputName = () => {
    const { showLengthInfo } = this.state;
    if (!showLengthInfo) {
      this.setState({
        showLengthInfo: true,
      });
    }
  };

  get getPipelineDom() {
    const { PipelineCreateStore: { getStageInfoList } } = this.props;

  }

  render() {
    const {
      location: {
        pathname,
        search,
      },
      AppState: {
        currentMenuType: {
          name,
          type,
          id: projectId,
          organizationId,
        },
      },
      intl: { formatMessage },
      form: { getFieldDecorator },
    } = this.props;

    const {
      triggerType,
      showLengthInfo,
    } = this.state;

    return (<Page
      className="c7n-region c7n-pipeline-creat"
      service={[
        'devops-service.devops-project-config.pageByOptions',
      ]}
    >
      <Header
        title={<FormattedMessage id="pipeline.header.create" />}
        backPath={`${pathname.replace(/\/create/, '')}${search}`}
      />
      <Content code="pipeline.create" values={{ name }}>
        <Form layout="vertical">
          <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true,
                message: formatMessage({ id: 'required' }),
              }],
            })(
              <Input
                className="c7n-select_512"
                label={<FormattedMessage id="name" />}
                type="text"
                maxLength={10}
                onChange={this.handleInputName}
                showLengthInfo={showLengthInfo}
              />,
            )}
          </FormItem>
          <FormItem
            className="c7n-select_512 c7ncd-formitem-bottom"
            {...formItemLayout}
          >
            {getFieldDecorator('triggerType', {
              initialValue: 'auto',
              rules: [{
                required: true,
                message: formatMessage({ id: 'required' }),
              }],
            })(
              <RadioGroup label={formatMessage({ id: 'pipeline.trigger' })} onChange={this.changeTriggerType}>
                <Radio value="auto">
                  <FormattedMessage id="pipeline.trigger.auto" />
                </Radio>
                <Radio value="manual">
                  <FormattedMessage id="pipeline.trigger.manual" />
                </Radio>
              </RadioGroup>,
            )}
          </FormItem>
          {triggerType === 'manual' && <FormItem
            className="c7n-select_512"
            {...formItemLayout}
          >
            {getFieldDecorator('member', {
              rules: [{
                required: true,
                message: formatMessage({ id: 'required' }),
              }],
            })(
              <Select
                className="c7n-select_512"
                label={formatMessage({ id: 'pipeline.trigger.member' })}
                mode="tags"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                allowClear
              >
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>Disabled</Option>
              </Select>,
            )}
          </FormItem>}
          <div className="c7ncd-pipeline-main">
            <StageTitle
              name="阶段一"
              type="auto"
            />
            <StageCard stageName="stage1" />
          </div>
          <FormItem
            {...formItemLayout}
          >
            <Button
              type="primary"
              funcType="raised"
              htmlType="submit"
            >
              <FormattedMessage id="create" />
            </Button>
            <Button funcType="raised" className="c7ncd-pipeline-btn_cancel">
              <FormattedMessage id="cancel" />
            </Button>
          </FormItem>
        </Form>
      </Content>
    </Page>);
  }

}
