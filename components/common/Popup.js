import React, { memo } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
Modal.setAppElement('#__next')

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}

const Popup = memo(({ isOpen, onAfterOpen, onRequestClose, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={onAfterOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel=""
    >
      {children}
    </Modal>
  )
})

Popup.propTypes = {
  isOpen: PropTypes.bool,
  onAfterOpen: PropTypes.func,
  onRequestClose: PropTypes.func,
  children: PropTypes.func,
}

Popup.defaultProps = {}

export default Popup
