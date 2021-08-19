import { useState } from 'react'
import Avatar from 'components/common/Avatar'
import Popup from 'components/common/Popup'
import { uploadImage } from 'lib/firebase'
import Button from 'components/common/Button'
import { useCookies } from 'react-cookie'
import { useMutation } from 'react-query'
import { updateUserInfo } from 'api/users'
import AvatarEditor from 'react-avatar-editor'
// import Preview from './Preview.jsx'

export default function UserAvatar({ imgURL, username, onSignOut }) {
  const [cookies, setCookie] = useCookies(['uid', 'imgURL'])
  const [visible, setVisbile] = useState(false)
  const [openPopup, setOpenPopup] = useState(false)
  // const [scale, setScale] = useState(1)
  const initialState = {
    image: imgURL,
    allowZoomOut: false,
    position: { x: 0.5, y: 0.5 },
    scale: 1,
    rotate: 0,
    borderRadius: 0,
    preview: null,
    width: 200,
    height: 200,
  }
  const [avatarURL, setAvatarURL] = useState(initialState)
  // const [allowZoomOut, setAllowZoomOut] = useState(false)
  
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
    setAvatarURL(avatarURL)
    setOpenPopup(false)
  }

  const handleSaveAvatar = async () => {
    // save to database
    mutateAsync(
      {
        uuid: cookies.uid,
        avatarURL,
      },
      // this.setState({
      //   preview: {
      //     img,
      //     rect,
      //     scale: this.state.scale,
      //     width: this.state.width,
      //     height: this.state.height,
      //     borderRadius: this.state.borderRadius,
      //   },
      // }),
      {
        onSettled: () => setOpenPopup(false),
      },
    )
  }
  const handleScale = e => {
    const scale = parseFloat(e.target.value)
    setAvatarURL({ ...avatarURL, scale: scale })
  }
  const handlePositionChange = position => {
    setAvatarURL({ ...avatarURL, position })
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
            <AvatarEditor 
                    scale={parseFloat(avatarURL.scale)}
                    width={avatarURL.width}
                    height={avatarURL.height}
                    position={avatarURL.position}
                    onPositionChange={handlePositionChange}
                    rotate={parseFloat(avatarURL.rotate)}
                    borderRadius={avatarURL.width / (100 / avatarURL.borderRadius)}
                    image={avatarURL.image}
                    className="editor-canvas"
            />
            {/* <Preview

            width={
              initialState.preview.scale < 1
                ? initialState.preview.width
                : initialState.preview.height
            rect={initialState.preview.rect}
          /> */}
              {/* <img src={avatarURL} alt="avatar" className="w-64 h-64 object-cover" /> */}
          
            </div>
            <div>
            <input
            className="w-64"
          name="scale"
          type="range"
          onChange={handleScale}
          min={avatarURL.allowZoomOut ? '0.1' : '1'}
          max="1.5"
          step="0.01"
          defaultValue="1"
        />
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
