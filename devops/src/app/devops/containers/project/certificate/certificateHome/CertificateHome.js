import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import { Select, Button, Modal } from 'choerodon-ui';
import '../../../main.scss';
import './CertificateHome.scss';
import CertTable from '../certTable';
import CreateCert from '../createCert';

const { AppState } = stores;
const { Option } = Select;
const { Sidebar } = Modal;
@observer
class CertificateHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createDisplay: false,
    };
  }

  componentDidMount() {
    this.loadCertData();
  }

  /**
   * 创建证书侧边栏
   */
  openCreateModal = () => {
    const { CertificateStore } = this.props;
    CertificateStore.setEnvData([]);
    this.setState({ createDisplay: true });
  };

  /**
   * 关闭创建侧边栏
   */
  closeCreateModal = () => this.setState({ createDisplay: false });

  /**
   * 刷新
   */
  reload = () => this.loadCertData();

  loadCertData = () => {
    const { CertificateStore } = this.props;
    const { page, pageSize, sorter, postData } = CertificateStore.getTableFilter;
    const { id: projectId } = AppState.currentMenuType;
    CertificateStore.loadCertData(projectId, page, pageSize, sorter, postData);
  };

  render() {
    const { CertificateStore } = this.props;
    const { createDisplay } = this.state;
    const { type, id: projectId, organizationId: orgId, name } = AppState.currentMenuType;

    return (
      <Page
        className="c7n-region c7n-ctf-wrapper"
        service={[
          'devops-service.devops-environment.listByProjectIdAndActive',
          'devops-service.certification.listByOptions',
          'devops-service.certification.create',
          'devops-service.certification.delete',
        ]}
      >
        <Header title={<FormattedMessage id="ctf.head" />}>
          <Permission
            type={type}
            projectId={projectId}
            organizationId={orgId}
            service={['devops-service.certification.create']}
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
          <CertTable store={CertificateStore} />
        </Content>
        {createDisplay && <CreateCert
          visible={createDisplay}
          store={CertificateStore}
          onClose={this.closeCreateModal}
        />}
      </Page>
    );
  }
}

export default withRouter(injectIntl(CertificateHome));
