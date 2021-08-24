import { useEffect, useState } from 'react'
import Head from 'next/head'
import useStep from 'hooks/useStep'
import { useRouter } from 'next/router'
import { useCookies } from 'react-cookie'
import { useQueryClient } from 'react-query'
import urls from 'consts/urls'
import queryKeys from 'consts/queryKeys'
import { auth } from 'lib/firebase'
import MainLayout from 'layouts/MainLayout'
import Container from 'components/common/Container'
import Button from 'components/common/Button'
import Center from 'components/common/Center'
import TitleText from 'components/common/TitleText'
import Step1 from 'components/sessions/create/Step1'
import Step2 from 'components/sessions/create/Step2'
import Step3 from 'components/sessions/create/Step3'
import UserAvatar from 'components/avatar/UserAvatar'
import ArrowLeftIcon from 'components/icons/ArrowLeftIcon'

export default function Create() {
  const router = useRouter()
  const [cookies, , removeCookie] = useCookies(['uid', 'username', 'imgURL'])
  const queryClient = useQueryClient()
  const { formData, setFormData } = useStep()
  const [createStep, setCreateStep] = useState('0')

  useEffect(() => {
    if (!router.isReady) return
    setCreateStep(router.query.all[0])
  }, [router.isReady, router.asPath])

  let stepElement = <></>
  switch (createStep) {
    case '1':
      stepElement = <Step1 formData={formData} setFormData={setFormData} />
      break
    case '2':
      stepElement = <Step2 formData={formData} setFormData={setFormData} />
      break
    case '3':
      stepElement = <Step3 formData={formData} setFormData={setFormData} />
      break
    default:
      break
  }

  const goToHomePage = () => router.push(`${urls.HOME}`)

  const handleSignOut = () => {
    router.push(`${urls.LOGIN}`)
    queryClient.setQueryData(queryKeys.CHECK_USER, { isSignedOut: true })
    sessionStorage.removeItem('redirectURL')
    removeCookie('accessToken', { path: '/' })
    removeCookie('uid', { path: '/' })
    removeCookie('username', { path: '/' })
    removeCookie('imgURL', { path: '/' })
    removeCookie('address', { path: '/' })
    auth.signOut()
  }

  return (
    <MainLayout>
      <Head>
        <title>Form</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container className="bg-image1">
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
