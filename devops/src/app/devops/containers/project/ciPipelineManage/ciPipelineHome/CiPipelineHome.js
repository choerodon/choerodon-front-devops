import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Tooltip, Popover, Select } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import TimeAgo from 'timeago-react';
import _ from 'lodash';
import '../../../main.scss';
import './CiPipelineHome.scss';
import CiPipelineStore from '../../../../stores/project/ciPipelineManage';

const Option = Select.Option;
const ICONS = {
  success: {
    icon: 'icon-check_circle',
    code: 'success',
    display: 'passed',
  },
  pending: {
    icon: 'icon-pause_circle_outline',
    code: 'pending',
    display: 'pending',
  },
  running: {
    icon: 'icon-timelapse',
    code: 'running',
    display: 'running',
  },
  failed: {
    icon: 'icon-cancel',
    code: 'failed',
    display: 'failed',
  },
  canceled: {
    icon: 'icon-not_interested',
    code: 'canceled',
    display: 'cancel',
  },
  skipped: {
    icon: 'icon-skipped_b',
    code: 'skipped',
    display: 'skipped',
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
      page: 0,
      param: [],
    };
  }

  componentDidMount() {
    CiPipelineStore.loadInitData();
  }

  componentWillUnmount() {
    CiPipelineStore.setCurrentApp({});
  }

  get filterBar() {
    return (
      <div>
        <Select
          className="c7n-app-select_512"
          value={CiPipelineStore.currentApp.id}
          label={this.props.intl.formatMessage({ id: 'deploy.step.one.app' })}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filter
          onChange={this.handleChange.bind(this)}
        >
          {
            _.map(CiPipelineStore.apps, (app, index) => 
              <Option key={index} value={app.id}>{app.name}</Option>,
            )
          }
        </Select>
      </div>
    );
  }

  get tableCiPipeline() {
    const { param } = this.state;

    const ciPipelineColumns = [
      {
        title: <FormattedMessage id="ciPipeline.status" />,
        dataIndex: 'status',
        render: (status, record) => this.renderStatus(status, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.sign" />,
        dataIndex: 'id',
        render: (id, record) => this.renderSign(id, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.commit" />,
        dataIndex: 'sha',
        render: (sha, record) => this.renderCommit(sha, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.jobs" />,
        dataIndex: 'jobs',
        render: (jobs, record) => this.renderJobs(jobs, record),
      },
      {
        title: <FormattedMessage id="ciPipeline.time" />,
        dataIndex: 'time',
        render: (time, record) => (
          <span>
            {this.renderTime(time, record)}
          </span>
        ),
      },
      {
        title: <FormattedMessage id="ciPipeline.createdAt" />,
        dataIndex: 'createdAt',
        render: (createdAt, record) => (
          <div>
            <Popover
              rowKey="creationDate"
              title={<FormattedMessage id="ciPipeline.createdAt" />}
              content={createdAt}
              placement="left"
            >
              <TimeAgo
                datetime={createdAt}
                locale={this.props.intl.formatMessage({ id: 'language' })}
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
          filterBarPlaceholder={this.props.intl.formatMessage({ id: 'filter' })}
          loading={CiPipelineStore.loading}
          size="middle"
          pagination={CiPipelineStore.pagination}
          columns={ciPipelineColumns}
          dataSource={CiPipelineStore.ciPipelines.slice()}
          rowKey={record => record.id}
          filters={param}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }

  handleChange(appId) {
    const currentApp = CiPipelineStore.apps.find(app => app.id === appId);
    CiPipelineStore.setCurrentApp(currentApp);
    CiPipelineStore.loadPipelines(appId);
  }

  handleAction(record) {
    if (record.status === 'running' || record.status === 'pending') {
      CiPipelineStore.cancelPipeline(record.gitlabProjectId, record.id);
    } else {
      CiPipelineStore.retryPipeline(record.gitlabProjectId, record.id);
    }
    this.handleRefresh();
  }

  handleTableChange = (pagination, filters, sorter, param) => {
    this.setState({ param });
    CiPipelineStore.setLoading(true);
    CiPipelineStore.loadPipelines(
      CiPipelineStore.currentApp.id,
      pagination.current - 1,
      pagination.pageSize);
  };

  handleRefresh =() => {
    this.setState({
      param: [],
    });
    CiPipelineStore.setLoading(true);
    CiPipelineStore.loadPipelines(
      CiPipelineStore.currentApp.id,
      CiPipelineStore.pagination.current - 1,
      CiPipelineStore.pagination.pageSize);
  };

  renderStatus = (status, record) => (
    <div className="c7n-status">
      <a
        href={`${record.gitlabUrl.slice(0, -4)}/pipelines/${record.id}`}
        target="_blank"
        rel="nofollow me noopener noreferrer"
      >
        <i className={`icon ${ICONS[status].icon} c7n-icon-${status} c7n-icon-sm`} />
        <span className="c7n-text-status black">{ICONS[status].display}</span>
      </a>
    </div>
  );

  renderSign = (id, record) => (
    <div className="c7n-sign">
      <div className="c7n-des-sign">
        <span>
          <a
            className="c7n-link-decoration"
            href={`${record.gitlabUrl.slice(0, -4)}/pipelines/${record.id}`}
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
          title={record.createUser}
          trigger="hover"
        >
          <span className="c7n-avatar m8 mt3">{record.createUser.substring(0, 1)}</span>
        </Tooltip>
      </div>
      {
        record.latest ? 
          (
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

  renderCommit = (sha, record) => (
    <div className="c7n-commit">
      <div className="c7n-title-commit">
        <i className="icon icon-branch mr7" />
        <Tooltip
          placement="top"
          title={record.ref}
          trigger="hover"
        >
          <a
            className="c7n-link-decoration"
            href={`${record.gitlabUrl.slice(0, -4)}/commits/${record.ref}`}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span className="black">{record.ref}</span>
          </a>
        </Tooltip>
        <i className="icon icon-point m8" />
        <Tooltip
          placement="top"
          title={record.sha}
          trigger="hover"
        >
          <a
            className="c7n-link-decoration"
            href={`${record.gitlabUrl.slice(0, -4)}/commit/${record.sha}`}
            target="_blank"
            rel="nofollow me noopener noreferrer"
          >
            <span>
              {
                _.find(CiPipelineStore.commits, { id: sha }) ? 
                  _.find(CiPipelineStore.commits, { id: sha }).shortId
                  : ''
              }
            </span>
          </a>
        </Tooltip>
      </div>
      <div className="c7n-des-commit">
        <Tooltip
          placement="top"
          title={
            _.find(CiPipelineStore.commits, { id: sha }) ? 
              _.find(CiPipelineStore.commits, { id: sha }).authorName
              : ''
          }
          trigger="hover"
        >
          <span className="c7n-avatar mr7">
            {
              _.find(CiPipelineStore.commits, { id: sha }) ? 
                _.find(CiPipelineStore.commits, { id: sha }).authorName.substring(0, 1)
                : ''
            }
          </span>
        </Tooltip>
        <a
          className="c7n-link-decoration"
          href={`${record.gitlabUrl.slice(0, -4)}/commit/${record.sha}`}
          target="_blank"
          rel="nofollow me noopener noreferrer"
        >
          <span className="gray">
            {
              _.find(CiPipelineStore.commits, { id: sha }) ? 
                _.find(CiPipelineStore.commits, { id: sha }).title
                : ''
            }
          </span>
        </a>
      </div>
    </div>
  );

  renderJobs = (jobs, record) => {
    const pipeStage = [];
    if (jobs && jobs.length) {
      for (let i = 0, l = jobs.length; i < l; i += 1) {
        pipeStage.push(<span className="c7n-jobs">
          {
            i !== 0 ?
              <span className="c7n-split-before" />
              : null
          }
          <Tooltip title={`${jobs[i].stage} : ${jobs[i].status}`}>
            <a
              className=""
              href={`${record.gitlabUrl.slice(0, -4)}/-/jobs/${jobs[i].id}`}
              target="_blank"
              rel="nofollow me noopener noreferrer"
            >
              <i
                className={`icon ${ICONS[jobs[i].status || 'skipped'].icon || ''}
                c7n-icon-${jobs[i].status} c7n-icon-lg`}
              />
            </a>
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

  renderTime = (time, record) => {
    if (time) {
      const day = time[0] ? `${time[0]}${this.props.intl.formatMessage({ id: 'ist.day' })}` : '';
      const hour = time[1] ? `${time[1]}${this.props.intl.formatMessage({ id: 'ist.hour' })}` : '';
      const minute = time[2] ? `${time[2]}${this.props.intl.formatMessage({ id: 'ist.min' })}` : '';
      const second = time[3] ? `${time[3]}${this.props.intl.formatMessage({ id: 'ist.sec' })}` : '';
      return `${day}${hour}${minute}${second}`;
    } else {
      return '--';
    }
  };

  renderAction = (record) => {
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;
    if (record.status && record.status !== 'success' && record.status !== 'skipped') {
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
    return (
      <Page
        className="c7n-region c7n-ciPipeline"
        service={[
          'devops-service.project-pipeline.list',
          'devops-service.application.listByActive',
          'devops-service.gitlab-commit.list',
          'devops-service.project-pipeline.cancel',
          'devops-service.project-pipeline.retry',
        ]}
      >
        <Header title={<FormattedMessage id="ciPipeline.title" />}>
          <Button
            funcType="flat"
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          <h2 className="c7n-space-first">
            <FormattedMessage
              id="ciPipeline.head"
              values={{
                name: `${AppState.currentMenuType.name}`,
              }}
            />
          </h2>
          <p>
            <FormattedMessage id="ciPipeline.description" />
            <a href={this.props.intl.formatMessage({ id: 'ciPipeline.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                <FormattedMessage id="learnmore" />
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
          {this.filterBar}
          {this.tableCiPipeline}
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(CiPipelineHome));
