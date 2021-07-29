import userAPI from 'api/userAPI'
import messageCodes from 'consts/messageCodes'
import { createContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'

export const AuthContext = createContext()

const AuthContextProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    authLoading: true,
    isAuthenticated: false,
    isSignedOut: false,
    user: null,
  })
  const [cookie, setCookie, removeCookie] = useCookies([])

  const loadUser = async () => {
    if (cookie?.uid === undefined) {
      setAuthState({
        ...authState,
        authLoading: false,
        isAuthenticated: false,
        user: null,
      })
    } else {
      const { uid } = cookie
      try {
        const response = await userAPI.checkUser({ uuid: uid })
        if (response.messageCode === messageCodes.SUCCESS) {
          setAuthState({
            ...authState,
            authLoading: false,
            isAuthenticated: true,
            user: {
              uid,
              username: response.data.username,
              imgURL: response.data.avatar_URL,
            },
          })
          setCookie('uid', uid, { path: '/' })
          setCookie('username', response.data.username, { path: '/' })
          setCookie('imgURL', response.data.avatar_URL, { path: '/' })
        }
      } catch(err) {
        removeCookie('uid', { path: '/' })
        setAuthState({
          ...authState,
          authLoading: false,
          isAuthenticated: false,
          user: null,
        })
      }
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
      isSignedOut: false,
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
      isSignedOut: true,
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
