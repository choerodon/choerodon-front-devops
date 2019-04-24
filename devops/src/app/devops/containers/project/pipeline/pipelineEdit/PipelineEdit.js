import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Icon, Form, Input, Select, Radio } from 'choerodon-ui';
import { Content, Header, Page } from 'choerodon-front-boot';
import _ from 'lodash';
import StageCard from '../components/stageCard';
import StageCreateModal from '../components/stageCreateModal';
import { STAGE_FLOW_AUTO, STAGE_FLOW_MANUAL } from '../components/Constans';
import InterceptMask from '../../../../components/interceptMask';
import EmptyPage from '../components/emptyPage';

import './PipelineEdit.scss';
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
export default class PipelineEdit extends Component {
  state = {
    triggerType: null,
    showCreate: false,
    prevId: null,
    submitLoading: false,
  };

  componentDidMount() {
    const {
      PipelineCreateStore,
      AppState: {
        currentMenuType: { id },
      },
      match: {
        params,
      },
    } = this.props;

    PipelineCreateStore.loadDetail(id, params.id);
    PipelineCreateStore.loadUser(id);
  }

  componentWillUnmount() {
    const { PipelineCreateStore } = this.props;
    PipelineCreateStore.setUser([]);
    PipelineCreateStore.clearStageList();
    PipelineCreateStore.setStageIndex(0);
    PipelineCreateStore.clearTaskList();
    PipelineCreateStore.clearTaskSettings();
    PipelineCreateStore.clearTaskIndex();
    PipelineCreateStore.setTrigger(STAGE_FLOW_AUTO);
    PipelineCreateStore.setPipeline([]);
  }

  onSubmit = (e) => {
    e.preventDefault();

    const {
      PipelineCreateStore,
      form: { validateFieldsAndScroll },
      AppState: {
        currentMenuType: {
          id: projectId,
        },
      },
    } = this.props;
    const { objectVersionNumber, id } = PipelineCreateStore.getPipeline;

    validateFieldsAndScroll(async (err, { name, triggerType, users }) => {
      if (!err) {
        const { getStageList, getTaskList } = PipelineCreateStore;
        const pipelineStageDTOS = _.map(getStageList, item => ({
          ...item,
          pipelineTaskDTOS: getTaskList[item.tempId] || null,
        }));
        this.setState({ submitLoading: true });
        const result = await PipelineCreateStore
          .editPipeline(projectId, {
            id,
            objectVersionNumber,
            name,
            triggerType,
            pipelineUserRelDTOS: triggerType === STAGE_FLOW_MANUAL ? _.map(users, item => Number(item)) : null,
            pipelineStageDTOS,
          })
          .catch(e => {
            this.setState({ submitLoading: false });
            Choerodon.handleResponseError(e);
          });
        this.setState({ submitLoading: false });
        if (result && result.failed) {
          Choerodon.prompt(result.message);
        } else {
          this.goBack();
        }
      }
    });
  };

  changeTriggerType = (e) => {
    const { PipelineCreateStore } = this.props;
    const triggerType = e.target.value;
    this.setState({ triggerType });
    PipelineCreateStore.setTrigger(triggerType);
  };

  /**
   * 创建阶段
   * @param prevId 该阶段的前置阶段的id
   */
  openCreateForm = (prevId) => {
    this.setState({ showCreate: true, prevId });
  };

  closeCreateForm = () => {
    this.setState({ showCreate: false, prevId: null });
  };

  goBack = () => {
    const {
      history,
      location: {
        search,
      },
    } = this.props;
    history.push({
      pathname: '/devops/pipeline',
      search,
    });
  };

