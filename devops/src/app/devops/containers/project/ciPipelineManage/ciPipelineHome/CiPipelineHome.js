import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Tooltip, Popover, Select } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import TimeAgo from 'timeago-react';
import _ from 'lodash';
import '../../../main.scss';
import './CiPipelineHome.scss';
import CiPipelineStore from '../../../../stores/project/ciPipelineManage';
import MouserOverWrapper from '../../../../components/MouseOverWrapper';
import DevPipelineStore from '../../../../stores/project/devPipeline';
import DepPipelineEmpty from '../../../../components/DepPipelineEmpty/DepPipelineEmpty';
import { getTableTitle } from '../../../../utils';

const { Option, OptGroup } = Select;
const ICONS = {
  passed: {
    icon: 'icon-check_circle',
    code: 'passed',
    display: 'Passed',
  },
  success: {
    icon: 'icon-check_circle',
    code: 'success',
    display: 'Passed',
  },
  pending: {
    icon: 'icon-pause_circle_outline',
    code: 'pending',
    display: 'Pending',
  },
  running: {
    icon: 'icon-timelapse',
    code: 'running',
    display: 'Running',
  },
  failed: {
    icon: 'icon-cancel',
    code: 'failed',
    display: 'Failed',
  },
  canceled: {
    icon: 'icon-cancle_b',
    code: 'canceled',
    display: 'Canceled',
  },
  skipped: {
    icon: 'icon-skipped_b',
    code: 'skipped',
    display: 'Skipped',
  },
  created: {
    icon: 'icon-radio_button_checked',
    code: 'created',
    display: 'Created',
  },
  manual: {
    icon: 'icon-radio_button_checked',
    code: 'manual',
    display: 'Manual',
  },
};
const ICONS_ACTION = {
  pending: {
    icon: 'icon-not_interested',
  },
  running: {
    icon: 'icon-not_interested',
  },
  failed: {
    icon: 'icon-refresh',
  },
  canceled: {
    icon: 'icon-refresh',
  },
  skipped: {
    icon: 'icon-refresh',
  },
};
const { AppState } = stores;

