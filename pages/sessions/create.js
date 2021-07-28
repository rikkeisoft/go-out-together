import Head from 'next/head'
import useStep from 'hooks/useStep'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import MainLayout from 'layouts/MainLayout'
import Container from 'components/common/Container'
import Button from 'components/common/Button'
import Center from 'components/common/Center'
import TitleText from 'components/common/TitleText'
import Step1 from 'components/sessions/create/Step1'
import Step2 from 'components/sessions/create/Step2'
import Step3 from 'components/sessions/create/Step3'
import ArrowLeftIcon from 'components/icons/ArrowLeftIcon'
import UserAvatar from 'components/avatar/UserAvatar'
import { auth } from 'lib/firebase'
import { useContext } from 'react'
import { AuthContext } from 'contexts/AuthContext'

export default function Create() {
  const {
    authState: { user },
    logOut,
  } = useContext(AuthContext)
  const router = useRouter()
  const { step, formData, backwardStep, prevStep, nextStep, setFormData } = useStep()

  let stepElement = <></>
  switch (step) {
    case 1:
      stepElement = <Step1 formData={formData} setFormData={setFormData} nextStep={nextStep} />
      break
    case 2:
      stepElement = <Step2 formData={formData} setFormData={setFormData} prevStep={prevStep} nextStep={nextStep} />
      break
    case 3:
      stepElement = <Step3 formData={formData} setFormData={setFormData} backwardStep={backwardStep} />
      break
    default:
      break
  }

  const goToHomePage = () => router.push(urls.HOME)

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
          <TitleText>Tạo nhóm để vote địa điểm</TitleText>
        </Center>
        {stepElement}
      </Container>
    </MainLayout>
  )
}
