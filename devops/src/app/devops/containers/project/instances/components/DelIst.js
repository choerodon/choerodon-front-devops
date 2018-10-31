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
        <p>
          <FormattedMessage id="ist.delDes" />
        </p>
      </Modal>);
  }
}
DelIst.propTypes = {
  open: PropTypes.bool,
};
export default injectIntl(DelIst);
