import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Modal, Select, Icon } from 'choerodon-ui';
import { stores, Content } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import Ace from '../../../components/yamlAce/index';
import './Instances.scss';
import '../../main.scss';

const { Sidebar } = Modal;
const { AppState } = stores;
const Option = Select.Option;

@observer
class UpgradeIst extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: undefined,
      value: '',
      loading: false,
      oldData: null,
      change: false,
    };
  }

  /**
   * 事件处理，修改value值后写入store
   * @param {*} value 修改后的value值
   */
  onChange = (value) => {
    const { store } = this.props;
    const projectId = AppState.currentMenuType.id;
    store.checkYaml(value, projectId)
      .then((data) => {
        this.setState({ errorLine: data });
      });
    this.setState({
      value,
      change: true,
    });
  };

  /**
   * 关闭弹窗
   * @param res
   */
  onClose = (res) => {
    this.setState({
      value: this.props.store.getValue,
    });
    this.props.onClose(res);
  };

  /**
   * 修改配置升级实例
   */
  handleOk = () => {
    this.setState({ loading: true });
    const { store, appInstanceId, idArr, intl } = this.props;
    const projectId = AppState.currentMenuType.id;
    const value = this.state.value || this.props.store.getValue.yaml;
    const verValue = this.props.store.getVerValue;
    const verId = this.state.id || verValue[0].id;
    const data = {
      values: value,
      appInstanceId,
      environmentId: idArr[0],
      appVerisonId: verId,
      appId: idArr[2],
      type: 'update',
    };
    store.checkYaml(value, projectId)
      .then((datas) => {
        this.setState({ errorLine: datas });
        if (datas.length === 0) {
          store.reDeploy(projectId, data)
            .then((res) => {
              if (res && res.failed) {
                Choerodon.prompt(res.message);
              } else {
                this.onClose(res);
              }
              this.setState({ loading: false });
            });
        } else {
          Choerodon.prompt(intl.formatMessage({ id: 'ist.yamlErr' }));
          this.setState({ loading: false });
        }
      });
  };

  aceDom = (data) => {
    const { errorLine, change } = this.state;
    if (data) {
      let error = data.errorLines;
      if (this.state.errorLine !== undefined) {
        error = errorLine;
      }
      return (<Ace
        newLines={data.newLines}
        isFileError={!!data.errorLines}
        errorLines={error}
        totalLine={data.totalLine}
        value={data.yaml}
        highlightMarkers={data.highlightMarkers && data.highlightMarkers.slice()}
        onChange={this.onChange}
        change={change}
      />);
    }
  }

  handleChange(id) {
    const { store, appInstanceId, idArr } = this.props;
    const projectId = AppState.currentMenuType.id;
    this.setState({
      id,
    });
    store.loadValue(projectId, appInstanceId, id)
      .then((res) => {
        if (res) {
          this.setState({ oldData: res, change: false });
        }
      });
  }

  render() {
    const { intl, store, name } = this.props;
    const { oldData } = this.state;
    const data = oldData || store.getValue;
    const verValue = this.props.store.getVerValue;
    const sideDom = (<div className="c7n-region">
      <Content code="ist.upgrade" values={{ name }} className="sidebar-content">
        {verValue && (<div>
          <Select
            className="c7n-app-select_512"
            notFoundContent={intl.formatMessage({ id: 'ist.noUpVer' })}
            value={this.state.id || (verValue.length ? verValue[0].id : undefined)}
            label={intl.formatMessage({ id: 'deploy.step.one.version.title' })}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
            onChange={this.handleChange.bind(this)}
          >
            {
              _.map(verValue, app => <Option key={app.id} value={app.id}>{app.version}</Option>)
            }
          </Select>
          {verValue.length === 0 ? <div>
            <Icon type="error" className="c7n-noVer-waring" />
            {intl.formatMessage({ id: 'ist.noUpVer' })}
          </div> : null}
        </div>)}
        <div className="c7n-ace-section">
          <div className="c7n-body-section c7n-border-done">
            {this.aceDom(data)}
          </div>
        </div>
      </Content>
    </div>);
    return (<Sidebar
      title={intl.formatMessage({ id: 'ist.upgrade' })}
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={this.onClose.bind(this, false)}
      cancelText={intl.formatMessage({ id: 'cancel' })}
      okText={intl.formatMessage({ id: 'ist.upgrade' })}
      confirmLoading={this.state.loading}
    >
      {sideDom}
    </Sidebar>);
  }
}

export default withRouter(injectIntl(UpgradeIst));
