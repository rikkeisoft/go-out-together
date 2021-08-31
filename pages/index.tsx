import Head from 'next/head'
import MainLayout from 'layouts/MainLayout'
import Container from '../components/common/Container'
import Center from '../components/common/Center'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import { useCookies } from 'react-cookie'
import Button from '../components/common/Button'
import UserAvatar from '../components/avatar/UserAvatar'
import { useQuery, useQueryClient } from 'react-query'
import { auth } from 'lib/firebase'
import queryKeys from 'consts/queryKeys'
import DetailIcon from '../components/icons/DetailIcon'
import { getOldSessions } from 'api/sessions'
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon'

interface Session {
  id: number
  content: string
  sid: string
  title: string
  result: string[]
}

export default function Home() {
  const [dataOldSessions, setDataOldSessions] = useState([])
  const [cookies, , removeCookie] = useCookies(['accessToken', 'imgURL'])
  const router = useRouter()
  const queryClient = useQueryClient()
  sessionStorage.getItem('isSessionExpired') && sessionStorage.removeItem('isSessionExpired')
  const url = sessionStorage.getItem('redirectURL')

  const uid = cookies.uid
  const {
    data: oldSessions,
    isLoading,
    isError,
  } = useQuery([queryKeys.GET_OLD, { uid }], () => getOldSessions({ uid }), {
    retry: 1,
  })

  useEffect(() => {
    if (!isLoading) {
      oldSessions?.data?.sort((a: Session, b: Session) => b.id - a.id)
      setDataOldSessions(oldSessions.data)
    }
  }, [uid, isLoading])

  const handleSignOut = () => {
    router.push(`${urls.LOGIN}`)
    queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedOut: true })
    removeCookie('accessToken', { path: '/' })
    removeCookie('uid', { path: '/' })
    removeCookie('username', { path: '/' })
    removeCookie('imgURL', { path: '/' })
    removeCookie('address', { path: '/' })
    auth.signOut()
  }

  const handleCheckOldSession = (item) => {
    sessionStorage.getItem('redirectToOldSession') && sessionStorage.removeItem('redirectToOldSession')
    sessionStorage.getItem('isAdmin') && sessionStorage.removeItem('isAdmin')
    sessionStorage.setItem('checkOldSession', 'true')
    router.push(`/sessions/detail/${item.sid}/0`)
  }

  return (
    <MainLayout>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script async src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <Container className="bg-image15 bg">
        <div className="flex items-center justify-around">
          {url ? (
            <Button type="button" variant="danger" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-7" /> Quay lại
            </Button>
          ) : (
            <h1 className="font-bold text-3xl cursor-pointer">Go out together</h1>
          )}
          <UserAvatar imgURL={cookies?.imgURL} username={cookies?.username} onSignOut={handleSignOut} />
        </div>
        <Center>
          <div className="flex justify-center text-xl font-bold">Thông tin các nhóm đã tham gia</div>
          <div className="md:w-8/12 mt-8 mx-auto border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center py-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : dataOldSessions.length !== 0 && !isError ? (
              <table className="min-w-full break-all bg-white border-r text-center table-auto">
                <thead className="bg-gray-800 text-white ">
                  <tr className=" sm:table-row  ">
                    <th className="w-2/6 py-3 px-4 uppercase font-semibold text-sm border-r">ID Nhóm</th>
                    <th className="w-3/6 py-3 px-4 uppercase font-semibold text-sm border-r">Tiêu đề</th>
                    <th className="w-1/6 py-3 px-4 uppercase font-semibold text-sm border-r"></th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {dataOldSessions.map((item, index) => (
                    <tr className=" sm:table-row border" key={index}>
                      <td className="p-3 border-r"> {item.sid}</td>
                      <td className="p-3 border-r"> {item.title}</td>
                      <td className="p-3 border-r">
                        <span title="Chi tiết" className="cursor-pointer" onClick={() => handleCheckOldSession(item)}>
                          <DetailIcon />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xl">Bạn chưa tham gia nhóm nào</p>
            )}
            <div className="mt-6 flex justify-center items-center">
              <Button type="submit" variant="primary" onClick={() => router.push(`${urls.SESSIONS_CREATE}/1`)}>
                Tạo nhóm
              </Button>
            </div>
          </div>
        </Center>
      </Container>
    </MainLayout>
  )
}
