import React, { Component } from 'react';
import { Modal } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import NewButton from 'NewButton';
import { is } from 'immutable';
import './ShowModal.scss';

@observer
export default class ShowModal extends React.Component {
  // Declare propTypes as static properties as early as possible
  static propTypes = {
    title: React.PropTypes.string,
    width: React.PropTypes.string,
    operate: React.PropTypes.string,
    visible: React.PropTypes.bool,
    loading: React.PropTypes.bool,
    handleOK: React.PropTypes.func,
    handleCancel: React.PropTypes.func,
    footer: React.PropTypes.node,
    maskClosable: React.PropTypes.bool,
    closable: React.PropTypes.bool,
    buttonHeight: React.PropTypes.string,
  };

  // Default props below propTypes
  static defaultProps = {
    maskClosable: false,
    closable: false,
    width: '520px',
    buttonHeight: '36px',
    buttonStyle: false,
    operate: '',
    loading: false,
    visible: false,
    footer: null,
  };

  shouldComponentUpdate(nextProps = {}) {
    const thisProps = this.props || {};

    // eslint-disable-next-line no-restricted-syntax
    for (const key in nextProps) {
      if (thisProps[key] !== nextProps[key] || !is(thisProps[key], nextProps[key])
      ) {
        return true;
      }
    }

    return false;
  }

  // 提交表单验证
  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        this.props.handleOK(data, this.props.opration);
      }
    });
  };

  render() {
    const {
      title,
      width,
      visible,
      loading,
      operate,
      handleCancel,
      maskClosable,
      closable,
      buttonStyle,
      buttonHeight,
      footer,
    } = this.props;

    return (
      <div>
        <Modal
          className="hap-modal-content"
          width={width}
          maskClosable={maskClosable}
          closable={closable}
          title={title}
          visible={visible}
          onOk={this.handleOk}
          onCancel={handleCancel}
          footer={footer || [
            <NewButton
              key="back"
              htmlType="reset"
              className="color3"
              height={buttonHeight}
              disabled={loading}
              onClick={handleCancel}
              text={Choerodon.languageChange('form.cancel')}
            />,
            <NewButton
              key="submit"
              htmlType="reset"
              className={buttonStyle ? 'color3' : 'color4'}
              height={buttonHeight}
              loading={loading}
              onClick={this.handleOk}
              text={operate === 'create' ? Choerodon.languageChange('form.create') : Choerodon.languageChange('form.save')}
            />,
          ]}
        >
          {this.props.children}
        </Modal>
      </div>
    );
  }
}

