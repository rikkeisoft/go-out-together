import Head from 'next/head'
import MainLayout from 'layouts/MainLayout'
import Container from 'components/common/Container'
import Center from 'components/common/Center'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import GoogleLoginModal from 'components/auth/GoogleLoginModal'
import { useCookies } from 'react-cookie'

export default function Home() {
  const [redirectURL, setRedirectURL] = useState(`${urls.SESSIONS_CREATE}/1`)
  const [cookies] = useCookies(['accessToken'])
  const router = useRouter()
  const url = sessionStorage.getItem('redirectURL')

  useEffect(() => {
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
          <div className="py-36 md:py-80">
            <h1 className="mb-3 text-gray-800 text-2xl md:text-5xl font-bold">GO OUT TOGETHER</h1>
            <h1 className="mb-3 text-gray-800 text-2xl md:text-5xl font-bold">
              Tạo nhóm và cùng bạn bè chọn địa điểm vui chơi
            </h1>
            <div className="mt-6 md:mt-12">
              {cookies?.accessToken ? (
                <div className="flex items-center justify-center">
                  <button
                    className="inline-flex mr-6 items-center md:px-12 md:py-3 px-8 py-2 text-white md:text-2xl text-base font-semibold rounded-md bg-blue-500 hover:bg-blue-400"
                    onClick={handleButtonClick}
                  >
                    Thử ngay
                  </button>
                  {url && (
                    <button
                      className="inline-flex items-center md:px-12 md:py-3 px-8 py-2 text-white md:text-2xl text-base font-semibold rounded-md bg-blue-500 hover:bg-blue-400"
                      onClick={() => router.push(`${urls.SESSIONS_CREATE}/1`)}
                    >
                      Tạo nhóm mới
                    </button>
                  )}
                </div>
              ) : (
                <div className="md:flex md:justify-center md:items-center">
                  <span className="font-semibold text-2xl font-semibold">Đăng nhập ngay: </span>
                  <GoogleLoginModal />
                </div>
              )}
            </div>
          </div>
        </Center>
      </Container>
    </MainLayout>
  )
}
