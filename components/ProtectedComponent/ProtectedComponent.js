import userAPI from 'api/userAPI'
import Loading from 'components/common/Loading'
import queryKeys from 'consts/queryKeys'
import { useRouter } from 'next/router'
import Home from 'pages'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useQuery, useQueryClient } from 'react-query'

export default function ProtectedComponent({ children }) {
  const [, , removeCookie] = useCookies(['uid', 'username', 'imgURL', 'accessToken'])
  const queryClient = useQueryClient()
  const { error, isLoading } = useQuery(
    [queryKeys.CHECK_USER],
    async () => {
      const state = queryClient.getQueryState(queryKeys.CHECK_USER)
      if (state?.data && (state?.data.isSignedOut || state?.data.isSignedIn)) {
        if (state?.data.isSignedOut) {
          queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedOut: false })
        }
        return new Promise((rs) => rs())
      }
      try {
        await userAPI.checkUser()
        queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedIn: true })
      } catch (error) {
        removeCookie('username', { path: '/' })
        removeCookie('uid', { path: '/' })
        removeCookie('imgURL', { path: '/' })
        removeCookie('accessToken', { path: '/' })
        throw new Error(error.response.data.message)
      }
    },
    { retry: 1 },
  )
  const router = useRouter()

  useEffect(() => {
    queryClient.invalidateQueries(queryKeys.CHECK_USER)
  }, [router.isReady, router.pathname])

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.id === undefined && router.asPath !== '/') {
      localStorage.setItem('redirectURL', router.asPath)
    } else if (router.query.id !== undefined && router.pathname === '/sessions/[id]') {
      localStorage.setItem('redirectURL', `/sessions/${router.query.id}`)
    }
  }, [router.isReady])

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Home error={error.message} />
  }

  return <>{children}</>
}
