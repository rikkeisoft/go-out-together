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
  const {
    isError,
    isLoading,
  } = useQuery([queriesKey.CHECK_USER, param], () => userAPI.checkUser(param), {
    retry: 2,
  })
  const router = useRouter()

  if (router.query.id !== undefined && router.pathname === '/sessions/[id]') {
    localStorage.setItem('redirectURL', `/sessions/${router.query.id}`)
  }
  console.log(router.pathname)
  console.log(router.query)

  useEffect(() => {
    if (router.query.id === undefined) {
      localStorage.setItem('redirectURL', `/sessions/create`)
    }
  }, [])

  if (isLoading) {
    return <div className="text-center">Loading....</div>
  }

  if (isError) {
    return <Home />
  }

  return <>{children}</>
}
