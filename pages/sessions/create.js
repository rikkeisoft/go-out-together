import { useState } from 'react'
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
import { useCookies } from 'react-cookie'
import { useMutation, useQueryClient } from 'react-query'
import userAPI from 'api/userAPI'
import Popup from 'components/common/Popup'
import Loading from 'components/common/Loading'
import queriesKey from 'consts/queriesKey'

export default function Create() {
  const [cookies, , removeCookie] = useCookies(['uid', 'username', 'imgURL'])
  const queryClient = useQueryClient()
  const { isLoading, mutateAsync } = useMutation((param) => userAPI.logout(param))
  const router = useRouter()
  const { step, formData, backwardStep, prevStep, nextStep, setFormData } = useStep()
  const [shareLink, setShareLink] = useState('')

  let stepElement = <></>
  switch (step) {
    case 1:
      stepElement = <Step1 formData={formData} setFormData={setFormData} nextStep={nextStep} />
      break
    case 2:
      stepElement = (
        <Step2
          formData={formData}
          setFormData={setFormData}
          prevStep={prevStep}
          nextStep={nextStep}
          setShareLink={setShareLink}
        />
      )
      break
    case 3:
      stepElement = <Step3 shareLink={shareLink} setFormData={setFormData} backwardStep={backwardStep} />
      break
    default:
      break
  }

  const goToHomePage = () => router.push(urls.HOME)

  const handleSignOut = async () => {
    await mutateAsync(
      { uuid: cookies.uid },
      {
        onSuccess: () => {
          queryClient.setQueryData(queriesKey.CHECK_USER, { isSignedOut: true })
        },
      },
    )
    localStorage.removeItem('redirectURL')
    removeCookie('uid', { path: '/' })
    removeCookie('username', { path: '/' })
    removeCookie('imgURL', { path: '/' })
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
        {isLoading && (
          <Popup isOpen={isLoading} onRequestClose={(isSuccess) => isSuccess}>
            <Loading />
          </Popup>
        )}
        <div className="flex items-center justify-around">
          <Button type="button" variant="danger" onClick={goToHomePage}>
            <ArrowLeftIcon className="w-7" /> Về trang chủ
          </Button>
          <UserAvatar imgURL={cookies?.imgURL} username={cookies?.username} onSignOut={handleSignOut} />
        </div>
        <Center>
          <TitleText>Tạo nhóm để vote địa điểm</TitleText>
        </Center>
        {stepElement}
      </Container>
    </MainLayout>
  )
}
