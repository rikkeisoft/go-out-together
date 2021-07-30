import userAPI from 'api/userAPI'
import Loading from 'components/common/Loading'
import queriesKey from 'consts/queriesKey'
import { useRouter } from 'next/router'
import Home from 'pages'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useQuery, useQueryClient } from 'react-query'

export default function ProtectedComponent({ children }) {
  const [cookies] = useCookies(['uid', 'username', 'imgURL'])
  const param = { uuid: cookies?.uid }
  const queryClient = useQueryClient()
  const { error, isLoading } = useQuery(
    [queriesKey.CHECK_USER, param],
    async () => {
      const state = queryClient.getQueryState(queriesKey.CHECK_USER)
      if (state?.data && (state?.data.isSignedOut || state?.data.isSignedIn)) {
        if (state.data.isSignedOut) {
          queryClient.setQueryData(queriesKey.CHECK_USER, { isSignedOut: false, isSignedIn: false })
        }
        return new Promise((rs) => rs())
      }
      try {
        await userAPI.checkUser(param)
        queryClient.setQueryData(queriesKey.CHECK_USER, { isSignedIn: true })
      } catch (error) {
        throw new Error('You need to login')
      }
    },
    { retry: 1 },
  )
  const router = useRouter()

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
