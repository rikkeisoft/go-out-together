import Head from 'next/head'
import MainLayout from 'layouts/MainLayout'
import Container from 'components/common/Container'
import TitleText from 'components/common/TitleText'
import Button from 'components/common/Button'
import Center from 'components/common/Center'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import GoogleLoginModal from 'components/auth/GoogleLoginModal'
import { useCookies } from 'react-cookie'

export default function Home() {
  const [redirectURL, setRedirectURL] = useState(urls.SESSIONS_CREATE)
  const [cookies] = useCookies(['accessToken'])
  const router = useRouter()

  useEffect(() => {
    const url = sessionStorage.getItem('redirectURL')
    if (url !== null) {
      setRedirectURL(url)
    }
  }, [])

  const handleButtonClick = () => {
    router.push(redirectURL)
  }

  return (
    <MainLayout>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>

      <Container>
        <Center>
          <TitleText>Làm thế nào để tìm địa điểm vui chơi một cách dễ dàng</TitleText>
          {cookies?.accessToken ? (
            <Button type="button" variant="primary" onClick={handleButtonClick}>
              Thử ngay
            </Button>
          ) : (
            <>
              <p className="font-semibold text-xl">Đăng nhập ngay: </p>
              <GoogleLoginModal />
            </>
          )}
        </Center>
      </Container>
    </MainLayout>
  )
}
