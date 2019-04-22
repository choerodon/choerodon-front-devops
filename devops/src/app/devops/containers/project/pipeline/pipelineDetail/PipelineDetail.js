import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Icon, Form, Input, Select, Radio } from 'choerodon-ui';
import { Content, Header, Page } from 'choerodon-front-boot';
import _ from 'lodash';
import { STAGE_FLOW_AUTO, STAGE_FLOW_MANUAL } from '../components/Constans';
import LoadingBar from '../../../../components/loadingBar';
import UserInfo from '../../../../components/userInfo';

import '../../../main.scss';
import './PipelineDeyail.scss';

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

  handleRefresh = () => {
    this.loadingData();
  };

  /**
   * 切换执行历史
   * @param id 执行 id
   */
  handleChange = (id) => {
    this.setState({ recordId: id });
  };

  loadingData() {
    const {
      location: { state },
      PipelineStore,
      AppState: {
        currentMenuType: { id: projectId },
      },
    } = this.props;
    const { recordId: propsRecordId, pipelineId } = state || {};
    const { recordId: stateRecordId } = this.state;

    const recordId = propsRecordId || stateRecordId;
    if (recordId) {
      PipelineStore.loadPipelineRecordDetail(projectId, Number(recordId));
    } else {
      // 无 pId 的处理
    }

    if (pipelineId) {
      PipelineStore.loadExeRecord(projectId, pipelineId);
    }
  }

  render() {
    const {
      location: {
        search,
        state,
      },
      intl: { formatMessage },
      PipelineStore: {
        getDetail,
        getDetailLoading,
        getRecordDate,
      },
    } = this.props;
    const { name } = state || {};
    const backPath = {
      pathname: '/devops/pipeline-record',
      search,
      state,
    };

    const exeDateOptions = _.map(getRecordDate, ({ id, lastUpdateDate }) => (
      <Option value={String(id)}>{lastUpdateDate}</Option>
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
      <Content code="pipeline.detail" values={{ name: name || '' }}>
        <Select
          label={<FormattedMessage id="pipeline.execute.history" />}
          className="c7ncd-pipeline-detail-select"
          optionFilterProp="children"
          onChange={this.handleChange}
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
            <span>{formatMessage({ id: 'pipeline.trigger.type' })}</span>手动触发
          </div>
          <div className="c7ncd-pipeline-detail-item">
            <span>{formatMessage({ id: 'pipeline.trigger.people' })}</span>
            <UserInfo avatar={null} name={'Tom'} id={12334} />
          </div>
        </div>
        <div className="c7ncd-pipeline-main">
          <div className="c7ncd-pipeline-scroll">
            {getDetailLoading ? <LoadingBar display /> : JSON.stringify(getDetail)}
          </div>
        </div>
      </Content>
    </Page>);
  }

}
