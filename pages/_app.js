import ProtectedComponent from 'components/ProtectedComponent/ProtectedComponent'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'tailwindcss/tailwind.css'
import '../style/home.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const metaData = {
  description: 'Bạn chưa biết làm sao để có thể chọn địa điểm vui chơi cùng bạn bè? Hãy sử dụng ngay Go out together!',
  ogDescription: `Trong cuộc sống, đôi khi thật khó để lựa chọn địa điểm đi chơi cùng gia đình hay bạn bè. 
  Mỗi người một ý tưởng, mỗi địa điểm lại có lợi thế riêng. 
  Hãy để Go out together giúp mọi người dễ dàng hơn trong việc chọn ra địa điểm vui chơi nhanh nhất.`,
  ogSitename: 'Go out together - Chọn địa điểm đi chơi thật dễ dàng',
  ogTitle: 'Go out together',
  ogUrl: 'https://rikkeisoft-go-out-together.vercel.app',
  ogImage:
    'https://images.unsplash.com/photo-1629659740606-66c36a82cc24?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
}

function MyApp({ Component, pageProps }) {
  const { description, ogDescription, ogSitename, ogTitle, ogUrl, ogImage } = metaData

  return (
    <>
      <Head>
        <meta name="description" content={description} />
        <meta property="og:site_name" content={ogSitename} key="ogsitename" />
        <meta property="og:description" content={ogDescription} key="ogdesc" />
        <meta property="og:title" content={ogTitle} key="ogtitle" />
        <meta property="og:url" content={ogUrl} key="ogurl" />
        <meta key="ogimage" property="og:image" content={ogImage} />
      </Head>
      <QueryClientProvider client={queryClient}>
        <ProtectedComponent>
          <Component {...pageProps} />
        </ProtectedComponent>
      </QueryClientProvider>
    </>
  )
}

export default MyApp
