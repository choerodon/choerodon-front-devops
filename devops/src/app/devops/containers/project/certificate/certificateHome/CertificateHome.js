import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Table, Icon, Select, Button } from 'choerodon-ui';
import '../../../main.scss';
import './CertificateHome.scss';

const { AppState } = stores;
const { Option } = Select;
@observer
class CertificateHome extends Component {

  openCreateModal =() => {};

  handleEnvSelect = () => {};

  reload = () => {};

  render() {
    const { intl } = this.props;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;
    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={['devops-service.devops-environment.listByProjectIdAndActive']}
      >
        <Header title={<FormattedMessage id="ctf.head" />}>
          <Permission
            type={type}
            projectId={projectId}
            organizationId={orgId}
            service={['devops-service.devops-environment.listByProjectIdAndActive']}
          >
            <Button
              funcType="flat"
              onClick={this.openCreateModal}
              icon="playlist_add"
            >
              <FormattedMessage id="ctf.create" />
            </Button>
          </Permission>
          <Button
            funcType="flat"
            onClick={this.reload}
            icon="refresh"
          >
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          className="page-content"
          code="ctf"
          value={{ name }}
        >
          <Select
            label={intl.formatMessage({ id: 'ctf.envName' })}
            className="c7n-select_512 c7n-ctf-select"
            onSelect={this.handleEnvSelect}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            getPopupContainer={triggerNode => triggerNode.parentNode}
            allowClear
            filter
            showSearch
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
          </Select>
          <Table
            filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
            // onChange={this.tableChange}
            // loading={}
            // pagination={}
            // filters={param || []}
            // columns={}
            // dataSource={}
            rowKey={record => record.id}
          />
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(CertificateHome));
