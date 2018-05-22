import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Icon, Card, Select } from 'choerodon-ui';
import PageHeader from 'PageHeader';
import './AppDetail.scss';
import '../../../main.scss';

const Option = Select.Option;

@inject('AppState')
@observer
class AppDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { AppState } = this.props;
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const type = AppState.currentMenuType.type;

    return (
      <div className="c7n-region page-container">
        <PageHeader title="Ad Exchange Seller" backPath={`/devops/appstore?type=${type}&id=${projectId}&name=${projectName}`}>
          <Button
            funcType="flat"
            className="leftBtn"
            onClick={this.handleRefresh}
          >
            <span className="icon-refresh page-head-icon" />
            <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
          </Button>
        </PageHeader>
        <div className="c7n-store-app-content">
          <div className="c7n-store-detail-head">
            <div className="c7n-store-detail-left">
              <div className="c7n-store-img-wrap">
                <div className="c7n-store-img" />
              </div>
            </div>
            <div className="c7n-store-detail-right">
              <div className="c7n-store-name">Ad Exchange Seller</div>
              <div className="c7n-store-contributor">贡献者：XXX</div>
              <div className="c7n-store-des">Choerodon认为软件交付过程的本质是用户价值的实现，而用户价值的实现是通过用户价值流动来体现的.</div>
              <div>
                <span className="c7n-store-circle">V</span>
                <Select
                  size="large"
                  className="c7n-store-select"
                  defaultValue="0.1.2－dev.201804180936121"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  filter
                >
                  <Option value="jack">Jack</Option>
                  <Option value="lucy">Lucy</Option>
                  <Option value="tom">Tom</Option>
                </Select>
                <Button
                  className="c7n-store-deploy"
                  type="primary"
                  funcType="raised"
                >
                  部署
                </Button>
              </div>
            </div>
          </div>
          <div className="c7n-store-detail">
            <div className="c7n-store-detail-left">
              <div className="c7n-store-key">类型</div>
              <div className="c7n-store-type">devops</div>
              <div className="c7n-store-key">上次更新日期</div>
              <div className="c7n-store-time">2018/1/6 上午10:42</div>
            </div>
            <div className="c7n-store-detail-right">
              <div className="c7n-store-detail-overview">
                <h1>概览</h1>
                <div>
                  Choerodon认为软件交付过程的本质是用户价值的实现，而用户价值的实现是通过用户价值流动来体现的，
                  Choerodon提供了一套工具来帮助用户通过敏捷的方式来管理用户价值的流动，使整个软件开发流程管化规范化。

                  关于软件开发，我们可以找到很多前人的经验，包括已经存在的方法论和工具。这两者很难说哪个方法论正确，
                  或是哪个工具是最好用。其实开发是“任性的”，它没有特定的规律，整个开发过程是否高效，
                  除了【团队的实力】这个决定因素以外，还取决于整个开发的流程是否清晰，通常高效总是伴随着清晰而来。
                </div>
              </div>
              <h1>教程和文档</h1>
              <a href="http://choerodon.io/zh/docs/user-guide/deploy/application-deployment/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
                <span className="c7n-external-link-content">
                  了解详情
                </span>
                <span className="icon-open_in_new" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(AppDetail);
