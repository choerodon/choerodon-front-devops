import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Modal, Spin, Tooltip, Form, Input, Select, Radio } from 'choerodon-ui';
import { Permission, Content, Header, Page } from 'choerodon-front-boot';
import _ from 'lodash';
import StageCard from '../components/stageCard';
import StageCreateModal from '../components/stageCreateModal';
import { STAGE_FLOW_AUTO, STAGE_FLOW_MANUAL } from '../components/Constans';

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

@Form.create({})
@injectIntl
@withRouter
@inject('AppState')
@observer
export default class PipelineCreate extends Component {
  state = {
    triggerType: STAGE_FLOW_AUTO,
    showCreate: false,
    prevId: null,
  };

  changeTriggerType = (e) => {
    this.setState({
      triggerType: e.target.value,
    });
  };

  openCreateForm = (prevId) => {
    this.setState({ showCreate: true, prevId });
  };

  closeCreateForm = () => {
    this.setState({ showCreate: false, prevId: null });
  };

  get renderPipelineDom() {
    const { PipelineCreateStore: { getStageList } } = this.props;
    return _.map(getStageList, item => (<StageCard
      key={item.id}
      stageId={item.id}
      clickAdd={this.openCreateForm}
    />));
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
      PipelineCreateStore,
    } = this.props;

    const { triggerType, showCreate, prevId } = this.state;

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
              />,
            )}
          </FormItem>
          <FormItem
            className="c7n-select_512 c7ncd-formitem-bottom"
            {...formItemLayout}
          >
            {getFieldDecorator('triggerType', {
              initialValue: STAGE_FLOW_AUTO,
              rules: [{
                required: true,
                message: formatMessage({ id: 'required' }),
              }],
            })(
              <RadioGroup label={formatMessage({ id: 'pipeline.trigger' })} onChange={this.changeTriggerType}>
                <Radio value={STAGE_FLOW_AUTO}>
                  <FormattedMessage id="pipeline.trigger.auto" />
                </Radio>
                <Radio value={STAGE_FLOW_MANUAL}>
                  <FormattedMessage id="pipeline.trigger.manual" />
                </Radio>
              </RadioGroup>,
            )}
          </FormItem>
          {triggerType === STAGE_FLOW_MANUAL && <FormItem
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
            <div className="c7ncd-pipeline-scroll">
              {this.renderPipelineDom}
            </div>
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
      {showCreate && <StageCreateModal
        store={PipelineCreateStore}
        prevId={prevId}
        visible={showCreate}
        onClose={this.closeCreateForm}
      />}
    </Page>);
  }

}
