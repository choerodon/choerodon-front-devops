import React, { Component } from 'react';
import { Table, Button } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { fromJS, is } from 'immutable';
import { Obversable } from 'rxjs';

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
      title: Choerodon.languageChange('app.version'),
      dataIndex: 'version',
      key: 'version',
      sorter: true,
      filters: [],
      filterMultiple: false,
    },
    {
      title: Choerodon.languageChange('app.code'),
      dataIndex: 'appCode',
      key: 'appCode',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      title: Choerodon.languageChange('app.name'),
      dataIndex: 'appName',
      key: 'appName',
      sorter: true,
      filters: [],
      filterMultiple: false,
    }, {
      title: Choerodon.languageChange('app.createTime'),
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: (text, record) => <TimePopover content={record.creationDate} />,
    },
    ];
  } ;
  render() {
    const { AppVersionStore } = this.props;
    const serviceData = AppVersionStore.getAllData;
    const { type, id: orgId } = AppState.currentMenuType;
    const contentDom = (
      <Table
        filterBarPlaceholder={'过滤表'}
        loading={AppVersionStore.loading}
        pagination={AppVersionStore.pageInfo}
        columns={this.getColumn()}
        dataSource={serviceData}
        rowKey={record => record.id}
        onChange={this.tableChange}
      />);

    return (
      <Page className="c7n-region c7n-appVersion-wrapper">
        {AppVersionStore.isRefresh ? <Loadingbar display /> : <React.Fragment>
          <Header title={Choerodon.languageChange('app.version')}>
            <Permission
              service={''}
              type={type}
              projectId={orgId}
            >
              <Button
                onClick={this.handleRefresh}
              >
                <span className="icon-refresh icon" />
                <span>{Choerodon.languageChange('refresh')}</span>
              </Button>
            </Permission>
          </Header>
          <Content>
            <h2 className="c7n-space-first">项目&quot;{AppState.currentMenuType.name}&quot;的应用版本管理</h2>
            <p>
              这些权限会影响此项目及其所有资源。
              <a href="http://choerodon.io/zh/docs/user-guide/assembly-line/service-version/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  了解详情
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

export default withRouter(ApplicationVersion);
