import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Popup from 'components/common/Popup'
import MessageText from 'components/common/MessageText'
import Avatar from 'boring-avatars'

const MemberList = memo(({ members }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const afterOpenModal = () => {}

  const closeModal = () => {
    setIsOpen(false)
  }

  let summaryText = members.length + ' thành viên'

  return (
    <>
      <span
        className="inline-block text-blue-500 cursor-pointer"
        onClick={() => {
          openModal()
        }}
      >
        {summaryText}
      </span>
      <Popup isOpen={isOpen} onAfterOpen={afterOpenModal} onRequestClose={closeModal}>
        <div className="overflow-y-auto">
          <MessageText>Các thành viên</MessageText>
          {members.map((member) => {
            return (
              <div key={'member-' + member} className="flex flex-row justify-start items-center mb-4">
                <Avatar
                  size={40}
                  name="SN"
                  variant="beam"
                  colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                />
                <span className="inline-block ml-4">{member}</span>
              </div>
            )
          })}
        </div>
      </Popup>
    </>
  )
})

MemberList.propTypes = {
  members: PropTypes.array,
}

MemberList.defaultProps = {}

export default MemberList
