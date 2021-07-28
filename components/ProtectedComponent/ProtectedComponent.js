import { AuthContext } from 'contexts/AuthContext'
import Home from 'pages'
import { useContext } from 'react'

export default function ProtectedComponent({ children }) {
  const {
    authState: { authLoading, isAuthenticated },
  } = useContext(AuthContext)

  if (authLoading) {
    return <div className="text-center">Loading....</div>
  }

  if (!isAuthenticated) return <Home />

  return <>{children}</>
}
