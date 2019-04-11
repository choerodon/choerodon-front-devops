import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Modal, Spin, Tooltip, Form, Input, Select, Table } from 'choerodon-ui';
import _ from 'lodash';
import PipelineCreateStore from '../../../../../stores/project/pipeline/PipelineCreateStore';
import TaskCreate from '../taskCreate';
import { TASK_SERIAL, TASK_PARALLEL } from '../Constans';

import './StageCard.scss';

const { Option } = Select;

@injectIntl
@inject('AppState')
@observer
export default class StageCard extends Component {
  state = {
    type: null,
    showTask: true,
    showDelete: false,
    deleteTaskName: '',
  };

  handleSelect = (value) => {
    const { stageName } = this.props;
    this.setState({ type: value });
    PipelineCreateStore.setTaskSettings(stageName, value);
  };

  openTaskSidebar = () => {
    this.setState({ showTask: true });
  };

  onCloseSidebar = (name) => {
    this.setState({ showTask: false });
  };

  handleDelete = () => {
    const { stageName } = this.props;
    const { deleteTaskName } = this.state;
    PipelineCreateStore.removeTask(stageName, deleteTaskName);
    this.closeRemove();
  };

  openRemove(name) {
    this.setState({ showDelete: true, deleteTaskName: name });
  };

  closeRemove = () => {
    this.setState({ showDelete: false });
  };

  get getTaskList() {
    const {
      stageName,
      intl: { formatMessage },
    } = this.props;
    const { getTaskList } = PipelineCreateStore;
    return _.map(getTaskList[stageName], item => (<div key={item.name} className="c7ncd-stagecard-item">
      <span className="c7ncd-stagecard-title">
        【{formatMessage({ id: `pipeline.mode.${item.type}` })}】
        {item.name}
      </span>
      <Button
        className="c7ncd-stagecard-btn"
        size="small"
        icon="mode_edit"
        shape="circle"
      />
      <Button
        onClick={this.openRemove.bind(this, item.name)}
        size="small"
        icon="delete_forever"
        shape="circle"
      />
    </div>));
  }

  render() {
    const {
      stageName,
      intl: { formatMessage },
    } = this.props;
    const { type, showTask, showDelete, deleteTaskName } = this.state;
    return (
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
          <div className="c7ncd-stagecard-item">
            <span className="c7ncd-stagecard-title">【部署】Staging 部署任务很长很长，甚至看不见了</span>
            <Button className="c7ncd-stagecard-btn" size="small" icon="mode_edit" shape="circle" />
            <Button size="small" icon="delete_forever" shape="circle" />
          </div>
          {this.getTaskList}
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
        <Modal
          visible={showDelete}
          title={`${formatMessage({ id: 'pipeline.task.delete' })}“${deleteTaskName}”`}
          closable={false}
          footer={[
            <Button key="back" onClick={this.closeRemove}>
              <FormattedMessage id="cancel" />
            </Button>,
            <Button key="submit" type="danger" onClick={this.handleDelete}>
              <FormattedMessage id="delete" />
            </Button>,
          ]}
        >
          <div className="c7n-padding-top_8">
            <FormattedMessage id="pipeline.task.delete.msg" />
          </div>
        </Modal>
        {showTask && <TaskCreate
          name={stageName}
          visible={showTask}
          onClose={this.onCloseSidebar}
        />}
      </div>
    );
  }

}
