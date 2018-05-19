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
            <span className="icon-refresh" />
            <span className="icon-space">{Choerodon.languageChange('refresh')}</span>
          </Button>
        </PageHeader>
        <div className="c7n-store-app-content">
          <div className="c7n-store-detail-head">
            <div className="c7n-store-img-wrap">
              <div className="c7n-store-img" />
            </div>
            <div>
              <div className="c7n-store-name">Ad Exchange Seller</div>
              <div className="c7n-store-contributor">贡献者：XXX</div>
              <div className="c7n-store-des">Choerodon认为软件交付过程的本质是用户价值的实现，而用户价值的实现是通过用户价值流动来体现的.</div>
              <div>
                <span className="c7n-store-circle">V</span>
                <Select
                  style={{ width: 300 }}
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
        </div>
      </div>
    );
  }
}

export default withRouter(AppDetail);
