import { createContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

export const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    authLoading: true,
    isAuthenticated: false,
    user: null,
  })
  const [cookie, setCookie, removeCookie] = useCookies([])

  const loadUser = () => {
    if (cookie?.uid === undefined) {
      setAuthState({
        ...authState,
        authLoading: false,
        isAuthenticated: false,
        user: null,
      })
    } else {
      const { uid, username, imgURL } = cookie
      setAuthState({
        ...authState,
        authLoading: false,
        isAuthenticated: true,
        user: { uid, username, imgURL },
      })
    }
  }

  useEffect(() => loadUser(), [])

  const logIn = (user) => {
    const { uid, displayName, photoURL } = user

    setCookie('uid', uid, { path: '/' })
    setCookie('username', displayName, { path: '/' })
    setCookie('imgURL', photoURL, { path: '/' })
    setAuthState({
      ...authState,
      authLoading: false,
      isAuthenticated: true,
      user: {
        uid: uid,
        username: displayName,
        imgURL: photoURL,
      },
    })
  }

  const logOut = () => {
    removeCookie('uid', { path: '/' })
    removeCookie('username', { path: '/' })
    removeCookie('imgURL', { path: '/' })
    setAuthState({
      ...authState,
      authLoading: false,
      isAuthenticated: false,
      user: null,
    })
  }

  const authContextData = {
    logIn,
    logOut,
    authState,
  }

  return <AuthContext.Provider value={authContextData}>{children}</AuthContext.Provider>
}

export default AuthContextProvider
