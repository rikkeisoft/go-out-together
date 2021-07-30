import Avatar from 'components/common/Avatar'
import { useState } from 'react'

export default function UserAvatar({ imgURL, username, onSignOut }) {
  const [visible, setVisbile] = useState(false)
  const handleSignOut = () => {
    onSignOut()
    setVisbile(!visible)
  }

  return (
    <div className="relative" onClick={() => setVisbile(!visible)}>
      {imgURL && <Avatar imgURL={imgURL} username={username} />}

      {visible && (
        <div className="absolute left-4 top-14 p-2 z-10border-gray-400 border bg-gray-400">
          <button className="w-20 px-2 py-1 rounded-sm bg-red-500 text-white text-sm" onClick={handleSignOut}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
