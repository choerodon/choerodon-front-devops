/**
 * Created by mading on 2017/12/2.
 */
import React, { Component } from 'react';
import { Tabs } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import './rightTab.less';

const TabPane = Tabs.TabPane;

@inject('AppState')
@observer
class RightTab extends Component {
  constructor(props) {
    super(props);
    // this.loadResource = this.loadResource.bind(this);
    // this.linkToChange = this.linkToChange.bind(this);
    this.state = {
      height: window.innerHeight - 48,
      minHeight: window.innerHeight - 48,
      id: this.props.id,
    };
  }
  componentDidMount() {
    // document.getElementsByClassName('ant-tabs-content')[0]
    // .style.height = window.innerHeight - 58 - 48;
  }
  componentWillReceiveProps(nextProps) {
    const id = this.state.id;
    if (nextProps.id !== id) {
      this.setState({ id: nextProps.id });
    }
  }
  componentDidUpdate() {
    // const minHeight = this.state.minHeight;
    const heightold = this.state.height;
    const height = document.getElementsByClassName('ant-tabs-content ant-tabs-content-animated')[0].offsetHeight + 75;
    if (height !== heightold) {
      // this.changeHeight();
    }
  }
  changeHeight =() => {
    this.setState({ height: document.getElementsByClassName('ant-tabs-content ant-tabs-content-animated')[0].offsetHeight + 75 });
  };


  render() {
    // onTabClose, operation是必传的
    // handleEdit ,id 只有在haveEditStatus为true的情况下才传
    const { handleEdit, operation, onTabClose, haveEditStatus } = this.props;
    const isEdit = haveEditStatus || false;
    let title;
    // 有编辑操作
    if (operation) {
      switch (operation) {
        case 'edit':
          title = Choerodon.getMessage('编辑', 'Edit');
          break;
        case 'detail':
          title = Choerodon.getMessage('详情', 'Detail');
          break;
        case 'create':
          title = Choerodon.getMessage('创建', 'Create');
          break;
        default:
          return title;
      }
    }
    let operations = null;
    if (isEdit) {
      operations = (
        <a
          role="none"
          onClick={handleEdit.bind(this, this.state.id, 'edit')}
          style={{ marginRight: '23px', color: '#3F51B5 ', fontSize: 13, textDecoration: 'none' }}
        >
          <span className="icon-mode_edit" style={{ fontSize: 12, paddingRight: 4 }} />
          <span className="icon-space">{Choerodon.getMessage('编辑', 'edit')}</span>
        </a>);
    }
    const tab = (<div style={{ paddingLeft: 24 }}>
      <span role="none" onClick={onTabClose.bind(this)} className="icon-close" style={{ verticalAlign: 'middle', color: '#3F51B5' }} />
      <span style={{ paddingLeft: 20, verticalAlign: 'middle' }}>{title}</span>
    </div>);

    return (
      <div
        className="tabStyle"
        style={{
          display: this.props.operation ? 'inline-block' : 'none',
          float: 'right',
          width: '30%',
          // height: window.innerHeight - 48,
          // minHeight: this.state.minHeight,
          borderLeft: '1px solid #D3D3D3',
        }}
      >
        <Tabs defaultActiveKey="1" size="small" style={{ width: '100%' }} tabBarExtraContent={operations}>
          <TabPane tab={tab} key="1" style={{ paddingLeft: 24, height: window.innerHeight - 58 - 48, overflow: 'auto' }}>
            {this.props.children}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default withRouter(RightTab);
