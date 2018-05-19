import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import NewButton from 'NewButton';
import classNames from 'classnames';
import { Button } from 'choerodon-ui';
import QueueAnim from 'rc-queue-anim';
import './Sidebar.scss';
import '../../containers/main.scss';


class Sidebar extends PureComponent {
  static propTypes = {
    onOk: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    title: PropTypes.string.isRequired,
    visible: PropTypes.bool,
    footer: PropTypes.node,
    showOkBth: PropTypes.bool,
  };

  static defaultProps = {
    loading: false,
    visible: false,
    showOkBth: true,
  };

  componentWillUpdate(nextProps) {
    const elements = document.getElementById('container');
    // const a = this.state.a;
    if (this.props.visible === false && nextProps.visible === true) {
      // elements.style.backgroundColor = 'rgba(33, 33, 33, 0.48)';
      elements.className = 'c7n-sidebar-wrap';
    }
  }

  get header() {
    return this.props.title ? (
      <header className="c7n-sidebar-container-header"><span className="c7n-text-title-3">{this.props.title}</span></header>
    ) : null;
  }

  get aside() {
    return this.props.aside ? (
      <aside className="c7n-sidebar-container-aside">{this.props.aside}</aside>
    ) : null;
  }

  get footer() {
    if (this.props.showOkBth) {
      return (
        <footer className="c7n-sidebar-container-footer">
          {this.props.footer ? this.props.footer : <Button
            onClick={this.props.onOk}
            type="primary"
            funcType="raised"
            className="sidebar-btn"
            loading={this.props.loading}
          >
            {Choerodon.getMessage('保存', 'Save')}</Button> }
          <Button
            funcType="raised"
            disabled={this.props.loading}
            onClick={this.props.onClose}
          >
            {Choerodon.getMessage('取消', 'Cancel')}</Button>
        </footer>);
    } else {
      return (
        <footer className="c7n-sidebar-container-footer">
          <Button
            funcType="raised"
            disabled={this.props.loading}
            onClick={this.props.onClose}
          >
            {Choerodon.getMessage('取消', 'Cancel')}</Button>
        </footer>);
    }
  }

  get content() {
    if (this.aside) {
      return (
        <section className="c7n-sidebar-container-content">
          <article className="c7n-sidebar-container-article">{this.props.children}</article>
          {this.aside}
        </section>
      );
    }
    return (
      <section className="c7n-sidebar-container-content">
        <article className={`c7n-sidebar-container-article ${this.props.className}`}>{this.props.children}</article>
      </section>
    );
  }

  hideParent =() => {
    if (!this.props.visible) {
      const elements = document.getElementById('container');
      // elements.style.backgroundColor = 'white';
      elements.className = 'c7n-sidebar-hidden';
    }
  };
  render() {
    const pageStyle = classNames({
      'c7n-region': true,
      'c7n-sidebar-container': true,
    });
    return (
      <div id="container" className="c7n-sidebar-hidden">
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <QueueAnim
            duration={150}
            type={['alpha']}
          >
            {this.props.visible ?
              <div key="left" className="c7n-left-Wrapper" /> : null}
          </QueueAnim>
          <QueueAnim
            duration={200}
            type={['right', 'left', 'alpha']}
            onEnd={this.hideParent}
          >
            {this.props.visible ?
              <div className={pageStyle} key="demo">
                {this.header}
                {this.content}
                {this.footer}
              </div> : null}
          </QueueAnim>
        </div>

      </div>);
  }
}

export default Sidebar;
