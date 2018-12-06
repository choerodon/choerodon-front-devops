import React, { Component, Fragment } from 'react';
import { Button, Tooltip, Select } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Content, Header, Page, Permission, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { injectIntl, FormattedMessage } from 'react-intl';
import KeyValueTable from '../keyValueTable';
import KeyValueSideBar from '../keyValueSideBar';
import './ConfigMap.scss';
import '../../../main.scss';
import EnvOverviewStore from "../../../../stores/project/envOverview";
import DepPipelineEmpty from "../../../../components/DepPipelineEmpty/DepPipelineEmpty";

const { AppState } = stores;
const { Option } = Select;

@observer
class ConfigMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sideBarDisplay: false,
      configMapId: undefined,
    };
  }


  componentDidMount() {
    const { id: projectId } = AppState.currentMenuType;
    EnvOverviewStore.loadActiveEnv(projectId, 'configMap');
  }

  openSideBar = (configMapId) => {
    this.setState({ sideBarDisplay: true, configMapId });
  };

  reload = () => this.loadConfigMap();

  loadConfigMap = (page, size) => {
    const { ConfigMapStore } = this.props;
    const tpEnvId = EnvOverviewStore.getTpEnvId;
    const { id: projectId } = AppState.currentMenuType;
    ConfigMapStore.loadConfigMap(projectId, tpEnvId, page, size);
  };

  /**
   * 环境选择
   * @param value
   */
  handleEnvSelect = (value) => {
    EnvOverviewStore.setTpEnvId(value);
    this.loadConfigMap();
  };

  closeSideBar = (isLoad) => {
    this.setState({ sideBarDisplay: false });
    if(isLoad) {
      this.loadConfigMap();
    }
  };

  render() {
    const { type, organizationId, name, id: projectId } = AppState.currentMenuType;
    const { sideBarDisplay, configMapId } = this.state;
    const {
      ConfigMapStore,
      intl: { formatMessage },
    } = this.props;
    const envData = EnvOverviewStore.getEnvcard;
    const envId = EnvOverviewStore.getTpEnvId;
    const title = _.find(envData, ['id', envId]);
    const envState = envData.length
      ? envData.filter(d => d.id === Number(envId))[0]
      : { connect: false };

    return (
      <Page
        className="c7n-region c7n-app-wrapper"
        service={[
          'devops-service.devops-config-map.create',
          'devops-service.devops-config-map.query',
          'devops-service.devops-config-map.delete',
          'devops-service.devops-config-map.checkName',
          'devops-service.devops-config-map.listByEnv',
        ]}
      >
        {envData && envData.length && envId ? (
          <Fragment>
            <Header title={<FormattedMessage id="configMap.head" />}>
              <Select
                className={`${
                  envId
                    ? "c7n-header-select"
                    : "c7n-header-select c7n-select_min100"
                  }`}
                dropdownClassName="c7n-header-env_drop"
                placeholder={formatMessage({ id: "envoverview.noEnv" })}
                value={envData && envData.length ? envId : undefined}
                disabled={envData && envData.length === 0}
                onChange={this.handleEnvSelect}
              >
                {_.map(envData, e => (
                  <Option
                    key={e.id}
                    value={e.id}
                    disabled={!e.permission}
                    title={e.name}
                  >
                    <Tooltip placement="right" title={e.name}>
                      <span className="c7n-ib-width_100">
                        {e.connect ? (
                          <span className="c7ncd-status c7ncd-status-success" />
                        ) : (
                          <span className="c7ncd-status c7ncd-status-disconnect" />
                        )}
                        {e.name}
                      </span>
                    </Tooltip>
                  </Option>
                ))}
              </Select>
              <Permission
                type={type}
                projectId={projectId}
                organizationId={organizationId}
                service={['devops-service.devops-config-map.create']}
              >
                <Tooltip
                  title={
                    envState && !envState.connect ? (
                      <FormattedMessage id="envoverview.envinfo" />
                    ) : null
                  }
                >
                  <Button
                    funcType="flat"
                    disabled={envState && !envState.connect}
                    onClick={this.openSideBar.bind(this, false)}
                    icon="playlist_add"
                  >
                    <FormattedMessage id="configMap.create" />
                  </Button>
                </Tooltip>
              </Permission>
              <Button funcType="flat" onClick={this.reload} icon="refresh">
                <FormattedMessage id="refresh" />
              </Button>
            </Header>
            <Content code={'configMap'} values={{ name: title ? title.name : name }}>
              <KeyValueTable store={ConfigMapStore} envId={envId} editOpen={this.openSideBar} />
            </Content>
          </Fragment>
        ) : (
          <DepPipelineEmpty
            title={<FormattedMessage id="configMap.head" />}
            type="env"
          />
        )}
        {sideBarDisplay && (
          <KeyValueSideBar
            visible={sideBarDisplay}
            store={ConfigMapStore}
            envId={envId}
            id={configMapId}
            onClose={this.closeSideBar}
          />
        )}
      </Page>
    );
  }
}

export default withRouter(injectIntl(ConfigMap));
