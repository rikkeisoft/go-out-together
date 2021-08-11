import Head from 'next/head'
import MainLayout from 'layouts/MainLayout'
// import BackgroundImage from 'components/common/BackgroundImage'
import Container from 'components/common/Container'
import TitleText from 'components/common/TitleText'
import Button from 'components/common/Button'
import Center from 'components/common/Center'
// import homeBgSrc from 'public/assets/images/homeBg.svg'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import GoogleLoginModal from 'components/auth/GoogleLoginModal'
import { useCookies } from 'react-cookie'
import Popup from 'components/common/Popup'

export default function Home({ error }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isError, setIsError] = useState(false)
  const [redirectURL, setRedirectURL] = useState(urls.SESSIONS_CREATE)
  const [cookies] = useCookies(['uid', 'username', 'imgURL'])
  const router = useRouter()

  useEffect(() => {
    const url = sessionStorage.getItem('redirectURL')
    if (url !== null) {
      setRedirectURL(url)
    }
  }, [])

  useEffect(() => {
    if (error) setIsError(true)
    else setIsError(false)
  }, [error])

  const handleButtonClick = () => {
    if (cookies?.accessToken !== undefined) {
      router.push(redirectURL)
    } else setIsModalOpen(true)
  }

  return (
    <MainLayout>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>

      {/* <BackgroundImage src={homeBgSrc}> */}
        <Popup isOpen={isError} onRequestClose={() => setIsError(false)}>
          <h1>{error}</h1>
        </Popup>
        <Container>
          <Center>
            <TitleText>Làm thế nào để tìm địa điểm vui chơi một cách dễ dàng</TitleText>
            <Button type="button" variant="primary" onClick={handleButtonClick}>
              Thử ngay
            </Button>
            <GoogleLoginModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
          </Center>
        </Container>
      {/* </BackgroundImage> */}
    </MainLayout>
  )
}
