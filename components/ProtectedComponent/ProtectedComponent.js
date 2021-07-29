import userAPI from 'api/userAPI'
import queriesKey from 'consts/queriesKey'
import { useRouter } from 'next/router'
import Home from 'pages'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useQuery } from 'react-query'

export default function ProtectedComponent({ children }) {
  const [cookies] = useCookies(['uid', 'username', 'imgURL'])
  const param = { uuid: cookies?.uid }
  const { isError, isLoading } = useQuery([queriesKey.CHECK_USER, param], () => userAPI.checkUser(param))
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.id === undefined && router.pathname === '/sessions/create') {
      localStorage.setItem('redirectURL', `/sessions/create`)
    } else if (router.query.id !== undefined && router.pathname === '/sessions/[id]') {
      localStorage.setItem('redirectURL', `/sessions/${router.query.id}`)
    }
  }, [router.isReady])

  if (isLoading) {
    return <div className="text-center">Loading....</div>
  }

  if (isError) {
    return <Home />
  }

  return <>{children}</>
}
