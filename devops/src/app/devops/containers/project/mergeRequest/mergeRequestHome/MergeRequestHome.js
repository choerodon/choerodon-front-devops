import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Icon, Pagination, Table, Popover } from 'choerodon-ui';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import './MergeRequestHome.scss';
import '../../../main.scss';

const { AppState } = stores;

@observer
class MergeRequestHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val: '',
      pageSize: 20,
      page: 0,
    };
  }

  componentDidMount() {
  }


  /**
   * 刷新函数
   */
  reload = () => {
  };


  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  render() {
    const { MergeRequestStore, intl } = this.props;
    const projectId = AppState.currentMenuType.id;
    const organizationId = AppState.currentMenuType.organizationId;
    const type = AppState.currentMenuType.type;

    const columns = [{
      title: <FormattedMessage id="app.name" />,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id="appstore.category" />,
      dataIndex: 'category',
      key: 'category',
    }, {
      title: <FormattedMessage id="appstore.description" />,
      dataIndex: 'description',
      key: 'description',
    }, {
      width: 56,
      key: 'action',
      render: (test, record) => (
        <div>
          <Permission
            service={['devops-service.application-market.queryApp']}
            organizationId={organizationId}
            projectId={projectId}
            type={type}
          >
            <Popover placement="bottom" content={<FormattedMessage id="app.appDetail" />}>
              <Button
                size="small"
                shape="circle"
                onClick={this.appDetail.bind(this, record.id)}
              >
                <span className="icon icon-insert_drive_file" />
              </Button>
            </Popover>
          </Permission>
        </div>
      ),
    }];

    return (
      <Page
        className="c7n-region page-container"
        service={[
        ]}
      >
        <Header title={<FormattedMessage id="appstore.title" />}>
          <Button
            funcType="flat"
            onClick={this.reload}
          >
            <span className="icon-refresh icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content>
          <h2 className="c7n-space-first">
            <FormattedMessage id="appstore.title" />
          </h2>
          <p>
            <FormattedMessage id="appstore.headDes" />
            <a href={intl.formatMessage({ id: 'appstore.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
                <FormattedMessage id="learnmore" />
              </span>
              <span className="icon icon-open_in_new" />
            </a>
          </p>
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(MergeRequestHome));
