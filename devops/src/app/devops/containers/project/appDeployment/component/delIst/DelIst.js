import React from 'react';
import { Modal, Button } from 'choerodon-ui';
import PropTypes from 'prop-types';

class DelIst extends React.Component {
  render() {
    const { open, handleCancel, handleConfirm, confirmLoading } = this.props;
    return (
      <Modal
        title={Choerodon.getMessage('删除实例', 'Delete instance')}
        visible={open}
        onOk={handleCancel}
        onCancel={handleConfirm}
        footer={[
          <Button key="back" onClick={handleCancel}>{Choerodon.getMessage('取消', 'Cancel')}</Button>,
          <Button key="submit" type="danger" loading={confirmLoading} onClick={handleConfirm}>
            {Choerodon.getMessage('删除', 'Delete')}
          </Button>,
        ]}
      >
        <p>
          {Choerodon.getMessage('删除实例将不可恢复，其配置网络同时失效，确定要删除该实例吗？', 'Are you sure delete this instance & instance`s newtwork!')}
        </p>
      </Modal>);
  }
}
DelIst.propTypes = {
  open: PropTypes.bool,
};
export default DelIst;
