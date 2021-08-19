import { login } from 'api/users'
import GoogleLogin from 'components/common/GoogleLogin'
import queryKeys from 'consts/queryKeys'
import urls from 'consts/urls'
import { auth } from 'lib/firebase'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useMutation, useQueryClient } from 'react-query'

function GoogleLoginModal() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [cookies, setCookie] = useCookies(['uid', 'username', 'imgURL', 'accessToken'])
  const { mutate } = useMutation((userInfo) => login(userInfo), {
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
        setCookie('uid', uid, { path: '/' })
        setCookie('username', displayName, { path: '/' })
        setCookie('imgURL', photoURL, { path: '/' })
        queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedIn: true })
        const url = sessionStorage.getItem('redirectURL')
        if (url !== null) router.push(url)
        else router.push(`${urls.HOME}`)
      }
    })
    return () => unregisterAuthObserver()
  }, [])

  return <GoogleLogin />
}

GoogleLoginModal.propTypes = {
  isOpen: PropTypes.bool,
  onRequestClose: PropTypes.func,
  url: PropTypes.string,
}

GoogleLoginModal.defaultProps = {}

export default GoogleLoginModal
