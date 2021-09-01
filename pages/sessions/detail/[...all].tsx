import Head from 'next/head'
import useStep from 'hooks/useStep'
import { useRouter } from 'next/router'
import { useCookies } from 'react-cookie'
import { useQueryClient } from 'react-query'
import queryKeys from 'consts/queryKeys'
import urls from 'consts/urls'
import { auth } from 'lib/firebase'
import MainLayout from 'layouts/MainLayout'
import Container from 'components/common/Container'
import Button from 'components/common/Button'
import Center from 'components/common/Center'
import TitleText from 'components/common/TitleText'
import Step0 from 'components/sessions/details/Step0'
import Step1 from 'components/sessions/details/Step1'
import Step2 from 'components/sessions/details/Step2'
import Step3 from 'components/sessions/details/Step3'
import UserAvatar from 'components/avatar/UserAvatar'
import ArrowLeftIcon from 'components/icons/ArrowLeftIcon'
import GoogleLoginModal from 'components/auth/GoogleLoginModal'
import { useEffect, useState } from 'react'
import LoadingOverlay from 'components/common/LoadingOverlay'
import socketIOClient from 'socket.io-client'

const socket = socketIOClient(process.env.NEXT_PUBLIC_SOCKET_IO_URL)

export default function Details(): JSX.Element {
  const [cookies, , removeCookie] = useCookies(['accessToken', 'imgURL', 'uid'])
  const [sid, setSid] = useState(null)
  const [bgClassname, setBgClassname] = useState(() => localStorage.getItem('bgClassname') ?? 'bg-image32 bg')
  const router = useRouter()
  const queryClient = useQueryClient()
  const { formData, setFormData } = useStep()
  const [detailStep, setDetailStep] = useState(null)
  const checkOldSession = sessionStorage.getItem('checkOldSession')

  // socketio
  useEffect(() => {
    // new background image
    if (sid) {
      // socket.emit('new_bg_image', { newBgClassname: bgClassname })
      // return socket.off('new_bg_image')
    }
  }, [bgClassname])

  useEffect(() => {
    if (!router.isReady) return
    setSid(router.query.all[0])
    if (router.query.all[1] !== detailStep) {
      setDetailStep(router.query.all[1])
    }
  }, [router.isReady, router.asPath])

  const handleOnChangeBg = (newBgClassname: string) => {
    localStorage.setItem('bgClassname', newBgClassname)
    setBgClassname(newBgClassname)
  }

  let stepElement = <></>
  switch (detailStep) {
    case '0':
      stepElement = <Step0 sid={sid} uid={cookies.uid} />
      break
    case '1':
      stepElement = <Step1 sid={sid} formData={formData} setFormData={setFormData} />
      break
    case '2':
      stepElement = <Step2 sid={sid} onChangeBg={handleOnChangeBg} />
      break
    case '3':
      stepElement = <Step3 sid={sid} setFormData={setFormData} />
      break
    default:
      break
  }

  const goToHomePage = () => {
    router.push(`${urls.HOME}`)
  }

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

  if (router.isReady && detailStep !== router.query?.all[1]) {
    return (
      <LoadingOverlay isOpen={detailStep !== router.query?.all[1]} message='Đang kiểm tra thông tin người dùng...' />
    )
  }

  return (
    <MainLayout>
      <Head>
        <title>Form</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Container className={bgClassname}>
        <div className='flex items-center justify-around'>
          {checkOldSession ? (
            <h1 className='text-2xl font-bold md:text-3xl cursor-pointer'>Go out together</h1>
          ) : (
            <Button type='button' variant='danger' onClick={goToHomePage}>
              <ArrowLeftIcon className='w-7' /> Về trang chủ
            </Button>
          )}
          <UserAvatar imgURL={cookies?.imgURL} username={cookies?.username} onSignOut={handleSignOut} />
        </div>
        <Center>
          <TitleText>Bạn đang tham gia nhóm: </TitleText>
          <span className='inline-block text-2xl font-bold text-blue-500 whitespace-nowrap overflow-hidden overflow-ellipsis'>
            {sid}
          </span>
        </Center>
        {!cookies.accessToken ? (
          <div className='text-center'>
            <p className='font-semibold text-xl'>Đăng nhập ngay: </p>
            <GoogleLoginModal />
          </div>
        ) : (
          stepElement
        )}
      </Container>
    </MainLayout>
  )
}
