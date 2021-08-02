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
import Step1 from 'components/sessions/details/Step1'
import Step2 from 'components/sessions/details/Step2'
import Step3 from 'components/sessions/details/Step3'
import ArrowLeftIcon from 'components/icons/ArrowLeftIcon'
import { auth } from 'lib/firebase'
import UserAvatar from 'components/avatar/UserAvatar'
import { useCookies } from 'react-cookie'
import { useQueryClient } from 'react-query'
import queriesKey from 'consts/queriesKey'

export default function Details() {
  const [cookies, , removeCookie] = useCookies(['uid', 'username', 'imgURL'])
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = router.query

  const { step, formData, prevStep, nextStep, setFormData } = useStep()
  const [voteResult, setVoteResult] = useState('')
  let stepElement = <></>
  switch (step) {
    case 1:
      stepElement = <Step1 sessionId={id} formData={formData} setFormData={setFormData} nextStep={nextStep} />
      break
    case 2:
      stepElement = (
        <Step2
          sessionId={id}
          formData={formData}
          prevStep={prevStep}
          nextStep={nextStep}
          setVoteResult={setVoteResult}
        />
      )
      break
    case 3:
      stepElement = <Step3 voteResult={voteResult} />
      break
    default:
      break
  }

  const goToHomePage = () => router.push(urls.HOME)

  const handleSignOut = () => {
    goToHomePage()
    queryClient.setQueryData(queriesKey.CHECK_USER, { isSignedOut: true })
    localStorage.removeItem('redirectURL')
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
          <TitleText>
            Bạn đang tham gia nhóm: <span className="text-blue-500">{id}</span>
          </TitleText>
        </Center>
        {stepElement}
      </Container>
    </MainLayout>
  )
}
