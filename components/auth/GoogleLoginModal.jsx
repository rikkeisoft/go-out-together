import Popup from 'components/common/Popup'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { auth } from 'lib/firebase'
import { useState } from 'react'
import GoogleLogin from 'components/common/GoogleLogin'
import { useMutation } from 'react-query'
import userAPI from 'api/userAPI'
import { useCookies } from 'react-cookie'

function GoogleLoginModal({ isOpen, onRequestClose, url }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [, setCookie] = useCookies(['uid', 'username', 'imgURL'])
  const { mutate } = useMutation((userInfo) => userAPI.login(userInfo))

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((userFirebase) => {
      setIsSignedIn(() => !!userFirebase)
      if (!isSignedIn && userFirebase) {
        const { uid, displayName, photoURL } = userFirebase
        mutate({
          uuid: uid,
          username: displayName,
          avatar_url: photoURL,
        })
        setCookie('uid', uid, { path: '/' })
        setCookie('username', displayName, { path: '/' })
        setCookie('imgURL', photoURL, { path: '/' })
      }
    })
    return () => unregisterAuthObserver()
  }, [])

  return (
    <Popup isOpen={isOpen} onRequestClose={onRequestClose}>
      <h1 className="text-center font-medium w-64">Đăng nhập</h1>
      <GoogleLogin url={url} />
    </Popup>
  )
}

GoogleLoginModal.propTypes = {
  isOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
  url: PropTypes.string,
}

GoogleLoginModal.defaultProps = {}

export default GoogleLoginModal
