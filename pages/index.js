import Head from 'next/head'
import MainLayout from 'layouts/MainLayout'
import BackgroundImage from 'components/common/BackgroundImage'
import Container from 'components/common/Container'
import TitleText from 'components/common/TitleText'
import Button from 'components/common/Button'
import Center from 'components/common/Center'
import homeBgSrc from 'public/assets/images/homeBg.svg'
import { useContext, useState } from 'react'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import GoogleLoginModal from 'components/auth/GoogleLoginModal'
import { AuthContext } from 'contexts/AuthContext'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const {
    authState: { user },
  } = useContext(AuthContext)
  const router = useRouter()

  const handleButtonClick = () => {
    if (user?.uid !== undefined) {
      router.push(urls.SESSIONS_CREATE)
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

      <BackgroundImage src={homeBgSrc}>
        <Container>
          <Center>
            <TitleText>Làm thế nào để tìm địa điểm vui chơi một cách dễ dàng</TitleText>
            <Button type="button" variant="primary" onClick={handleButtonClick}>
              Thử ngay
            </Button>
            <GoogleLoginModal
              isOpen={isModalOpen}
              onRequestClose={() => setIsModalOpen(false)}
              url={urls.SESSIONS_CREATE}
            />
          </Center>
        </Container>
      </BackgroundImage>
    </MainLayout>
  )
}
