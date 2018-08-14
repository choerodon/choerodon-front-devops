import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Modal } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
// import yaml from 'js-yaml';
import { injectIntl, FormattedMessage } from 'react-intl';
import Ace from '../../../../components/yamlAce';
import '../AppDeploy.scss';
import '../../../main.scss';

const { Sidebar } = Modal;
const { AppState } = stores;

@observer
class ValueConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      loading: false,
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
   * 修改配置重新部署
   */
  handleOk = () => {
    this.setState({
      loading: true,
    });
    const { store, id, idArr, intl } = this.props;
    const projectId = AppState.currentMenuType.id;
    const value = this.state.value || this.props.store.getValue.yaml;
    const data = {
      values: value,
      appInstanceId: id,
      environmentId: idArr[0],
      appVerisonId: idArr[1],
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
              this.setState({
                loading: false,
              });
            });
        } else {
          Choerodon.prompt(intl.formatMessage({ id: 'ist.yamlErr' }));
          this.setState({
            loading: false,
          });
        }
      });
  };

  render() {
    const { intl } = this.props;
    const data = this.props.store.getValue;
    let error = data.errorLines;
    if (this.state.errorLine !== undefined) {
      error = this.state.errorLine;
    }
    const sideDom = (<div className="c7n-region">
      <h2 className="c7n-space-first">
        <FormattedMessage
          id="ist.editHead"
          values={{
            name: `${this.props.name}`,
          }}
        />
      </h2>
      <p>
        <FormattedMessage id="ist.editDes" />
        <a href={intl.formatMessage({ id: 'ist.link' })} rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
          <span className="c7n-external-link-content">
            <FormattedMessage id="learnmore" />
          </span>
          <span className="icon icon-open_in_new" />
        </a>
      </p>
      <div className="c7n-ace-section">
        <div className="c7n-body-section c7n-border-done">
          <div>
            {data && <Ace
              newLines={data.newLines}
              isFileError={!!data.errorLines}
              errorLines={error}
              totalLine={data.totalLine}
              value={data.yaml}
              highlightMarkers={data.highlightMarkers}
              onChange={this.onChange}
            /> }
          </div>
        </div>
      </div>
    </div>);
    return (<Sidebar
      title={intl.formatMessage({ id: 'ist.values' })}
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={this.onClose.bind(this, false)}
      cancelText={intl.formatMessage({ id: 'cancel' })}
      okText={intl.formatMessage({ id: 'ist.reDeploy' })}
      confirmLoading={this.state.loading}
    >
      {sideDom}
    </Sidebar>);
  }
}

export default withRouter(injectIntl(ValueConfig));
