import React, { Component } from 'react';
import { Modal } from 'choerodon-ui';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import NewButton from 'NewButton';

@inject('AppState')
@observer
class ShowModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // this.handleFormReset();
  }

  componentWillUpdate() {
    // this.handleFormReset();
  }

  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        this.props.handleOK(data, this.props.opration);
      }
    });
  };

  render() {
    return (
      <div>
        <Modal
          className="create"
          width="520px"
          maskClosable={false}
          closable={false}
          title={this.props.title}
          visible={this.props.visible}
          onOk={this.handleOk}
          onCancel={this.props.handleCancel}
          footer={[
            <NewButton
              key="back"
              htmlType="reset"
              className="color3"
              height={36}
              disabled={this.props.loading}
              onClick={this.props.handleCancel}
              text={Choerodon.languageChange('form.cancel')}
            />,
            <NewButton
              key="submit"
              htmlType="reset"
              className={this.props.buttonStyle ? 'color3' : 'color4'}
              height={36}
              loading={this.props.loading}
              onClick={this.handleOk}
              text={this.props.opration === 'create' ? Choerodon.languageChange('form.create') : Choerodon.languageChange('form.save')}
            />,
          ]}
        >
          {this.props.content}
        </Modal>
      </div>
    );
  }
}
export default withRouter(ShowModal);
