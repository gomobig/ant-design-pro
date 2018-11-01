import React, { PureComponent } from 'react';
import { Modal } from 'antd';

export default (modalProps) => (WrapComponent) => {
  class ModalConnect extends PureComponent {
    render () {
      let { visible }  = this.props;
      const { onCancel } = this.props;
      if (!visible) {
        ( { visible } = modalProps);
      }
      return (
        <Modal {...modalProps} visible={visible} onCancel={onCancel}>
          <WrapComponent {...this.props} />
        </Modal>
      );
    }
  }
  return ModalConnect;
};
