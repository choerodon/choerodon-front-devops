import React from 'react';
import { Modal, Button } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

class DelIst extends React.Component {
  render() {
    const { open, handleCancel, handleConfirm, confirmLoading, intl, name } = this.props;
    return (
      <Modal
        title={`${intl.formatMessage({ id: 'ist.del' })}“${name}”`}
        visible={open}
        onOk={handleCancel}
        closable={false}
        footer={[
          <Button key="back" onClick={handleCancel} disabled={confirmLoading}><FormattedMessage id="cancel" /></Button>,
          <Button key="submit" type="danger" loading={confirmLoading} onClick={handleConfirm}>
            <FormattedMessage id="delete" />
          </Button>,
        ]}
      >
        <div className="c7n-padding-top_8">
          <FormattedMessage id="ist.delDes" />
        </div>
      </Modal>);
  }
}
DelIst.propTypes = {
  open: PropTypes.bool,
};
export default injectIntl(DelIst);
