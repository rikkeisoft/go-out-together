import { useState } from 'react'
import Avatar from 'components/common/Avatar'
import Popup from 'components/common/Popup'
import { uploadImage } from 'lib/firebase'
import Button from 'components/common/Button'
import { useCookies } from 'react-cookie'
import { useMutation } from 'react-query'
import { updateUserInfo } from 'api/users'

export default function UserAvatar({ imgURL, username, onSignOut }) {
  const [cookies, setCookie] = useCookies(['uid', 'imgURL'])
  const [visible, setVisbile] = useState(false)
  const [openPopup, setOpenPopup] = useState(false)
  const [avatarURL, setAvatarURL] = useState(imgURL)
  const { mutateAsync } = useMutation((data) => updateUserInfo(data), {
    onSuccess: () => setCookie('imgURL', avatarURL),
  })

  const handleSignOut = () => {
    localStorage.clear()
    sessionStorage.clear()
    onSignOut()
    setVisbile(!visible)
  }

  const handleChangeAvatar = () => setOpenPopup(true)

  const handleUploadImage = async (e) => {
    const image = e.target.files[0]
    const imageFirebaseURL = await uploadImage(image)
    if (imageFirebaseURL) {
      setAvatarURL(imageFirebaseURL)
    }
  }

  const handleCancelSaveAvatar = () => {
    setAvatarURL(imgURL)
    setOpenPopup(false)
  }

  const handleSaveAvatar = async () => {
    // save to database
    mutateAsync(
      {
        uuid: cookies.uid,
        avatarURL,
      },
      {
        onSettled: () => setOpenPopup(false),
      },
    )
  }

  return (
    <div className="relative" onClick={() => setVisbile(!visible)}>
      {imgURL && <Avatar imgURL={imgURL} username={username} />}

      {visible && (
        <div className="absolute left-6 top-14 md:left-5 top-12 md:top-14 p-1 md:py-1 z-10 border-white rounded-sm border bg-white">
          <button
            className="w-full p-0.5 md:w-20 md:px-2 md:py-1 rounded-sm bg-transparent text-red-500 text-xs font-bold hover:bg-gray-300"
            onClick={handleChangeAvatar}
          >
            Thay đổi avatar
          </button>
          <button
            className="w-full p-0.5 md:w-20 md:px-2 md:py-1 rounded-sm bg-transparent text-red-500 text-xs font-bold hover:bg-gray-300"
            onClick={handleSignOut}
          >
            Đăng xuất
          </button>
        </div>
      )}
      {openPopup && (
        <Popup isOpen={openPopup} onRequestClose={() => setOpenPopup(false)}>
          <div className="">
            <div className="mb-6 flex items-center justify-center">
              <img src={avatarURL} alt="avatar" className="w-64 h-64 object-cover" />
            </div>
            <input type="file" onChange={handleUploadImage} />
          </div>
          <div className="flex items-center justify-around">
            <Button type="button" variant="danger" onClick={handleCancelSaveAvatar}>
              Hủy
            </Button>
            <Button type="button" variant="primary" onClick={handleSaveAvatar}>
              Lưu
            </Button>
          </div>
        </Popup>
      )}
    </div>
  )
}
