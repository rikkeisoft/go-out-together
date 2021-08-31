import { login } from 'api/users'
import GoogleLogin from '../common/GoogleLogin'
import queryKeys from 'consts/queryKeys'
import urls from 'consts/urls'
import { auth } from 'lib/firebase'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useMutation, useQueryClient } from 'react-query'

interface MutateProps {
  uuid: string
  username: string
  avatar_url: string
}

function GoogleLoginModal() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [cookies, setCookie] = useCookies(['uid', 'username', 'imgURL', 'accessToken'])
  const { mutate } = useMutation((userInfo: MutateProps) => login(userInfo), {
    onSuccess: (data) => {
      setCookie('imgURL', data.data.avatarURL, { path: '/' })
      setCookie('accessToken', data.data.accessToken, { path: '/' })
    },
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

export default GoogleLoginModal
