import React, { Component } from 'react';
import { Table, Button } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import { fromJS, is } from 'immutable';
import { commonComponent } from '../../../../components/commonFunction';
import TimePopover from '../../../../components/timePopover';
import Loadingbar from '../../../../components/loadingBar';
import './ApplicationVersion.scss';
import '../../../main.scss';


const { AppState } = stores;
@commonComponent('AppVersionStore')
@observer
class ApplicationVersion extends Component {
  constructor(props) {
    super(props);
    const menu = AppState.currentMenuType;
    this.state = {
      page: 0,
      id: '',
      projectId: menu.id,
      show: false,
    };
  }

  componentDidMount() {
    this.loadAllData(this.state.page);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (this.props.form.isFieldsTouched()) {
      return true;
    }
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  };

  getColumn = () => {
    const { type, id: orgId } = AppState.currentMenuType;
    return [{
      title: <FormattedMessage id="app.appVersion" />,
      dataIndex: 'version',
      key: 'version',
      sorter: true,
      filters: [],
      filterMultiple: false,
    },
    {
      title: <FormattedMessage id="app.code" />,
      dataIndex: 'appCode',
      key: 'appCode',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'appName',
      key: 'appName',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      title: <FormattedMessage id="app.createTime" />,
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    },
    ];
  } ;
  render() {
    const { AppVersionStore, intl } = this.props;
    const serviceData = AppVersionStore.getAllData;
    const { type, id: orgId } = AppState.currentMenuType;
    const menu = AppState.currentMenuType;
    const contentDom = (
      <Table
        filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
        loading={AppVersionStore.loading}
        pagination={AppVersionStore.pageInfo}
        columns={this.getColumn()}
        dataSource={serviceData}
        rowKey={record => record.id}
        onChange={this.tableChange}
      />);

    return (
      <Page
        className="c7n-region c7n-appVersion-wrapper"
        service={[
          'devops-service.application-version.pageByOptions',
        ]}
      >
        {AppVersionStore.isRefresh ? <Loadingbar display /> : <React.Fragment>
          <Header title={<FormattedMessage id="app.version" />}>
            <Button
              onClick={this.handleRefresh}
            >
              <span className="icon-refresh icon" />
              <FormattedMessage id="refresh" />
            </Button>
          </Header>
          <Content>
            <h2 className="c7n-space-first">
              <FormattedMessage
                id="appVer.head"
                values={{
                  name: `${menu.name}`,
                }}
              />
            </h2>
            <p>
              <FormattedMessage id="appVer.description" />
              <a href={intl.formatMessage({ id: 'appVer.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  <FormattedMessage id="learnmore" />
                </span>
                <span className="icon icon-open_in_new" />
              </a>
            </p>
            {contentDom}
          </Content>
        </React.Fragment>}
      </Page>
    );
  }
}

export default withRouter(injectIntl(ApplicationVersion));
