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

export default function Details({ error }) {
  const [cookies, , removeCookie] = useCookies()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { sid } = router.query

  const { step, formData, setStep, prevStep, nextStep, setFormData } = useStep(0)
  let stepElement = <></>
  switch (step) {
    case 0:
      stepElement = <Step0 sid={sid} uid={cookies.uid} setStep={setStep} />
      break
    case 1:
      stepElement = <Step1 sid={sid} formData={formData} setFormData={setFormData} nextStep={nextStep} />
      break
    case 2:
      stepElement = <Step2 sid={sid} prevStep={prevStep} nextStep={nextStep} />
      break
    case 3:
      stepElement = <Step3 sid={sid} prevStep={prevStep} setFormData={setFormData} />
      break
    default:
      break
  }

  const goToHomePage = () => router.push(urls.HOME)

  const handleSignOut = () => {
    goToHomePage()
    queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedOut: true })
    sessionStorage.removeItem('redirectURL')
    removeCookie('accessToken', { path: '/' })
    removeCookie('uid', { path: '/' })
    removeCookie('username', { path: '/' })
    removeCookie('imgURL', { path: '/' })
    auth.signOut()
  }

  return (
    <MainLayout>
      <Head>
        <title>Form</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div className="flex items-center justify-around">
          <Button type="button" variant="danger" onClick={goToHomePage}>
            <ArrowLeftIcon className="w-7" /> Về trang chủ
          </Button>
          <UserAvatar imgURL={cookies?.imgURL} username={cookies?.username} onSignOut={handleSignOut} />
        </div>
        <Center>
          <TitleText>Bạn đang tham gia nhóm: </TitleText>
          <span className="inline-block text-2xl font-bold text-blue-500 whitespace-nowrap overflow-hidden overflow-ellipsis">
            {sid}
          </span>
        </Center>
        {error ? (
          <div className="text-center">
            <p className="font-semibold text-xl">Đăng nhập ngay: </p>
            <GoogleLoginModal />
          </div>
        ) : (
          stepElement
        )}
      </Container>
    </MainLayout>
  )
}
