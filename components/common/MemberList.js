import React, { memo } from 'react'
import PropTypes from 'prop-types'
import Avatar from 'components/common/Avatar'

const MemberList = memo(({ members }) => {
  return (
    <div className="flex flex-row">
      {members.map((member, index) => {
        return (
          <div key={'member-' + index} className="mr-2">
            <Avatar imgURL={member.avatarUrl} username={member.username} />
          </div>
        )
      })}
    </div>
  )
})

MemberList.propTypes = {
  members: PropTypes.array,
}

MemberList.defaultProps = {}

export default MemberList
