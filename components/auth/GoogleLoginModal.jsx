import userAPI from 'api/userAPI'
import GoogleLogin from 'components/common/GoogleLogin'
import Popup from 'components/common/Popup'
import queryKeys from 'consts/queryKeys'
import urls from 'consts/urls'
import { auth } from 'lib/firebase'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useMutation, useQueryClient } from 'react-query'

function GoogleLoginModal({ isOpen, onRequestClose }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [cookies, setCookie] = useCookies(['username', 'imgURL', 'accessToken'])
  const { mutate } = useMutation((userInfo) => userAPI.login(userInfo), {
    onSuccess: (data) => setCookie('accessToken', data.data.accessToken, { path: '/' }),
  })

  useEffect(() => {
    if (cookies?.accessToken === undefined) auth.signOut()
    const unregisterAuthObserver = auth.onAuthStateChanged((userFirebase) => {
      if (userFirebase && cookies?.accessToken === undefined) {
        const { uid, displayName, photoURL } = userFirebase
        mutate({
          uuid: uid,
          username: displayName,
          avatar_url: photoURL,
        })
        setCookie('username', displayName, { path: '/' })
        setCookie('imgURL', photoURL, { path: '/' })
        queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedIn: true })
        const url = localStorage.getItem('redirectURL')
        if (url !== null) router.push(url)
        else router.push(urls.SESSIONS_CREATE)
      }
    })
    return () => unregisterAuthObserver()
  }, [isOpen])

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
