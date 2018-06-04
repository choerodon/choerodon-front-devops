/* eslint-disable no-console */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Table, Icon, Select, Button, Form } from 'choerodon-ui';
import Action from 'Action';
import classNames from 'classnames';
import _ from 'lodash';
import '../AppDeploy.scss';
import '../../../main.scss';

const Option = Select.Option;

@observer
class AppVersion extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      appName: '',
      isClick: false,
    };
  }

  componentDidMount() {
    this.loadAppName();
  }

  /**
   * 获取应用名称
   */
  loadAppName = () => {
    const { store } = this.props;
    const menu = JSON.parse(sessionStorage.selectData);
    const projectId = menu.id;
    store.loadAppNames(projectId);
  };

  loadDetail = (id) => {
    this.setState({
      isClick: id,
    });
    console.log(id, this.state.appName);
  };

  handleChange = (value) => {
    this.setState({
      appName: value,
    });
    console.log(`selected ${value}`);
  };

  /**
   * 处理页面跳转
   * @param url 跳转地址
   */
  linkToChange = (url) => {
    const { history } = this.props;
    history.push(url);
  };

  linkDeployDetail = (id) => {
    this.linkToChange(`/devops/instance/${id}/detail`);
  };

  render() {
    const { store } = this.props;
    const { isClick } = this.state;
    const appNames = store.getAppNames;
    const envCard = store.getEnvcard;

    const appNameDom = appNames.length ? _.map(appNames, d => <Option key={d.id}>{d.name}</Option>) : <Option key="null">无</Option>;
    const envCardDom = envCard.length ? _.map(envCard, d => (<div className="c7n-app-square">
      <div role="none" className={isClick === d.id ? 'c7n-app-card c7n-app-card-active' : 'c7n-app-card'} key={d.id} onClick={this.loadDetail.bind(this, d.id)}>
        <div className="c7n-app-state">
          运行中
        </div>
        <span>{d.name}</span>
      </div>
      <span className="c7n-app-arrow">→</span>
    </div>)) : (<div className="c7n-app-card" key="noEnv">
      <div className="c7n-app-state">
        未添加
      </div>
      <span>未添加环境</span>
    </div>);

    const dataSource = [{
      key: '1',
      status: 4,
      instance: 'deploy－front－1.0.1-ABC',
      app: { name: '部署服务', version: '0.1.2' },
      env: { name: '开发环境', env: 'devops-0408' },
      cNumber: 2,
    }, {
      key: '2',
      status: 4,
      instance: 'deploy－front－1.0.1-ABC',
      app: { name: '部署服务', version: '0.1.2' },
      env: { name: '开发环境', env: 'devops-0408' },
      cNumber: 3,
    }, {
      key: '3',
      status: 4,
      instance: 'deploy－front－1.0.1-ABC',
      app: { name: '部署服务', version: '0.1.2' },
      env: { name: '开发环境', env: 'devops-0408' },
      cNumber: 5,
    }];

    const columns = [{
      title: Choerodon.languageChange('deploy.status'),
      key: 'status',
      render: record => (
        <div className="c7n-deploy-status">
          <svg className="c7n-deploy-circle_red">
            <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="40%" strokeWidth="16.5%" />
          </svg>
          <svg className="c7n-deploy-circle-process">
            <circle className="c7n-transition-rotate" cx="50%" cy="50%" r="40%" strokeWidth="16.5%" strokeDashoffset="62.5%" />
          </svg>
          <span className="c7n-deploy-status-num">{record.status}</span>
        </div>
      ),
    }, {
      title: Choerodon.languageChange('deploy.instance'),
      dataIndex: 'instance',
      key: 'instance',
    }, {
      title: Choerodon.languageChange('deploy.cNumber'),
      key: 'cNumber',
      render: record => (
        <div>
          <span className="icon-remove c7n-deploy-cNumber-first" />
          <span className="c7n-deploy-cNumber_1">{record.cNumber}</span>
          <span className="icon-add c7n-deploy-cNumber" />
        </div>
      ),
    }, {
      width: '40px',
      className: 'c7n-operate-icon',
      key: 'action',
      render: (test, record) => (
        <Action
          data={[
            {
              service: '',
              icon: 'search',
              text: Choerodon.getMessage('查看实例详情', 'View instance details'),
              action: this.linkDeployDetail.bind(this, 2),
            }, {
              service: '',
              icon: '',
              text: Choerodon.getMessage('查看版本特性', 'View version features'),
              // action: this.linkVersionFeature.bind(this, record.id),
            }, {
              service: '',
              icon: '',
              text: Choerodon.getMessage('下载chart', 'Download Chart'),
              // action: this.activeService.bind(this, record.id, false),
            },
          ]}
        />
      ),
    }];

    const detailDom = isClick ? (<div className="c7n-deploy-wrap_gray">
      <h2 className="c7n-space-first">实例</h2>
      <Table columns={columns} dataSource={dataSource} rowKey={record => record.key} />
    </div>) : <span className="c7n-none-des">请先选择应用、应用版本和环境</span>;

    return (
      <div className="c7n-region">
        <Select label="应用名称" className="c7n-app-select_180" allowClear>
          {appNameDom}
        </Select>
        <Select label="应用版本" className="c7n-app-select_312" allowClear>
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>Disabled</Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
        <div className="c7n-deploy-env-line">
          {envCardDom}
        </div>
        {detailDom}
      </div>
    );
  }
}

export default Form.create({})(withRouter(AppVersion));
