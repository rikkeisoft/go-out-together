import urls from 'consts/urls'
import { AuthContext } from 'contexts/AuthContext'
import { useRouter } from 'next/router'
import Home from 'pages'
import { useContext, useEffect } from 'react'

export default function ProtectedComponent({ children }) {
  const {
    authState: { authLoading, isAuthenticated },
  } = useContext(AuthContext)
  const router = useRouter()

  if (router.query.id !== undefined) {
    localStorage.setItem('redirectURL', `/sessions/${router.query.id}`)
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(urls.HOME)
    }
  }, [isAuthenticated, authLoading])

  if (authLoading) {
    return <div className="text-center">Loading....</div>
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return <Home />
}