  get renderPipelineDom() {
    const { PipelineCreateStore: { getStageList } } = this.props;
    if (getStageList.length === 1) {
      const { tempId, stageName } = getStageList[0] || {};
      return <StageCard
        allowDelete={false}
        key={tempId}
        stageId={tempId}
        stageName={stageName}
        clickAdd={this.openCreateForm}
      />;
    }

    return _.map(getStageList, ({ tempId, stageName }) => (<StageCard
      key={tempId}
      stageId={tempId}
      stageName={stageName}
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
        },
      },
      intl: { formatMessage },
      form: { getFieldDecorator },
      PipelineCreateStore,
    } = this.props;
    const { triggerType, showCreate, prevId, submitLoading } = this.state;
    const {
      getLoading,
      getUser,
      getIsDisabled,
      getPipeline,
      getDetailLoading,
    } = PipelineCreateStore;

    const showUserSelector = triggerType
      ? (triggerType === STAGE_FLOW_MANUAL)
      : (getPipeline.triggerType === STAGE_FLOW_MANUAL);
    const user = _.map(getUser, ({ id, realName }) => (
      <Option key={id} value={String(id)}>{realName}</Option>));
    const initUser = _.map(getPipeline.pipelineUserRelDTOS, item => String(item));

    return (<Page
      className="c7n-region c7n-pipeline-creat"
      service={[
        'devops-service.pipeline.update',
        'devops-service.pipeline.getAllUsers',
        'devops-service.application.pageByOptions',
        'devops-service.devops-environment.listByProjectIdAndActive',
        'devops-service.application-instance.getByAppIdAndEnvId',
        'devops-service.pipeline-value.queryByAppIdAndEnvId',
        'devops-service.pipeline-value.queryById',
        'devops-service.pipeline.queryById',
      ]}
    >
      {_.isNull(getPipeline) ? <EmptyPage /> : <Fragment>
        <Header
          title={<FormattedMessage id="pipeline.header.edit" />}
          backPath={`${pathname.replace(/\/edit\/\d*/, '')}${search}`}
        />
        <Content code="pipeline.edit" values={{ name }}>
          <Form
            layout="vertical"
            onSubmit={this.onSubmit}
          >
            <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'required' }),
                }],
                initialValue: getPipeline.name,
              })(
                <Input
                  disabled
                  className="c7n-select_512"
                  label={<FormattedMessage id="name" />}
                  type="text"
                  maxLength={30}
                />,
              )}
            </FormItem>
            <FormItem
              className="c7n-select_512 c7ncd-formitem-bottom"
              {...formItemLayout}
            >
              {getFieldDecorator('triggerType', {
                initialValue: getPipeline.triggerType,
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
            {showUserSelector && <FormItem
              className="c7n-select_512"
              {...formItemLayout}
            >
              {getFieldDecorator('users', {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'required' }),
                }],
                initialValue: initUser,
              })(
                <Select
                  filter
                  allowClear
                  mode="tags"
                  optionFilterProp="children"
                  label={formatMessage({ id: 'pipeline.trigger.member' })}
                  loading={getLoading.user}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  filterOption={(input, option) =>
                    option.props.children[1]
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {user}
                </Select>,
              )}
            </FormItem>}
            <div className="c7ncd-pipeline-main">
              <div className="c7ncd-pipeline-scroll">
                {this.renderPipelineDom}
              </div>
            </div>
            {getIsDisabled && <div className="c7ncd-pipeline-error">
              <Icon type="error" className="c7ncd-pipeline-error-icon" />
              <span className="c7ncd-pipeline-error-msg">请检查任务类型是否正确！</span>
            </div>}
            <FormItem
              {...formItemLayout}
            >
              <Button
                disabled={getIsDisabled}
                type="primary"
                funcType="raised"
                htmlType="submit"
                loading={submitLoading}
              >
                <FormattedMessage id="save" />
              </Button>
              <Button
                disabled={submitLoading}
                funcType="raised"
                className="c7ncd-pipeline-btn_cancel"
                onClick={this.goBack}
              >
                <FormattedMessage id="cancel" />
              </Button>
            </FormItem>
          </Form>
          <InterceptMask visible={submitLoading || getDetailLoading} />
        </Content>
        {showCreate && <StageCreateModal
          store={PipelineCreateStore}
          prevId={prevId}
          visible={showCreate}
          onClose={this.closeCreateForm}
        />}
      </Fragment>}
    </Page>);
  }

}
