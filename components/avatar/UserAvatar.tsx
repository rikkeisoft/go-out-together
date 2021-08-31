import React, { useState, useRef } from 'react'
import Avatar from '../../components/common/Avatar'
import Popup from '../../components/common/Popup'
import { uploadImage } from 'lib/firebase'
import Button from '../../components/common/Button'
import { useCookies } from 'react-cookie'
import { useMutation } from 'react-query'
import { updateUserInfo } from 'api/users'
import AvatarEditor from 'react-avatar-editor'
import CropIcon from '../../components/icons/CropIcon'
import useClickOutside from 'hooks/useClickOutside'

interface UserAvatarProps {
  imgURL: string
  username: string
  onSignOut: () => unknown
}

interface UpdateUserData {
  uuid: string
  avatarURL: string
}

export default function UserAvatar({ imgURL, username, onSignOut }: UserAvatarProps) {
  const avatarInputRef = useRef(null)
  const avatarButtonRef = useRef(null)
  const menuRef = useRef(null)
  const [cookies, setCookie] = useCookies(['uid', 'imgURL'])
  const [visible, setVisbile] = useState(false)
  const [openPopup, setOpenPopup] = useState(false)
  const initialState = {
    image: imgURL,
    name: null,
    allowZoomOut: false,
    position: { x: 0, y: 0 },
    scale: 1,
    rotate: 0,
    editor: null,
    borderRadius: 0,
    preview: null,
    width: 300,
    height: 300,
  }
  const [avatarURL, setAvatarURL] = useState(initialState)
  const { mutateAsync } = useMutation((data: UpdateUserData) => updateUserInfo(data), {
    onSuccess: () => setCookie('imgURL', avatarURL.image),
  })

  React.useEffect(() => {
    setAvatarURL({ ...avatarURL, image: imgURL })
  }, [imgURL])

  const handleChangeMenuStatus = () => setVisbile(!visible)
  useClickOutside(menuRef, avatarButtonRef, (value: boolean) => setVisbile(value))

  const handleSignOut = () => {
    handleChangeMenuStatus()
    localStorage.clear()
    sessionStorage.clear()
    onSignOut()
    setVisbile(!visible)
  }

  const handleChangeAvatar = () => {
    handleChangeMenuStatus()
    setOpenPopup(true)
  }

  const handleUploadImage = async (e) => {
    const image = e.target.files[0]

    const imageFirebaseURL = await uploadImage(image)
    if (imageFirebaseURL) {
      setAvatarURL({ ...avatarURL, image: imageFirebaseURL, name: image.name })
    }
  }

  const handleCancelSaveAvatar = () => {
    setAvatarURL(initialState)
    setOpenPopup(false)
  }

  const handleSaveAvatar = async () => {
    // save to database
    mutateAsync(
      {
        uuid: cookies.uid,
        avatarURL: avatarURL.image,
      },
      {
        onSettled: () => setOpenPopup(false),
      },
    )
  }
  const handleScale = (e) => {
    const scale = parseFloat(e.target.value)
    setAvatarURL({ ...avatarURL, scale: scale })
  }

  const handlePositionChange = (position) => {
    setAvatarURL({ ...avatarURL, position })
  }
  const onCrop = () => {
    if (avatarInputRef.current) {
      const imageUrl = avatarInputRef.current.getImageScaledToCanvas().toDataURL()
      let imageURL
      fetch(imageUrl)
        .then((res) => res.blob())
        .then(async (blob) => {
          imageURL = new File([blob], avatarURL.name, { type: 'image/png' })
          const imageFirebaseURL = await uploadImage(imageURL)
          if (imageFirebaseURL) {
            setAvatarURL({ ...avatarURL, image: imageFirebaseURL })
          }
        })
    }
  }

  return (
    <>
      <div className="relative">
        {imgURL && (
          <button ref={avatarButtonRef}>
            <Avatar imgURL={avatarURL.image} username={username} />
          </button>
        )}

        {visible && (
          <div
            ref={menuRef}
            className="absolute left-6 top-16 md:left-5 p-1 md:py-1 z-10 border-white rounded-sm border bg-white"
          >
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
      </div>
      {openPopup && (
        <Popup isOpen={openPopup} onRequestClose={() => setOpenPopup(false)}>
          <div className="">
            <div className="mb-6 flex items-center justify-center md:w-600 md:h-300">
              <AvatarEditor
                ref={avatarInputRef}
                scale={Number(avatarURL.scale)}
                width={avatarURL.width}
                height={avatarURL.height}
                position={avatarURL.position}
                onPositionChange={handlePositionChange}
                rotate={Number(avatarURL.rotate)}
                borderRadius={200}
                color={[255, 255, 255, 0.4]}
                image={avatarURL.image}
                crossOrigin="anonymous"
                className="editor-canvas"
              />
            </div>
            <div className="flex justify-around my-2">
              <label className="bg-gray-300 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded">
                <span>Tải ảnh lên</span>
                <input type="file" className="hidden" onChange={handleUploadImage} />
              </label>
              <button
                className="bg-gray-300 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={onCrop}
              >
                <CropIcon className="w-6 mr-1" />
                Cắt ảnh
              </button>
            </div>
            <div className=" mx-6 my-4 flex items-center justify-center">
              <input
                className="md:w-80 h-1"
                name="scale"
                type="range"
                value={avatarURL.scale}
                onChange={handleScale}
                min={avatarURL.allowZoomOut ? '0.1' : '1'}
                max="1.5"
                step="0.01"
              />
            </div>
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
    </>
  )
}
