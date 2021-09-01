import React, { memo, useState } from 'react'
import Avatar from '../../components/common/Avatar'
import Popup from './Popup'
import Button from './Button'

interface Member {
  id: number
  name: string
  username: string
  avatarUrl: string
}

interface MemberListProps {
  members: Member[]
}

const MemberList = memo(({ members }: MemberListProps) => {
  const [openPopup, setOpenPopup] = useState(false)

  return (
    <>
      <div className="flex flex-row">
        {members.slice(0, 3).map((member) => {
          return (
            <div key={'member-' + member.id} className="mr-2">
              <Avatar imgURL={member.avatarUrl} username={member.name} />
            </div>
          )
        })}
        {members.length > 3 && (
          <div>
            <span
              className="flex justify-center items-center bg-gray-300 text-black rounded-full cursor-pointer object-cover w-16 h-16 text-xl"
              onClick={() => setOpenPopup(true)}
            >
              + {members.length - 3}
            </span>
          </div>
        )}
      </div>
      <Popup isOpen={openPopup} onRequestClose={() => setOpenPopup(false)}>
        <p className="mb-4 font-bold text-2xl text-center">Các thành viên đang tham gia:</p>
        <ul className="mb-2 h-80 overflow-y-auto text-center">
          {members.map((member) => (
            <li
              key={member.id}
              className="px-2 py-1 mb-2 flex items-center justify-start text-xl hover:bg-gray-200 transition-colors"
            >
              <Avatar imgURL={member.avatarUrl} username={member.name} />
              <span className="ml-6">{member.name}</span>
            </li>
          ))}
        </ul>
        <div className="text-center">
          <Button type="button" variant="primary" onClick={() => setOpenPopup(false)}>
            Xong
          </Button>
        </div>
      </Popup>
    </>
  )
})

export default MemberList
