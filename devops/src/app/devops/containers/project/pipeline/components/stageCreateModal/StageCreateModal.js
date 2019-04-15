import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Button, Modal, Form, Input, Select, Radio } from 'choerodon-ui';
import { STAGE_FLOW_MANUAL, STAGE_FLOW_AUTO } from '../Constans';

import '../../../../main.scss';
import './StageCreateModal.scss';

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

@injectIntl
@Form.create({})
export default class StageCreateModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    prevId: PropTypes.number,
    stage: PropTypes.object,
    store: PropTypes.object,
  };

  static defaultProps = {
    stage: {},
  };

  state = {
    flowType: STAGE_FLOW_AUTO,
  };

  changeFlowType = (e) => {
    this.setState({
      flowType: e.target.value,
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const {
      store,
      prevId,
      onClose,
      stage,
      form: { validateFieldsAndScroll },
    } = this.props;

    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { flowType, stageName, flowMember } = values;
        const data = {
          name: stageName,
          type: flowType,
          flowMember,
        };
        if (_.isEmpty(stage)) {
          const currentIndex = store.getStageIndex + 1;
          store.addStage(prevId, {
            ...data,
            id: currentIndex,
          });
          store.setStageIndex(currentIndex);
        } else {
          store.editStage(stage.id, { ...stage, ...data });
        }
        onClose();
      }
    });
  };

  render() {
    const {
      intl: { formatMessage },
      form: { getFieldDecorator },
      stage,
      visible,
      onClose,
    } = this.props;
    const { flowType } = this.state;
    const {
      name,
      type,
      flowMember,
    } = stage;

    return <Modal
      visible={visible}
      title={formatMessage({ id: `pipeline.stage.${_.isEmpty(stage) ? 'create' : 'edit'}` })}
      closable={false}
      footer={null}
    >
      <div className="c7n-padding-top_8">
        <Form layout="vertical">
          <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('stageName', {
              rules: [{
                required: true,
                message: formatMessage({ id: 'required' }),
              }],
              initialValue: name,
            })(
              <Input
                label={<FormattedMessage id="name" />}
                type="text"
                maxLength={10}
              />,
            )}
          </FormItem>
          <FormItem
            className="c7ncd-stage-modal-from"
            {...formItemLayout}
          >
            {getFieldDecorator('flowType', {
              initialValue: type || STAGE_FLOW_AUTO,
            })(
              <RadioGroup label={formatMessage({ id: 'pipeline.trigger' })} onChange={this.changeFlowType}>
                <Radio value={STAGE_FLOW_AUTO}>
                  <FormattedMessage id="pipeline.flow.auto" />
                </Radio>
                <Radio value={STAGE_FLOW_MANUAL}>
                  <FormattedMessage id="pipeline.flow.manual" />
                </Radio>
              </RadioGroup>,
            )}
          </FormItem>
          {(type || flowType) === STAGE_FLOW_MANUAL && <FormItem
            {...formItemLayout}
          >
            {getFieldDecorator('flowMember', {
              rules: [{
                required: true,
                message: formatMessage({ id: 'required' }),
              }],
              initialValue: flowMember ? flowMember.slice() : undefined,
            })(
              <Select
                label={formatMessage({ id: 'pipeline.trigger.member' })}
                mode="tags"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                allowClear
              >
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
              </Select>,
            )}
          </FormItem>}
          <FormItem
            className="c7ncd-stage-modal-btn"
            {...formItemLayout}
          >
            <Button key="back" onClick={onClose}>
              <FormattedMessage id="cancel" />
            </Button>
            <Button key="submit" type="primary" onClick={this.onSubmit}>
              <FormattedMessage id={_.isEmpty(stage) ? 'create' : 'edit'} />
            </Button>
          </FormItem>
        </Form>
      </div>
    </Modal>;
  }
}
