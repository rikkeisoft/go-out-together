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
        <div className="absolute left-6 top-14 md:left-5 top-12 md:top-14 p-1 md:py-1 z-10 border-white rounded-sm border bg-white">
          <button
            className="w-full p-0.5 md:w-20 md:px-2 md:py-1 rounded-sm bg-transparent text-red-500 text-xs font-bold"
            onClick={handleSignOut}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
