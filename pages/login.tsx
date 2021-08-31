import Head from 'next/head'
import MainLayout from 'layouts/MainLayout'
import Container from '../components/common/Container'
import Center from '../components/common/Center'
import { useRouter } from 'next/router'
import urls from 'consts/urls'
import GoogleLoginModal from '../components/auth/GoogleLoginModal'
import { useCookies } from 'react-cookie'

export default function Login() {
  const [cookies] = useCookies(['accessToken', 'imgURL'])
  const router = useRouter()

  const handleButtonClick = () => {
    router.push(`${urls.HOME}`)
  }

  return (
    <MainLayout>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js"></script>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css" rel="stylesheet" />
      </Head>
      <Container className="bg bg-image34">
        <Center>
          <div className="py-34 md:py-40">
            <h1 className="mb-3 text-gray-800 text-2xl md:text-5xl font-bold">GO OUT TOGETHER</h1>
            <h1 className="mb-3 text-gray-800 text-2xl md:text-5xl font-bold">
              Tạo nhóm và cùng bạn bè chọn địa điểm vui chơi
            </h1>
            <div className="mt-6 md:mt-12">
              {cookies?.accessToken ? (
                <div className="flex items-center justify-center">
                  <button
                    className="inline-flex items-center md:px-12 md:py-3 px-8 py-2 text-white md:text-2xl text-base font-semibold rounded-md bg-blue-500 hover:bg-blue-400"
                    onClick={handleButtonClick}
                  >
                    Thử ngay
                  </button>
                </div>
              ) : (
                <div className="md:flex md:justify-center md:items-center">
                  <span className="font-semibold text-2xl">Đăng nhập ngay: </span>
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
