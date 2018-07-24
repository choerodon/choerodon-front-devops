import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button, Tabs, Form, Select, Collapse, Icon } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import '../EnvOverview.scss';
import '../../../main.scss';

const { AppState } = stores;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const Panel = Collapse.Panel;

@observer
class EnvOverviewHome extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  componentDidMount() {
    this.loadEnvCards();
  }

  /**
   * 获取可用环境
   */
  loadEnvCards = () => {
    const { EnvOverviewStore } = this.props;
    const projectId = AppState.currentMenuType.id;
    EnvOverviewStore.loadActiveEnv(projectId);
  };


  render() {
    const { intl, EnvOverviewStore } = this.props;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    const envNames = EnvOverviewStore.getEnvcard;
    const envName = envNames.length ? (<React.Fragment>
      {envNames[0].name}
    </React.Fragment>) : '无可用环境';
    const text = `
      A dog is a type of domesticated animal.
      Known for its loyalty and faithfulness,
      it can be found as a welcome guest in many households across the world.
    `;

    const envNameDom = envNames.length ? _.map(envNames, d => (<Option key={d.id}>
      {d.name}</Option>)) : [];

    const headDom = (<div className="c7n-envow-plane-head">
      <Icon type="navigate_next" />
    </div>);

    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.application.listByActive',
        ]}
      >
        <Header title={<FormattedMessage id="envoverview.head" />}>
          <Select defaultValue={envName} onChange={this.loadEnvCards} className="c7n-envow-select" notFoundContent={intl.formatMessage({ id: 'envoverview.noEnv' })} showSearch>
            {envNameDom}
          </Select>
          <Permission
            service={[
              'devops-service.devops-git.createTag',
            ]}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Button
              onClick={this.showSideBar}
            >
              <span className="icon-jsfiddle icon" />
              <FormattedMessage id="deploy.header.title" />
            </Button>
          </Permission>
          <Permission
            service={['devops-service.devops-service.create']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Button
              funcType="flat"
              onClick={this.showSideBar}
            >
              <span className="icon-playlist_add icon" />
              <span><FormattedMessage id={'network.header.create'} /></span>
            </Button>
          </Permission>
          <Permission
            service={['devops-service.devops-ingress.create']}
            type={type}
            projectId={projectId}
            organizationId={orgId}
          >
            <Button
              funcType="flat"
              // onClick={this.showSideBar.bind(this, 'create', '')}
            >
              <span className="icon icon-playlist_add icon" />
              <FormattedMessage id={'domain.header.create'} />
            </Button>
          </Permission>
          <Button
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          <div className="c7n-envow-status-wrap">
            <div>
              <h2 className="c7n-space-first">
                <FormattedMessage
                  id="envoverview.title"
                  values={{
                    name: `${name}`,
                  }}
                />
              </h2>
              <p>
                <FormattedMessage
                  id="envoverview.description"
                />
                <a href={this.props.intl.formatMessage({ id: 'envoverview.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                  <span className="c7n-external-link-content">
                    <FormattedMessage id="learnmore" />
                  </span>
                  <span className="icon icon-open_in_new" />
                </a>
              </p>
            </div>
            <div className="c7n-envow-status-content">
              <table>
                <tr>
                  <td className="c7n-envow-status-text">运行中</td>
                  <td className="c7n-envow-status-text">操作中</td>
                  <td className="c7n-envow-status-text">已停止</td>
                  <td className="c7n-envow-status-text">失败</td>
                </tr>
                <tr>
                  <td>
                    <span className="c7n-envow-status-num c7n-envow-status-running">3</span>
                  </td>
                  <td>
                    <span className="c7n-envow-status-num c7n-envow-status-operating">4</span>
                  </td>
                  <td>
                    <span className="c7n-envow-status-num c7n-envow-status-stopped">2</span>
                  </td>
                  <td>
                    <span className="c7n-envow-status-num c7n-envow-status-fail">0</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
          <Tabs defaultActiveKey="app" animated={false} onChange={this.tabChange}>
            <TabPane tab={`${intl.formatMessage({ id: 'network.column.app' })}`} key="app">
              <Collapse bordered={false} defaultActiveKey={['1']}>
                <Panel header={`${process.env.NODE_ENV}`} key="1">
                  <p>{text}</p>
                </Panel>
                <Panel header="This is panel header 2" key="2">
                  <p>{text}</p>
                </Panel>
              </Collapse>
            </TabPane>
            <TabPane tab={`${intl.formatMessage({ id: 'network.header.title' })}`} key="network">
              网络
            </TabPane>
            <TabPane tab={`${intl.formatMessage({ id: 'domain.header.title' })}`} key="domain">
              域名
            </TabPane>
          </Tabs>
        </Content>
      </Page>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(EnvOverviewHome)));
