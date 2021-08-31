import { checkUser } from 'api/users'
import LoadingOverlay from '../common/LoadingOverlay'
import queryKeys from 'consts/queryKeys'
import urls from 'consts/urls'
import { useRouter } from 'next/router'
import Details from '../../pages/sessions/detail/[...all]'
import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useQuery, useQueryClient } from 'react-query'

interface State {
  data: {
    isSignedIn?: boolean
    isSignedOut?: boolean
  }
}

export default function ProtectedComponent({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies(['uid', 'username', 'imgURL', 'accessToken'])
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isError, isLoading, refetch } = useQuery(
    queryKeys.CHECK_USER,
    async () => {
      try {
        const data = await checkUser(cookies.uid)
        queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedIn: true })
        setCookie('imgURL', data?.data?.avatar_url)
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

  useEffect(() => {
    if (!router.isReady) return
    const state: State = queryClient.getQueryState(queryKeys.CHECK_USER)
    if ((state?.data && (state?.data.isSignedOut || state?.data.isSignedIn)) || router.pathname === '/login') {
      if (state?.data?.isSignedOut) {
        queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedOut: false })
      }
    } else refetch()

    if (
      router.query.all !== undefined &&
      router.pathname === '/sessions/detail/[...all]' &&
      !sessionStorage.getItem('checkOldSession')
    ) {
      sessionStorage.setItem('redirectURL', `/sessions/detail/${router.query.all[0]}/${router.query.all[1]}`)
    } else if (router.pathname === '/sessions/create/1') {
      sessionStorage.setItem('redirectURL', router.asPath)
    } else return
  }, [router.isReady, router.asPath])

  useEffect(() => {
    if (isError && router.pathname !== '/sessions/detail/[...all]') {
      router.push(`${urls.LOGIN}`)
    }
  }, [isLoading, isError])

  if (isLoading) {
    return <LoadingOverlay isOpen={isLoading} message="Vui lòng chờ..." />
  }

  if (isError && router.pathname === '/sessions/detail/[...all]') {
    return <Details isError={isError} />
  }

  return (
    <>
      {router.pathname === '/login' ? (
        children
      ) : isError ? (
        <LoadingOverlay isOpen={router.pathname !== '/login'} message="Vui lòng chờ..." />
      ) : (
        children
      )}
    </>
  )
}
