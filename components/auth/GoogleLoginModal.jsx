import Popup from 'components/common/Popup'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { auth } from 'lib/firebase'
import { useState } from 'react'
import GoogleLogin from 'components/common/GoogleLogin'
import { useContext } from 'react'
import { AuthContext } from 'contexts/AuthContext'

function GoogleLoginModal({ isOpen, onRequestClose, url }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const {
    authState: { user },
    logIn,
  } = useContext(AuthContext)

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((userFirebase) => {
      setIsSignedIn(() => !!userFirebase)
      if (!isSignedIn && user?.uid === undefined && userFirebase) {
        logIn(userFirebase)
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
