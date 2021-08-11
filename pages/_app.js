import ProtectedComponent from 'components/ProtectedComponent/ProtectedComponent'
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

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedComponent>
        <Component {...pageProps} />
      </ProtectedComponent>
    </QueryClientProvider>
  )
}

export default MyApp
