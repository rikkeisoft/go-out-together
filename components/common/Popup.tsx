import React, { memo } from 'react'
import Modal from 'react-modal'
import { ReactNode } from 'react'
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

interface Props {
  isOpen: boolean
  onAfterOpen?: () => unknown
  onRequestClose: () => unknown
  children: ReactNode
}

const Popup = memo(({ isOpen, onAfterOpen, onRequestClose, children }: Props) => {
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

export default Popup
