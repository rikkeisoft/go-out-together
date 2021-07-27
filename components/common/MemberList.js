import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Popup from 'components/common/Popup'
import MessageText from 'components/common/MessageText'

const MemberList = memo(({ members, representativeCount = 2 }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const afterOpenModal = () => {}

  const closeModal = () => {
    setIsOpen(false)
  }

  let summaryText

  if (members.length <= representativeCount) {
    summaryText = members.join(',')
  } else {
    const anotherCount = members.length - representativeCount
    summaryText = members.slice(0, representativeCount - 1).join(',') + ` và ${anotherCount} người khác`
  }

  console.log(members)

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
          <MessageText>Các thành viên đang tham gia</MessageText>
          {members.map((member) => {
            return <div key={'member-' + member}>{member}</div>
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
