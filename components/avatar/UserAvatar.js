import { useState } from 'react'
import Avatar from 'components/common/Avatar'

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
        <div className="absolute md:left-4 top-12 md:top-14 p-2 z-10 md:border-gray-400 md:border md:bg-gray-400">
          <button
            className="w-16 p-0.5 md:w-20 md:px-2 md:py-1 rounded-sm bg-red-500 text-white text-sm"
            onClick={handleSignOut}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
