import userAPI from 'api/userAPI'
import GoogleLogin from 'components/common/GoogleLogin'
import Popup from 'components/common/Popup'
import queriesKey from 'consts/queriesKey'
import urls from 'consts/urls'
import { auth } from 'lib/firebase'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useMutation, useQueryClient } from 'react-query'

function GoogleLoginModal({ isOpen, onRequestClose }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()
  const [cookie, setCookie] = useCookies(['uid', 'username', 'imgURL'])
  const { mutate } = useMutation((userInfo) => userAPI.login(userInfo))

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((userFirebase) => {
      setIsSignedIn(() => !!userFirebase)
      if (!isSignedIn && userFirebase && cookie?.uid === undefined) {
        const { uid, displayName, photoURL } = userFirebase
        mutate({
          uuid: uid,
          username: displayName,
          avatar_url: photoURL,
        })
        queryClient.setQueryData(queriesKey.CHECK_USER, { isSignedIn: true })
        const url = localStorage.getItem('redirectURL')
        if (url !== null) router.push(url)
        else router.push(urls.SESSIONS_CREATE)
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
      <GoogleLogin />
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