@observer
class CiPipelineHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    DevPipelineStore.queryAppData(AppState.currentMenuType.id, 'ci');
  }

  componentWillUnmount() {
    CiPipelineStore.setCiPipelines([]);
  }

  get tableCiPipeline() {
    const { loading, pagination, ciPipelines } = CiPipelineStore;
    const { intl: { formatMessage } } = this.props;

    const ciPipelineColumns = [
      {
        title: <FormattedMessage id="ciPipeline.status" />,
        dataIndex: 'status',
        render: (status, record) => this.renderStatus(status, record),
      },
      {
        title: getTableTitle('ciPipeline.sign'),
        dataIndex: 'pipelineId',
        render: (pipelineId, record) => this.renderSign(pipelineId, record),
      },
      {
        title: getTableTitle('ciPipeline.commit'),
        dataIndex: 'commit',
        render: (commit, record) => this.renderCommit(commit, record),
      },
      {
        title: getTableTitle('ciPipeline.jobs'),
        dataIndex: 'stages',
        render: (stages, record) => this.renderstages(stages, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.time" />,
        dataIndex: 'pipelineTime',
        render: (pipelineTime, record) => (
          <span>
            {this.renderTime(pipelineTime, record)}
          </span>
        ),
      },
      {
        title: <FormattedMessage id="ciPipeline.createdAt" />,
        dataIndex: 'creationDate',
        render: (creationDate, record) => (
          <div>
            <Popover
              rowKey="creationDate"
              title={<FormattedMessage id="ciPipeline.createdAt" />}
              content={creationDate}
              placement="left"
            >
              <TimeAgo
                datetime={creationDate}
                locale={formatMessage({ id: 'language' })}
              />
            </Popover>
          </div>),
      },
      {
        width: 56,
        dataIndex: 'gitlabProjectId',
        render: (gitlabProjectId, record) => this.renderAction(record),
      },
    ];
    return (
      <div>
        <Table
          loading={loading}
          size="middle"
          pagination={pagination}
          columns={ciPipelineColumns}
          dataSource={ciPipelines.slice()}
          rowKey={record => record.pipelineId}
          onChange={this.handleTableChange}
          filterBar={false}
        />
      </div>
    );
  }

  handleTableChange = (pagination) => {
    CiPipelineStore.loadPipelines(
      DevPipelineStore.selectedApp,
      pagination.current - 1,
      pagination.pageSize,
    );
  };

  handleRefresh =() => {
    CiPipelineStore.loadPipelines(
      DevPipelineStore.selectedApp,
      CiPipelineStore.pagination.current - 1,
      CiPipelineStore.pagination.pageSize,
    );
  };

  handleChange(appId) {
    DevPipelineStore.setSelectApp(appId);
    DevPipelineStore.setRecentApp(appId);
    CiPipelineStore.loadPipelines(appId);
  }

  handleAction(record) {
    if (record.status === 'running' || record.status === 'pending') {
      CiPipelineStore.cancelPipeline(record.gitlabProjectId, record.pipelineId);
    } else {
      CiPipelineStore.retryPipeline(record.gitlabProjectId, record.pipelineId);
    }
    this.handleRefresh();
  }

  renderStatus = (status, record) => {
    if (status) {
      return (<div className="c7n-status">
        <a
          href={record.gitlabUrl ? `${record.gitlabUrl.slice(0, -4)}/pipelines/${record.pipelineId}` : null}
          target="_blank"
          rel="nofollow me noopener noreferrer"
          className="c7n-status-link"
        >
          <i className={`icon ${ICONS[status].icon} c7n-icon-${status} c7n-icon-lg`} />
          <span className="c7n-text-status black">{ICONS[status].display}</span>
        </a>
      </div>);
    } else {
      return 'Null';
    }
  };

  renderSign = (id, record) => (
    <div className="c7n-sign">
      <div className="c7n-des-sign">
        <span>
          <a
            className="c7n-link-decoration"
            href={record.gitlabUrl ? `${record.gitlabUrl.slice(0, -4)}/pipelines/${record.pipelineId}` : null}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span className="mr7 black">
              #{id}
            </span>
          </a>
            by
        </span>
        <Tooltip
          placement="top"
          title={record.pipelineUserName ? record.pipelineUserName : ''}
          trigger="hover"
        >
          {
            record.pipelineUserUrl
              ? <img className="c7n-image-avatar m8" src={record.pipelineUserUrl} alt="avatar" />
              : <span className="c7n-avatar m8 mt3">{record.pipelineUserName ? record.pipelineUserName.substring(0, 1).toUpperCase() : ''}</span>
          }
        </Tooltip>
      </div>
      {
        record.latest
          ? (
            <Tooltip
              placement="top"
              title="Latest pipeline for this branch"
              trigger="hover"
            >
              <span title="" className="c7n-latest">
                latest
              </span>
            </Tooltip>
          )
          : null
      }
    </div>
  );

  renderCommit = (commit, record) => (
    <div className="c7n-commit">
      <div className="c7n-title-commit">
        <i className="icon icon-branch mr7" />
        <MouserOverWrapper text={record.ref} width={0.1}>
          <a
            className="c7n-link-decoration"
            href={record.gitlabUrl ? `${record.gitlabUrl.slice(0, -4)}/commits/${record.ref}` : null}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span className="black">{record.ref}</span>
          </a>
        </MouserOverWrapper>
        <i className="icon icon-point m8" />
        <Tooltip
          placement="top"
          title={record.commit}
          trigger="hover"
        >
          <a
            className="c7n-link-decoration"
            href={record.gitlabUrl ? `${record.gitlabUrl.slice(0, -4)}/commit/${record.commit}` : null}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span>
              { record.commit ? record.commit.slice(0, 8) : '' }
            </span>
          </a>
        </Tooltip>
      </div>
      <div className="c7n-des-commit">
        <Tooltip
          placement="top"
          title={record.commitUserName ? record.commitUserName : ''}
          trigger="hover"
        >
          {
            record.commitUserUrl
              ? <img className="c7n-image-avatar" src={record.commitUserUrl} alt="avatar" />
              : <span className="c7n-avatar mr7">{ record.commitUserName ? record.commitUserName.substring(0, 1).toUpperCase() : '' }</span>
          }
        </Tooltip>
        <MouserOverWrapper text={record.commitContent} width={0.2}>
          <a
            className="c7n-link-decoration"
            href={record.gitlabUrl ? `${record.gitlabUrl.slice(0, -4)}/commit/${record.commit}` : null}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span className="gray">
              {record.commitContent}
            </span>
          </a>
        </MouserOverWrapper>
      </div>
    </div>
  );

  renderstages = (stages, record) => {
    const pipeStage = [];
    if (stages && stages.length) {
      for (let i = 0, l = stages.length; i < l; i += 1) {
        pipeStage.push(<span className="c7n-jobs" key={i}>
          {
            i !== 0
              ? <span className="c7n-split-before" />
              : null
          }
          <Tooltip
            title={(stages[i].name === 'sonarqube' && stages[i].status === 'failed') ? `${stages[i].name} : ${stages[i].description}` : `${stages[i].name} : ${stages[i].status}`}
          >
            {stages[i].stage === 'sonarqube' ? <i
              className={`icon ${ICONS[stages[i].status || 'skipped'].icon || ''}
                c7n-icon-${stages[i].status} c7n-icon-lg`}
            /> : <a
              className=""
              href={record.gitlabUrl ? `${record.gitlabUrl.slice(0, -4)}/-/jobs/${stages[i].id}` : null}
              target="_blank"
              rel="nofollow me noopener noreferrer"
            >
              <i
                className={`icon ${ICONS[stages[i].status || 'skipped'].icon || ''}
                c7n-icon-${stages[i].status} c7n-icon-lg`}
              />
            </a>}
          </Tooltip>
        </span>);
      }
    }
    return (
      <div className="c7n-jobs">
        {pipeStage}
      </div>
    );
  };

  renderTime = (pipelineTime, record) => {
    const { intl: { formatMessage } } = this.props;
    if (pipelineTime) {
      if (pipelineTime.split('.')[1] === '00') {
        pipelineTime = `${pipelineTime.toString().split('.')[0]}${formatMessage({ id: 'minutes' })}`;
      } else if (pipelineTime.split('.')[0] === '0') {
        pipelineTime = `${(Number(pipelineTime.toString().split('.')[1]) * 0.6).toFixed()}${formatMessage({ id: 'seconds' })}`;
      } else if (pipelineTime.split('.').length === 2) {
        pipelineTime = `${pipelineTime.toString().split('.')[0]}${formatMessage({ id: 'minutes' })}${(Number(pipelineTime.toString().split('.')[1]) * 0.6).toFixed()}${formatMessage({ id: 'seconds' })}`;
      } else {
        pipelineTime = null;
      }
      return pipelineTime;
    } else {
      return '--';
    }
  };

  renderAction = (record) => {
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    if (record.status && record.status !== 'passed' && record.status !== 'success' && record.status !== 'skipped') {
      return (
        <Permission
          service={['devops-service.project-pipeline.retry', 'devops-service.project-pipeline.cancel']}
          organizationId={organizationId}
          projectId={projectId}
          type={type}
        >
          <Popover placement="bottom" content={<div><span>{(record.status === 'running' || record.status === 'pending') ? 'cancel' : 'retry'}</span></div>}>
            <Button
              size="small"
              shape="circle"
              onClick={this.handleAction.bind(this, record)}
            >
              <span className={`icon ${ICONS_ACTION[record.status].icon} c7n-icon-action c7n-icon-sm`} />
            </Button>
          </Popover>
        </Permission>
      );
    } else {
      return null;
    }
  };

  render() {
    const { name } = AppState.currentMenuType;
    const { intl: { formatMessage } } = this.props;
    const appData = DevPipelineStore.getAppData;
    const appId = DevPipelineStore.getSelectApp;
    const titleName = _.find(appData, ['id', appId]) ? _.find(appData, ['id', appId]).name : name;
    return (
      <Page
        className="c7n-region c7n-ciPipeline"
        service={[
          'devops-service.application.listByActive',
          'devops-service.project-pipeline.cancel',
          'devops-service.project-pipeline.retry',
          'devops-service.devops-gitlab-pipeline.pagePipeline',
        ]}
      >
        {appData && appData.length ? <Fragment><Header title={<FormattedMessage id="ciPipeline.head" />}>
          <Select
            filter
            className="c7n-header-select"
            dropdownClassName="c7n-header-select_drop"
            placeholder={formatMessage({ id: 'ist.noApp' })}
            value={appData && appData.length ? DevPipelineStore.getSelectApp : undefined}
            disabled={appData.length === 0}
            filterOption={(input, option) => option.props.children.props.children.props.children
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={this.handleChange.bind(this)}
          >
            <OptGroup label={formatMessage({ id: 'recent' })} key="recent">
              {_.map(DevPipelineStore.getRecentApp, app => <Option key={`recent-${app.id}`} value={app.id}>
                <Tooltip title={app.code}><span className="c7n-ib-width_100">{app.name}</span></Tooltip>
              </Option>)}
            </OptGroup>
            <OptGroup label={formatMessage({ id: 'deploy.app' })} key="app">
              {
                _.map(appData, (app, index) => (
                  <Option value={app.id} key={index}>
                    <Tooltip title={app.code}><span className="c7n-ib-width_100">{app.name}</span></Tooltip>
                  </Option>))
              }
            </OptGroup>
          </Select>
          <Button
            funcType="flat"
            onClick={this.handleRefresh}
          >
            <i className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content code={appData.length ? 'ciPipeline.app' : 'ciPipeline'} values={{ name: titleName }}>
          {this.tableCiPipeline}
        </Content></Fragment> : <DepPipelineEmpty title={<FormattedMessage id="ciPipeline.head" />} type="app" />}
      </Page>
    );
  }
}

export default withRouter(injectIntl(CiPipelineHome));
