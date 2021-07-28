import ProtectedComponent from 'components/ProtectedComponent/ProtectedComponent'
import AuthContextProvider from 'contexts/AuthContext'
import 'tailwindcss/tailwind.css'

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <ProtectedComponent>
        <Component {...pageProps} />
      </ProtectedComponent>
    </AuthContextProvider>
  )
}

export default MyApp
