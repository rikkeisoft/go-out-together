import Head from 'next/head'
import useStep from 'hooks/useStep'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import MainLayout from 'layouts/MainLayout'
import Container from 'components/common/Container'
import Button from 'components/common/Button'
import Center from 'components/common/Center'
import TitleText from 'components/common/TitleText'
import Step1 from 'components/sessions/details/Step1'
import Step2 from 'components/sessions/details/Step2'
import Step3 from 'components/sessions/details/Step3'
import ArrowLeftIcon from 'components/icons/ArrowLeftIcon'
import GoogleLoginModal from 'components/auth/GoogleLoginModal'
import { useContext, useState } from 'react'
import { auth } from 'lib/firebase'
import UserAvatar from 'components/avatar/UserAvatar'
import { AuthContext } from 'contexts/AuthContext'

export default function Details() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    authState: { user },
    logOut,
  } = useContext(AuthContext)
  const router = useRouter()
  const { id } = router.query

  const { step, formData, prevStep, nextStep, setFormData } = useStep()
  let stepElement = <></>
  switch (step) {
    case 1:
      stepElement = <Step1 formData={formData} setFormData={setFormData} nextStep={nextStep} />
      break
    case 2:
      stepElement = <Step2 formData={formData} setFormData={setFormData} prevStep={prevStep} nextStep={nextStep} />
      break
    case 3:
      stepElement = <Step3 />
      break
    default:
      break
  }

  const goToHomePage = () => router.push(urls.HOME)

  const handleButtonClick = () => {
    if (user?.uid !== undefined) {
      router.push(`/sessions/${id}`)
    } else setIsModalOpen(true)
  }

  const handleSignOut = () => {
    logOut()
    auth.signOut()
    goToHomePage()
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
          <UserAvatar imgURL={user?.imgURL} username={user?.username} onSignOut={handleSignOut} />
        </div>
        <Center>
          <TitleText>
            Bạn đang tham gia nhóm: <span className="text-blue-500">{id}</span>
          </TitleText>
        </Center>
        {user?.uid !== undefined ? (
          <div>{stepElement}</div>
        ) : (
          <div className="text-center">
            <Button type="button" variant="primary" onClick={handleButtonClick}>
              Đăng nhập
            </Button>
            <GoogleLoginModal
              isOpen={isModalOpen}
              onRequestClose={() => setIsModalOpen(false)}
              url={`/sessions/${id}`}
            />
          </div>
        )}
      </Container>
    </MainLayout>
  )
}
