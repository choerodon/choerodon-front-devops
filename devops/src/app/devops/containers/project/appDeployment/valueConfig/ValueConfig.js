/* eslint-disable react/no-string-refs */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Modal } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import yaml from 'js-yaml';
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
    };
  }

  componentWillReceiveProps() {
    const value = yaml.safeLoad(this.props.store.getValue);
    this.setState({
      value,
    });
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
    const { store, id, idArr } = this.props;
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
        if(datas === '') {
          store.reDeploy(projectId, data)
            .then((res) => {
              if (res && res.failed) {
                Choerodon.prompt(res.message);
              } else {
                this.onClose(res);
              }
            });
        } else {
          Choerodon.prompt('请先更改yaml格式错误行');
        }
      });
  };

  render() {
    const data = this.props.store.getValue;
    const sideDom = (<div className="c7n-region">
      <h2 className="c7n-space-first">对&quot;{this.props.name}&quot;进行修改</h2>
      <p>
        对实例配置信息进行修改后重新部署。
        <a href="http://choerodon.io/zh/docs/user-guide/deployment-pipeline/instance/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
          <span className="c7n-external-link-content">
            了解详情
          </span>
          <span className="icon icon-open_in_new" />
        </a>
      </p>
      <div className="c7n-ace-section">
        <div className="c7n-body-section c7n-border-done">
          <div>
            {data && <Ace
              errorLines={this.state.errorLine || data.errorLines}
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
      title={Choerodon.getMessage('修改配置信息', 'Modify configuration information')}
      visible={this.props.visible}
      onOk={this.handleOk}
      onCancel={this.onClose.bind(this, false)}
      cancelText={Choerodon.languageChange('cancel')}
      okText={Choerodon.getMessage('重新部署', 'Redeploy')}
    >
      {sideDom}
    </Sidebar>);
  }
}

export default withRouter(ValueConfig);
