import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Select } from 'choerodon-ui';
import { Content, Header, Page } from 'choerodon-front-boot';
import _ from 'lodash';
import LoadingBar from '../../../../components/loadingBar';
import UserInfo from '../../../../components/userInfo';
import DetailTitle from '../components/detailTitle';
import DetailCard from '../components/detailCard';

import '../../../main.scss';
import './PipelineDeyail.scss';
import { TRIGGER_TYPE_MANUAL } from '../components/Constans';

const { Option } = Select;

@injectIntl
@withRouter
@inject('AppState')
@observer
export default class PipelineDetail extends Component {
  state = {
    recordId: null,
  };

  componentDidMount() {
    this.loadingData();
  }

  componentWillUnmount() {
    const {
      PipelineStore,
    } = this.props;
    PipelineStore.setDetail({});
    PipelineStore.setRecordDate([]);
  }

  handleRefresh = () => {
    this.loadingData();
  };

  /**
   * 切换执行历史
   * @param id 执行 id
   */
  handleChange = (id) => {
    const {
      PipelineStore,
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;
    PipelineStore.loadPipelineRecordDetail(projectId, Number(id));
    this.setState({ recordId: id });
  };

  loadingData() {
    const {
      match: {
        params,
      },
      PipelineStore,
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;

    PipelineStore.loadPipelineRecordDetail(projectId, params.rId);
    PipelineStore.loadExeRecord(projectId, params.pId);
  }

  get renderPipeline() {
    const {
      PipelineStore: {
        getDetail: {
          stageRecordDTOS,
        },
      },
    } = this.props;

    return _.map(stageRecordDTOS,
      ({
         id,
         status,
         stageName,
         executionTime,
         userDTOS,
         triggerType,
         isParallel,
         taskRecordDTOS,
       }) => (
        <div className="c7ncd-pipeline-detail-stage" key={id}>
          <DetailTitle
            name={stageName}
            time={executionTime}
            type={triggerType}
            user={userDTOS}
            status={status}
          />
          <DetailCard
            isParallel={isParallel}
            tasks={taskRecordDTOS ? taskRecordDTOS.slice() : []}
          />
        </div>
      ));
  }

  render() {
    const {
      location: {
        search,
        state,
      },
      match: {
        params,
      },
      intl: { formatMessage },
      PipelineStore: {
        getDetail: {
          userDTO,
          triggerType,
          pipelineName,
        },
        getDetailLoading,
        getRecordDate,
      },
    } = this.props;
    const { loginName, realName, imageUrl } = userDTO || {};
    const { recordId } = this.state;

    const { isFilter, pipelineId, fromPipeline } = state || {};
    const backPath = {
      pathname: '/devops/pipeline-record',
      search,
      state: {
        pipelineId: isFilter ? pipelineId : undefined,
        fromPipeline,
      },
    };

    const exeDateOptions = _.map(getRecordDate, ({ id, creationTime }) => (
      <Option key={id} value={String(id)}>{creationTime}</Option>
    ));

    return (<Page
      className="c7n-region c7n-pipeline-detail"
      service={[
        'devops-service.devops-project-config.pageByOptions',
      ]}
    >
      <Header
        title={<FormattedMessage id="pipeline.header.detail" />}
        backPath={backPath}
      >
        <Button
          icon='refresh'
          onClick={this.handleRefresh}
        >
          <FormattedMessage id="refresh" />
        </Button>
      </Header>
      <Content code="pipeline.detail" values={{ name: pipelineName }}>
        <Select
          label={<FormattedMessage id="pipeline.execute.history" />}
          className="c7ncd-pipeline-detail-select"
          optionFilterProp="children"
          onChange={this.handleChange}
          value={recordId || params.rId}
          filter
          filterOption={(input, option) =>
            option.props.children
              .toLowerCase()
              .indexOf(input.toLowerCase()) >= 0
          }
        >
          {exeDateOptions}
        </Select>
        <div className="c7ncd-pipeline-detail-msg">
          <div className="c7ncd-pipeline-detail-item">
            <span className="c7ncd-pipeline-detail-label">{formatMessage({ id: 'pipeline.trigger.type' })}</span>
            {triggerType && <FormattedMessage id={`pipeline.trigger.${triggerType}`} />}
          </div>
          {triggerType === TRIGGER_TYPE_MANUAL && <div className="c7ncd-pipeline-detail-item">
            <span className="c7ncd-pipeline-detail-label">{formatMessage({ id: 'pipeline.trigger.people' })}</span>
            <UserInfo avatar={imageUrl} name={realName || ''} id={loginName} />
          </div>}
        </div>
        <div className="c7ncd-pipeline-main">
          {getDetailLoading ? <LoadingBar display /> :
            <div className="c7ncd-pipeline-scroll">{this.renderPipeline}</div>}
        </div>
      </Content>
    </Page>);
  }

}
