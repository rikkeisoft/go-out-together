import { checkUser } from 'api/users'
import LoadingOverlay from 'components/common/LoadingOverlay'
import queryKeys from 'consts/queryKeys'
import { useRouter } from 'next/router'
import Home from 'pages'
import Details from 'pages/sessions/[sid]'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useQuery, useQueryClient } from 'react-query'

export default function ProtectedComponent({ children }) {
  const [, , removeCookie] = useCookies(['uid', 'username', 'imgURL', 'accessToken'])
  const queryClient = useQueryClient()
  const { error, isLoading } = useQuery(
    queryKeys.CHECK_USER,
    async () => {
      const state = queryClient.getQueryState(queryKeys.CHECK_USER)
      if (state?.data && (state?.data.isSignedOut || state?.data.isSignedIn)) {
        if (state?.data.isSignedOut) {
          queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedOut: false })
        }
        return new Promise((rs) => rs())
      }

      try {
        await checkUser()
        queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedIn: true })
        return
      } catch (error) {
        removeCookie('username', { path: '/' })
        removeCookie('uid', { path: '/' })
        removeCookie('imgURL', { path: '/' })
        removeCookie('accessToken', { path: '/' })
        throw new Error(error.response.data.message)
      }
    },
    { retry: false },
  )
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const isReloaded = sessionStorage.getItem('pageReloaded')
    if (isReloaded) {
      sessionStorage.getItem('redirectURL') && sessionStorage.removeItem('redirectURL')
    }
    sessionStorage.setItem('pageReloaded', 'true')
    if (router.query.id === undefined && router.asPath !== '/') {
      sessionStorage.setItem('redirectURL', router.asPath)
    } else if (router.query.id !== undefined && router.pathname === '/sessions/[sid]') {
      sessionStorage.setItem('redirectURL', `/sessions/${router.query.sid}`)
    } else return
  }, [router.isReady])

  if (isLoading) {
    return <LoadingOverlay isOpen={isLoading} message="Vui lòng chờ..." />
  }

  if (error) {
    if (router.pathname === '/sessions/[sid]') return <Details error={error.message} />
    return <Home />
  }

  return <>{children}</>
}
