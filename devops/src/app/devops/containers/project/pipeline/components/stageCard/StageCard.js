import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Modal, Spin, Tooltip, Form, Input, Select, Table } from 'choerodon-ui';
import _ from 'lodash';
import PipelineCreateStore from '../../../../../stores/project/pipeline/PipelineCreateStore';
import TaskCreate from '../taskCreate';
import StageTitle from '../stageTitle';
import StageCreateModal from '../stageCreateModal';
import { TASK_SERIAL, TASK_PARALLEL } from '../Constans';

import './StageCard.scss';

const { Option } = Select;

@injectIntl
@inject('AppState')
@observer
export default class StageCard extends Component {
  state = {
    type: null,
    taskName: '',
    stage: {},
    showTask: false,
    showTaskDelete: false,
    showStageDelete: false,
    showHeadModal: false,
  };

  handleSelect = (value) => {
    const { stageId } = this.props;
    this.setState({ type: value });
    PipelineCreateStore.setTaskSettings(stageId, value);
  };

  openTaskSidebar = (name = '') => {
    this.setState({ showTask: true, taskName: name });
  };

  onCloseSidebar = () => {
    this.setState({ showTask: false, taskName: '' });
  };

  handleTaskDelete = () => {
    const { stageId } = this.props;
    const { taskName } = this.state;
    PipelineCreateStore.removeTask(stageId, taskName);
    this.closeTaskRemove();
  };

  openTaskRemove(name) {
    this.setState({ showTaskDelete: true, taskName: name });
  };

  closeTaskRemove = () => {
    this.setState({ showTaskDelete: false, taskName: '' });
  };

  handleHeadChange = () => {
    const { stageId } = this.props;
    const stageList = PipelineCreateStore.getStageList;
    const stage = _.find(stageList, ['id', stageId]);
    this.setState({ showHeadModal: true, stage });
  };

  handleStageRemove = () => {
    const { stageId } = this.props;
    PipelineCreateStore.removeStage(stageId);
    this.closeStageRemove();
  };

  openStageRemove = () => {
    this.setState({ showStageDelete: true });
  };

  closeStageRemove = () => {
    this.setState({ showStageDelete: false });
  };

  closeCreateForm = () => {
    this.setState({ showHeadModal: false, stage: {} });
  };

  /**
   * 点击创建阶段
   */
  openCreateForm = () => {
    const { stageId, clickAdd } = this.props;
    clickAdd(stageId);
  };

  get renderTaskList() {
    const {
      stageId,
      intl: { formatMessage },
    } = this.props;

    return _.map(PipelineCreateStore.getTaskList[stageId], item => (
      <div key={item.name} className="c7ncd-stagecard-item">
      <span className="c7ncd-stagecard-title">
        【{formatMessage({ id: `pipeline.mode.${item.type}` })}】
        {item.name}
      </span>
        <Button
          onClick={this.openTaskSidebar.bind(this, item.name)}
          className="c7ncd-stagecard-btn"
          size="small"
          icon="mode_edit"
          shape="circle"
        />
        <Button
          onClick={this.openTaskRemove.bind(this, item.name)}
          size="small"
          icon="delete_forever"
          shape="circle"
        />
      </div>));
  }

  render() {
    const {
      stageId,
      intl: { formatMessage },
    } = this.props;
    const {
      type,
      stage,
      showTask,
      showTaskDelete,
      taskName,
      showStageDelete,
      showHeadModal,
    } = this.state;
    const { getStageList } = PipelineCreateStore;
    const currentStage = _.find(getStageList, ['id', stageId]) || {};
    return (
      <div className="c7ncd-pipeline-stage-wrap">
        <Button onClick={this.openCreateForm}>+</Button>

        <StageTitle
          name={currentStage.name}
          type={currentStage.type}
          onChange={this.handleHeadChange}
          onRemove={this.openStageRemove}
        />
        <div className="c7ncd-stagecard-wrap">
          <Select
            label={<FormattedMessage id="pipeline.task.settings" />}
            onChange={this.handleSelect}
          >
            <Option value={TASK_PARALLEL}>
              <FormattedMessage id="pipeline.task.parallel" />
            </Option>
            <Option value={TASK_SERIAL}>
              <FormattedMessage id="pipeline.task.serial" />
            </Option>
          </Select>
          <h3 className="c7ncd-stagecard-label">
            <FormattedMessage id="pipeline.task.list" />
          </h3>
          <div className="c7ncd-stagecard-list">
            {this.renderTaskList}
          </div>
          <Button
            disabled={!type}
            type="primary"
            funcType="flat"
            icon="add"
            onClick={this.openTaskSidebar}
          >
            <FormattedMessage id="pipeline.task.add" />
          </Button>
        </div>
        <Modal
          visible={showTaskDelete}
          title={`${formatMessage({ id: 'pipeline.task.delete' })}“${taskName}”`}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeTaskRemove}>
              <FormattedMessage id="cancel" />
            </Button>,
            <Button key="submit" type="danger" onClick={this.handleTaskDelete}>
              <FormattedMessage id="delete" />
            </Button>,
          ]}
        >
          <div className="c7n-padding-top_8">
            <FormattedMessage id="pipeline.task.delete.msg" />
          </div>
        </Modal>
        <Modal
          visible={showStageDelete}
          title={`${formatMessage({ id: 'pipeline.stage.delete' })}“${currentStage.name}”`}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeStageRemove}>
              <FormattedMessage id="cancel" />
            </Button>,
            <Button key="submit" type="danger" onClick={this.handleStageRemove}>
              <FormattedMessage id="delete" />
            </Button>,
          ]}
        >
          <div className="c7n-padding-top_8">
            <FormattedMessage id="pipeline.stage.delete.msg" />
          </div>
        </Modal>
        {showTask && <TaskCreate
          taskName={taskName}
          stageId={stageId}
          visible={showTask}
          onClose={this.onCloseSidebar}
        />}
        {
          showHeadModal && <StageCreateModal
            visible={showHeadModal}
            stage={stage}
            store={PipelineCreateStore}
            onClose={this.closeCreateForm}
          />
        }
      </div>
    );
  }

}
