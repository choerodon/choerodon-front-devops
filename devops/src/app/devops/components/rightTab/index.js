import React, { Component } from 'react';
import { Tabs } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { is } from 'immutable';
import classNames from 'classnames';
import './RightTab.scss';

const TabPane = Tabs.TabPane;

@observer
export default class RightTab extends React.Component {
  // Declare propTypes as static properties as early as possible
  static propTypes = {
    operation: React.PropTypes.string.isRequired,
    onTabClose: React.PropTypes.func.isRequired,
    handleEdit: React.PropTypes.func,
    id: React.PropTypes.number,
    haveEditStatus: React.PropTypes.bool,
  };
  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight - 48,
      minHeight: window.innerHeight - 48,
    };
  }

  shouldComponentUpdate(nextProps = {}, nextState = {}) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
      Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key in nextProps) {
      if (thisProps[key] !== nextProps[key] || !is(thisProps[key], nextProps[key])
      ) {
        return true;
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])
      ) {
        return true;
      }
    }
    return false;
  }

  render() {
    const { handleEdit, operation, onTabClose, haveEditStatus, id } = this.props;
    const rightTabClass = classNames({
      'rightTab-content': operation,
      'rightTab-hidden': !operation,
    });

    let title = '';
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

    const editOpt = haveEditStatus && (
      <a
        role="none"
        onClick={handleEdit.bind(this, id, 'edit')}
        className="rightTab-tabPane-edit"
      >
        <span className="icon-mode_edit rightTab-tabPane-icon-edit" />
        <span>{Choerodon.getMessage('详情', 'Detail')}</span>
      </a>);

    const tab = (<div className="rightTab-tabPane-title">
      <span role="none" onClick={onTabClose.bind(this)} className="rightTab-tabPane-close icon-close" />
      <span className="rightTab-tabPane-title-text">{title}</span>
    </div>);

    const tabPaneStyle = { paddingLeft: 24, height: window.innerHeight - 106 };

    return (
      <div className={rightTabClass}>
        <Tabs defaultActiveKey="1" size="small" tabBarExtraContent={editOpt}>
          <TabPane
            tab={tab}
            key="1"
            style={tabPaneStyle}
          >
            {this.props.children}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

