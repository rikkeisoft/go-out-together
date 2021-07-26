import Head from 'next/head'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import MainLayout from 'layouts/MainLayout'
import BackgroundImage from 'components/common/BackgroundImage'
import Container from 'components/common/Container'
import TitleText from 'components/common/TitleText'
import Button from 'components/common/Button'
import Center from 'components/common/Center'
import homeBgSrc from 'public/assets/images/homeBg.svg'

export default function Home() {
  const router = useRouter()

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
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                router.push(urls.SESSIONS_CREATE)
              }}
            >
              Thử ngay
            </Button>
          </Center>
        </Container>
      </BackgroundImage>
    </MainLayout>
  )
}
